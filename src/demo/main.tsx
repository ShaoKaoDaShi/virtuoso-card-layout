import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './App.css';

// 创建根元素并渲染应用
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);