<div align="center">

<h1>🤖 NANA</h1>

<p><strong>An Event-Driven Autonomous Agent Framework</strong></p>
<p><em>事件驱动的自主智能体框架</em></p>

<p>
  <img src="https://img.shields.io/badge/version-v0.9.0--beta-blue?style=flat-square" alt="Version">
  <img src="https://img.shields.io/badge/codename-NANA-purple?style=flat-square" alt="Codename">
  <img src="https://img.shields.io/badge/powered%20by-Gemini%20%7C%20Doubao-orange?style=flat-square" alt="Powered by">
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License">
</p>

<p>
  <a href="#english">English</a> ·
  <a href="#chinese">中文</a>
</p>

</div>

---

<a name="english"></a>

## 🇬🇧 English

### What is NANA?

**NANA** is an **Event-Driven Autonomous Agent Framework** that brings an AI agent to life with a persistent identity, a real-time bio-clock, and genuine autonomous behavior — not just a chatbot that waits for your input.

NANA's reference implementation ships as **Li Nana (李娜娜)**, a 32-year-old digital persona who sleeps, commutes, works, shops, posts to her social feed, and sends you messages entirely on her own schedule. She is the proof-of-concept that the framework works.

> **The core idea:** An agent should *exist* between conversations, not just *respond* during them.

---

### 🏗️ Architecture — The 4-Layer Cognitive Stack

NANA is built on a layered cognitive pipeline inspired by human psychology:

```
┌─────────────────────────────────────────────────────────┐
│  L0 · Bio-Clock & Free Will Engine  (useFreeWill hook)  │
│  Heartbeat timer · Schedule rules · Event triggers      │
├─────────────────────────────────────────────────────────┤
│  L1 · Perception Layer  (Gemini 2.0 Flash Lite)         │
│  Intent analysis · Emotional weight · Reply strategy    │
├─────────────────────────────────────────────────────────┤
│  L2 · Director / Superego  (Gemini 3.0 Pro)             │
│  Persona consistency · Director's Notes · Correction    │
├─────────────────────────────────────────────────────────┤
│  L3 · Execution Layer  (Gemini 3.0 Flash / Doubao Pro)  │
│  Final dialogue · Voice (TTS) · Selfie generation       │
└─────────────────────────────────────────────────────────┘
```

| Layer | Role | Model |
|-------|------|-------|
| **L0** | Bio-clock heartbeat, state machine, event scheduler | — (pure logic) |
| **L1** | Subconscious perception — reads intent, decides strategy | Gemini 2.0 Flash Lite |
| **L2** | Director / Superego — monitors persona consistency | Gemini 3.0 Pro |
| **L3** | Actor / Executor — generates final output | Gemini 3.0 Flash · Doubao Pro |

---

### ✨ Key Features

#### 🕐 Autonomous Existence (Event-Driven)
- A **heartbeat timer** (every 5 s) drives the agent's lifecycle
- Separate **weekday** and **weekend** schedule rules
- One-time daily events (wake-up, commute) and probabilistic recurring events (browsing, posting)
- **Soft Override**: if you're chatting late at night, she delays sleep

#### 🧠 Multi-Layer Reasoning
- **L1** fast-path: lightweight intent classification before every reply
- **L2** director: periodically audits the conversation and injects corrective "Director's Notes" into L3
- **L3** actor: synthesizes context from all layers into a final, in-character response

#### 🎭 Persona & Visual Consistency
- Outfit system with 6 categories (`HOME`, `WORK`, `GYM`, `NIGHT`, `WEEKEND`, `COAT`)
- Outfit resolves deterministically per day — she won't change clothes mid-afternoon
- AI-generated selfies reflect current location, outfit, and activity

#### 📱 Social Ecology — Moments Feed
- Agent autonomously **posts to a social feed** (text + selfie) up to 2× per day
- Feed supports likes and comments
- Mirrors the WeChat Moments UX

#### 🔊 Multimodal Output
- **Voice**: TTS responses with emotional tone design (`gemini-2.5-flash-preview-tts`)
- **Vision**: Selfie generation via `gemini-2.5-flash-image` / `gemini-3-pro-image-preview`
- **Text**: Emoji-rich, short-bubble chat format (≤ 40 words per bubble)

#### 🔀 Multi-Model Routing
- Seamlessly switches between **Google Gemini** and **Volcengine (Doubao/GLM)** backends
- Per-layer model selection in the UI settings

---

### ⚙️ Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `API_KEY` | ✅ Yes | Google Gemini API key (L1/L2/L3/Vision) |
| `VOLC_API_KEY` | Optional | Volcengine key for Doubao / GLM models |

Set these in `.env.local` or via the in-app **Laboratory Settings** panel.

---

### 🚀 Getting Started

```bash
# 1. Clone
git clone https://github.com/your-username/nana.git
cd nana

# 2. Install dependencies
npm install

# 3. Configure API key
echo "VITE_API_KEY=your_gemini_key_here" > .env.local

# 4. Run dev server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

### 📁 Project Structure

```
nana/
├── hooks/
│   └── useFreeWill.ts       # L0 — Bio-clock & autonomous event engine
├── services/
│   ├── layer1Service.ts     # L1 — Perception / intent analysis
│   ├── layer3Service.ts     # L3 — Execution / response generation
│   ├── unifiedService.ts    # Orchestration across all layers
│   ├── geminiService.ts     # Google Gemini API client
│   └── volcService.ts       # Volcengine (Doubao/GLM) API client
├── components/
│   ├── WeChatApp.tsx        # Main chat UI (WeChat-style)
│   ├── MomentsView.tsx      # Social feed / Moments
│   ├── RightPanel.tsx       # System monitor & status
│   ├── ActionLogPanel.tsx   # Real-time cognitive process log
│   └── SettingsModal.tsx    # Model & API key configuration
├── context/
│   └── AIContext.tsx        # Global state management
├── constants.ts             # Schedules, personas, model defaults
└── types.ts                 # TypeScript type definitions
```

---

### ⚠️ Disclaimer

This project is for **research and educational purposes only**. The AI persona is entirely fictional. All generated content reflects the simulated character, not the views of the developers.

---

<a name="chinese"></a>

## 🇨🇳 中文

### NANA 是什么？

**NANA** 是一个**事件驱动的自主智能体框架**。它赋予 AI 智能体持久的身份认同、实时生物钟和真正的自主行为——而不仅仅是一个等待用户输入的聊天机器人。

NANA 的参考实现是**李娜娜**，一位 32 岁的数字人设。她会睡觉、通勤、上班、逛街、发朋友圈，并完全按照自己的日程主动给你发消息。她是框架可行性的活体证明。

> **核心理念：** 智能体应该在对话间隙"存在"，而不只是在对话时"响应"。

---

### 🏗️ 架构 — 四层认知栈

NANA 基于受人类心理学启发的分层认知管道构建：

```
┌─────────────────────────────────────────────────────────┐
│  L0 · 生物钟与自主意志引擎  (useFreeWill hook)           │
│  心跳定时器 · 日程规则 · 事件触发                        │
├─────────────────────────────────────────────────────────┤
│  L1 · 感知层  (Gemini 2.0 Flash Lite)                   │
│  意图分析 · 情绪权重 · 回复策略                          │
├─────────────────────────────────────────────────────────┤
│  L2 · 导演 / 超我  (Gemini 3.0 Pro)                     │
│  人设一致性 · 导演笔记 · 行为纠偏                        │
├─────────────────────────────────────────────────────────┤
│  L3 · 执行层  (Gemini 3.0 Flash / Doubao Pro)           │
│  最终对话 · 语音 (TTS) · 自拍生成                        │
└─────────────────────────────────────────────────────────┘
```

| 层级 | 角色 | 模型 |
|------|------|------|
| **L0** | 生物钟心跳、状态机、事件调度器 | — (纯逻辑) |
| **L1** | 潜意识感知——读取意图，决定策略 | Gemini 2.0 Flash Lite |
| **L2** | 导演/超我——监控人设一致性 | Gemini 3.0 Pro |
| **L3** | 演员/执行者——生成最终输出 | Gemini 3.0 Flash · Doubao Pro |

---

### ✨ 核心功能

#### 🕐 自主存在（事件驱动）
- **心跳定时器**（每 5 秒）驱动智能体生命周期
- 独立的**工作日**与**周末**日程规则
- 一次性每日事件（起床、通勤）与概率性循环事件（刷手机、发朋友圈）
- **软性熬夜模式**：如果你在深夜聊天，她会推迟入睡

#### 🧠 多层推理
- **L1 快速通道**：每次回复前进行轻量意图分类
- **L2 导演**：定期审查对话，向 L3 注入纠偏"导演笔记"
- **L3 演员**：综合所有层的上下文，生成最终的、符合人设的回复

#### 🎭 人设与视觉一致性
- 服装系统含 6 个类别（`HOME`、`WORK`、`GYM`、`NIGHT`、`WEEKEND`、`COAT`）
- 每日服装按确定性规则解析——下午不会突然换装
- AI 生成的自拍反映当前位置、服装和活动

#### 📱 社交生态——朋友圈
- 智能体每日自主**发布朋友圈**（文字 + 自拍），每日上限 2 条
- 支持点赞与评论
- 完整复刻微信朋友圈 UX

#### 🔊 多模态输出
- **语音**：带情绪设计的 TTS 回复（`gemini-2.5-flash-preview-tts`）
- **视觉**：自拍生成（`gemini-2.5-flash-image` / `gemini-3-pro-image-preview`）
- **文字**：富含 Emoji 的短气泡聊天格式（每条 ≤ 40 字）

#### 🔀 多模型路由
- 无缝切换 **Google Gemini** 与**火山引擎（Doubao/GLM）**后端
- 在 UI 设置中按层独立选择模型

---

### ⚙️ 配置

| 变量 | 是否必填 | 说明 |
|------|----------|------|
| `API_KEY` | ✅ 必填 | Google Gemini API Key（L1/L2/L3/视觉） |
| `VOLC_API_KEY` | 可选 | 火山引擎 Key，用于 Doubao / GLM 模型 |

在 `.env.local` 中配置，或通过应用内**实验室设置**面板设置。

---

### 🚀 快速开始

```bash
# 1. 克隆仓库
git clone https://github.com/your-username/nana.git
cd nana

# 2. 安装依赖
npm install

# 3. 配置 API Key
echo "VITE_API_KEY=你的_gemini_key" > .env.local

# 4. 启动开发服务器
npm run dev
```

在浏览器中打开 `http://localhost:5173`。

---

### 📁 项目结构

```
nana/
├── hooks/
│   └── useFreeWill.ts       # L0 — 生物钟与自主事件引擎
├── services/
│   ├── layer1Service.ts     # L1 — 感知 / 意图分析
│   ├── layer3Service.ts     # L3 — 执行 / 回复生成
│   ├── unifiedService.ts    # 跨层编排
│   ├── geminiService.ts     # Google Gemini API 客户端
│   └── volcService.ts       # 火山引擎 (Doubao/GLM) API 客户端
├── components/
│   ├── WeChatApp.tsx        # 主聊天 UI（微信风格）
│   ├── MomentsView.tsx      # 社交动态 / 朋友圈
│   ├── RightPanel.tsx       # 系统监控与状态面板
│   ├── ActionLogPanel.tsx   # 实时认知过程日志
│   └── SettingsModal.tsx    # 模型与 API Key 配置
├── context/
│   └── AIContext.tsx        # 全局状态管理
├── constants.ts             # 日程表、人设、模型默认值
└── types.ts                 # TypeScript 类型定义
```

---

### ⚠️ 免责声明

本项目**仅供研究和教育用途**。AI 人设完全为虚构角色，所有生成内容均反映模拟角色，不代表开发者观点。

---

<div align="center">
<sub>NANA · An Event-Driven Autonomous Agent Framework · v0.9.0-beta</sub>
</div>
