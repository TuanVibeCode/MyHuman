
/**
 * -------------------------------------------------------------------------
 * 文件名称：components/RightPanel.tsx
 * 功能描述：右侧控制面板。
 * -------------------------------------------------------------------------
 */

import React, { useState } from 'react';
import { useAI } from '../context/AIContext';
import { 
    FAST_MODELS, 
    CHAT_MODELS, 
    THINKING_MODELS,
    UI_LABELS 
} from '../constants';

interface RightPanelProps {
  onOpenSettings: () => void;
}

const ModelCard: React.FC<{ 
    title: string; 
    selectedModelId: string;
    models: { id: string; name: string }[];
    onModelChange: (id: string) => void;
    color: string; 
    isActive: boolean; 
    layer: string;
    icon: React.ReactNode;
}> = ({ title, selectedModelId, models, onModelChange, color, isActive, layer, icon }) => (
    <div className={`relative bg-[#21262d] rounded-lg border transition-all duration-300 ${isActive ? `border-${color}-500 shadow-[0_0_15px_rgba(0,0,0,0.5)] scale-[1.02] z-10` : 'border-gray-700 opacity-90'}`}>
        <div className="absolute -top-2 -right-2 bg-gray-900 text-[9px] font-mono text-gray-500 px-1.5 py-0.5 rounded border border-gray-700 pointer-events-none">
            {layer}
        </div>
        <div className="p-3">
            <div className="flex items-center gap-2 mb-2">
                <span className={`text-${color}-400`}>{icon}</span>
                <h4 className="text-[11px] font-bold text-gray-300 uppercase tracking-wider truncate">{title}</h4>
            </div>
            <div className="relative group">
                <select 
                    value={selectedModelId}
                    onChange={(e) => onModelChange(e.target.value)}
                    className={`w-full bg-black/20 border border-gray-700 text-xs rounded px-2 py-1.5 appearance-none cursor-pointer focus:ring-1 focus:ring-${color}-500 focus:outline-none transition-colors ${isActive ? 'text-white font-bold' : 'text-gray-400 hover:text-gray-300'}`}
                >
                    {models.map(m => <option key={m.id} value={m.id} className="bg-[#161b22] text-gray-300">{m.name}</option>)}
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
            </div>
            {isActive && (
                <div className="mt-2 flex items-center gap-2 animate-fade-in bg-black/20 p-1 rounded">
                    <div className={`w-1.5 h-1.5 rounded-full bg-${color}-500 animate-pulse`}></div>
                    <span className={`text-[9px] text-${color}-400 font-mono`}>Processing...</span>
                </div>
            )}
        </div>
    </div>
);

const ToolBadge: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    color: string;
}> = ({ icon, label, isActive, color }) => (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${isActive ? `bg-${color}-900/20 border-${color}-500/50 text-${color}-400` : 'bg-[#21262d] border-gray-700 text-gray-500'}`}>
        <span className={isActive ? 'animate-bounce' : ''}>{icon}</span>
        <span className="text-[10px] font-medium truncate">{label}</span>
    </div>
);

const RightPanel: React.FC<RightPanelProps> = ({ onOpenSettings }) => {
  const { 
    language, setLanguage,
    isAutoMode, toggleAutoMode,
    isImageGenerationPaused, toggleImageGenerationPause,
    isVoiceEnabled, toggleVoiceEnabled,
    l3ModelId, setL3ModelId,
    l2ModelId, setL2ModelId,
    l1ModelId, setL1ModelId,
    isQuotaExhausted,
    activeProcess,
    runDirectorManualTrigger,
    currentPersona, setCurrentPersona
  } = useAI();
  
  const [isEditingPersona, setIsEditingPersona] = useState(false);
  const t = UI_LABELS[language];

  return (
    <div className="h-full flex flex-col p-4 text-gray-300 gap-4 font-sans overflow-hidden">
      {/* Top Bar */}
      <div className="shrink-0 flex justify-between items-center">
        <div>
            <h2 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-1">Neural Core</h2>
            <div className="h-0.5 w-8 bg-blue-500"></div>
        </div>
        <div className="flex items-center gap-2">
             <div className="flex bg-[#21262d] rounded-md p-0.5 border border-gray-700">
                <button onClick={() => setLanguage('zh')} className={`text-[9px] px-2 py-0.5 rounded transition-colors ${language === 'zh' ? 'bg-blue-600 text-white font-bold' : 'text-gray-500 hover:text-gray-300'}`}>中文</button>
                <button onClick={() => setLanguage('en')} className={`text-[9px] px-2 py-0.5 rounded transition-colors ${language === 'en' ? 'bg-blue-600 text-white font-bold' : 'text-gray-500 hover:text-gray-300'}`}>EN</button>
             </div>
            <div className={`text-[9px] px-2 py-0.5 rounded ${isQuotaExhausted ? 'bg-red-900/50 text-red-400' : 'bg-green-900/50 text-green-400'}`}>
                {isQuotaExhausted ? 'QUOTA LIMIT' : 'OK'}
            </div>
        </div>
      </div>

      {/* Persona Editor */}
      <div className="shrink-0 bg-[#161b22] border border-gray-700 rounded-lg flex flex-col shadow-lg">
          <div className="px-3 py-2 bg-[#21262d] border-b border-gray-700 flex justify-between items-center">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Base Identity</h4>
              <button 
                onClick={() => setIsEditingPersona(!isEditingPersona)} 
                className={`text-[9px] px-2 py-0.5 rounded border transition-colors ${isEditingPersona ? 'bg-blue-900/30 text-blue-400 border-blue-500/50' : 'bg-gray-800 text-gray-500 border-gray-600 hover:text-gray-300'}`}
              >
                  {isEditingPersona ? 'SAVE' : 'EDIT'}
              </button>
          </div>
          <div className="p-0">
               {isEditingPersona ? (
                  <textarea 
                    className="w-full h-[100px] bg-[#0d1117] text-gray-300 text-[10px] font-mono p-3 focus:outline-none resize-none"
                    value={currentPersona}
                    onChange={(e) => setCurrentPersona(e.target.value)}
                  />
              ) : (
                  <div className="w-full h-[100px] bg-[#0d1117] text-gray-500 text-[10px] font-mono p-3 overflow-y-auto leading-relaxed scrollbar-thin scrollbar-thumb-gray-800 hover:text-gray-400 transition-colors">
                      {currentPersona}
                  </div>
              )}
          </div>
      </div>

      {/* Cognitive Stack */}
      <div className="flex-1 min-h-0 flex flex-col gap-3 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-800">
          <div className="flex justify-between items-end pb-2 sticky top-0 bg-[#161b22] z-10 border-b border-gray-800/50">
            <h4 className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Cognitive Stack</h4>
            <button onClick={runDirectorManualTrigger} className="text-[9px] text-blue-500 hover:text-blue-400 underline decoration-dotted">
                {t.TRIGGER_REFLECT}
            </button>
          </div>
          
          <ModelCard 
            title={t.MODEL_L1}
            selectedModelId={l1ModelId}
            models={FAST_MODELS}
            onModelChange={setL1ModelId}
            color="emerald"
            isActive={activeProcess === 'L1_PERCEPTION'}
            layer="L1"
            icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
          />

          <ModelCard 
            title={t.MODEL_L2}
            selectedModelId={l2ModelId}
            models={THINKING_MODELS}
            onModelChange={setL2ModelId}
            color="indigo"
            isActive={activeProcess === 'L2_DIRECTOR'}
            layer="L2"
            icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>}
          />

          <ModelCard 
            title={t.MODEL_L3}
            selectedModelId={l3ModelId}
            models={CHAT_MODELS}
            onModelChange={setL3ModelId}
            color="blue"
            isActive={activeProcess === 'L3_EXECUTION'}
            layer="L3"
            icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>}
          />
      </div>

      {/* Tools */}
      <div className="shrink-0 space-y-3 pt-2 border-t border-gray-800">
          <div className="flex justify-between items-center mb-1">
             <h4 className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Tools & IO</h4>
             <span className="text-[9px] text-gray-500">Active</span>
          </div>
          <div className="grid grid-cols-1 gap-2 mb-2">
            <ToolBadge icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} label={t.TOOL_VISION} isActive={activeProcess === 'TOOL_VISION'} color="purple" />
          </div>
          
          <button onClick={toggleAutoMode} className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all w-full ${isAutoMode ? 'bg-pink-900/20 border-pink-700/50' : 'bg-[#21262d] border-gray-700'}`}>
              <span className="text-[10px] text-gray-400">{t.AUTO_MODE}</span>
              <div className={`w-6 h-3 rounded-full p-0.5 transition-colors duration-300 ${isAutoMode ? 'bg-pink-500' : 'bg-gray-600'}`}><div className={`w-2 h-2 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${isAutoMode ? 'translate-x-3' : 'translate-x-0'}`}></div></div>
          </button>

          <div className="grid grid-cols-2 gap-2">
             <button onClick={toggleImageGenerationPause} className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all ${!isImageGenerationPaused ? 'bg-purple-900/20 border-purple-700/50' : 'bg-[#21262d] border-gray-700'}`}>
                <span className="text-[10px] text-gray-400">{t.SELFIE_SWITCH}</span>
                <div className={`w-6 h-3 rounded-full p-0.5 transition-colors duration-300 ${!isImageGenerationPaused ? 'bg-purple-500' : 'bg-gray-600'}`}><div className={`w-2 h-2 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${!isImageGenerationPaused ? 'translate-x-3' : 'translate-x-0'}`}></div></div>
            </button>

             <button onClick={toggleVoiceEnabled} className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all ${isVoiceEnabled ? 'bg-yellow-900/20 border-yellow-700/50' : 'bg-[#21262d] border-gray-700'}`}>
                <span className="text-[10px] text-gray-400">{t.VOICE_SWITCH}</span>
                <div className={`w-6 h-3 rounded-full p-0.5 transition-colors duration-300 ${isVoiceEnabled ? 'bg-yellow-500' : 'bg-gray-600'}`}><div className={`w-2 h-2 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${isVoiceEnabled ? 'translate-x-3' : 'translate-x-0'}`}></div></div>
            </button>
          </div>

      </div>

      <div className="mt-auto pt-3 border-t border-gray-800 shrink-0">
          <button onClick={onOpenSettings} className={`w-full py-2.5 rounded-lg border border-gray-700 text-xs font-medium transition-all flex items-center justify-center gap-2 ${isQuotaExhausted ? 'bg-red-900/20 text-red-400 border-red-800 hover:bg-red-900/40' : 'bg-[#21262d] text-gray-300 hover:bg-[#30363d]'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {t.FULL_SETTINGS}
          </button>
      </div>
    </div>
  );
};

export default RightPanel;
