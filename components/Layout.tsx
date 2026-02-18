
/**
 * -------------------------------------------------------------------------
 * 文件名称：components/Layout.tsx
 * 功能描述：应用主布局容器。
 * 
 * 职责：
 * 1. 划分三栏布局：左侧日志(ActionLogPanel)，中间手机(WeChatApp)，右侧控制(RightPanel)。
 * 2. 处理响应式布局逻辑 (移动端/桌面端)。
 * 3. 实现右侧面板的拖拽调整大小。
 * -------------------------------------------------------------------------
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import ActionLogPanel from './ActionLogPanel';
import WeChatApp from './WeChatApp';
import RightPanel from './RightPanel';
import SettingsModal from './SettingsModal';

interface LayoutProps {
  children?: React.ReactNode; 
}

const Layout: React.FC<LayoutProps> = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [rightPanelWidth, setRightPanelWidth] = useState(320); // 默认宽度
  const isResizingRef = useRef(false);

  const startResizing = useCallback(() => {
    isResizingRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const stopResizing = useCallback(() => {
    isResizingRef.current = false;
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'auto';
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (isResizingRef.current) {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 250 && newWidth < 800) { // 限制最小/最大宽度
        setRightPanelWidth(newWidth);
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  return (
    <div className="flex h-screen w-full bg-[#1e1e1e] overflow-hidden text-gray-900 font-sans">
      {/* 左侧：系统日志面板 (Matrix 风格) */}
      <div className="hidden xl:block w-80 h-full border-r border-gray-800 bg-[#0d1117] shrink-0 z-10">
        <ActionLogPanel />
      </div>

      {/* 中间：手机模拟器舞台 */}
      <div className="flex-1 h-full relative bg-[#2b2b2b] overflow-hidden flex items-center justify-center min-w-0">
         {/* 装饰背景 */}
         <div className="fixed inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] z-0"></div>
         
         {/* 手机容器，支持缩放 */}
         <div className="relative z-10 flex items-center justify-center transition-transform duration-500 transform scale-[0.85] sm:scale-[0.9] lg:scale-100 origin-center h-full w-full">
            <div className="shadow-[0_0_100px_rgba(0,0,0,0.5)] rounded-[48px]">
                <WeChatApp />
            </div>
         </div>
      </div>

      {/* 拖拽手柄 */}
      <div 
        className="hidden lg:block w-1 h-full cursor-col-resize hover:bg-blue-500 bg-gray-800 transition-colors z-20 shrink-0"
        onMouseDown={startResizing}
      ></div>

      {/* 右侧：控制中心 (可调整大小) */}
      <div 
        className="hidden lg:block h-full border-l border-gray-800 bg-[#161b22] shrink-0 z-10"
        style={{ width: `${rightPanelWidth}px` }}
      >
         <RightPanel onOpenSettings={() => setShowSettings(true)} />
      </div>

      {/* 弹窗 */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
};

export default Layout;
