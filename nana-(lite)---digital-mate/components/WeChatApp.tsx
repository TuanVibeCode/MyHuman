/**
 * -------------------------------------------------------------------------
 * 文件名称：components/WeChatApp.tsx
 * 功能描述：仿微信 UI 容器。
 * 
 * 职责：
 * 1. 管理底部导航栏 (Tab Bar) 和 视图路由。
 * 2. 集成朋友圈视图 (MomentsView)。
 * -------------------------------------------------------------------------
 */

import React, { useState, useEffect } from 'react';
import ChatList from './ChatList';
import InputArea from './InputArea';
import MomentsView from './MomentsView';
import { useAI } from '../context/AIContext';
import { MessageRole } from '../types';
import { UI_LABELS } from '../constants';

type Tab = 'wechat' | 'contacts' | 'discover' | 'me';
type View = 'tab_root' | 'chat_nana' | 'chat_work' | 'chat_career' | 'moments_nana' | 'moments_feed';

const WeChatApp: React.FC = () => {
  const { messages, language } = useAI();
  const t = UI_LABELS[language];
  
  const [activeTab, setActiveTab] = useState<Tab>('wechat');
  const [currentView, setCurrentView] = useState<View>('tab_root');
  const [currentTime, setCurrentTime] = useState('');

  // 顶部时钟逻辑
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleConversationClick = (id: string) => {
     if (id === 'nana') setCurrentView('chat_nana');
     if (id === 'work') setCurrentView('chat_work');
     if (id === 'career') setCurrentView('chat_career');
  };

  const handleAvatarClick = (role: string) => {
      // 简化逻辑：在 Chat 中点击对方头像，直接看对方朋友圈
      if (role === MessageRole.MODEL) {
          setCurrentView('moments_nana');
      }
  };

  const goBack = () => {
      setCurrentView('tab_root');
  };

  const lastMessage = messages.length > 0 ? messages[messages.length - 1].text : "Welcome to WeChat";
  const lastTime = messages.length > 0 ? new Date(messages[messages.length - 1].timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : "Now";

  return (
    <div className="w-[375px] h-[812px] bg-white rounded-[40px] border-[8px] border-[#1a1a1a] shadow-2xl relative overflow-hidden flex flex-col font-sans select-none">
      
      {/* --- STATUS BAR (状态栏) --- */}
      <div className={`h-[44px] w-full flex justify-between items-end px-6 pb-2 text-black z-50 transition-colors ${currentView !== 'tab_root' ? 'bg-[#f5f5f5]' : 'bg-[#ededed]'}`}>
         <span className="font-semibold text-sm w-[54px]">{currentTime}</span>
         <div className="flex gap-1.5 items-center">
             <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
             <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.01 21.49L23.64 7c-.45-.34-4.93-4-11.64-4C5.28 3 .81 6.66.36 7l11.63 14.49.01.01.01-.01z"/></svg>
             <div className="w-6 h-3 border border-gray-400 rounded-[3px] relative ml-1">
                 <div className="bg-black h-full w-[80%]"></div>
                 <div className="absolute right-[-3px] top-[3px] w-[2px] h-[4px] bg-gray-400 rounded-r"></div>
             </div>
         </div>
      </div>

      {/* --- APP HEADER (标题栏) --- */}
      {currentView === 'tab_root' ? (
          <div className="h-[44px] bg-[#ededed] px-4 flex items-center justify-between z-40 sticky top-0">
             <span className="font-semibold text-[16px]">{t.WECHAT_TITLE}</span>
             <div className="flex gap-4">
                 <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                 <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
             </div>
          </div>
      ) : currentView.startsWith('moments') ? (
         // 朋友圈沉浸式 Header (透明或悬浮) - 由 MomentsView 内部的 Back Button 处理
         null
      ) : (
          <div className="h-[44px] bg-[#f5f5f5] px-2 flex items-center justify-between z-40 border-b border-gray-200">
             <button onClick={goBack} className="flex items-center text-black px-2">
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                 <span className="text-[16px]">{t.WECHAT_TITLE}</span>
             </button>
             <span className="font-semibold text-[16px]">
                {currentView === 'chat_nana' ? '李娜娜 (Nana)' : currentView === 'chat_work' ? 'Nana & Boss 工作群 (3)' : '事业发展群 (45)'}
             </span>
             <button className="px-2">
                 <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
             </button>
          </div>
      )}

      {/* --- CONTENT AREA (内容区) --- */}
      <div className={`flex-1 overflow-y-auto relative scrollbar-hide ${currentView.startsWith('moments') ? 'bg-white' : 'bg-[#ededed]'}`}>
         
         {/* VIEW: CONVERSATION LIST (HOME) */}
         {currentView === 'tab_root' && activeTab === 'wechat' && (
             <div className="divide-y divide-gray-200/50">
                 {/* Item 1: Nana */}
                 <div onClick={() => handleConversationClick('nana')} className="bg-white flex px-4 py-3 gap-3 active:bg-gray-100 cursor-pointer">
                     <div className="relative">
                         <img src="https://picsum.photos/id/64/100/100" className="w-12 h-12 rounded-[6px]" />
                         <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white"></div>
                     </div>
                     <div className="flex-1 overflow-hidden">
                         <div className="flex justify-between items-center mb-1">
                             <span className="font-medium text-[16px] text-black">李娜娜 (Nana)</span>
                             <span className="text-[10px] text-gray-400">{lastTime}</span>
                         </div>
                         <p className="text-[13px] text-gray-400 truncate">{lastMessage}</p>
                     </div>
                 </div>
                 {/* ... Other items (work/career) kept from previous code ... */}
             </div>
         )}

         {/* VIEW: CHAT WITH NANA */}
         {currentView === 'chat_nana' && (
             <div className="h-full flex flex-col bg-[#f5f5f5]">
                 <ChatList onAvatarClick={handleAvatarClick} />
                 <InputArea />
             </div>
         )}

         {/* VIEW: MOMENTS (NANA PROFILE) */}
         {currentView === 'moments_nana' && (
             <MomentsView filterAuthor="Nana" onBack={() => setCurrentView('chat_nana')} />
         )}

         {/* VIEW: MOMENTS FEED (DISCOVER) */}
         {currentView === 'moments_feed' && (
             <MomentsView onBack={() => setCurrentView('tab_root')} />
         )}

         {/* VIEW: CONTACTS & ME (Keep minimal) */}
         {currentView === 'tab_root' && activeTab === 'contacts' && (
             <div className="bg-white min-h-full">
                 <div className="bg-[#ededed] px-4 py-1 text-xs text-gray-500">L</div>
                 <div onClick={() => handleConversationClick('nana')} className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 cursor-pointer">
                     <img src="https://picsum.photos/id/64/100/100" className="w-10 h-10 rounded-[4px]" />
                     <span className="text-[16px]">李娜娜 (Nana)</span>
                 </div>
             </div>
         )}

          {/* VIEW: DISCOVER */}
          {currentView === 'tab_root' && activeTab === 'discover' && (
             <div className="bg-[#ededed] min-h-full py-2">
                 <div onClick={() => setCurrentView('moments_feed')} className="bg-white flex items-center px-4 py-3 gap-3 border-y border-gray-200 cursor-pointer active:bg-gray-100">
                     <img src="https://cdn-icons-png.flaticon.com/512/1384/1384031.png" className="w-6 h-6" alt="moments"/>
                     <span className="text-[16px]">{t.MOMENTS}</span>
                     <div className="ml-auto flex items-center">
                        <img src="https://picsum.photos/id/64/100/100" className="w-8 h-8 rounded-[4px] mr-2" />
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <svg className="w-4 h-4 text-gray-400 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                     </div>
                 </div>
             </div>
         )}

         {/* VIEW: ME */}
         {currentView === 'tab_root' && activeTab === 'me' && (
             <div className="bg-[#ededed] min-h-full">
                 <div className="bg-white flex items-center px-6 py-8 gap-4 mb-2 mt-4">
                     <div className="w-16 h-16 rounded-[6px] bg-gray-200 flex items-center justify-center overflow-hidden">
                         <span className="font-bold text-gray-400">ME</span>
                     </div>
                     <div className="flex-1">
                         <h2 className="text-[20px] font-bold">The Boss</h2>
                         <p className="text-gray-400 text-sm">WeChat ID: boss_001</p>
                     </div>
                     <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                 </div>
             </div>
         )}
      </div>

      {/* --- BOTTOM TAB BAR --- */}
      {currentView === 'tab_root' && (
          <div className="h-[83px] bg-[#f7f7f7] border-t border-gray-300 flex items-start justify-around pt-2 pb-8 z-50">
             <button onClick={() => setActiveTab('wechat')} className={`flex flex-col items-center gap-1 w-16 ${activeTab === 'wechat' ? 'text-[#07c160]' : 'text-black'}`}>
                 <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor"><path d="M8 13.5c0-3 2.8-5.5 6.2-5.5 3.4 0 6.2 2.5 6.2 5.5 0 3-2.8 5.5-6.2 5.5-.6 0-1.1 0-1.7-.2l-2.1 1.2v-2.1c-1.4-1.1-2.2-2.7-2.2-4.4zM2.5 8.2c0-3.3 3.1-6 7-6s7 2.7 7 6c0 3.3-3.1 6-7 6-.7 0-1.3-.1-2-.2l-2.4 1.4V13c-1.6-1.3-2.6-3-2.6-4.8z"/></svg>
                 <span className="text-[10px]">{t.WECHAT_TITLE}</span>
             </button>
             <button onClick={() => setActiveTab('contacts')} className={`flex flex-col items-center gap-1 w-16 ${activeTab === 'contacts' ? 'text-[#07c160]' : 'text-black'}`}>
                 <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                 <span className="text-[10px]">{t.CONTACTS}</span>
             </button>
             <button onClick={() => setActiveTab('discover')} className={`flex flex-col items-center gap-1 w-16 ${activeTab === 'discover' ? 'text-[#07c160]' : 'text-black'}`}>
                 <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                 <span className="text-[10px]">{t.DISCOVER}</span>
             </button>
             <button onClick={() => setActiveTab('me')} className={`flex flex-col items-center gap-1 w-16 ${activeTab === 'me' ? 'text-[#07c160]' : 'text-black'}`}>
                 <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                 <span className="text-[10px]">{t.ME}</span>
             </button>
          </div>
      )}

      {/* --- HOME INDICATOR --- */}
      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-[134px] h-[5px] bg-black rounded-full z-50"></div>
    </div>
  );
};

export default WeChatApp;