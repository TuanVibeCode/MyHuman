
/**
 * -------------------------------------------------------------------------
 * 文件名称：utils/helpers.ts
 * 功能描述：通用辅助函数。
 * -------------------------------------------------------------------------
 */

import { AIState } from '../types';
import { OUTFIT_COLLECTIONS } from '../constants';

export const generateId = () => Math.random().toString(36).substring(2, 9);

export const getMoodColor = (value: number) => {
  if (value > 80) return 'bg-pink-500';
  if (value > 50) return 'bg-yellow-500';
  return 'bg-blue-500';
};

export interface PersonaContext {
  timeString: string;
  state: AIState;
  activityDescription: string;
  searchTopics: string[];
}

/**
 * 格式化微信风格时间戳
 * 规则: 
 * - 当天显示 HH:mm
 * - 昨天显示 Yesterday HH:mm
 * - 一周内显示 Weekday HH:mm
 * - 否则显示 YYYY/MM/DD HH:mm
 */
export const formatWeChatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    
    const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    if (isToday) {
        return timeStr;
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear();

    if (isYesterday) {
        return `Yesterday ${timeStr}`;
    }
    
    // 简单处理，非今天昨天则显示日期
    return `${date.getMonth() + 1}/${date.getDate()} ${timeStr}`;
};

/**
 * 每日穿搭解析器 (增强版：支持季节)
 */
export const resolveDailyOutfit = (category: keyof typeof OUTFIT_COLLECTIONS): string => {
    const today = new Date();
    const dayOfMonth = today.getDate(); // 1-31
    const month = today.getMonth(); // 0-11
    
    // 简单的季节判定：11, 0, 1, 2 为冬季/初春，需要加外套
    const isColdSeason = [10, 11, 0, 1, 2].includes(month);
    
    const collection = OUTFIT_COLLECTIONS[category];
    if (!collection) return OUTFIT_COLLECTIONS['HOME'][0];

    // 伪随机选择
    const index = dayOfMonth % collection.length;
    let baseOutfit = collection[index];

    // 如果是冷天且在户外/工作，强制加一件外套
    if (isColdSeason && (category === 'WORK' || category === 'WEEKEND')) {
        const coats = OUTFIT_COLLECTIONS['COAT'];
        const coatIndex = dayOfMonth % coats.length;
        return `${baseOutfit}, wearing ${coats[coatIndex]}`;
    }

    return baseOutfit;
};

/**
 * 获取符合当前状态的穿搭 (Legacy Wrapper)
 */
export const getOutfitByState = (targetState: AIState): string => {
    let category: keyof typeof OUTFIT_COLLECTIONS = 'HOME';
    
    switch(targetState) {
        case AIState.WORKING:
        case AIState.COMMUTING:
        case AIState.LUNCH:
        case AIState.BROWSING:
        case AIState.FOCUSED:
            category = 'WORK';
            break;
        case AIState.EXCITED:
        case AIState.DRINKING:
            category = 'NIGHT'; 
            break;
        case AIState.SHOPPING:
            category = 'WEEKEND';
            break;
        case AIState.SPA:
            category = 'HOME';
            break;
        default:
            category = 'HOME';
    }
    
    return resolveDailyOutfit(category);
};

// 获取 AI 当前的实时生活状态
export const getPersonaLiveContext = (): PersonaContext => {
  const now = new Date();
  const timeString = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  
  return {
    timeString,
    state: AIState.IDLE,
    activityDescription: "Being active",
    searchTopics: ["Liaoning weather", "OOTD office lady"]
  };
};
