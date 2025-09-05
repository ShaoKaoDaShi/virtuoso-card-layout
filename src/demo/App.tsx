import React, { useState } from 'react';
import { BasicExample } from '../examples/BasicExample';
import { AdvancedExample } from '../examples/AdvancedExample';
import './App.css';

/**
 * 演示应用主组件
 */
export const App: React.FC = () => {
  const [currentExample, setCurrentExample] = useState<'basic' | 'advanced'>('basic');

  return (
    <div className="demo-app">
      <header className="demo-header">
        <div className="demo-header-content">
          <h1 className="demo-title">
            🚀 Virtuoso Card Layout
          </h1>
          <p className="demo-subtitle">
            React虚拟滚动列表与卡片列表并排布局解决方案
          </p>
          
          <nav className="demo-nav">
            <button 
              className={`demo-nav-button ${currentExample === 'basic' ? 'active' : ''}`}
              onClick={() => setCurrentExample('basic')}
            >
              基础示例
            </button>
            <button 
              className={`demo-nav-button ${currentExample === 'advanced' ? 'active' : ''}`}
              onClick={() => setCurrentExample('advanced')}
            >
              高级示例
            </button>
          </nav>
        </div>
      </header>

      <main className="demo-main">
        {currentExample === 'basic' ? <BasicExample /> : <AdvancedExample />}
      </main>

      <footer className="demo-footer">
        <div className="demo-footer-content">
          <p>
            基于 <strong>React</strong> + <strong>react-virtuoso</strong> + <strong>TypeScript</strong> 构建
          </p>
          <div className="demo-features">
            <span className="demo-feature">✨ 高度同步</span>
            <span className="demo-feature">🎯 精确定位</span>
            <span className="demo-feature">📱 响应式设计</span>
            <span className="demo-feature">🔧 高度可配置</span>
          </div>
        </div>
      </footer>
    </div>
  );
};