
/**
 * -------------------------------------------------------------------------
 * 文件名称：components/ChatMessage.tsx
 * 功能描述：单条聊天消息组件。
 * -------------------------------------------------------------------------
 */

import React, { useState, useEffect } from 'react';
import { Message, MessageRole } from '../types';
import { playAudio } from '../utils/audioUtils';

interface ChatMessageProps {
  message: Message;
  onAvatarClick?: (role: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onAvatarClick }) => {
  const isUser = message.role === MessageRole.USER;
  const isInternal = message.isInternal;
  const isSystem = message.role === MessageRole.SYSTEM && !isInternal;
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);

  // 自动播放效果：当收到新的 AI 语音消息时自动触发
  useEffect(() => {
    // 检查是否为“新鲜”消息 (10秒内创建)，防止加载历史记录时炸麦
    const isRecent = (Date.now() - message.timestamp) < 10000;
    
    // 仅自动播放 Model 的消息
    if (!isUser && message.audio && !hasAutoPlayed && isRecent) {
        const timer = setTimeout(() => {
            handlePlayVoice();
            setHasAutoPlayed(true);
        }, 500); // 延迟以等待 UI 渲染完成
        return () => clearTimeout(timer);
    }
  }, [message.audio, isUser, hasAutoPlayed, message.timestamp]);

  const handlePlayVoice = async () => {
    if ((message.audio || message.audioUrl) && !isPlaying) {
        setIsPlaying(true);
        try {
            if (message.audioUrl) {
                // 用户录制的音频 (Blob URL)
                const audio = new Audio(message.audioUrl);
                audio.onended = () => setIsPlaying(false);
                await audio.play();
            } else if (message.audio) {
                // AI 生成的音频 (PCM Base64)
                await playAudio(message.audio);
                // 简单的模拟播放状态持续时间
                setTimeout(() => setIsPlaying(false), (message.audioDuration || 2) * 1000 + 500);
            }
        } catch (e) {
            console.error("Playback failed:", e);
            setIsPlaying(false);
        }
    }
  };

  // 内部思维消息 (调试用，通常不显示或以淡色显示)
  if (isInternal) {
    return (
      <div className="flex justify-center my-2">
        <span className="text-[12px] text-gray-400 bg-gray-200/50 px-2 py-0.5 rounded text-center max-w-[80%]">
          {message.text}
        </span>
      </div>
    );
  }

  // 系统提示消息 (居中显示)
  if (isSystem) {
      return (
          <div className="flex justify-center my-4">
              <span className="text-[12px] text-gray-400 bg-gray-200 px-3 py-1 rounded-full">
                  {message.text}
              </span>
          </div>
      )
  }

  const hasAudio = message.audio || message.audioUrl;
  const hasImage = !!message.image;

  return (
    <div className={`flex w-full mb-4 items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      
      {/* 头像 */}
      <div className="flex-shrink-0 cursor-pointer" onClick={() => onAvatarClick && onAvatarClick(message.role)}>
        {isUser ? (
           <div className="w-10 h-10 rounded-[4px] bg-blue-300 flex items-center justify-center text-white font-bold text-xs">ME</div>
        ) : (
           <img 
            src="https://picsum.photos/id/64/100/100" 
            alt="Nana" 
            className="w-10 h-10 rounded-[4px] border border-gray-100 object-cover"
           />
        )}
      </div>
      
      {/* 消息内容包装器 */}
      <div className={`flex flex-col gap-1 max-w-[70%] ${isUser ? 'items-end' : 'items-start'}`}>
        
        {/* 1. 图片气泡 (如果有图片，显示在文本上方) */}
        {hasImage && (
           <div className="overflow-hidden rounded-[4px] shadow-sm border border-gray-200/50 bg-white">
                <img 
                  src={message.image} 
                  alt="Selfie" 
                  className="max-w-full h-auto object-cover block"
                  style={{ maxHeight: '300px' }}
                />
           </div>
        )}

        {/* 2. 文本/语音气泡 */}
        {(message.text || hasAudio) && (
            <div className={`relative px-3 py-2 rounded-[4px] shadow-sm ${
                isUser 
                    ? 'bg-[#95ec69] text-black' 
                    : 'bg-white text-black border border-gray-200/50'
                } ${hasAudio ? 'cursor-pointer hover:bg-opacity-90 transition-colors' : ''}`}
                onClick={hasAudio ? handlePlayVoice : undefined}
            >
                {/* 气泡小三角 */}
                <div className={`absolute top-3 w-0 h-0 border-[6px] border-transparent ${
                    isUser 
                    ? 'right-[-10px] border-l-[#95ec69]' 
                    : 'left-[-10px] border-r-white'
                }`}></div>

                {hasAudio ? (
                    /* 语音条 UI */
                    <div className="flex items-center gap-2 min-w-[60px]" style={{ width: `${Math.min(60 + (message.audioDuration || 0) * 15, 180)}px` }}>
                        {!isUser && (
                            <div className="flex items-center gap-1">
                                <svg className={`w-5 h-5 ${isPlaying ? 'animate-pulse text-green-600' : 'text-gray-600'}`} viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3-8l-5 3V9l5 3z"/>
                                </svg>
                                <span className="text-[14px] text-gray-500">{message.audioDuration || 2}"</span>
                            </div>
                        )}
                        
                        {/* 模拟声波动画 */}
                        <div className={`flex gap-0.5 items-end h-3 ml-1 opacity-50 ${isUser ? 'mr-auto' : ''}`}>
                            <div className={`w-0.5 bg-gray-500 ${isPlaying ? 'animate-[bounce_1s_infinite] h-full' : 'h-1'}`}></div>
                            <div className={`w-0.5 bg-gray-500 ${isPlaying ? 'animate-[bounce_1.2s_infinite] h-2' : 'h-3'}`}></div>
                            <div className={`w-0.5 bg-gray-500 ${isPlaying ? 'animate-[bounce_0.8s_infinite] h-1.5' : 'h-2'}`}></div>
                            <div className={`w-0.5 bg-gray-500 ${isPlaying ? 'animate-[bounce_1.1s_infinite] h-3' : 'h-1'}`}></div>
                        </div>

                        {isUser && (
                            <div className="flex items-center gap-1 ml-auto">
                                <span className="text-[14px] text-gray-500">{message.audioDuration || 2}"</span>
                                <svg className={`w-5 h-5 ${isPlaying ? 'animate-pulse text-green-700' : 'text-gray-600'}`} viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3-8l-5 3V9l5 3z"/>
                                </svg>
                            </div>
                        )}
                    </div>
                ) : (
                    /* 纯文本内容 */
                    <div className="whitespace-pre-wrap break-words">
                        {message.text}
                    </div>
                )}
            </div>
        )}

        {/* Grounding 引用来源显示 */}
        {message.sources && message.sources.length > 0 && !isUser && (
          <div className="ml-1 pt-1 text-[10px] w-full">
            <ul className="list-none space-y-1">
              {message.sources.map((source, idx) => (
                <li key={idx} className="bg-white/80 inline-block px-2 py-0.5 rounded border border-gray-100 shadow-sm mr-1 mb-1">
                  <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    {source.title || 'Source'}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
