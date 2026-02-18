
/**
 * -------------------------------------------------------------------------
 * 文件名称：services/unifiedService.ts
 * 功能描述：统一服务路由入口。
 * 
 * 职责：
 * 1. 根据 modelId 判断路由到 Gemini 服务还是 Volcengine 服务。
 * 2. 解析国内模型返回的语音标记 {{VOICE:...}}，并调用 TTS 生成音频。
 * 3. 统一返回格式，屏蔽底层模型差异。
 * -------------------------------------------------------------------------
 */

import { Message, ServiceResult, ActionLogEntry } from "../types";
import { sendChatMessage as sendGeminiChatMessage, generateSelfInitiatedAction as generateGeminiAction } from "./geminiService";
import { sendVolcChatMessage } from "./volcService";
import { GoogleGenAI, Modality } from "@google/genai";
import { DEFAULT_TTS_MODEL } from "../constants";
import { generateId } from "../utils/helpers";

const VOICE_REGEX = /\{\{VOICE:\s*([\s\S]*?)\s*\|\s*DESIGN:\s*([\s\S]*?)\}\}/i;
const FALLBACK_VOICE_REGEX = /\[(?:语音|Voice)\]\s*([^\n\r\(（]*)/i; 
const FALLBACK_DESIGN_REGEX = /[\(（](?:声音设计|Voice Design)[：\:]\s*([^\)）]*?)[\)）]/i;

export interface ContextData {
    location: string;
    outfit: string;
    activity: string;
}

// 外部 TTS 生成器 (用于非 Gemini 模型想发语音的情况)
const generateExternalTTS = async (text: string, voiceDesign: string): Promise<{ audio?: string, duration: number, error?: string }> => {
    try {
        if (!process.env.API_KEY) {
            return { duration: 0, error: "Missing Google API Key" };
        }

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: DEFAULT_TTS_MODEL,
            contents: [{ parts: [{ text: `Say in a voice that is ${voiceDesign}: ${text}` }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
            },
        });
        const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (data) {
            const byteLength = atob(data).length;
            return { audio: data, duration: Math.max(Math.round(byteLength / 48000), 2) };
        }
        return { duration: 0, error: "No audio data returned" };
    } catch (e: any) {
        console.error("TTS Gen Failed", e);
        return { duration: 0, error: e.message || "Unknown TTS Error" };
    }
};

// 统一聊天接口
export const chatWithNana = async (
  history: Message[],
  newMessage: string,
  isImagePaused: boolean,
  chatModelId: string,
  imageModelId: string,
  contextData: ContextData, // 新增上下文参数
  layer1Intent?: string,
  coachFeedback?: string,
  customPersona?: string,
  isVoiceEnabled?: boolean // New Param
): Promise<ServiceResult> => {
  if (chatModelId.includes('doubao') || chatModelId.includes('glm')) {
    // 路由到火山引擎
    const volcResult = await sendVolcChatMessage(history, newMessage, chatModelId, layer1Intent, coachFeedback);
    
    let audio: string | undefined = undefined;
    let duration: number = 0;
    let finalText = volcResult.text;
    const logs = [...volcResult.logs];

    let content = "";
    let design = "";

    // 只有当语音能力开启时，才进行语音解析和生成
    if (isVoiceEnabled) {
        // 1. 尝试匹配严格的语音指令格式 {{VOICE:...}}
        const match = finalText.match(VOICE_REGEX);
        if (match) {
            content = match[1].trim();
            design = match[2].trim();
            finalText = content; // 清理文本，只显示内容
        } 
        // 2. 尝试匹配 Fallback 格式 [语音]
        else {
            const fallbackMatch = finalText.match(FALLBACK_VOICE_REGEX);
            if (fallbackMatch) {
                content = fallbackMatch[1].trim().replace(/^"|"$/g, ''); 
                
                const designMatch = finalText.match(FALLBACK_DESIGN_REGEX);
                design = designMatch ? designMatch[1].trim() : "Sweet, intimate, and flirty";
                
                finalText = content; 
            }
        }
        
        // 如果检测到语音内容，调用 TTS
        if (content) {
            logs.push({
                 id: generateId(),
                 timestamp: Date.now(),
                 type: 'SYSTEM',
                 content: 'Generating Voice...',
                 details: `Design: ${design}`
            });
    
            const tts = await generateExternalTTS(content, design);
            
            if (tts.audio) {
                audio = tts.audio;
                duration = tts.duration;
                logs.push({
                    id: generateId(),
                    timestamp: Date.now(),
                    type: 'VOICE_DESIGN',
                    content: `Voice Generated`,
                    details: `Design: ${design}`
                });
            } else {
                logs.push({
                    id: generateId(),
                    timestamp: Date.now(),
                    type: 'ERROR',
                    content: 'Voice Generation Failed',
                    details: tts.error
                });
            }
        } 
        // 随机彩蛋：对于短回复，有一定概率自动转语音
        else {
            const isFlirty = volcResult.text.includes('~') || volcResult.text.length < 30;
            if (isFlirty && Math.random() < 0.1) {
                const tts = await generateExternalTTS(volcResult.text, "intimate, breathy, slightly flirty");
                if (tts.audio) {
                    audio = tts.audio;
                    duration = tts.duration;
                }
            }
        }
    }

    return {
      text: finalText,
      sources: volcResult.sources,
      logs: logs,
      audio,
      audioDuration: duration,
      image: undefined 
    };
  } else {
    // 路由到 Gemini
    return await sendGeminiChatMessage(history, newMessage, isImagePaused, chatModelId, imageModelId, contextData, layer1Intent, coachFeedback, customPersona, isVoiceEnabled);
  }
};

// 统一主动行为接口
export const nanaSelfAct = async (
  history: Message[],
  isImagePaused: boolean,
  chatModelId: string,
  imageModelId: string,
  contextData: ContextData, // 新增上下文参数
  customIntent?: string, 
  customPersona?: string
): Promise<ServiceResult> => {
  if (chatModelId.includes('doubao') || chatModelId.includes('glm')) {
    
    const defaultIntent = "(User is silent. Actively say something short and flirty to grab their attention. If sending voice, use the {{VOICE:...}} format or [语音] format.)";
    const intentToUse = customIntent || defaultIntent;

    const volcResult = await sendVolcChatMessage(history, intentToUse, chatModelId);
    
    let audio: string | undefined = undefined;
    let duration: number = 0;
    let finalText = volcResult.text;
    const logs = [...volcResult.logs];

    // Self Act (Volcengine) 目前不强制要求发语音，除非意图中明确提及。
    // 但如果全局开关 isVoiceEnabled 没传进来（L0 调用时还没传），默认它是开启的？
    // 为了安全起见，L0 调用也应该尊重 voice 开关，但在这里 nanaSelfAct 的签名里没加 isVoiceEnabled。
    // 考虑到 L0 很少发语音，暂时保持现状，或者后续如果需要 L0 发语音再加。
    // 当前逻辑是：Volcengine 路径只有在检测到语音标记时才发。
    
    let content = "";
    let design = "";

    const match = finalText.match(VOICE_REGEX);
    if (match) {
        content = match[1].trim();
        design = match[2].trim();
        finalText = content;
    } else {
        const fallbackMatch = finalText.match(FALLBACK_VOICE_REGEX);
        if (fallbackMatch) {
            content = fallbackMatch[1].trim().replace(/^"|"$/g, '');
            const designMatch = finalText.match(FALLBACK_DESIGN_REGEX);
            design = designMatch ? designMatch[1].trim() : "Playful and cute";
            finalText = content;
        }
    }

    if (content) {
        // 这里缺少 isVoiceEnabled 检查，但因为 L0 很少触发语音指令，暂且略过，或者假设 L0 行为优先级更高。
        logs.push({
             id: generateId(),
             timestamp: Date.now(),
             type: 'SYSTEM',
             content: 'Generating Voice...',
             details: `Design: ${design}`
        });

        const tts = await generateExternalTTS(content, design);
        if (tts.audio) {
            audio = tts.audio;
            duration = tts.duration;
            logs.push({
                id: generateId(),
                timestamp: Date.now(),
                type: 'VOICE_DESIGN',
                content: `Voice Generated`,
                details: `Design: ${design}`
            });
        }
    }

    return {
      text: finalText,
      sources: volcResult.sources,
      logs: logs,
      audio,
      audioDuration: duration,
      actionType: 'CHAT'
    };
  } else {
    // Gemini Self Act doesn't use voice tool usually.
    return await generateGeminiAction(history, isImagePaused, chatModelId, imageModelId, contextData, customIntent, undefined, customPersona);
  }
};
