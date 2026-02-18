
/**
 * -------------------------------------------------------------------------
 * 文件名称：components/InputArea.tsx
 * 功能描述：聊天输入区域。
 * 
 * 职责：
 * 1. 文本输入框。
 * 2. 语音录制 (长按录音)，使用 Web Speech API 进行语音转文字 (STT) 预览。
 * 3. 发送消息逻辑。
 * 4. 表情包选择器 (Emoji Picker)。
 * -------------------------------------------------------------------------
 */

import React, { useState, useRef, useEffect } from 'react';
import { useAI } from '../context/AIContext';
import { UI_LABELS, EMOJI_LIST } from '../constants';

const InputArea: React.FC = () => {
  const { handleUserMessage, isSubmitting, isApiKeyNeeded, isQuotaExhausted, language } = useAI();
  const t = UI_LABELS[language];

  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // 表情包开关状态
  const [recordingDuration, setRecordingDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);
  const timerIntervalRef = useRef<number | null>(null);
  const transcriptRef = useRef<string>('');
  
  // 用于点击外部关闭表情面板
  const emojiPanelRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // 卸载时清理定时器
    return () => {
       if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // 点击外部关闭表情面板
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (
              showEmojiPicker &&
              emojiPanelRef.current &&
              !emojiPanelRef.current.contains(event.target as Node) &&
              emojiButtonRef.current &&
              !emojiButtonRef.current.contains(event.target as Node)
          ) {
              setShowEmojiPicker(false);
          }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  const onSend = (text: string, audioBlob?: Blob, duration?: number) => {
    if ((text.trim() || audioBlob) && !isSubmitting) {
      handleUserMessage(text, audioBlob, duration);
      setInput('');
      setShowEmojiPicker(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend(input);
    }
  };

  const addEmoji = (emoji: string) => {
      setInput(prev => prev + emoji);
  };

  // 开始录音逻辑
  const startRecording = async () => {
    if (disabled) return;

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];
        transcriptRef.current = '';

        mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunksRef.current.push(event.data);
            }
        };

        // 初始化 Web Speech API (用于生成临时的文字转录)
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            // 根据当前语言设置识别语言
            recognitionRef.current.lang = language === 'zh' ? 'zh-CN' : 'en-US'; 
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = false;
            
            recognitionRef.current.onresult = (event: any) => {
                let finalTrans = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTrans += event.results[i][0].transcript;
                    }
                }
                if (finalTrans) transcriptRef.current += finalTrans;
            };
            
            recognitionRef.current.start();
        }

        mediaRecorderRef.current.start();
        startTimeRef.current = Date.now();
        setIsRecording(true);
        setShowEmojiPicker(false); // 录音时关闭表情
        
        // 启动计时器
        setRecordingDuration(0);
        timerIntervalRef.current = window.setInterval(() => {
            setRecordingDuration(prev => prev + 1);
        }, 1000);

    } catch (err) {
        console.error("Error accessing microphone:", err);
        alert("Microphone access denied or not available.");
    }
  };

  // 停止录音逻辑
  const stopRecording = () => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') return;

      mediaRecorderRef.current.stop();
      if (recognitionRef.current) recognitionRef.current.stop();
      
      if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
      }

      setIsRecording(false);
      
      // 停止所有音频轨道
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());

      // 等待最后的数据块写入
      setTimeout(() => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
          
          // 如果转录为空，则发送空文本，主要依赖 AudioBlob
          const text = transcriptRef.current.trim() || ""; 
          
          if (duration < 1) {
              console.log("Recording too short");
              return;
          }

          onSend(text, audioBlob, duration);
      }, 200);
  };

  const disabled = isApiKeyNeeded || isSubmitting || isQuotaExhausted;

  return (
    <div className="bg-[#f7f7f7] border-t border-gray-300 relative z-50 select-none">
      
      {/* 表情包选择面板 */}
      {showEmojiPicker && (
          <div ref={emojiPanelRef} className="absolute bottom-full left-0 w-full bg-[#f7f7f7] border-t border-gray-300 p-4 h-[250px] overflow-y-auto shadow-inner grid grid-cols-8 gap-4 animate-fade-in z-40">
              {EMOJI_LIST.map((emoji, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => addEmoji(emoji)}
                    className="text-2xl hover:scale-125 transition-transform flex items-center justify-center h-10 w-10 hover:bg-gray-200 rounded-lg"
                  >
                      {emoji}
                  </button>
              ))}
          </div>
      )}

      <div className="px-3 py-2 pb-6 min-h-[50px] flex items-end gap-3">
        {/* 语音按钮 (长按说话) */}
        <button 
            className={`mb-2 transition-colors ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-700'}`}
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onMouseLeave={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            disabled={disabled}
            title={t.TYPE_PLACEHOLDER}
        >
            <svg className="w-7 h-7" fill={isRecording ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
        </button>

        {/* 输入框或录音覆盖层 */}
        <div className="flex-1 bg-white rounded-[6px] px-2 py-2 mb-1 relative">
            {isRecording ? (
                <div className="absolute inset-0 bg-gray-100 rounded-[6px] flex items-center justify-center text-red-500 font-medium z-10">
                    Recording... {recordingDuration}s
                </div>
            ) : null}
            
            <textarea
                className="w-full max-h-24 bg-transparent border-none focus:ring-0 resize-none p-0 text-[16px] text-black leading-6 placeholder-gray-400"
                rows={1}
                placeholder={isQuotaExhausted ? "Quota Exceeded" : ""}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                style={{ minHeight: '24px' }}
            />
        </div>

        {/* 表情按钮 (Toggle) */}
        <button 
            ref={emojiButtonRef}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
            className={`mb-2 transition-colors ${showEmojiPicker ? 'text-[#07c160]' : 'text-gray-700'}`}
        >
            <svg className="w-7 h-7" fill={showEmojiPicker ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </button>

        {/* 发送按钮 */}
        {input.trim() ? (
            <button 
                onClick={() => onSend(input)}
                disabled={disabled}
                className="mb-1.5 bg-[#07c160] text-white px-3 py-1.5 rounded-[4px] text-sm font-medium"
            >
                {t.SEND}
            </button>
        ) : (
            <button className="mb-2 text-gray-700">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
            </button>
        )}
      </div>
    </div>
  );
};

export default InputArea;
