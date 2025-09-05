import React, { memo } from 'react';
import styled from 'styled-components';
import { VirtualListItem, Theme } from '@/types';
import { createClassName } from '@/utils/helpers';

const ItemContainer = styled.div<{ $isClickable: boolean }>`
  padding: var(--vc-spacing-sm) var(--vc-spacing-md);
  border-bottom: 1px solid var(--vc-color-border);
  background-color: var(--vc-color-background);
  transition: background-color 0.2s ease-in-out;
  
  ${props => props.$isClickable && `
    cursor: pointer;
    
    &:hover {
      background-color: var(--vc-color-surface);
    }
    
    &:active {
      background-color: var(--vc-color-border);
    }
  `}
  
  &:last-child {
    border-bottom: none;
  }
`;

const ItemContent = styled.div`
  color: var(--vc-color-text-primary);
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
  overflow-wrap: break-word;
`;

const ItemIndex = styled.span`
  display: inline-block;
  width: 40px;
  color: var(--vc-color-text-secondary);
  font-size: 12px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  text-align: right;
  margin-right: var(--vc-spacing-sm);
  opacity: 0.7;
`;

const ItemMeta = styled.div`
  display: flex;
  align-items: center;
  margin-top: var(--vc-spacing-xs);
  font-size: 12px;
  color: var(--vc-color-text-secondary);
  gap: var(--vc-spacing-sm);
`;

const MetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
`;

interface VirtualListItemProps {
  item: VirtualListItem;
  index: number;
  onClick?: (item: VirtualListItem, index: number) => void;
  theme: Theme;
  showIndex?: boolean;
  className?: string;
}

/**
 * 虚拟列表项组件 - 渲染单个虚拟列表项
 */
export const VirtualListItemComponent: React.FC<VirtualListItemProps> = memo(({
  item,
  index,
  onClick,
  showIndex = true,
  className
}) => {
  const isClickable = Boolean(onClick);

  const handleClick = () => {
    if (onClick) {
      onClick(item, index);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (isClickable && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick?.(item, index);
    }
  };

  return (
    <ItemContainer
      $isClickable={isClickable}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={createClassName('virtual-list-item', className)}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={isClickable ? `列表项 ${index + 1}` : undefined}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        {showIndex && (
          <ItemIndex>
            {index + 1}
          </ItemIndex>
        )}
        
        <div style={{ flex: 1, minWidth: 0 }}>
          <ItemContent>
            {typeof item.content === 'string' ? (
              <div dangerouslySetInnerHTML={{ __html: item.content }} />
            ) : (
              item.content
            )}
          </ItemContent>
          
          {item.metadata && Object.keys(item.metadata).length > 0 && (
            <ItemMeta>
              {item.height && (
                <MetaItem>
                  📏 高度: {item.height}px
                </MetaItem>
              )}
              {item.metadata.type && (
                <MetaItem>
                  🏷️ 类型: {item.metadata.type}
                </MetaItem>
              )}
              {item.metadata.timestamp && (
                <MetaItem>
                  🕒 {new Date(item.metadata.timestamp).toLocaleTimeString()}
                </MetaItem>
              )}
            </ItemMeta>
          )}
        </div>
      </div>
    </ItemContainer>
  );
});

VirtualListItemComponent.displayName = 'VirtualListItem';