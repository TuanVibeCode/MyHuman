
/**
 * -------------------------------------------------------------------------
 * 文件名称：components/StatusWidget.tsx
 * 功能描述：顶部浮动状态小组件。
 * 
 * 职责：
 * 1. 实时显示 AI 的当前状态 (State) 和活动描述。
 * 2. 可视化心情值 (Mood Value)。
 * 3. 作为“灵动岛”式的 UI 元素悬浮在界面顶部。
 * -------------------------------------------------------------------------
 */

import React from 'react';
import { AIStatus, AIState } from '../types';
import { DATA_TRANSLATIONS } from '../constants';
import { useAI } from '../context/AIContext';

interface StatusWidgetProps {
  status: AIStatus;
}

const StatusWidget: React.FC<StatusWidgetProps> = ({ status }) => {
  const { language } = useAI();

  const getStatusColor = (state: AIState) => {
    switch (state) {
      case AIState.IDLE: return 'bg-green-400';
      case AIState.BROWSING: return 'bg-blue-400 animate-pulse';
      case AIState.TYPING: return 'bg-yellow-400 animate-bounce';
      case AIState.TIRED: return 'bg-gray-400';
      case AIState.EXCITED: return 'bg-pink-400';
      default: return 'bg-gray-300';
    }
  };

  const translate = (text: string) => {
      if (language === 'en') return text;
      const translations = DATA_TRANSLATIONS['zh'];
      if (translations && translations[text]) {
          return translations[text];
      }
      return text;
  };

  const getStatusText = (state: AIState) => {
      switch (state) {
          case AIState.IDLE: return language === 'zh' ? '等待吃瓜...' : 'waiting for gossip...';
          case AIState.BROWSING: return language === 'zh' ? '正在冲浪...' : 'surfing the web...';
          case AIState.TYPING: return language === 'zh' ? '正在回复...' : 'replying...';
          case AIState.TIRED: return language === 'zh' ? '需要咖啡...' : 'needs coffee...';
          case AIState.FOCUSED: return language === 'zh' ? '专注阅读中...' : 'reading intently...';
          default: return translate(state); // Fallback to translated state name
      }
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-10 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg rounded-full px-4 py-2 flex items-center gap-3 w-[90%] md:w-auto max-w-sm transition-all duration-300">
      <div className="relative">
        <img 
          src="https://picsum.photos/id/64/100/100" 
          alt="Avatar" 
          className="w-10 h-10 rounded-full border border-gray-100 object-cover"
        />
        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(status.state)}`}></div>
      </div>
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex justify-between items-center">
          <span className="font-bold text-sm text-gray-800">{language === 'zh' ? '李娜娜 (Nana)' : 'Li Nana (Nana)'}</span>
          <span className="text-[10px] text-gray-400">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
        <p className="text-xs text-gray-500 truncate">
          {getStatusText(status.state)}
        </p>
      </div>

      <div className="h-full border-l border-gray-200 pl-3 flex flex-col justify-center items-center min-w-[40px]">
         <span className="text-[10px] text-gray-400 uppercase">Mood</span>
         <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
            <div 
              className="bg-pink-500 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${status.moodValue}%` }}
            ></div>
         </div>
      </div>
    </div>
  );
};

export default StatusWidget;
