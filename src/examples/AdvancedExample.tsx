
import React, { useState, useCallback } from 'react';
import { VirtuosoCardLayout } from '../components/VirtuosoCardLayout';
import { CardData, VirtualListItem } from '../types';
import { generateId } from '../utils/helpers';
import { useHeightSync, useCardManagement } from '../hooks';

/**
 * 高级使用示例 - 展示更复杂的功能和自定义配置
 */
export const AdvancedExample: React.FC = () => {
  // 使用高度同步Hook
  const {
    scrollToIndex,
    scrollToTop,
    scrollToBottom
  } = useHeightSync({ enabled: true, debounceMs: 50 });

  // 生成代码文件内容
  const generateCodeItems = (): VirtualListItem[] => {
    const codeLines = [
      'import React, { useState, useCallback } from "react";',
      'import { Virtuoso } from "react-virtuoso";',
      '',
      'interface Props {',
      '  items: any[];',
      '  onItemClick?: (item: any) => void;',
      '}',
      '',
      'export const CodeViewer: React.FC<Props> = ({ items, onItemClick }) => {',
      '  const [selectedItem, setSelectedItem] = useState<any>(null);',
      '',
      '  const handleItemClick = useCallback((item: any, index: number) => {',
      '    setSelectedItem(item);',
      '    onItemClick?.(item);',
      '  }, [onItemClick]);',
      '',
      '  return (',
      '    <div className="code-viewer">',
      '      <Virtuoso',
      '        data={items}',
      '        itemContent={(index, item) => (',
      '          <div',
      '            key={item.id}',
      '            className={`code-line ${selectedItem?.id === item.id ? "selected" : ""}`}',
      '            onClick={() => handleItemClick(item, index)}',
      '          >',
      '            <span className="line-number">{index + 1}</span>',
      '            <span className="line-content">{item.content}</span>',
      '          </div>',
      '        )}',
      '      />',
      '    </div>',
      '  );',
      '};',
      '',
      '// 使用示例',
      'const App = () => {',
      '  const [items] = useState(generateItems());',
      '',
      '  return (',
      '    <CodeViewer',
      '      items={items}',
      '      onItemClick={(item) => console.log("Clicked:", item)}',
      '    />',
      '  );',
      '};'
    ];

    return codeLines.map((line, index) => ({
      id: generateId('line'),
      content: `
        <div style="display: flex; align-items: center; padding: 4px 8px; font-family: 'Monaco', 'Menlo', monospace; font-size: 13px;">
          <span style="width: 40px; text-align: right; color: #999; margin-right: 12px; user-select: none;">
            ${index + 1}
          </span>
          <span style="color: ${line.trim() === '' ? '#999' : '#333'};">
            ${line || '&nbsp;'}
          </span>
        </div>
      `,
      height: 24,
      metadata: {
        type: 'code-line',
        lineNumber: index + 1,
        isEmpty: line.trim() === '',
        language: 'typescript'
      }
    }));
  };

  // 生成问题卡片
  const generateIssueCards = (): CardData[] => {
    const issues = [
      {
        line: 12,
        type: 'error' as const,
        priority: 'high' as const,
        title: '类型错误',
        content: '参数 `item` 的类型应该更具体，建议使用泛型或定义接口。'
      },
      {
        line: 18,
        type: 'warning' as const,
        priority: 'medium' as const,
        title: '性能警告',
        content: '建议使用 React.memo 包装组件以避免不必要的重渲染。'
      },
      {
        line: 23,
        type: 'suggestion' as const,
        priority: 'low' as const,
        title: '代码建议',
        content: '可以考虑将 className 的逻辑提取到一个辅助函数中。'
      },
      {
        line: 35,
        type: 'comment' as const,
        priority: 'medium' as const,
        title: '代码评论',
        content: '这里的逻辑很清晰，但建议添加错误边界处理。'
      },
      {
        line: 5,
        type: 'issue' as const,
        priority: 'high' as const,
        title: '接口定义',
        content: 'Props 接口定义过于宽泛，建议明确 items 的类型结构。'
      }
    ];

    return issues.map(issue => ({
      id: generateId('issue'),
      type: issue.type,
      priority: issue.priority,
      content: `
        <div>
          <h4 style="margin: 0 0 8px 0; color: #333;">${issue.title}</h4>
          <p style="margin: 0; line-height: 1.4;">${issue.content}</p>
        </div>
      `,
      lineNumber: issue.line,
      metadata: {
        author: 'Code Reviewer',
        timestamp: Date.now() - Math.random() * 86400000,
        severity: issue.priority,
        category: issue.type
      }
    }));
  };

  const [items] = useState(() => generateCodeItems());
  const [cards, setCards] = useState(() => generateIssueCards());
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [alignmentStrategy, setAlignmentStrategy] = useState<'inline' | 'overlay' | 'hybrid'>('hybrid');

  // 使用卡片管理Hook
  const {
    getCardsByLine
  } = useCardManagement(cards);

  // 处理行点击
  const handleItemClick = useCallback((item: VirtualListItem, index: number) => {
    const lineNumber = index + 1;
    setSelectedLine(lineNumber);
    console.log(`选中了第 ${lineNumber} 行:`, item);
  }, []);

  // 处理卡片点击
  const handleCardClick = useCallback((card: CardData) => {
    if (card.lineNumber) {
      scrollToIndex(card.lineNumber - 1, { align: 'center', behavior: 'smooth' });
      setSelectedLine(card.lineNumber);
    }
  }, [scrollToIndex]);

  // 跳转到指定行
  const jumpToLine = useCallback(() => {
    const input = prompt('请输入要跳转的行号 (1-' + items.length + '):');
    if (input) {
      const lineNumber = parseInt(input, 10);
      if (lineNumber >= 1 && lineNumber <= items.length) {
        scrollToIndex(lineNumber - 1, { align: 'center', behavior: 'smooth' });
        setSelectedLine(lineNumber);
      } else {
        alert('行号超出范围！');
      }
    }
  }, [items.length, scrollToIndex]);

  // 添加新问题
  const addNewIssue = useCallback(() => {
    if (selectedLine) {
      const newCard: CardData = {
        id: generateId('issue'),
        type: 'comment',
        priority: 'medium',
        content: `
          <div>
            <h4 style="margin: 0 0 8px 0; color: #333;">新问题</h4>
            <p style="margin: 0; line-height: 1.4;">
              在第 ${selectedLine} 行发现的问题，添加时间: ${new Date().toLocaleTimeString()}
            </p>
          </div>
        `,
        lineNumber: selectedLine,
        metadata: {
          author: '当前用户',
          timestamp: Date.now()
        }
      };
      
      setCards(prev => [...prev, newCard]);
    } else {
      alert('请先选择一行代码！');
    }
  }, [selectedLine]);

  return (
    <div style={{ padding: '20px', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '24px', fontWeight: 'bold' }}>
          Virtuoso卡片布局 - 高级示例
        </h1>
        <p style={{ margin: '0 0 15px 0', color: '#666' }}>
          模拟代码审查场景，展示代码行与问题卡片的精确对齐
        </p>
        
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          flexWrap: 'wrap', 
          alignItems: 'center',
          marginBottom: '10px'
        }}>
          <button onClick={jumpToLine} style={buttonStyle}>
            跳转到行
          </button>
          <button onClick={addNewIssue} style={buttonStyle}>
            添加问题
          </button>
          <button onClick={() => setCards([])} style={{ ...buttonStyle, backgroundColor: '#f5222d' }}>
            清空问题
          </button>
          <button onClick={scrollToTop} style={buttonStyle}>
            回到顶部
          </button>
          <button onClick={scrollToBottom} style={buttonStyle}>
            跳到底部
          </button>
          
          <div style={{ marginLeft: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '14px' }}>对齐策略:</label>
            <select 
              value={alignmentStrategy}
              onChange={(e) => setAlignmentStrategy(e.target.value as any)}
              style={{
                padding: '4px 8px',
                border: '1px solid #d9d9d9',
                borderRadius: '4px'
              }}
            >
              <option value="inline">内联</option>
              <option value="overlay">覆盖</option>
              <option value="hybrid">混合</option>
            </select>
          </div>
        </div>

        <div style={{ fontSize: '14px', color: '#666' }}>
          当前选中行: {selectedLine || '无'} | 
          问题总数: {cards.length} | 
          当前行问题: {selectedLine ? getCardsByLine(selectedLine).length : 0}
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        <VirtuosoCardLayout
          items={items}
          cards={cards}
          layout={{
            virtuosoWidth: '65%',
            cardListWidth: '35%',
            gap: '1px',
            minHeight: '500px',
            maxHeight: '100%'
          }}
          heightSync={{
            enabled: true,
            debounceMs: 50,
            minHeight: 500
          }}
          alignmentStrategy={alignmentStrategy}
          onItemClick={handleItemClick}
          onCardClick={handleCardClick}
          virtuosoProps={{
            overscan: 100,
            increaseViewportBy: 50
          }}
          // 自定义主题
          theme={{
            colors: {
              primary: '#1890ff',
              secondary: '#722ed1',
              background: '#ffffff',
              surface: '#fafafa',
              border: '#e8e8e8',
              text: {
                primary: '#262626',
                secondary: '#595959',
                disabled: '#bfbfbf'
              },
              card: {
                comment: '#e6f7ff',
                issue: '#fff2e8',
                suggestion: '#f6ffed',
                warning: '#fffbe6',
                error: '#fff1f0'
              }
            }
          }}
        />
      </div>
    </div>
  );
};

const buttonStyle: React.CSSProperties = {
  padding: '6px 12px',
  backgroundColor: '#1890ff',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px'
};