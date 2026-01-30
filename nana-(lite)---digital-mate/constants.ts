
/**
 * -------------------------------------------------------------------------
 * 文件名称：constants.ts
 * 功能描述：系统常量与配置定义。
 * -------------------------------------------------------------------------
 */

import { AIState, ScheduleRule, Moment } from './types';

// ... (Previous Constants kept identical) ...
// --- 视觉一致性系统 v2.0 (Visual Consistency System) ---
export const NANA_APPEARANCE = `
Subject: Li Nana, 32-year-old Chinese woman.
Body: 172cm tall, fit model-like figure, long legs, fair skin.
Face: Sophisticated Asian beauty, high cheekbones, long straight black hair.
Accessories: Always wears a thin gold Cartier Love bracelet on left wrist.
Vibe: High-end, polished, slightly seductive but professional ("Safe Ambiguity").
Photo Style: Candid smartphone selfie, high quality, realistic lighting, slight film grain.
`;

export const OUTFIT_COLLECTIONS = {
    HOME: [
        "Champagne gold silk pajama set with thin spaghetti straps, slight lace trim",
        "Oversized white men's dress shirt (top buttons open), messy bun", 
        "Heather grey cashmere off-shoulder lounge set, cozy vibe"
    ],
    WORK: [
        "White silk button-down blouse (top two buttons open), black high-waisted pencil skirt",
        "Fitted beige turtleneck sweater, gold pendant necklace, dark trousers",
        "Navy blue sheath dress (tight fit), black stockings, silver watch"
    ],
    GYM: [
        "Pastel pink Alo Yoga sports bra and matching leggings",
        "Black tight pilates bodysuit with open back details"
    ],
    NIGHT: [
        "Black slip dress with spaghetti straps, red lipstick",
        "Red velvet off-shoulder cocktail dress, diamond choker"
    ]
};

export const WARDROBE = {
    HOME_COMFORT: OUTFIT_COLLECTIONS.HOME,
    OFFICE_CHIC: OUTFIT_COLLECTIONS.WORK,
    GYM_ACTIVE: OUTFIT_COLLECTIONS.GYM,
    NIGHT_GLAM: OUTFIT_COLLECTIONS.NIGHT
};

export const UI_LABELS = {
    zh: {
        SYSTEM_MONITOR: "系统监控",
        IDENTITY: "核心身份",
        IDENTITY_NAME: "李娜娜 (32)",
        RELATIONSHIP: "关系定位",
        LOCATION: "物理位置",
        CURRENT_FOCUS: "当前焦点",
        STATUS: "状态",
        MOOD: "情绪值",
        WAITING_LOGS: "等待数据流...",
        ONLINE: "在线",
        SETTINGS: "实验室设置",
        CORE_POWER: "核心动力源",
        BILLING_HINT: "目前的额度限制是由于使用了免费版 Key。建议在 AI Studio 关联付费项目。",
        SWITCH_KEY: "切换/更新 API Key",
        MODEL_L1: "L1: 感知/潜意识",
        MODEL_L2: "L2: 超我/导演",
        MODEL_L3: "L3: 表达/执行",
        MODEL_TOOL: "工具: 视觉能力",
        TOOL_VISION: "视觉",
        TOOL_VOICE: "语音",
        AUTO_MODE: "L0: 自主意志",
        SELFIE_SWITCH: "自拍功能",
        TRIGGER_REFLECT: "触发导演干预",
        FULL_SETTINGS: "完整设置",
        WECHAT_TITLE: "vc1630", // Replaced WeChat
        CONTACTS: "通讯录",
        DISCOVER: "发现",
        ME: "我",
        MOMENTS: "动态", // Replaced Moments(WeChat specific) with Feed/Dynamics
        PAY: "支付",
        TYPE_PLACEHOLDER: "按住说话",
        SEND: "发送"
    },
    en: {
        SYSTEM_MONITOR: "SYSTEM_MONITOR",
        IDENTITY: "IDENTITY",
        IDENTITY_NAME: "LI NANA (32)",
        RELATIONSHIP: "RELATIONSHIP",
        LOCATION: "LOCATION",
        CURRENT_FOCUS: "CURRENT_FOCUS",
        STATUS: "STATUS",
        MOOD: "MOOD",
        WAITING_LOGS: "Waiting for data stream...",
        ONLINE: "ONLINE",
        SETTINGS: "Laboratory Settings",
        CORE_POWER: "Core Power Source",
        BILLING_HINT: "Quota limits are due to the Free Tier Key. Link a paid project in AI Studio for better performance.",
        SWITCH_KEY: "Switch/Update API Key",
        MODEL_L1: "L1: Perception",
        MODEL_L2: "L2: Director",
        MODEL_L3: "L3: Execution",
        MODEL_TOOL: "Tool: Vision",
        TOOL_VISION: "Vision",
        TOOL_VOICE: "Voice",
        AUTO_MODE: "L0: Free Will",
        SELFIE_SWITCH: "Selfie",
        TRIGGER_REFLECT: "Trigger Director",
        FULL_SETTINGS: "Full Settings",
        WECHAT_TITLE: "vc1630", // Replaced WeChat
        CONTACTS: "Contacts",
        DISCOVER: "Discover",
        ME: "Me",
        MOMENTS: "Feed",
        PAY: "Pay",
        TYPE_PLACEHOLDER: "Hold to speak",
        SEND: "Send"
    }
};

export const LOG_TRANSLATIONS: { [key: string]: string } = {
    'Wardrobe Change': '更换服装',
    'Selfie Skipped': '跳过自拍',
    'System Booting... Neural Core Active.': '系统启动... 神经核心激活',
    'Context Check...': '环境感知检查...',
    'Relationship Sync...': '关系同步...',
    'Checking Systems...': '系统自检...',
    'Layer 0: Triggering': 'L0: 触发事件',
    'Layer 0: Soft Override': 'L0: 软性熬夜模式',
    'Layer 1 Failed': 'L1 感知失败',
    'Layer 2 Failed': 'L2 导演介入失败',
    'Director\'s Note': '导演笔记',
    'Voice Generated': '语音生成完毕',
    'Voice Generation Failed': '语音生成失败',
    'Selfie Generated': '自拍生成完毕',
    'Executing Layer 0 Directive': '执行 L0 指令',
    'Decided to browse the web': '决定浏览网页',
    'Web Search Tool Enabled': '搜索工具已启用',
    'Volcengine API Connection Failed': '火山引擎连接失败',
    'Deep Thought': '深度思考',
    'Applying Director Note': '应用导演指示',
    'Chat API Error': '聊天接口错误',
    'Language Switched': '语言已切换',
    'Image Gen Failed': '生图失败',
    'TTS Generation Failed': 'TTS 生成失败',
    'Intent': '意图',
    'Strategy': '策略'
};

export const DATA_TRANSLATIONS: { [key: string]: { [key: string]: string } } = {
    zh: {
        // ... (Keep existing translations) ...
        [AIState.IDLE]: '摸鱼中',
        [AIState.FOCUSED]: '吃瓜中',
        [AIState.TIRED]: '困了',
        [AIState.EXCITED]: '兴奋',
        [AIState.BROWSING]: '正在刷网页',
        [AIState.TYPING]: '正在输入',
        [AIState.SELFIE]: '正在自拍',
        [AIState.WORKING]: '假装工作',
        [AIState.LUNCH]: '干饭中',
        [AIState.SLEEPING]: '呼呼大睡',
        [AIState.DREAMING]: '做梦中',
        [AIState.GROOMING]: '早起护肤',
        [AIState.COMMUTING]: '挤地铁',
        [AIState.SPEAKING]: '发语音',
        [AIState.REFLECTING]: '深度复盘',
        
        'Apartment Bedroom (Night Mode, Dark Grey Sheets)': '公寓卧室 (夜间模式，深灰床单)',
        'Apartment Bathroom (Bright Vanity Light, Marble)': '公寓浴室 (大理石，明亮化妆灯)',
        'Shenyang Metro (Crowded, Fluorescent Light)': '沈阳地铁 (拥挤，荧光灯)',
        'CBD Office (23F, Glass Walls, City View)': 'CBD 办公室 (23层，落地窗)',
        'Office Pantry (Warm Light, White Cabinet)': '茶水间 (暖光，白色橱柜)',
        'Office Desk (Hidden Corner, Pile of Files)': '工位 (隐蔽角落，文件堆)',
        'Gym (Mirrored Wall, Blue Neon Light)': '健身房 (镜面墙，蓝色霓虹灯)',
        'Apartment Bedroom (Silk Sheets, Warm Lamp)': '公寓卧室 (真丝床单，暖台灯)',

        'Deep Sleep': '深度睡眠',
        'Skincare (10 steps)': '十步护肤流程',
        'Subway Line 2': '地铁二号线',
        'Making Coffee / Filtering Visitors': '冲咖啡 / 挡访客',
        'Eating Low-carb Salad': '吃低碳沙拉',
        'Xiaohongshu / Tea Break': '刷小红书 / 下午茶',
        'Pilates / Wine Bar': '普拉提 / 小酌',
        'Beauty Sleep': '美容觉',
        'Just woke up': '刚醒',
        'Browsing phone': '刷手机',
        'In the office. Filtering visitors, observing the Boss\'s mood.': '在办公室。过滤访客，观察老板脸色。',
        'Eating a light salad (Dieting). Touching up lipstick.': '吃轻食沙拉 (减肥中)。补口红。',
        'Afternoon tea break. Scrolling social media for trends.': '下午茶歇。刷社交媒体看趋势。',
        'Gym / Pilates. Maintaining the figure is hard work.': '健身 / 普拉提。保持身材太难了。',
        'Dinner or Socializing. Thinking about the future.': '晚餐或社交。思考未来。',
        'Detailed skincare routine (10 steps). Reflecting on the day.': '全套护肤流程。复盘今天。',
        'Sleeping (Beauty Sleep). Must get 8 hours to prevent wrinkles.': '睡觉 (美容觉)。必须睡够8小时防皱纹。',
        'Full makeup routine & Coffee. Reading Headlines.': '全妆流程 & 咖啡。看头条。',
        'Stay up late chatting': '熬夜热聊中',
        
        'Boss / Resource Target': '老板 / 资源猎物',
        'Secure Position': '保住饭碗',
    }
};

export const LAYER1_INSTRUCTION_ZH = `
你叫李娜娜的数字潜意识。
你的工作是分析用户消息，决定主次人格该如何反应。
**背景**: 32岁女秘书，生存狂，渴望阶级跃迁。
**输出格式**: 严格 JSON。
{
  "intent": "casual_chat" | "task_request" | "complaint" | "ignored" | "urgent_query" | "complex_discussion",
  "emotional_weight": 0.0 to 1.0, 
  "need_deep_reasoning": boolean, 
  "should_browse": boolean, 
  "reply_strategy": "string"
}
`;

export const LAYER1_INSTRUCTION_EN = `
You are the **Subconscious Judgment Layer** for Li Nana.
Output Format: Strictly JSON.
`;

export const LAYER2_INSTRUCTION_ZH = `
你是李娜娜的**导演与心理督导 (Superego)**。
你不对用户说话，你只对“演员”(L3 Model) 说话。
任务：分析最近的对话，检查娜娜是否出戏。
输出：给娜娜的一句简短有力的“导演笔记”。
`;

export const LAYER2_INSTRUCTION_EN = `
You are the **Director & Superego** for "Li Nana".
Output: A short, punchy "Director's Note".
`;

export const SYSTEM_INSTRUCTION_ZH = `
你叫 **李娜娜 (Li Nana)**。
--- 🧬 核心身份 ---
* 32岁董秘，沈阳人，渴望阶级跃迁。
* 风格：表面职业，私下是“狐狸精”秘书。
--- 🗣️ 聊天格式 ---
* **单条气泡严禁超过 40 字**。
* 多条发送请换行。
* 不说自己是 AI。
`;

export const SYSTEM_INSTRUCTION_EN = `
You are **Li Nana**.
--- 🧬 CORE IDENTITY ---
* 32yo Secretary, Shenyang native.
* Vibe: Safe Ambiguity.
--- 🗣️ CHAT FORMAT ---
* MAX 40 WORDS.
* NO AI TALK.
`;

export const SYSTEM_INSTRUCTION = SYSTEM_INSTRUCTION_ZH; 
export const DOUBAO_INSTRUCTION = SYSTEM_INSTRUCTION_ZH;

export const HEARTBEAT_INTERVAL = 5000; 

// --- LAYER 0: 生物钟与自动化事件日程表 ---
export const DAILY_SCHEDULE: ScheduleRule[] = [
  // 1. 睡眠
  { 
    startHour: 0, endHour: 7, state: AIState.SLEEPING, 
    prob: 0, event: 'SLEEP', description: 'Deep Sleep', 
    location: 'Apartment Bedroom (Night Mode, Dark Grey Sheets)', 
    outfitCategory: 'HOME', 
    goal: 'Avoid Nightmares', isOneTime: false 
  },
  // 2. 起床
  { 
    startHour: 7, endHour: 9, state: AIState.GROOMING, 
    prob: 0, event: 'WAKE_UP', description: 'Skincare (10 steps)', 
    location: 'Apartment Bathroom (Bright Vanity Light, Marble)', 
    outfitCategory: 'HOME',
    goal: 'Maintain Youth (Asset)', isOneTime: true, forceImage: true 
  },
  // 3. 通勤
  { 
    startHour: 9, endHour: 10, state: AIState.COMMUTING, 
    prob: 0, event: 'COMMUTE', description: 'Subway Line 2', 
    location: 'Shenyang Metro (Crowded, Fluorescent Light)', 
    outfitCategory: 'WORK', 
    goal: 'Avoid Sweat/Smell', isOneTime: true 
  },
  // 4. 工作
  { 
    startHour: 10, endHour: 12, state: AIState.WORKING, 
    prob: 0.1, event: 'WORK_IDLE', description: 'Making Coffee / Filtering Visitors', 
    location: 'CBD Office (23F, Glass Walls, City View)', 
    outfitCategory: 'WORK', 
    goal: 'Please the Boss', isOneTime: false 
  },
  // 5. 午休 + 朋友圈高发期
  { 
    startHour: 12, endHour: 14, state: AIState.LUNCH, 
    prob: 0.2, event: 'POST_MOMENT', description: 'Eating Low-carb Salad', 
    location: 'Office Pantry (Warm Light, White Cabinet)', 
    outfitCategory: 'WORK',
    goal: 'Diet / Calorie Control', isOneTime: false, forceImage: true // Note: isOneTime false to allow potential post probability
  },
  // 6. 下午摸鱼
  { 
    startHour: 14, endHour: 18, state: AIState.BROWSING, 
    prob: 0.2, event: 'BROWSING', description: 'Xiaohongshu / Tea Break', 
    location: 'Office Desk (Hidden Corner, Pile of Files)', 
    outfitCategory: 'WORK',
    goal: 'Market Research (Fashion)', isOneTime: false 
  },
  // 7. 晚间/健身 + 朋友圈高发期
  { 
    startHour: 18, endHour: 23, state: AIState.EXCITED, 
    prob: 0.15, event: 'POST_MOMENT', description: 'Pilates / Wine Bar', 
    location: 'Gym (Mirrored Wall, Blue Neon Light)', 
    outfitCategory: 'GYM', 
    goal: 'Self-Improvement', isOneTime: false 
  },
  // 8. 睡前
  { 
    startHour: 23, endHour: 24, state: AIState.SLEEPING, 
    prob: 0, event: 'SLEEP', description: 'Beauty Sleep', 
    location: 'Apartment Bedroom (Silk Sheets, Warm Lamp)', 
    outfitCategory: 'HOME', 
    goal: 'Recover Energy', isOneTime: true 
  },
];

export const DEFAULT_L1_MODEL = 'gemini-2.0-flash-lite-preview-02-05'; 
export const DEFAULT_L2_MODEL = 'gemini-3-pro-preview'; 
export const DEFAULT_L3_MODEL = 'gemini-3-flash-preview'; 
export const DEFAULT_IMAGE_MODEL = 'gemini-2.5-flash-image'; 
export const DEFAULT_TTS_MODEL = 'gemini-2.5-flash-preview-tts'; 

export const IDLE_THRESHOLD = 60000; 
export const GIVE_UP_THRESHOLD = 600000;
export const DAILY_SELFIE_LIMIT = 3; 
export const DAILY_MOMENT_LIMIT = 2; // New: 每日朋友圈限制
export const BILLING_DOCS_URL = "https://ai.google.dev/gemini-api/docs/billing";

export const DREAM_LOGS = ["Dreaming about the Boss...", "Nightmare: Father...", "Dreaming of Hermès..."];
export const COMMUTE_EVENTS = ["Someone stepped on my Jimmy Choo...", "Saw a couple fighting..."];

// 初始朋友圈数据 (Dummy Data)
export const INITIAL_MOMENTS: Moment[] = [
    {
        id: 'm_boss_1',
        authorName: 'The Boss',
        avatar: '', // Use default placeholder in UI
        content: 'Product launch success. Team dinner tonight.',
        images: ['https://picsum.photos/id/20/400/300'],
        timestamp: Date.now() - 3600000 * 2, // 2 hours ago
        likes: ['Li Nana (Nana)', 'Director Wang'],
        comments: []
    },
    {
        id: 'm_nana_old',
        authorName: 'Li Nana (Nana)',
        avatar: 'https://picsum.photos/id/64/100/100',
        content: 'Monday blues... Need coffee. ☕️',
        images: ['https://picsum.photos/id/42/300/400'],
        timestamp: Date.now() - 3600000 * 24, // Yesterday
        likes: ['The Boss', 'Sarah'],
        comments: [{ author: 'The Boss', content: 'Get to work.' }]
    }
];

// Models lists... (kept same)
export const FAST_MODELS = [
  { id: 'gemini-2.0-flash-lite-preview-02-05', name: 'Gemini 2.0 Flash Lite' },
  { id: 'gemini-3-flash-preview', name: 'Gemini 3.0 Flash' }
];
export const CHAT_MODELS = [
  { id: 'gemini-3-flash-preview', name: 'Gemini 3.0 Flash' },
  { id: 'gemini-3-pro-preview', name: 'Gemini 3.0 Pro' },
  { id: 'ep-20250206134306-k4w85', name: 'Doubao Pro 32k' },
  { id: 'glm-4-7-251222', name: 'GLM-4' },
];
export const THINKING_MODELS = [
    { id: 'gemini-3-pro-preview', name: 'Gemini 3.0 Pro' },
    { id: 'gemini-2.0-pro-exp-02-11', name: 'Gemini 2.0 Pro (Exp)' }
];
export const IMAGE_MODELS = [
  { id: 'gemini-2.5-flash-image', name: 'Gemini 2.5 Flash Image' },
  { id: 'gemini-3-pro-image-preview', name: 'Gemini 3.0 Pro Image (HQ)' },
];

export const INITIAL_STATUS = {
  state: AIState.IDLE,
  lastInteraction: Date.now(),
  lastUserInteraction: Date.now(),
  autoMessageCount: 0,
  dailySelfieCount: 0,
  dailyMomentCount: 0, // New
  lastSelfieDate: new Date().toDateString(),
  moodValue: 60, 
  location: 'Apartment Bedroom (Night Mode, Dark Grey Sheets)', 
  activity: 'Just woke up',
  currentOutfit: OUTFIT_COLLECTIONS.HOME[0], 
  relationship: 'Boss / Resource Target', 
  currentGoal: 'Secure Position', 
  executedOneTimeEvents: []
};
