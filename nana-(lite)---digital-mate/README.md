
# Nana (Project vc1630) - Digital Roommate

**Version:** v0.9.0 (Beta)  
**Code Name:** vc1630

## 📖 Introduction (项目介绍)

**Nana (vc1630)** is an advanced AI-driven digital companion that simulates a "digital roommate" experience. Unlike traditional chatbots, Nana possesses a simulated **free will**, operates on a **bio-clock**, and maintains a consistent, evolving persona ("The Calculating Survivor").

Nana (vc1630) 是一个先进的 AI 数字伴侣项目，旨在模拟“数字室友”体验。与传统聊天机器人不同，Nana 拥有模拟的**自由意志 (Free Will)**，按照**生物钟**运行，并保持一致且不断演化的人设（“精明的生存者”）。

She doesn't just reply; she lives. She sleeps, works, commutes, browses the web, and even posts to her social feed autonomously.
她不仅仅是回复消息，她在“生活”。她会睡觉、工作、通勤、上网冲浪，甚至自主发布动态。

## 🏗 Architecture (架构设计)

The project utilizes a multi-layer cognitive architecture (L0-L3):
本项目采用多层认知架构 (L0-L3)：

1.  **L0: Bio-Clock & Free Will (生物钟与自主意志)**
    *   **Role**: The heartbeat of the system. Manages state (Sleeping, Working, Commuting) based on time of day.
    *   **Function**: Triggers autonomous actions (e.g., sending a morning greeting, complaining about traffic) without user input. Handles "Soft Override" (e.g., staying up late if chatting).

2.  **L1: Perception (感知层)**
    *   **Model**: Gemini 2.0 Flash Lite (Fast & Cheap).
    *   **Role**: Subconscious processing. Analyzes user intent, emotion, and decides the immediate strategy (e.g., "Ignore him", "Flirt", "Refuse task").

3.  **L2: Director/Superego (导演/超我层)**
    *   **Model**: Gemini 3.0 Pro / Gemini 2.0 Pro (High Reasoning).
    *   **Role**: The "inner critic". Monitors the conversation to ensure Nana stays in character. Provides "Director's Notes" to the actor (L3) to correct behavior (e.g., "Too robotic! Be more manipulative.").

4.  **L3: Execution (执行层)**
    *   **Model**: Gemini 3.0 Flash / Doubao Pro.
    *   **Role**: The "Actor". Generates the final dialogue, voice, and visual outputs based on L0 context, L1 intent, and L2 direction.

## ✨ Key Features (核心功能)

*   **Autonomous Existence (自主生存)**: She initiates conversations based on her schedule.
*   **Visual Consistency (视觉一致性)**: 
    *   **Outfit Collections**: She changes clothes based on the occasion (Work, Gym, Home) and ensures the outfit remains consistent throughout the day.
*   **Social Ecology (社交生态)**: 
    *   **Moments Feed**: Browse her social media updates (text + generated selfies).
    *   **Dual-End Interaction**: Chat with her or check her "Moments".
*   **Multimodal (多模态)**:
    *   **Voice**: Generates audio responses (TTS) with emotional tone design.
    *   **Vision**: Generates "selfies" reflecting her current location and outfit.
*   **Cross-Model Routing (多模型路由)**: Seamlessly switches between Google Gemini and Volcengine (Doubao) models.

## 🚀 Getting Started (快速开始)

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/vc1630.git
    ```
2.  **Install dependencies**:
    (Project uses raw ES modules via CDN/ImportMap, no `npm install` required for basic usage, just a static server).
3.  **Run the app**:
    Serve the root directory using any static file server (e.g., VS Code Live Server, Python `http.server`).
4.  **Configure Keys**:
    Click "Settings" in the UI to link your **Google Gemini API Key** (via AI Studio).

## ⚠️ Disclaimer (免责声明)

This project is for research and educational purposes only. The AI persona is fictional.
本项目仅供研究和教育用途。AI 人设均为虚构。

---
*Status: v0.9.0 (Beta) - Feature Complete*
