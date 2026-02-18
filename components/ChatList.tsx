
/**
 * -------------------------------------------------------------------------
 * 文件名称：components/ChatList.tsx
 * 功能描述：聊天记录列表组件。
 * 
 * 职责：
 * 1. 遍历并渲染所有聊天消息 (ChatMessage)。
 * 2. 自动滚动到底部 (Auto-scroll)。
 * 3. 显示 AI 正在输入 (Typing Indicator) 的状态。
 * 4. 显示消息时间戳 (每5分钟显示一次)。
 * -------------------------------------------------------------------------
 */

import React, { useEffect, useRef } from 'react';
import { useAI } from '../context/AIContext';
import { AIState } from '../types';
import ChatMessage from './ChatMessage';
import { formatWeChatTime } from '../utils/helpers';

interface ChatListProps {
  onAvatarClick?: (role: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({ onAvatarClick }) => {
  const { messages, status } = useAI();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, status.state]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      {messages.map((msg, index) => {
        // 时间戳逻辑：第一条消息，或者与上一条消息间隔超过5分钟
        const showTimestamp = index === 0 || (msg.timestamp - messages[index - 1].timestamp > 5 * 60 * 1000);
        
        return (
          <React.Fragment key={msg.id}>
            {showTimestamp && (
               <div className="flex justify-center mb-2">
                 <span className="text-[11px] text-gray-400 bg-gray-200/50 px-2 py-0.5 rounded">
                    {formatWeChatTime(msg.timestamp)}
                 </span>
               </div>
            )}
            <ChatMessage message={msg} onAvatarClick={onAvatarClick} />
          </React.Fragment>
        );
      })}
      
      {/* 正在输入状态指示器 */}
      {status.state === AIState.TYPING && (
        <div className="flex items-center gap-2 mb-2 animate-pulse">
            <img src="https://picsum.photos/id/64/100/100" className="w-10 h-10 rounded-[4px] border border-gray-100" />
            <div className="bg-white text-gray-400 px-3 py-2 rounded-[4px] rounded-tl-none shadow-sm text-xs flex items-center gap-1">
               Typing...
            </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatList;
