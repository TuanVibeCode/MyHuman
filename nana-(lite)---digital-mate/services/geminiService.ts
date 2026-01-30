
/**
 * -------------------------------------------------------------------------
 * 文件名称：services/geminiService.ts
 * 功能描述：Gemini API 服务封装。
 * -------------------------------------------------------------------------
 */

import { GoogleGenAI, GenerateContentResponse, FunctionDeclaration, Type, Tool, HarmCategory, HarmBlockThreshold, Modality } from "@google/genai";
import { Message, MessageRole, GroundingSource, ActionLogEntry, ServiceResult, AIState } from "../types";
import { SYSTEM_INSTRUCTION, NANA_APPEARANCE, DEFAULT_TTS_MODEL } from "../constants";
import { generateId, getPersonaLiveContext } from "../utils/helpers";
import { ContextData } from "./unifiedService";

// --- Tool Definitions (工具定义) ---

// 工具：拍摄自拍
const selfieToolDecl: FunctionDeclaration = {
  name: 'take_selfie',
  parameters: {
    type: Type.OBJECT,
    description: 'Taking a selfie photo. Used for chat replies OR social media moments.',
    properties: {
      action_description: {
        type: Type.STRING,
        description: 'What are you doing in the photo? (e.g. "Winking", "Holding coffee").',
      },
      facial_expression: {
        type: Type.STRING,
        description: 'Facial expression (e.g. "Seductive smile", "Pouting").',
      }
    },
    required: ['action_description'],
  },
};

const voiceMemoToolDecl: FunctionDeclaration = {
  name: 'take_voice_memo',
  parameters: {
    type: Type.OBJECT,
    description: 'Send a voice message.',
    properties: {
      voice_content: { type: Type.STRING },
      voice_design: { type: Type.STRING }
    },
    required: ['voice_content', 'voice_design'],
  },
};

const thoughtToolDecl: FunctionDeclaration = {
  name: 'log_thought',
  parameters: {
    type: Type.OBJECT,
    description: 'Records internal thought.',
    properties: {
      thought: { type: Type.STRING },
      strategy: { type: Type.STRING }
    },
    required: ['thought'],
  },
};

const chatTools: Tool[] = [
  { functionDeclarations: [selfieToolDecl, voiceMemoToolDecl, thoughtToolDecl] }
];

const searchTools: Tool[] = [
  { googleSearch: {} }
];

// --- Helpers ---
const createLog = (type: ActionLogEntry['type'], content: string, details?: string): ActionLogEntry => ({
  id: generateId(),
  timestamp: Date.now(),
  type,
  content,
  details
});

const parseResponse = (response: GenerateContentResponse) => {
  const text = response.text || "";
  const sources: GroundingSource[] = [];
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (chunks) {
    chunks.forEach((chunk: any) => {
      if (chunk.web) sources.push({ title: chunk.web.title, uri: chunk.web.uri });
    });
  }
  return { text, sources };
};

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3, initialDelay = 2000): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const isRateLimit = error?.message?.includes('429') || error?.status === 429 || error?.message?.includes('RESOURCE_EXHAUSTED');
      if (isRateLimit && attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

// --- Generators ---

const generateTTS = async (text: string, voiceDesign: string): Promise<{ audio?: string, duration: number, log: ActionLogEntry }> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Say in a voice that is ${voiceDesign}: ${text}`;
        const response = await ai.models.generateContent({
            model: DEFAULT_TTS_MODEL,
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
            },
        });
        const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (audioData) {
            const byteLength = atob(audioData).length;
            const duration = Math.round(byteLength / 48000); 
            return {
                audio: audioData,
                duration: Math.max(duration, 2), 
                log: createLog('VOICE_DESIGN', `Voice Design: ${voiceDesign}`, `Content: "${text}"`)
            };
        }
        return { duration: 0, log: createLog('ERROR', 'TTS generation returned no data') };
    } catch (error: any) {
        return { duration: 0, log: createLog('ERROR', 'TTS Generation Failed', error.message) };
    }
}

const generateSelfieImage = async (
    imageModelId: string, 
    contextData: ContextData, 
    actionDesc: string,
    facialExp: string
): Promise<{ image?: string, log: ActionLogEntry, error?: boolean }> => {
  const fullImagePrompt = `
  ${NANA_APPEARANCE}
  CURRENT PHYSICAL REALITY:
  - Background Scene: ${contextData.location}
  - Subject Wear: ${contextData.outfit}
  ACTION:
  - Pose: ${actionDesc}
  - Expression: ${facialExp || "Looking at camera"}
  CONSISTENCY RULES:
  1. IGNORE any creative desire to change the outfit colors. The description "${contextData.outfit}" is ABSOLUTE law.
  2. IGNORE any desire to change the room lighting or wall color. The scene "${contextData.location}" is ABSOLUTE law.
  3. Style: Hyper-realistic smartphone selfie. Imperfect framing.
  `;
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: imageModelId,
      contents: { parts: [{ text: fullImagePrompt }] },
      config: {
        imageConfig: { aspectRatio: "3:4" }, 
        safetySettings: [{ category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH }]
      },
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return {
          image: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
          log: createLog('IMAGE_GEN', 'Selfie Generated', `Ctx: ${contextData.location} | Wear: ${contextData.outfit}`)
        };
      }
    }
    return { image: undefined, log: createLog('ERROR', 'Image generation returned no data') };
  } catch (error: any) {
    const isQuota = error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED');
    return { image: undefined, log: createLog('ERROR', 'Image Gen Failed', error.message), error: isQuota };
  }
};

export const sendChatMessage = async (
  history: Message[],
  newMessage: string,
  isImageGenerationPaused: boolean,
  chatModelId: string,
  imageModelId: string,
  contextData: ContextData, 
  layer1Intent?: string,
  coachFeedback?: string,
  customPersona?: string
): Promise<ServiceResult> => {
  const logs: ActionLogEntry[] = [];
  let imageErrorOccurred = false;
  let selfieRequested = false;
  
  if (!process.env.API_KEY) throw new Error("API_KEY_REQUIRED");

  const context = getPersonaLiveContext();
  const baseInstruction = customPersona || SYSTEM_INSTRUCTION;

  const contextSystemPrompt = `
  [CURRENT REALITY CONTEXT]
  Time: ${context.timeString} (Shenyang, China).
  Location: ${contextData.location}.
  Activity: ${contextData.activity}.
  Wearing: ${contextData.outfit}.
  ${layer1Intent ? `\n[SUBCONSCIOUS JUDGMENT]: ${layer1Intent}` : ''}
  `;

  const coachInstruction = coachFeedback ? `\n\n🛑 [URGENT SUPERVISOR INSTRUCTION]: ${coachFeedback}` : '';

  const recentHistory = history.slice(-10).filter(m => !m.isInternal).map(m => ({
    role: m.role === MessageRole.USER ? "user" : "model",
    parts: [{ text: m.text }],
  }));

  try {
    const result = await withRetry(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const chat = ai.chats.create({
        model: chatModelId,
        config: {
          systemInstruction: baseInstruction + contextSystemPrompt + coachInstruction, 
          tools: chatTools, 
          safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          ],
        },
        history: recentHistory,
      });
      return await chat.sendMessage({ message: newMessage + coachInstruction }); 
    });

    const functionCalls = result.functionCalls;
    let generatedImageBase64: string | undefined = undefined;
    let generatedAudioBase64: string | undefined = undefined;
    let audioDuration: number = 0;
    let audioText: string = "";

    if (functionCalls) {
      for (const call of functionCalls) {
        if (call.name === 'log_thought') logs.push(createLog('THOUGHT', (call.args as any).thought, (call.args as any).strategy));
        if (call.name === 'take_selfie') {
          selfieRequested = true;
          if (!isImageGenerationPaused) {
             const imgResult = await generateSelfieImage(imageModelId, contextData, (call.args as any).action_description, (call.args as any).facial_expression);
             if (imgResult.error) imageErrorOccurred = true;
             generatedImageBase64 = imgResult.image;
             logs.push(imgResult.log);
          }
        }
        if (call.name === 'take_voice_memo') {
            const ttsResult = await generateTTS((call.args as any).voice_content, (call.args as any).voice_design);
            generatedAudioBase64 = ttsResult.audio;
            audioDuration = ttsResult.duration;
            audioText = (call.args as any).voice_content;
            logs.push(ttsResult.log);
        }
      }
    }

    let { text, sources } = parseResponse(result);
    if (selfieRequested && !generatedImageBase64 && imageErrorOccurred) text = text + "\n\n(图片生成失败：信号太差)";
    if (!text && !generatedImageBase64 && !generatedAudioBase64) text = "哎呀，走神了...";

    return { 
        text: generatedAudioBase64 ? audioText : text, 
        sources, 
        image: generatedImageBase64, 
        audio: generatedAudioBase64, 
        audioDuration,
        logs, 
        imageError: imageErrorOccurred 
    };
  } catch (error: any) {
    throw error;
  }
};

export const generateSelfInitiatedAction = async (
  history: Message[],
  isImageGenerationPaused: boolean,
  chatModelId: string,
  imageModelId: string,
  contextData: ContextData, 
  customIntent?: string,
  coachFeedback?: string,
  customPersona?: string
): Promise<ServiceResult> => {
  const logs: ActionLogEntry[] = [];
  let imageErrorOccurred = false;

  if (!process.env.API_KEY) throw new Error("API_KEY_REQUIRED");

  const context = getPersonaLiveContext();
  const baseInstruction = customPersona || SYSTEM_INSTRUCTION;
  const isPostMoment = customIntent?.includes('POST_MOMENT');

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let response: GenerateContentResponse;
    let actionType: any = isPostMoment ? 'POST_MOMENT' : 'CHAT';
    
    const contextSystemPrompt = `
    [CONTEXT]
    Location: ${contextData.location}.
    Outfit: ${contextData.outfit}.
    `;

    if (isPostMoment) {
        // --- 朋友圈生成逻辑 ---
        const momentPrompt = `
        TASK: Write a WeChat Moment (Social Media Post).
        CONTEXT: ${customIntent}
        ${contextSystemPrompt}
        
        RULES:
        1. Short, life-oriented text (max 20 words).
        2. NO talking to "Boss" or "You". It's a broadcast to friends.
        3. Casual, slightly show-off or complaining tone.
        4. MUST use 'take_selfie' tool to generate the image for the post.
        `;
        logs.push(createLog('DECISION', 'Generating Social Moment', customIntent));

        response = await withRetry(async () => {
            return await ai.models.generateContent({
                model: chatModelId,
                contents: [{ role: 'user', parts: [{ text: baseInstruction + momentPrompt }]}],
                config: { tools: chatTools }
            });
        });

    } else if (customIntent) {
        // 普通主动聊天
        const thoughtPrompt = customIntent + contextSystemPrompt; 
        logs.push(createLog('DECISION', 'Executing Layer 0 Directive', customIntent.substring(0, 50)));
        response = await withRetry(async () => {
            return await ai.models.generateContent({
                model: chatModelId,
                contents: [
                    { role: 'user', parts: [{ text: baseInstruction }]},
                    ...history.slice(-5).filter(m => !m.isInternal).map(m => ({ role: m.role === MessageRole.USER ? 'user' : 'model', parts: [{ text: m.text }] })),
                    { role: 'user', parts: [{ text: thoughtPrompt }]}
                ],
                config: { tools: chatTools }
            });
        });

    } else {
       // 默认闲聊 / 搜索 (Keep existing browsing logic if needed, simplified here)
       const thoughtPrompt = `User silent. Send flirty message. ${contextSystemPrompt}`;
       response = await withRetry(async () => {
         return await ai.models.generateContent({
             model: chatModelId,
             contents: [
                 { role: 'user', parts: [{ text: baseInstruction }]},
                 ...history.slice(-3).map(m => ({ role: m.role === MessageRole.USER ? 'user' : 'model', parts: [{ text: m.text }] })),
                 { role: 'user', parts: [{ text: thoughtPrompt }]}
             ],
             config: { tools: chatTools }
         });
       });
    }

    const functionCalls = response.functionCalls;
    let generatedImageBase64: string | undefined = undefined;
    
    if (functionCalls) {
         for (const call of functionCalls) {
            if (call.name === 'log_thought') logs.push(createLog('THOUGHT', (call.args as any).thought));
            if (call.name === 'take_selfie' && !isImageGenerationPaused) {
                const imgResult = await generateSelfieImage(
                    imageModelId, 
                    contextData,
                    (call.args as any).action_description || "Selfie", 
                    (call.args as any).facial_expression
                );
                if (imgResult.error) imageErrorOccurred = true;
                generatedImageBase64 = imgResult.image;
                logs.push(imgResult.log);
            }
         }
    }

    let { text, sources } = parseResponse(response);
    
    // 如果是发朋友圈但没生成图，强制失败标记（因为朋友圈通常带图）
    if (isPostMoment && !generatedImageBase64 && !imageErrorOccurred) {
        // Optional: retry logic or just let it consist of text only
    }

    return { 
        text: text || "", 
        sources, 
        image: generatedImageBase64, 
        actionType, 
        logs, 
        imageError: imageErrorOccurred 
    };
  } catch (error: any) { 
    throw error; 
  }
};
