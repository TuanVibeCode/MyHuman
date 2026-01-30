
/**
 * -------------------------------------------------------------------------
 * 文件名称：components/ActionLogPanel.tsx
 * 功能描述：左侧系统日志面板。
 * 
 * 职责：
 * 1. 实时显示 AI 的思维过程 (Thought)、系统日志 (System)、错误 (Error) 等。
 * 2. 顶部显示核心状态仪表盘 (Identity, Location, Mood)。
 * 3. 营造“黑客/系统后台”的视觉风格。
 * -------------------------------------------------------------------------
 */

import React from 'react';
import { useAI } from '../context/AIContext';
import { ActionLogEntry, AIState } from '../types';
import { UI_LABELS, DATA_TRANSLATIONS, LOG_TRANSLATIONS } from '../constants';

const ActionLogPanel: React.FC = () => {
  const { logs, status, isQuotaExhausted, language } = useAI();
  const t = UI_LABELS[language];

  // Helper to translate dynamic data content if available
  const translateData = (text: string) => {
      if (language === 'en') return text; // Default is English in data source
      // Try to find translation in DATA_TRANSLATIONS.zh
      const translations = DATA_TRANSLATIONS['zh'];
      if (translations && translations[text]) {
          return translations[text];
      }
      return text;
  };

  // Helper to translate log content and type
  const translateLogContent = (content: string) => {
    if (language === 'en') return content;
    // Check if we have a translation in LOG_TRANSLATIONS
    for (const [key, value] of Object.entries(LOG_TRANSLATIONS)) {
        if (content.includes(key)) {
            // Replace key phrases with translation, or if it's an exact match return translation
            return content.replace(key, value);
        }
    }
    return content;
  };

  const getLogColor = (type: ActionLogEntry['type']) => {
    switch (type) {
      case 'ERROR': return 'text-red-400';
      case 'IMAGE_GEN': return 'text-purple-400';
      case 'DECISION': return 'text-blue-400';
      case 'THOUGHT': return 'text-yellow-300';
      case 'SYSTEM': return 'text-emerald-400';
      case 'DREAM': return 'text-indigo-300';
      default: return 'text-gray-400';
    }
  };

  const getIcon = (type: ActionLogEntry['type']) => {
      switch (type) {
          case 'THOUGHT': return '💭';
          case 'IMAGE_GEN': return '📸';
          case 'DECISION': return '⚡';
          case 'ERROR': return '❌';
          case 'SYSTEM': return '🔋';
          case 'DREAM': return '💤';
          default: return '⚙️';
      }
  }

  return (
    <div className="h-full bg-[#0d1117] text-gray-300 flex flex-col font-mono text-xs overflow-hidden border-r border-gray-800 shadow-2xl">
      {/* 顶部状态监控区 */}
      <div className="p-4 border-b border-gray-800 bg-[#161b22]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-gray-400 font-black tracking-[0.2em] text-[10px] animate-pulse">{t.SYSTEM_MONITOR}</h2>
          <div className="flex items-center gap-2">
             <span className="text-[9px] text-gray-600">API:</span>
             <div className={`w-1.5 h-1.5 rounded-full ${isQuotaExhausted ? 'bg-red-500 shadow-[0_0_8px_red]' : 'bg-green-500 shadow-[0_0_8px_#22c55e]'}`}></div>
          </div>
        </div>
        
        {/* 核心身份网格 */}
        <div className="grid grid-cols-1 gap-2 mb-3 bg-black/20 p-2 rounded border border-gray-800/50">
            <div className="flex justify-between items-center border-b border-gray-800/50 pb-1">
                <span className="text-[9px] text-gray-600">{t.IDENTITY}</span>
                <span className="text-[10px] text-blue-400 font-bold">{t.IDENTITY_NAME}</span>
            </div>
             <div className="flex justify-between items-center">
                <span className="text-[9px] text-gray-600">{t.RELATIONSHIP}</span>
                <span className="text-[10px] text-pink-400 font-bold">{translateData(status.relationship).toUpperCase()}</span>
            </div>
        </div>

        {/* 动态上下文网格 */}
        <div className="grid grid-cols-2 gap-2 text-[9px]">
             <div className="col-span-2">
                <span className="text-gray-600 block mb-0.5">{t.LOCATION}</span>
                <span className="text-emerald-400 truncate block border border-gray-800 px-1.5 py-1 rounded bg-[#0d1117]">
                    [{translateData(status.location).toUpperCase()}]
                </span>
             </div>
             
             <div className="col-span-2">
                <span className="text-gray-600 block mb-0.5">{t.CURRENT_FOCUS}</span>
                <span className="text-yellow-400 truncate block border border-gray-800 px-1.5 py-1 rounded bg-[#0d1117]">
                    &gt; {translateData(status.activity)}
                </span>
             </div>
             
             <div>
                <span className="text-gray-600 block mb-0.5">{t.STATUS}</span>
                <span className={`block border border-gray-800 px-1.5 py-1 rounded bg-[#0d1117] ${status.state === AIState.IDLE ? 'text-gray-400' : 'text-blue-300'}`}>
                    {translateData(status.state)}
                </span>
             </div>

             <div>
                <span className="text-gray-600 block mb-0.5">{t.MOOD}</span>
                <div className="border border-gray-800 px-1.5 py-1 rounded bg-[#0d1117] flex items-center gap-2 h-[22px]">
                   <div className="flex-1 bg-gray-800 h-1 rounded-full overflow-hidden">
                      <div className="bg-pink-500 h-full transition-all duration-1000" style={{ width: `${status.moodValue}%`}}></div>
                   </div>
                   <span className="text-pink-500">{status.moodValue}</span>
                </div>
             </div>
        </div>

      </div>

      {/* 滚动日志区域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-800 bg-[#0d1117]">
        {logs.length === 0 && (
          <div className="h-full flex items-center justify-center opacity-20 flex-col gap-2">
             <div className="w-10 h-10 border-2 border-dashed border-gray-600 rounded-full animate-spin"></div>
             <p className="italic">{t.WAITING_LOGS}</p>
          </div>
        )}
        
        {logs.map((log) => (
          <div key={log.id} className={`group border-l-2 pl-3 py-1 transition-all ${log.type === 'THOUGHT' ? 'bg-yellow-900/5 border-yellow-500/30' : log.type === 'DREAM' ? 'bg-indigo-900/10 border-indigo-500/30' : 'border-gray-800 hover:border-gray-600'}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] text-gray-600 font-light">
                {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' })}
              </span>
              <span className={`font-black text-[9px] tracking-tighter ${getLogColor(log.type)}`}>
                {getIcon(log.type)} {log.type}
              </span>
            </div>
            <p className={`text-[11px] leading-relaxed ${log.type === 'THOUGHT' ? 'text-yellow-100/80 italic font-serif' : log.type === 'DREAM' ? 'text-indigo-200/80 italic' : 'text-gray-300'}`}>
                {translateLogContent(log.content)}
            </p>
            {log.details && (
              <div className="mt-2 p-2 bg-black/40 rounded border border-gray-800/50 text-[10px] text-gray-500 break-words whitespace-pre-wrap font-mono leading-normal">
                {log.details}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="px-4 py-2 text-[9px] text-gray-700 font-bold bg-[#161b22] border-t border-gray-800 flex justify-between">
        <span>vc1630_OS_v0.9.0</span>
        <span className="animate-pulse">{t.ONLINE}</span>
      </div>
    </div>
  );
};

export default ActionLogPanel;
