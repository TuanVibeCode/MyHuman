
/**
 * -------------------------------------------------------------------------
 * 文件名称：services/volcService.ts
 * 功能描述：火山引擎 (豆包) API 服务封装。
 * 
 * 职责：
 * 1. 处理调用豆包 (Doubao Pro/Lite) 或 GLM 等国内模型的请求。
 * 2. 转换 Google Gemini 消息格式为 Volcengine V3 格式。
 * 3. 注入防止 AI 承认自己无法生成图片的特殊指令。
 * -------------------------------------------------------------------------
 */

import { Message, MessageRole, GroundingSource, ActionLogEntry } from "../types";
import { DOUBAO_INSTRUCTION } from "../constants";
import { generateId, getPersonaLiveContext } from "../utils/helpers";

const VOLC_API_KEY = "4a1819f1-dc5b-4544-a02d-88528864262d";
const VOLC_ENDPOINT = "https://ark.cn-beijing.volces.com/api/v3/responses";

export interface VolcResult {
  text: string;
  sources: GroundingSource[];
  logs: ActionLogEntry[];
}

export const sendVolcChatMessage = async (
  history: Message[],
  newMessage: string,
  modelId: string,
  layer1Intent?: string,
  coachFeedback?: string
): Promise<VolcResult> => {
  const logs: ActionLogEntry[] = [];
  
  // 获取实时上下文
  const context = getPersonaLiveContext();
  const contextInstruction = `
  【实时情境】
  时间: ${context.timeString} (辽宁沈阳).
  你的状态: ${context.state}.
  你的活动: ${context.activityDescription}.
  ${layer1Intent ? `\n[潜意识判断]: ${layer1Intent}` : ''}
  
  【特别指令：照片请求】
  你当前的模型无法直接生成图片。
  如果老板向你要照片或自拍：
  1. 绝对不要说“我是AI无法生成图片”这种破坏氛围的话。
  2. 要积极答应，然后找借口解释为什么发不出来。
  3. 借口示例：“哎呀老板，这破信号照片一直在转圈圈发不出去，气死人家了~”、“老板等下嘛，人家正忙着呢没法自拍，晚点补偿你好不好~”。
  4. 保持暧昧和顺从，让他觉得你是真的想发但客观条件不允许。
  `;

  // 注入 Layer 3 导演反馈
  const coachInstruction = coachFeedback 
      ? `\n\n🛑 【导演指示 (必须执行)】: ${coachFeedback}\n你必须先思考如何落实导演的要求，再回答老板。` 
      : '';

  // 转换消息格式
  const input = [
    {
      role: "system",
      content: [{ type: "input_text", text: DOUBAO_INSTRUCTION + contextInstruction + coachInstruction }]
    },
    ...history.slice(-10).map(m => ({
      role: m.role === MessageRole.USER ? "user" : "assistant",
      content: [{ type: "input_text", text: m.text }]
    })),
    {
      role: "user",
      content: [{ type: "input_text", text: newMessage + coachInstruction }]
    }
  ];

  try {
    logs.push({
      id: generateId(),
      timestamp: Date.now(),
      type: 'SYSTEM',
      content: `Nana is connecting to Volcengine Ark...`,
      details: `Model: ${modelId} | State: ${context.state}`
    });

    const requestBody: any = {
      model: modelId,
      input: input
    };

    // 为 GLM-4 开启搜索工具
    if (modelId.includes('glm')) {
        requestBody.tools = [{
            type: "web_search",
            max_keyword: 3
        }];
        logs.push({
            id: generateId(),
            timestamp: Date.now(),
            type: 'SYSTEM',
            content: 'Web Search Tool Enabled',
            details: 'GLM-4 active'
        });
    }

    const response = await fetch(VOLC_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VOLC_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.error?.message || errData?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    let text = "";

    const choices = data.choices || data.output?.choices;
    if (choices && choices.length > 0) {
      const choice = choices[0];
      if (choice.message?.content) {
        const content = choice.message.content;
        if (typeof content === 'string') text = content;
        else if (Array.isArray(content)) {
          text = content
            .filter((c: any) => c.type === 'text' || c.type === 'input_text')
            .map((c: any) => c.text)
            .join('\n');
        }
      } else if (choice.text) {
        text = choice.text;
      }
    } 
    else if (Array.isArray(data.output)) {
      for (const item of data.output) {
        if (item.type === 'reasoning' && Array.isArray(item.summary)) {
           const reasoningText = item.summary
             .map((s: any) => s.text)
             .join('\n');
           
           if (reasoningText) {
             logs.push({
               id: generateId(),
               timestamp: Date.now(),
               type: 'THOUGHT',
               content: 'Deep Thought',
               details: reasoningText
             });
           }
           continue;
        }

        let contentCandidate = 
            item.text || 
            item.content || 
            item.message?.content || 
            item.message?.text;

        if (contentCandidate) {
            if (typeof contentCandidate === 'string') {
                text += contentCandidate;
            } else if (Array.isArray(contentCandidate)) {
                text += contentCandidate
                   .filter((c: any) => c.type === 'text' || c.type === 'input_text' || c.text)
                   .map((c: any) => c.text || '')
                   .join('\n');
            }
        }
      }
    }

    if (text) {
        // 清理 DeepSeek R1 样式的思维链标签，避免显示给用户
        text = text
            .replace(/<think>[\s\S]*?<\/think>/gi, '') 
            .replace(/\[Thinking:[\s\S]*?\]/gi, '')    
            .replace(/^Reasoning:.*$/gim, '')           
            .trim();
    }

    if (!text) {
      const hasReasoning = logs.some(l => l.type === 'THOUGHT');
      if (hasReasoning) {
          text = "(陷入沉思...)";
      } else {
          text = "哎呀，老板你刚说啥？人家刚才走神了嘛~";
      }
    }

    return {
      text,
      sources: [],
      logs
    };
  } catch (error: any) {
    logs.push({
        id: generateId(),
        timestamp: Date.now(),
        type: 'ERROR',
        content: 'Volcengine API Connection Failed',
        details: error.message
    });
    throw error;
  }
};
