
/**
 * -------------------------------------------------------------------------
 * 文件名称：components/SettingsModal.tsx
 * 功能描述：设置弹窗组件。
 * -------------------------------------------------------------------------
 */

import React from 'react';
import { useAI } from '../context/AIContext';
import { BILLING_DOCS_URL, CHAT_MODELS, IMAGE_MODELS, FAST_MODELS, THINKING_MODELS, UI_LABELS } from '../constants';

interface SettingsModalProps {
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { 
    l3ModelId, setL3ModelId, 
    imageModelId, setImageModelId, 
    l1ModelId, setL1ModelId,
    l2ModelId, setL2ModelId,
    setApiKeyNeeded, language 
  } = useAI();
  const t = UI_LABELS[language];

  const handleSelectApiKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setApiKeyNeeded(false); 
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 transform transition-all border border-gray-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">{t.SETTINGS}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* API Key Section */}
        <div className="mb-8 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl shadow-inner">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-blue-500 rounded-lg text-white">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
                <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3A5.25 5.25 0 0 0 12 1.5Zm-3.75 8.25v-3a3.75 3.75 0 1 1 7.5 0v3H8.25Z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-blue-900">{t.CORE_POWER}</h3>
          </div>
          
          <div className="text-sm text-blue-800/80 mb-4 space-y-2 leading-relaxed">
            <p>{t.BILLING_HINT}</p>
            <a href={BILLING_DOCS_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 font-bold hover:underline">
              Docs <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-4"><path fillRule="evenodd" d="M5.22 14.78a.75.75 0 0 0 1.06 0l7.22-7.22v5.69a.75.75 0 0 0 1.5 0v-7.5a.75.75 0 0 0-.75-.75h-7.5a.75.75 0 0 0 0 1.5h5.69l-7.22 7.22a.75.75 0 0 0 0 1.06Z" clipRule="evenodd" /></svg>
            </a>
          </div>

          <button onClick={handleSelectApiKey} className="w-full px-5 py-3 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95">
            {t.SWITCH_KEY}
          </button>
        </div>

        {/* Model Selection Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">{t.MODEL_L1}</label>
            <select
              className="w-full bg-gray-50 border border-gray-200 text-gray-800 py-3 px-4 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all cursor-pointer"
              value={l1ModelId}
              onChange={(e) => setL1ModelId(e.target.value)}
            >
              {FAST_MODELS.map(model => <option key={model.id} value={model.id}>{model.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">{t.MODEL_L2}</label>
            <select
              className="w-full bg-gray-50 border border-gray-200 text-gray-800 py-3 px-4 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all cursor-pointer"
              value={l2ModelId}
              onChange={(e) => setL2ModelId(e.target.value)}
            >
              {THINKING_MODELS.map(model => <option key={model.id} value={model.id}>{model.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">{t.MODEL_L3}</label>
            <select
              className="w-full bg-gray-50 border border-gray-200 text-gray-800 py-3 px-4 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all cursor-pointer"
              value={l3ModelId}
              onChange={(e) => setL3ModelId(e.target.value)}
            >
              {CHAT_MODELS.map(model => <option key={model.id} value={model.id}>{model.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">{t.MODEL_TOOL}</label>
            <select
              className="w-full bg-gray-50 border border-gray-200 text-gray-800 py-3 px-4 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition-all cursor-pointer"
              value={imageModelId}
              onChange={(e) => setImageModelId(e.target.value)}
            >
              {IMAGE_MODELS.map(model => <option key={model.id} value={model.id}>{model.name}</option>)}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
