
/**
 * -------------------------------------------------------------------------
 * 文件名称：services/layer3Service.ts -> (Conceptually Layer 2)
 * 功能描述：L2 - 导演/超我层 (Superego / Director)。
 * 
 * 职责：
 * 1. 监控 L3 (演员) 的表现。
 * 2. 检查人设一致性。
 * 3. 提供“导演笔记” (Director's Note)。
 * -------------------------------------------------------------------------
 */

import { GoogleGenAI } from "@google/genai";
import { LAYER2_INSTRUCTION_ZH, LAYER2_INSTRUCTION_EN } from "../constants"; // Use L2 Instruction
import { ActionLogEntry, Message, MessageRole, Language } from "../types";
import { generateId, getPersonaLiveContext } from "../utils/helpers";

const createLog = (type: ActionLogEntry['type'], content: string, details?: string): ActionLogEntry => ({
  id: generateId(),
  timestamp: Date.now(),
  type,
  content,
  details
});

// Renamed function to reflect L2 role
export const runLayer2Director = async (
    history: Message[],
    modelId: string,
    language: Language,
    reason?: string
): Promise<{ feedback: string, log: ActionLogEntry }> => {
    
    if (!process.env.API_KEY) throw new Error("API Key Required for L2");

    const context = getPersonaLiveContext();
    const shortContext = `Time: ${context.timeString}, Status: ${context.state}.`;
    
    const recentMessages = history.slice(-15).map(m => 
        `${m.role === MessageRole.USER ? 'Boss' : 'Nana'}: ${m.text} ${m.isInternal ? '(Internal Thought)' : ''}`
    ).join('\n');

    const prompt = `
    ${shortContext}
    [TRIGGER]: ${reason || "Routine Check"}
    [LOG]:
    ${recentMessages}

    Analyze Nana's performance. Output "Director's Note".
    `;

    const instruction = language === 'zh' ? LAYER2_INSTRUCTION_ZH : LAYER2_INSTRUCTION_EN;

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: modelId,
            contents: [
                { role: 'user', parts: [{ text: prompt }] }
            ],
            config: {
                systemInstruction: instruction,
                temperature: 0.7, 
            }
        });

        const feedback = response.text || "Maintain persona.";
        
        return {
            feedback: feedback,
            log: createLog('LAYER2', `Director's Note`, feedback)
        };

    } catch (error: any) {
        return {
            feedback: "",
            log: createLog('ERROR', 'L2 Director Failed', error.message)
        };
    }
};
