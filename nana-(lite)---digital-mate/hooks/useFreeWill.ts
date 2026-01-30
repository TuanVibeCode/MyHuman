
/**
 * -------------------------------------------------------------------------
 * 文件名称：hooks/useFreeWill.ts
 * 功能描述：L0 - 生物钟与自主意志引擎。
 * -------------------------------------------------------------------------
 */

import { useEffect, useRef } from 'react';
import { useAI } from '../context/AIContext';
import { 
    HEARTBEAT_INTERVAL, 
    DAILY_SCHEDULE,
    IDLE_THRESHOLD,
    DAILY_SELFIE_LIMIT,
    DAILY_MOMENT_LIMIT,
    DREAM_LOGS
} from '../constants';
import { AIState, MessageRole, Message, SystemEventType, Moment } from '../types';
import { nanaSelfAct } from '../services/unifiedService';
import { generateId, resolveDailyOutfit } from '../utils/helpers';

export const useFreeWill = () => {
  const { 
    isAutoMode, 
    latestStatusRef, 
    latestMessagesRef, 
    latestIsImageGenerationPausedRef, 
    addMessage,
    addMoment, // New
    addLog,
    updateStatus,
    incrementAutoMessageCount,
    latestL3ModelIdRef, 
    latestImageModelIdRef,
    setImageQuotaExhausted,
    setQuotaExhausted, 
    isQuotaExhausted,
  } = useAI(); 
  
  const processingRef = useRef(false);
  const lastActionTimeRef = useRef(Date.now());

  useEffect(() => {
    const heartbeat = setInterval(async () => {
      // 0. 安全检查
      if (!isAutoMode || processingRef.current || isQuotaExhausted) return;

      const now = Date.now();
      const dateObj = new Date();
      const currentHour = dateObj.getHours();
      const currentStatus = latestStatusRef.current;
      const todayStr = dateObj.toDateString();

      // --- LAYER 0: 生物钟规则引擎 ---
      const activeRule = DAILY_SCHEDULE.find(r => 
          (r.startHour <= currentHour && currentHour < r.endHour) || 
          (r.startHour > r.endHour && (currentHour >= r.startHour || currentHour < r.endHour))
      );

      if (!activeRule) return;

      // 2. 状态同步逻辑 (包含 Soft Override)
      let targetState = activeRule.state;
      let targetActivity = activeRule.description;
      let targetOutfit = resolveDailyOutfit(activeRule.outfitCategory); 
      
      if (activeRule.state === AIState.SLEEPING) {
          const timeSinceUser = now - currentStatus.lastUserInteraction;
          if (timeSinceUser < 300000) { 
             targetState = AIState.TIRED;
             targetActivity = "Stay up late chatting";
          }
      }

      const shouldUpdateState = 
          currentStatus.state !== targetState || 
          currentStatus.location !== activeRule.location ||
          currentStatus.currentOutfit !== targetOutfit;

      if (shouldUpdateState) {
          let hasOutfitChanged = targetOutfit !== currentStatus.currentOutfit;

          if (hasOutfitChanged) {
              addLog({ id: generateId(), timestamp: now, type: 'SYSTEM', content: 'Wardrobe Change', details: `Update: ${targetState}` });
          }
          
          if (targetState === AIState.TIRED && activeRule.state === AIState.SLEEPING) {
               addLog({ id: generateId(), timestamp: now, type: 'SYSTEM', content: 'Layer 0: Soft Override', details: 'Delaying sleep.' });
          }

          if (targetState === AIState.SLEEPING && currentStatus.state !== AIState.SLEEPING) {
              updateStatus({ 
                  state: targetState, activity: targetActivity, location: activeRule.location,
                  currentGoal: activeRule.goal, currentOutfit: targetOutfit, executedOneTimeEvents: [] 
              });
          } else {
              updateStatus({ 
                  state: targetState, activity: targetActivity, location: activeRule.location,
                  currentGoal: activeRule.goal, currentOutfit: targetOutfit
              });
          }
      }

      // 3. 事件判定逻辑
      if (targetState === AIState.SLEEPING) {
           if (Math.random() < 0.05) {
                const dream = DREAM_LOGS[Math.floor(Math.random() * DREAM_LOGS.length)];
                addLog({ id: generateId(), timestamp: now, type: 'DREAM', content: 'REM Cycle', details: dream });
           }
           return;
      }

      let triggerEvent: SystemEventType = 'NONE';
      let systemNote = "";
      let forceImage = false;

      // A. 一次性事件
      const eventKey = `${activeRule.event}_${todayStr}`;
      if (activeRule.isOneTime && !currentStatus.executedOneTimeEvents.includes(eventKey)) {
          triggerEvent = activeRule.event;
          updateStatus({ executedOneTimeEvents: [...currentStatus.executedOneTimeEvents, eventKey] });
          forceImage = !!activeRule.forceImage;
          
          addLog({ id: generateId(), timestamp: now, type: 'SYSTEM', content: `L0: Triggering ${activeRule.event}`, details: `${activeRule.description}` });
      } 
      // B. 概率性事件 (包含 POST_MOMENT)
      else if (!activeRule.isOneTime && activeRule.prob > 0) {
          const timeSinceLastAction = now - lastActionTimeRef.current;
          if (timeSinceLastAction > 1800000 && Math.random() < activeRule.prob) {
             triggerEvent = activeRule.event;
          }
      }

      // C. 交互追问
      if (triggerEvent === 'NONE') {
          const timeSinceUser = now - currentStatus.lastUserInteraction;
          if (timeSinceUser > IDLE_THRESHOLD && currentStatus.autoMessageCount === 0) {
              triggerEvent = 'WORK_IDLE';
              systemNote = `User is silent. Send a short, flirty message.`;
          }
      }

      // --- L0 -> L3 执行 ---
      if (triggerEvent !== 'NONE' || systemNote) {
          if (!systemNote) {
              switch (triggerEvent) {
                  case 'WAKE_UP': systemNote = `[EVENT: WAKE_UP] Time: ${currentHour}:00. Energetic greeting.`; break;
                  case 'COMMUTE': systemNote = `[EVENT: COMMUTE] Complain about subway.`; break;
                  case 'LUNCH': systemNote = `[EVENT: LUNCH] Eating salad.`; break;
                  case 'BROWSING': systemNote = `[EVENT: BROWSING] Bored. Share random news.`; break;
                  case 'WORK_IDLE': systemNote = `[EVENT: IDLE] Pretend to work.`; break;
                  case 'POST_MOMENT': 
                      // 检查朋友圈限额
                      if (currentStatus.dailyMomentCount < DAILY_MOMENT_LIMIT) {
                          systemNote = `[EVENT: POST_MOMENT] Location: ${activeRule.location}. Share a moment about ${activeRule.description}.`;
                          forceImage = true; // 朋友圈通常带图
                      } else {
                          triggerEvent = 'NONE'; // 超过限额不发
                      }
                      break;
              }
          }

          if (systemNote) {
             await executeAction(systemNote, forceImage, triggerEvent === 'POST_MOMENT');
          }
      }

    }, HEARTBEAT_INTERVAL);

    return () => clearInterval(heartbeat);
  }, [isAutoMode, latestStatusRef]); 

  const executeAction = async (intent: string, forceImage: boolean, isMoment: boolean) => {
      if (processingRef.current) return;
      processingRef.current = true;
      lastActionTimeRef.current = Date.now();
      
      updateStatus({ state: AIState.TYPING });
      if (!isMoment) incrementAutoMessageCount();

      let isImageAllowed = !latestIsImageGenerationPausedRef.current;
      if (forceImage) {
         if (latestStatusRef.current.dailySelfieCount >= DAILY_SELFIE_LIMIT) isImageAllowed = false;
      } else {
          isImageAllowed = false;
      }

      const currentStatus = latestStatusRef.current;
      
      try {
        const result = await nanaSelfAct(
          [...latestMessagesRef.current, { role: MessageRole.SYSTEM, id: 'sys-intent', text: `[L0]: ${intent}`, timestamp: Date.now(), isInternal: true }],
          !isImageAllowed, 
          latestL3ModelIdRef.current, 
          latestImageModelIdRef.current,
          { location: currentStatus.location, outfit: currentStatus.currentOutfit, activity: currentStatus.activity },
          intent
        );

        result.logs.forEach(log => addLog(log));

        if (result.imageError) setImageQuotaExhausted(true);
        else if (result.image) updateStatus({ dailySelfieCount: latestStatusRef.current.dailySelfieCount + 1 });

        // 处理朋友圈逻辑
        if (isMoment && result.text) {
             const newMoment: Moment = {
                 id: generateId(),
                 authorName: 'Li Nana (Nana)',
                 avatar: 'https://picsum.photos/id/64/100/100',
                 content: result.text,
                 images: result.image ? [result.image] : [],
                 timestamp: Date.now(),
                 likes: [],
                 comments: []
             };
             addMoment(newMoment);
             updateStatus({ dailyMomentCount: currentStatus.dailyMomentCount + 1, state: AIState.IDLE });
             addLog({ id: generateId(), timestamp: Date.now(), type: 'SYSTEM', content: 'Posted to Moments', details: result.text.substring(0, 30) });
        } 
        // 处理普通聊天逻辑
        else if (result.text && result.actionType !== 'NONE') {
            const aiMsg: Message = {
                id: generateId(),
                role: MessageRole.MODEL,
                text: result.text,
                timestamp: Date.now(),
                sources: result.sources || [],
                image: result.image,
                audio: result.audio,
                audioDuration: result.audioDuration
            };
            addMessage(aiMsg);
            updateStatus({ state: AIState.IDLE, lastInteraction: Date.now() });
        } else {
            updateStatus({ state: AIState.IDLE });
        }
      } catch (e: any) {
          console.error("L0 Exec Failed", e);
          if (String(e).includes("RESOURCE_EXHAUSTED")) setQuotaExhausted(true);
          updateStatus({ state: AIState.IDLE });
      } finally {
          processingRef.current = false;
      }
  };
};
