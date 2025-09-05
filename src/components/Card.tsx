
import React, { memo } from 'react';
import styled from 'styled-components';
import { CardData, Theme } from '@/types';
import { getCardColor, getCardTypeDisplayName, getCardPriorityDisplayName } from '@/utils/helpers';

const CardContainer = styled.div<{ $cardType: CardData['type']; $priority: CardData['priority']; $isMobile: boolean }>`
  background-color: ${props => getCardColor(props.theme as Theme, props.$cardType)};
  border: 1px solid var(--vc-color-border);
  border-radius: var(--vc-border-radius-md);
  padding: var(--vc-spacing-md);
  margin-bottom: var(--vc-spacing-sm);
  box-shadow: var(--vc-shadow-sm);
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  position: relative;
  overflow: hidden;
  
  ${props => props.$isMobile && `
    padding: var(--vc-spacing-sm);
    font-size: 14px;
  `}
  
  ${props => props.$priority === 'high' && `
    border-left: 4px solid var(--vc-color-primary);
    box-shadow: var(--vc-shadow-md);
  `}
  
  ${props => props.$priority === 'medium' && `
    border-left: 4px solid var(--vc-color-secondary);
  `}
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--vc-shadow-lg);
    border-color: var(--vc-color-primary);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--vc-spacing-sm);
`;

const CardType = styled.span<{ $type: CardData['type'] }>`
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: var(--vc-border-radius-sm);
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  
  ${props => {
    const colors = {
      comment: '#1890ff',
      issue: '#fa8c16',
      suggestion: '#52c41a',
      warning: '#faad14',
      error: '#f5222d'
    };
    const color = colors[props.$type] || colors.comment;
    return `
      background-color: ${color}20;
      color: ${color};
      border: 1px solid ${color}40;
    `;
  }}
`;

const CardPriority = styled.span<{ $priority: CardData['priority'] }>`
  font-size: 12px;
  font-weight: 500;
  opacity: 0.7;
  
  ${props => {
    const colors = {
      high: '#f5222d',
      medium: '#fa8c16',
      low: '#52c41a'
    };
    return `color: ${colors[props.$priority]};`;
  }}
`;

const CardContent = styled.div`
  color: var(--vc-color-text-primary);
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
  overflow-wrap: break-word;
  
  /* 限制最大高度并添加滚动 */
  max-height: 120px;
  overflow-y: auto;
  
  /* 自定义滚动条 */
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--vc-color-border);
    border-radius: 2px;
  }
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--vc-spacing-sm);
  padding-top: var(--vc-spacing-sm);
  border-top: 1px solid var(--vc-color-border);
  font-size: 12px;
  color: var(--vc-color-text-secondary);
`;

const LineNumber = styled.span`
  background-color: var(--vc-color-surface);
  padding: 2px 6px;
  border-radius: var(--vc-border-radius-sm);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 11px;
`;

const CardId = styled.span`
  opacity: 0.6;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
`;

interface CardProps {
  card: CardData;
  theme: Theme;
  onClick?: () => void;
  isMobile?: boolean;
  className?: string;
}

/**
 * 卡片组件 - 显示单个卡片的内容和信息
 */
export const Card: React.FC<CardProps> = memo(({
  card,
  onClick,
  isMobile = false,
  className
}) => {
  const handleClick = () => {
    onClick?.();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.();
    }
  };

  return (
    <CardContainer
      $cardType={card.type}
      $priority={card.priority}
      $isMobile={isMobile}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={className}
      role="button"
      tabIndex={0}
      aria-label={`${getCardTypeDisplayName(card.type)}卡片，优先级：${getCardPriorityDisplayName(card.priority)}`}
    >
      <CardHeader>
        <CardType $type={card.type}>
          {getCardTypeDisplayName(card.type)}
        </CardType>
        <CardPriority $priority={card.priority}>
          {getCardPriorityDisplayName(card.priority)}
        </CardPriority>
      </CardHeader>
      
      <CardContent>
        {typeof card.content === 'string' ? (
          <div dangerouslySetInnerHTML={{ __html: card.content }} />
        ) : (
          card.content
        )}
      </CardContent>
      
      <CardFooter>
        <div>
          {card.lineNumber && (
            <LineNumber>
              行 {card.lineNumber}
            </LineNumber>
          )}
        </div>
        <CardId>
          #{card.id.slice(-6)}
        </CardId>
      </CardFooter>
    </CardContainer>
  );
});

Card.displayName = 'Card';