
/**
 * -------------------------------------------------------------------------
 * 文件名称：context/AIContext.tsx
 * 功能描述：全局 AI 状态管理 (L0-L3 Orchestrator)。
 * -------------------------------------------------------------------------
 */

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { Message, AIStatus, AIState, MessageRole, ActionLogEntry, AIContextType, ActiveProcessType, Language, Moment } from '../types'; 
import { INITIAL_STATUS, INITIAL_MOMENTS, DEFAULT_L2_MODEL, DEFAULT_IMAGE_MODEL, DEFAULT_L1_MODEL, DEFAULT_L3_MODEL, SYSTEM_INSTRUCTION_ZH, SYSTEM_INSTRUCTION_EN } from '../constants';
import { chatWithNana } from '../services/unifiedService';
import { runLayer1Analysis } from '../services/layer1Service';
import { runLayer2Director } from '../services/layer3Service'; // Import L2 logic
import { generateId, resolveDailyOutfit } from '../utils/helpers';

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]); 
  const [status, setStatus] = useState<AIStatus>(INITIAL_STATUS);
  const [logs, setLogs] = useState<ActionLogEntry[]>([]);
  const [moments, setMoments] = useState<Moment[]>(INITIAL_MOMENTS); // New: Moments
  const [language, setLanguage] = useState<Language>('zh');

  const [isAutoMode, setIsAutoMode] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImageGenerationPaused, setIsImageGenerationPaused] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true); // New: Default Voice Enabled
  const [isApiKeyNeeded, setApiKeyNeeded] = useState(false); 
  const [isQuotaExhausted, setIsQuotaExhausted] = useState(false);
  const [isImageQuotaExhausted, setIsImageQuotaExhausted] = useState(false);
  
  // 模型 ID 配置 (L1, L2, L3)
  const [l1ModelId, setL1ModelId] = useState<string>(DEFAULT_L1_MODEL);
  const [l2ModelId, setL2ModelId] = useState<string>(DEFAULT_L2_MODEL);
  const [l3ModelId, setL3ModelId] = useState<string>(DEFAULT_L3_MODEL);
  const [imageModelId, setImageModelId] = useState<string>(DEFAULT_IMAGE_MODEL);

  const [activeProcess, setActiveProcess] = useState<ActiveProcessType>('IDLE');
  const [directorFeedback, setDirectorFeedback] = useState<string>(""); 
  
  const [currentPersona, setCurrentPersona] = useState<string>(SYSTEM_INSTRUCTION_ZH);
  const [lastLayer1Strategy, setLastLayer1Strategy] = useState<string>("");

  // Refs
  const latestMessagesRef = useRef(messages);
  const latestStatusRef = useRef(status);
  const latestIsImageGenerationPausedRef = useRef(isImageGenerationPaused); 
  const latestIsVoiceEnabledRef = useRef(isVoiceEnabled); // New Ref
  const latestL3ModelIdRef = useRef(l3ModelId); 
  const latestL2ModelIdRef = useRef(l2ModelId);
  const latestImageModelIdRef = useRef(imageModelId);
  const latestDirectorFeedbackRef = useRef(directorFeedback);
  const latestCurrentPersonaRef = useRef(currentPersona);

  useEffect(() => {
    latestMessagesRef.current = messages;
    latestStatusRef.current = status;
    latestL3ModelIdRef.current = l3ModelId; 
    latestL2ModelIdRef.current = l2ModelId;
    latestImageModelIdRef.current = imageModelId; 
    latestDirectorFeedbackRef.current = directorFeedback;
    latestCurrentPersonaRef.current = currentPersona;
  }, [messages, status, l3ModelId, l2ModelId, imageModelId, directorFeedback, currentPersona]);

  useEffect(() => {
    latestIsImageGenerationPausedRef.current = isImageGenerationPaused;
  }, [isImageGenerationPaused]);

  useEffect(() => {
    latestIsVoiceEnabledRef.current = isVoiceEnabled;
  }, [isVoiceEnabled]);

  useEffect(() => {
    if (language === 'zh') {
        setCurrentPersona(SYSTEM_INSTRUCTION_ZH);
        addLog({ id: generateId(), timestamp: Date.now(), type: 'SYSTEM', content: 'Language Switched', details: 'Persona: Chinese' });
    } else {
        setCurrentPersona(SYSTEM_INSTRUCTION_EN);
        addLog({ id: generateId(), timestamp: Date.now(), type: 'SYSTEM', content: 'Language Switched', details: 'Persona: English' });
    }
  }, [language]);

  const toggleAutoMode = useCallback(() => setIsAutoMode(prev => !prev), []);
  const toggleImageGenerationPause = useCallback(() => setIsImageGenerationPaused(prev => !prev), []); 
  const toggleVoiceEnabled = useCallback(() => setIsVoiceEnabled(prev => !prev), []); // New
  
  const addMessage = useCallback((msg: Message) => {
    setMessages(prev => [...prev, msg]);
  }, []);

  const addMoment = useCallback((moment: Moment) => {
      setMoments(prev => [moment, ...prev]);
  }, []);

  const addLog = useCallback((log: ActionLogEntry) => {
    setLogs(prev => [log, ...prev].slice(0, 50));
  }, []);

  const updateStatus = useCallback((updates: Partial<AIStatus>) => {
    setStatus(prev => {
        const today = new Date().toDateString();
        const isNewDay = prev.lastSelfieDate !== today;
        const newState = { ...prev, ...updates };
        if (isNewDay) {
            newState.dailySelfieCount = 0;
            newState.dailyMomentCount = 0; // Reset moment count
            newState.lastSelfieDate = today;
        }
        return newState;
    });
  }, []);

  const setSubmitting = useCallback((val: boolean) => setIsSubmitting(val), []);
  const incrementAutoMessageCount = useCallback(() => {
    setStatus(prev => ({ ...prev, autoMessageCount: prev.autoMessageCount + 1 }));
  }, []);

  // --- 模拟意识苏醒 ---
  useEffect(() => {
    const wakeUpSequence = async () => {
      const today = new Date().toDateString();
      if (INITIAL_STATUS.lastSelfieDate !== today) {
          updateStatus({ dailySelfieCount: 0, dailyMomentCount: 0, lastSelfieDate: today });
      }

      // 初始化：根据日期确定今日穿搭 (Visual Variety)
      const initialOutfit = resolveDailyOutfit('HOME'); 
      updateStatus({ currentOutfit: initialOutfit });

      addLog({ id: generateId(), type: 'THOUGHT', content: 'System Booting... Neural Core Active.', details: 'Identity Loaded.', timestamp: Date.now() });
      await new Promise(r => setTimeout(r, 600));

      addLog({ id: generateId(), type: 'THOUGHT', content: 'Context Check...', details: `Location: ${INITIAL_STATUS.location} | Outfit: ${initialOutfit}`, timestamp: Date.now() });
      await new Promise(r => setTimeout(r, 600));

      addMessage({
        id: 'init-greeting',
        role: MessageRole.MODEL,
        text: "哎呀，你可算来了！\n今天穿哪件好呢...",
        timestamp: Date.now(), 
      });
    };
    wakeUpSequence();
  }, [addLog, addMessage, updateStatus]);

  // --- L2: Director Execution ---
  const executeDirector = async (reason: string) => {
      setActiveProcess('L2_DIRECTOR');
      addLog({ id: generateId(), timestamp: Date.now(), type: 'LAYER2', content: 'Director is thinking...', details: `Trigger: ${reason}` });
      try {
          const res = await runLayer2Director(latestMessagesRef.current, latestL2ModelIdRef.current, language, reason);
          addLog(res.log);
          setDirectorFeedback(res.feedback);
          return res.feedback;
      } catch (e: any) {
          addLog({ id: generateId(), timestamp: Date.now(), type: 'ERROR', content: 'L2 Failed', details: e.message });
          return "";
      } finally {
          setActiveProcess('IDLE');
      }
  };

  const runDirectorManualTrigger = useCallback(async () => {
      if (isSubmitting) return; 
      await executeDirector("Manual Trigger");
  }, [isSubmitting, language]);


  // --- 主消息处理管道 ---
  const handleUserMessage = useCallback(async (text: string, audioBlob?: Blob, audioDuration?: number) => {
    if ((!text.trim() && !audioBlob) || isSubmitting) return;

    setIsSubmitting(true);
    setIsQuotaExhausted(false); 
    
    const userMsg: Message = {
      id: generateId(),
      role: MessageRole.USER,
      text: text,
      timestamp: Date.now(),
      audioUrl: audioBlob ? URL.createObjectURL(audioBlob) : undefined,
      audioDuration: audioDuration
    };
    addMessage(userMsg);

    updateStatus({
      state: AIState.TYPING,
      lastInteraction: Date.now(),
      lastUserInteraction: Date.now(), 
      autoMessageCount: 0,
      moodValue: Math.min(latestStatusRef.current.moodValue + 5, 100)
    });

    try {
      // --- L1: 感知 (Perception) ---
      setActiveProcess('L1_PERCEPTION');
      let l1Intent = "";
      let needsDeepThinking = false;
      
      if (text) {
          const l1Result = await runLayer1Analysis(text, l1ModelId, language); 
          addLog(l1Result.log);
          
          l1Intent = `Intent=${l1Result.analysis.intent}. Strategy=${l1Result.analysis.reply_strategy}.`;
          setLastLayer1Strategy(l1Intent); 
          
          if (l1Result.analysis.intent === 'task_request') l1Intent += " REFUSE TASK.";
          if (l1Result.analysis.need_deep_reasoning) needsDeepThinking = true;
      }

      // --- L2: 导演 (Director) - 仅在需要时介入 ---
      if (needsDeepThinking || Math.random() < 0.2) {
          setActiveProcess('L2_DIRECTOR'); 
          const freshFeedback = await executeDirector("L1 Detected Complexity / Random Check");
          latestDirectorFeedbackRef.current = freshFeedback;
          if (freshFeedback) {
             addLog({ id: generateId(), timestamp: Date.now(), type: 'SYSTEM', content: 'Applying Director Note', details: 'Injecting L2 feedback.' });
          }
      }

      // --- L3: 执行 (Execution) ---
      setActiveProcess('L3_EXECUTION');
      const historyForService = latestMessagesRef.current.filter(m => m.id !== userMsg.id);
      
      const currentContextData = {
          location: latestStatusRef.current.location,
          outfit: latestStatusRef.current.currentOutfit, 
          activity: latestStatusRef.current.activity
      };

      const result = await chatWithNana(
        historyForService, 
        text || "(Voice Message)", 
        latestIsImageGenerationPausedRef.current,
        latestL3ModelIdRef.current, // Use L3 Model
        latestImageModelIdRef.current,
        currentContextData, 
        l1Intent,
        latestDirectorFeedbackRef.current, // L2 Feedback
        latestCurrentPersonaRef.current,
        latestIsVoiceEnabledRef.current // Pass voice toggle state
      );
      
      result.logs.forEach(log => addLog(log));

      if (result.imageError) setIsImageQuotaExhausted(true);
      else if (result.image) {
          setActiveProcess('TOOL_VISION'); 
          updateStatus({ dailySelfieCount: latestStatusRef.current.dailySelfieCount + 1 });
      }

      if (result.audio) setActiveProcess('TOOL_TTS');

      // Burst Messaging logic...
      const messageParts = result.text.split('\n').map(p => p.trim()).filter(p => p.length > 0);
      if (messageParts.length === 0) messageParts.push(""); 

      for (let i = 0; i < messageParts.length; i++) {
          const partText = messageParts[i];
          const isLastPart = i === messageParts.length - 1;
          const typingDelay = i === 0 ? 0 : Math.min(partText.length * 50 + 500, 2000);
          
          if (typingDelay > 0) {
              updateStatus({ state: AIState.TYPING }); 
              await new Promise(resolve => setTimeout(resolve, typingDelay));
          }

          const aiMsg: Message = {
            id: generateId(),
            role: MessageRole.MODEL,
            text: partText,
            timestamp: Date.now(),
            sources: isLastPart ? result.sources : [],
            image: isLastPart ? result.image : undefined,
            audio: isLastPart ? result.audio : undefined,
            audioDuration: isLastPart ? result.audioDuration : undefined
          };
          addMessage(aiMsg);
      }
      
      updateStatus({ state: AIState.IDLE });

    } catch (e: any) {
      const errorMessage = e?.message || String(e);
      addLog({ id: generateId(), timestamp: Date.now(), type: 'ERROR', content: 'API Error', details: errorMessage });
      updateStatus({ state: AIState.IDLE });
      if (errorMessage.includes("PERMISSION_DENIED")) setApiKeyNeeded(true); 
    } finally {
      setIsSubmitting(false);
      setActiveProcess('IDLE');
    }
  }, [isSubmitting, addMessage, updateStatus, addLog, l1ModelId, language]);

  return (
    <AIContext.Provider value={{
      messages, status, logs, language, moments,
      isAutoMode, isSubmitting, isApiKeyNeeded, isQuotaExhausted, isImageGenerationPaused, isImageQuotaExhausted, isVoiceEnabled,
      l1ModelId, l2ModelId, l3ModelId, imageModelId, 
      activeProcess, directorFeedback: directorFeedback,
      currentPersona, setCurrentPersona, lastLayer1Strategy,
      setLanguage, toggleAutoMode, toggleImageGenerationPause, toggleVoiceEnabled,
      handleUserMessage, addMessage, addLog, updateStatus, addMoment,
      setSubmitting, setApiKeyNeeded, setQuotaExhausted: setIsQuotaExhausted, setImageQuotaExhausted: setIsImageQuotaExhausted,
      setL1ModelId, setL2ModelId, setL3ModelId, setImageModelId, 
      incrementAutoMessageCount, runDirectorManualTrigger,
      latestMessagesRef, latestStatusRef, latestIsImageGenerationPausedRef, latestIsVoiceEnabledRef,
      latestL3ModelIdRef, latestL2ModelIdRef, latestImageModelIdRef,
      latestDirectorFeedbackRef, latestCurrentPersonaRef
    }}>
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) throw new Error("useAI must be used within an AIProvider");
  return context;
};
