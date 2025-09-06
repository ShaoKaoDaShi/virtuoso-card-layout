import React, { useState, useCallback } from 'react';
import { VirtuosoCardLayout } from '../components/VirtuosoCardLayout';
import { CardData, VirtualListItem } from '../types';
import { generateId } from '../utils/helpers';

/**
 * 基础使用示例 - 展示Virtuoso虚拟滚动与卡片列表的基本功能
 */
export const BasicExample: React.FC = () => {
  // 生成示例虚拟列表数据
  const generateListItems = (count: number): VirtualListItem[] => {
    return Array.from({ length: count }, (_, index) => ({
      id: generateId('item'),
      content: `
        <div style="padding: 8px;">
          <div style="font-weight: 600; margin-bottom: 4px;">代码行 ${index + 1}</div>
          <div style="font-family: 'Monaco', 'Menlo', monospace; font-size: 13px; color: #666;">
            ${index % 3 === 0 ? 'function calculateSum(a, b) {' : 
              index % 3 === 1 ? '  return a + b;' : '}'}
          </div>
        </div>
      `,
      height: 60,
      metadata: {
        type: 'code-line',
        lineNumber: index + 1,
        timestamp: Date.now()
      }
    }));
  };

  // 生成示例卡片数据
  const generateCards = (count: number): CardData[] => {
    const cardTypes: CardData['type'][] = ['comment', 'issue', 'suggestion', 'warning', 'error'];
    const priorities: CardData['priority'][] = ['high', 'medium', 'low'];
    
    return Array.from({ length: count }, (_, index) => ({
      id: generateId('card'),
      type: cardTypes[index % cardTypes.length],
      priority: priorities[index % priorities.length],
      content: `
        <div>
          <p><strong>卡片 ${index + 1}</strong></p>
          <p>这是一个示例卡片，展示了不同类型的内容。</p>
          <p>行号: ${Math.floor(Math.random() * 100) + 1}</p>
        </div>
      `,
      lineNumber: Math.floor(Math.random() * 100) + 1,
      metadata: {
        author: '开发者',
        timestamp: Date.now() - Math.random() * 86400000,
        tags: ['示例', '测试']
      }
    }));
  };

  const [items] = useState(() => generateListItems(1000));
  const [cards, setCards] = useState(() => generateCards(15));

  // 处理项目点击
  const handleItemClick = useCallback((item: VirtualListItem, index: number) => {
    console.log("点击了项目:", item, "索引:", index);
    // alert(`点击了第 ${index + 1} 项`);
  }, []);

  // 处理卡片点击
  const handleCardClick = useCallback((card: CardData) => {
    console.log("点击了卡片:", card);
    // alert(`点击了卡片: ${card.type} - ${card.id}`);
  }, []);

  // 处理滚动
  const handleScroll = useCallback((scrollTop: number) => {
    console.log('滚动位置:', scrollTop);
  }, []);

  // 处理高度变化
  const handleHeightChange = useCallback((height: number) => {
    console.log('容器高度变化:', height);
  }, []);

  // 添加新卡片
  const addNewCard = useCallback(() => {
    const newCard: CardData = {
      id: generateId('card'),
      type: 'comment',
      priority: 'medium',
      content: `
        <div>
          <p><strong>新卡片</strong></p>
          <p>这是一个新添加的卡片，时间: ${new Date().toLocaleTimeString()}</p>
        </div>
      `,
      lineNumber: Math.floor(Math.random() * 100) + 1,
      metadata: {
        author: '用户',
        timestamp: Date.now()
      }
    };
    
    setCards(prev => [...prev, newCard]);
  }, []);

  // 清空卡片
  const clearCards = useCallback(() => {
    setCards([]);
  }, []);

  return (
    <div style={{ padding: '20px', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '24px', fontWeight: 'bold' }}>
          Virtuoso卡片布局 - 基础示例
        </h1>
        <p style={{ margin: '0 0 15px 0', color: '#666' }}>
          展示虚拟滚动列表与卡片列表的并排布局和高度同步功能
        </p>
        
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={addNewCard}
            style={{
              padding: '8px 16px',
              backgroundColor: '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            添加卡片
          </button>
          <button 
            onClick={clearCards}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f5222d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            清空卡片
          </button>
          <span style={{ 
            padding: '8px 12px', 
            backgroundColor: '#f0f0f0', 
            borderRadius: '4px',
            fontSize: '14px'
          }}>
            列表项: {items.length} | 卡片: {cards.length}
          </span>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        <VirtuosoCardLayout
          items={items}
          cards={cards}
          layout={{
            virtuosoWidth: '70%',
            cardListWidth: '30%',
            gap: '1px',
            minHeight: '400px',
            maxHeight: '100%'
          }}
          heightSync={{
            enabled: true,
            debounceMs: 100,
            minHeight: 400
          }}
          alignmentStrategy="hybrid"
          onItemClick={handleItemClick}
          onCardClick={handleCardClick}
          onScroll={handleScroll}
          onHeightChange={handleHeightChange}
          virtuosoProps={{
            overscan: 200,
            increaseViewportBy: 100
          }}
        />
      </div>
    </div>
  );
};