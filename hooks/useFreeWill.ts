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
    WEEKDAY_SCHEDULE,
    WEEKEND_SCHEDULE,
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
      const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 6 = Saturday
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      const currentStatus = latestStatusRef.current;
      const todayStr = dateObj.toDateString();

      // --- LAYER 0: 生物钟规则引擎 (Dynamic Scheduling) ---
      // 根据日期选择不同的日程表
      const scheduleToUse = isWeekend ? WEEKEND_SCHEDULE : WEEKDAY_SCHEDULE;
      
      const activeRule = scheduleToUse.find(r => 
          (r.startHour <= currentHour && currentHour < r.endHour) || 
          (r.startHour > r.endHour && (currentHour >= r.startHour || currentHour < r.endHour))
      );

      if (!activeRule) return;

      // 2. 状态同步逻辑 (包含 Soft Override)
      let targetState: AIState = activeRule.state;
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
             // 记录换装日志
             const logType = isWeekend ? 'Weekend Logic' : 'Weekday Logic';
             addLog({ id: generateId(), timestamp: now, type: 'SYSTEM', content: logType, details: `Outfit Change: ${targetState}` });
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

      // A. 一次性事件 (Daily Once)
      const eventKey = `${activeRule.event}_${todayStr}`;
      if (activeRule.isOneTime && !currentStatus.executedOneTimeEvents.includes(eventKey)) {
          triggerEvent = activeRule.event;
          updateStatus({ executedOneTimeEvents: [...currentStatus.executedOneTimeEvents, eventKey] });
          forceImage = !!activeRule.forceImage;
          
          addLog({ id: generateId(), timestamp: now, type: 'SYSTEM', content: `L0: Triggering ${activeRule.event}`, details: `${activeRule.description}` });
      } 
      // B. 概率性事件 (包含 POST_MOMENT, SHOPPING, DRINKING)
      else if (!activeRule.isOneTime && activeRule.prob > 0) {
          const timeSinceLastAction = now - lastActionTimeRef.current;
          // 降低频率：至少间隔 45 分钟才再次触发概率事件 (原 30分钟)
          if (timeSinceLastAction > 2700000 && Math.random() < activeRule.prob) {
             triggerEvent = activeRule.event;
          }
      }

      // C. 交互追问 (Idle Breaker)
      if (triggerEvent === 'NONE') {
          const timeSinceUser = now - currentStatus.lastUserInteraction;
          // 如果处于 SPA 状态，则不进行主动破冰 (模拟失联)
          const isBusy = targetState === AIState.SPA;
          
          if (!isBusy && timeSinceUser > IDLE_THRESHOLD && currentStatus.autoMessageCount === 0) {
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
                          forceImage = true; 
                      } else {
                          triggerEvent = 'NONE'; 
                      }
                      break;
                  // New Events
                  case 'WEEKEND_BRUNCH': 
                       systemNote = `[EVENT: WEEKEND] At W Hotel Brunch. Show off lifestyle.`; 
                       break;
                  case 'SHOPPING_SPREE': 
                       systemNote = `[EVENT: SHOPPING] At SKP. Want to buy something expensive but hesitating.`; 
                       break;
                  case 'SPA_TIME':
                       // SPA 时不发消息，只发一条类似“刚做完脸”的
                       systemNote = `[EVENT: SPA] Just finished facial. Feeling refreshed.`; 
                       break;
                  case 'LATE_NIGHT_EMO':
                       // 情绪化时刻
                       systemNote = `[EVENT: LATE_NIGHT] Drinking alone. Feeling a bit vulnerable/tipsy. Text is messy.`;
                       break;
                  case 'MONDAY_BLUE':
                       systemNote = `[EVENT: MONDAY] Monday Morning panic. Don't want to go to work.`;
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
