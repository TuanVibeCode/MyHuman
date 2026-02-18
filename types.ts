
/**
 * -------------------------------------------------------------------------
 * 文件名称：types.ts
 * 功能描述：TypeScript 类型定义文件。
 * -------------------------------------------------------------------------
 */

import React from 'react';

// AI Studio 窗口对象扩展
export interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

interface Window {
  aistudio: AIStudio;
}

// 语言类型
export type Language = 'zh' | 'en';

// 消息角色枚举
export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

// AI 状态枚举
export enum AIState {
  IDLE = 'IDLE',
  FOCUSED = 'FOCUSED',
  TIRED = 'TIRED',
  EXCITED = 'EXCITED',
  BROWSING = 'BROWSING',
  TYPING = 'TYPING',
  SELFIE = 'SELFIE',
  WORKING = 'WORKING',
  LUNCH = 'LUNCH',
  SLEEPING = 'SLEEPING',
  DREAMING = 'DREAMING',
  GROOMING = 'GROOMING',
  COMMUTING = 'COMMUTING',
  SPEAKING = 'SPEAKING',
  REFLECTING = 'REFLECTING',
  // New States
  SHOPPING = 'SHOPPING', // 逛街
  SPA = 'SPA',           // 美容/SPA
  DRINKING = 'DRINKING', // 喝酒/社交
  TRANSIT = 'TRANSIT'    // 非通勤的移动（如打车去餐厅）
}

// 系统事件类型
export type SystemEventType = 
    | 'WAKE_UP' | 'SLEEP' | 'COMMUTE' | 'WORK_IDLE' | 'LUNCH' | 'BROWSING' | 'NONE' 
    | 'REFLECTION' | 'POST_MOMENT'
    // New Events
    | 'WEEKEND_BRUNCH'  // 周末早午餐
    | 'SHOPPING_SPREE'  // 购物
    | 'LATE_NIGHT_EMO'  // 深夜网抑云
    | 'SPA_TIME'        // 美容时间
    | 'MONDAY_BLUE';    // 周一综合症

// UI 可视化状态
export type ActiveProcessType = 'IDLE' | 'L1_PERCEPTION' | 'L2_DIRECTOR' | 'L3_EXECUTION' | 'TOOL_TTS' | 'TOOL_VISION';

// 朋友圈动态接口 (New)
export interface Moment {
  id: string;
  authorName: string;
  avatar: string;
  content: string;
  images: string[]; // Base64 or URL
  timestamp: number;
  likes: string[]; // List of names who liked
  comments: { author: string; content: string }[];
}

// Layer 1 (感知层) 的分析结果接口
export interface Layer1Analysis {
  intent: 'casual_chat' | 'task_request' | 'complaint' | 'ignored' | 'urgent_query';
  emotional_weight: number; 
  need_deep_reasoning: boolean;
  should_browse: boolean;
  reply_strategy: string; 
}

// Layer 2 (导演层) 的分析结果接口
export interface Layer2Analysis {
    critique: string;
    suggestion: string;
    consistency_score: number;
    updated_strategy: string;
}

// 生物钟日程规则接口
export interface ScheduleRule {
  startHour: number;
  endHour: number;
  state: AIState;
  prob: number; 
  event: SystemEventType;
  description: string;
  location: string; 
  outfitCategory: 'HOME' | 'WORK' | 'GYM' | 'NIGHT' | 'WEEKEND' | 'COAT'; 
  goal: string; 
  isOneTime?: boolean; 
  forceImage?: boolean; 
}

// 引用来源接口
export interface GroundingSource {
  title?: string;
  uri?: string;
}

// 核心日志条目接口
export interface ActionLogEntry {
  id: string;
  timestamp: number;
  type: 'SYSTEM' | 'IMAGE_GEN' | 'DECISION' | 'ERROR' | 'THOUGHT' | 'SEARCH' | 'DREAM' | 'VOICE_DESIGN' | 'LAYER1' | 'LAYER2';
  content: string;
  details?: string;
}

// 聊天消息接口
export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: number;
  sources?: GroundingSource[];
  image?: string;
  audio?: string; 
  audioUrl?: string; 
  audioDuration?: number; 
  isInternal?: boolean; 
}

// AI 全局状态接口
export interface AIStatus {
  state: AIState;
  lastInteraction: number;
  lastUserInteraction: number;
  autoMessageCount: number;
  dailySelfieCount: number;
  dailyMomentCount: number; 
  lastSelfieDate: string;
  moodValue: number;
  currentAction?: string;
  location: string;
  activity: string;
  currentOutfit: string;
  relationship: string; 
  currentGoal: string; 
  executedOneTimeEvents: string[]; 
}

// 服务层返回结果接口
export interface ServiceResult {
  text: string;
  sources: GroundingSource[];
  image?: string;
  audio?: string;
  audioDuration?: number;
  actionType?: 'SEARCH' | 'CHAT' | 'NONE' | 'POST_MOMENT';
  logs: ActionLogEntry[];
  imageError?: boolean;
}

// Context 上下文接口
export interface AIContextType {
  messages: Message[];
  status: AIStatus;
  logs: ActionLogEntry[];
  moments: Moment[]; 
  language: Language; 
  
  isAutoMode: boolean; 
  isSubmitting: boolean;
  isApiKeyNeeded: boolean; 
  isQuotaExhausted: boolean;
  isImageGenerationPaused: boolean; 
  isVoiceEnabled: boolean; 
  isImageQuotaExhausted: boolean;
  
  l1ModelId: string; 
  l2ModelId: string; 
  l3ModelId: string; 
  imageModelId: string; 

  activeProcess: ActiveProcessType;
  directorFeedback: string; 
  
  currentPersona: string;
  setCurrentPersona: (persona: string) => void;
  lastLayer1Strategy: string;

  setLanguage: (lang: Language) => void;
  toggleAutoMode: () => void;
  toggleImageGenerationPause: () => void; 
  toggleVoiceEnabled: () => void;
  handleUserMessage: (text: string, audioBlob?: Blob, audioDuration?: number) => Promise<void>;
  addMessage: (msg: Message) => void;
  addMoment: (moment: Moment) => void;
  addLog: (log: ActionLogEntry) => void;
  updateStatus: (updates: Partial<AIStatus>) => void;
  setSubmitting: (val: boolean) => void;
  setApiKeyNeeded: (val: boolean) => void; 
  setQuotaExhausted: (val: boolean) => void;
  setImageQuotaExhausted: (val: boolean) => void; 
  
  setL1ModelId: (id: string) => void;
  setL2ModelId: (id: string) => void;
  setL3ModelId: (id: string) => void;
  setImageModelId: (id: string) => void;
  
  incrementAutoMessageCount: () => void;
  runDirectorManualTrigger: () => Promise<void>;
  
  latestMessagesRef: React.MutableRefObject<Message[]>;
  latestStatusRef: React.MutableRefObject<AIStatus>;
  latestIsImageGenerationPausedRef: React.MutableRefObject<boolean>; 
  latestIsVoiceEnabledRef: React.MutableRefObject<boolean>; 
  latestL3ModelIdRef: React.MutableRefObject<string>;
  latestL2ModelIdRef: React.MutableRefObject<string>;
  latestImageModelIdRef: React.MutableRefObject<string>;
  latestDirectorFeedbackRef: React.MutableRefObject<string>;
  latestCurrentPersonaRef: React.MutableRefObject<string>;
}
