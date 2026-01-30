
/**
 * -------------------------------------------------------------------------
 * 文件名称：index.tsx
 * 功能描述：Web 应用的入口文件。
 * 
 * 职责：
 * 1. 查找 HTML 中的根节点 ('root')。
 * 2. 初始化 React Root。
 * 3. 渲染顶级组件 <App />，并包裹在 StrictMode 中以进行开发环境检查。
 * -------------------------------------------------------------------------
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
