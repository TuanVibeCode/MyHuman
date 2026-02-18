
/**
 * -------------------------------------------------------------------------
 * 文件名称：services/layer1Service.ts
 * 功能描述：Layer 1 - 潜意识判断层 (Subconscious Judgment)。
 * 
 * 职责：
 * 1. 使用轻量级高速模型 (Flash Lite) 快速分析用户消息。
 * 2. 判断用户意图 (Intent)：闲聊、任务、抱怨等。
 * 3. 决定是否需要进行深度思考 (Need Deep Reasoning) 或上网搜索。
 * 4. 输出简短的回复策略供 Layer 2 参考。
 * -------------------------------------------------------------------------
 */

import { GoogleGenAI } from "@google/genai";
import { LAYER1_INSTRUCTION_ZH, LAYER1_INSTRUCTION_EN } from "../constants";
import { Layer1Analysis, ActionLogEntry, Language } from "../types";
import { generateId, getPersonaLiveContext } from "../utils/helpers";

const createLog = (type: ActionLogEntry['type'], content: string, details?: string): ActionLogEntry => ({
  id: generateId(),
  timestamp: Date.now(),
  type,
  content,
  details
});

export const runLayer1Analysis = async (
    lastUserMessage: string,
    modelId: string,
    language: Language
): Promise<{ analysis: Layer1Analysis, log: ActionLogEntry }> => {
    
    if (!process.env.API_KEY) throw new Error("API Key Required for Layer 1");

    const context = getPersonaLiveContext();
    const shortContext = `Time: ${context.timeString}, Status: ${context.state}.`;
    
    // 兜底策略 (Fallback)，防止模型调用失败导致流程中断
    const fallback: Layer1Analysis = {
        intent: 'casual_chat',
        emotional_weight: 0.1,
        need_deep_reasoning: false,
        should_browse: false,
        reply_strategy: "Standard persona response"
    };

    const instruction = language === 'zh' ? LAYER1_INSTRUCTION_ZH : LAYER1_INSTRUCTION_EN;

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const response = await ai.models.generateContent({
            model: modelId,
            contents: [
                { role: 'user', parts: [{ text: `${shortContext}\nUser Message: "${lastUserMessage}"` }] }
            ],
            config: {
                systemInstruction: instruction,
                responseMimeType: "application/json", // 强制返回 JSON
                temperature: 0.3, // 低温度，保证判断稳定性
            }
        });

        const text = response.text;
        if (!text) throw new Error("Empty Layer 1 response");

        const json = JSON.parse(text) as Layer1Analysis;
        
        // 合并兜底值，防止字段缺失
        const result = { ...fallback, ...json };

        return {
            analysis: result,
            log: createLog('LAYER1', `Intent: ${result.intent}`, `Strategy: ${result.reply_strategy} | Emo: ${result.emotional_weight}`)
        };

    } catch (error: any) {
        console.warn("Layer 1 Analysis Failed, using fallback", error);
        return {
            analysis: fallback,
            log: createLog('ERROR', 'Layer 1 Failed', error.message)
        };
    }
};
