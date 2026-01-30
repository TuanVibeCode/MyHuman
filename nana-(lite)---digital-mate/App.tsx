
/**
 * -------------------------------------------------------------------------
 * 文件名称：App.tsx
 * 功能描述：应用主组件。
 * 
 * 职责：
 * 1. 提供全局 AIContext。
 * 2. 初始化自主意志引擎 (useFreeWill)。
 * 3. 渲染主布局 (Layout)。
 * -------------------------------------------------------------------------
 */

import React from 'react';
import { AIProvider } from './context/AIContext';
import { useFreeWill } from './hooks/useFreeWill';
import Layout from './components/Layout';

const InnerApp = () => {
  // 初始化自由意志引擎 (Layer 0)。必须在 AIProvider 内部调用。
  useFreeWill(); 

  return (
    <Layout />
  );
};

function App() {
  return (
    <AIProvider>
      <InnerApp />
    </AIProvider>
  );
}

export default App;
