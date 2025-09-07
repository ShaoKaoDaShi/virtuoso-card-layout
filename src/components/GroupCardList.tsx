import React, { forwardRef, useMemo, useCallback, useState, useEffect } from "react";
import styled from "styled-components";
import { CardData, Theme, CardAlignmentStrategy } from "@/types";
import { calculateOptimalCardPosition, createClassName } from "@/utils/helpers";
import { Card } from "./Card";
import { useCardContext } from "./common/Context";
import { useGroupCardContext } from "./common/GroupContext";

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100%;

  background-color: var(--vc-color-surface);
  padding: var(--vc-spacing-sm);
  border-left: 1px solid var(--vc-color-border);
  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: var(--vc-color-surface);
  }

  &::-webkit-scrollbar-thumb {
    background: var(--vc-color-border);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--vc-color-text-disabled);
  }
`;

const CardWrapper = styled.div<{
  $strategy: CardAlignmentStrategy;
  $position?: { x: number; y: number };
  $isMobile: boolean;
}>`
  ${(props) => {
    if (props.$strategy === "overlay" && props.$position) {
      return `
        position: absolute;
        left: ${props.$position.x}px;
        top: ${props.$position.y}px;
        z-index: 10;
      `;
    }
    return `
      position: relative;
      margin-bottom: var(--vc-spacing-sm);
    `;
  }}

  width: ${(props) => (props.$isMobile ? "100%" : "calc(100% - 16px)")};
  max-width: 100%;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--vc-color-text-secondary);
  font-size: 14px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  width: 48px;
  height: 48px;
  margin-bottom: var(--vc-spacing-md);
  opacity: 0.5;

  &::before {
    content: "📝";
    font-size: 48px;
  }
`;

interface CardListProps {
  cards: CardData[];
  alignmentStrategy: CardAlignmentStrategy;
  theme: Theme;
  cardRenderer?: (card: CardData) => React.ReactNode;
  onCardClick?: (card: CardData) => void;
  isMobile: boolean;
  className?: string;
}

/**
 * 卡片列表组件 - 管理和渲染所有卡片
 */
export const GroupCardList = forwardRef<HTMLDivElement, CardListProps>(
  ({ cards, alignmentStrategy, theme, cardRenderer, onCardClick, isMobile, className }, ref) => {
    const [cardPositions, setCardPositions] = useState<Map<string, { x: number; y: number }>>(new Map());
    const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
    const { cardsWrappers, needRenderedCards } = useGroupCardContext();
    // 监听容器尺寸变化
    useEffect(() => {
      if (!ref || typeof ref === "function") return;

      const container = ref.current;
      if (!container) return;

      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          setContainerDimensions({ width, height });
        }
      });

      resizeObserver.observe(container);

      // 初始化尺寸
      const rect = container.getBoundingClientRect();
      setContainerDimensions({ width: rect.width, height: rect.height });

      return () => {
        resizeObserver.disconnect();
      };
    }, [ref]);

    // 计算卡片位置（用于overlay策略）
    // const calculateCardPositions = useCallback(() => {
    //   if (alignmentStrategy !== "overlay" && alignmentStrategy !== "hybrid") {
    //     return new Map();
    //   }

    //   const positions = new Map<string, { x: number; y: number }>();
    //   const existingRects: Array<{ x: number; y: number; width: number; height: number }> = [];

    //   cards.forEach((card, index) => {
    //     const cardWidth = Math.min(280, containerDimensions.width - 16);
    //     const cardHeight = 120; // 估算卡片高度
    //     const preferredY = (card.lineNumber || index) * 24; // 基于行号计算Y位置

    //     // 对于hybrid策略，只有高优先级卡片使用overlay
    //     const shouldUseOverlay =
    //       alignmentStrategy === "overlay" || (alignmentStrategy === "hybrid" && card.priority === "high");

    //     if (shouldUseOverlay) {
    //       const optimalPosition = calculateOptimalCardPosition(
    //         { width: cardWidth, height: cardHeight, preferredY },
    //         existingRects,
    //         containerDimensions.width,
    //         containerDimensions.height
    //       );

    //       positions.set(card.id, optimalPosition);
    //       existingRects.push({
    //         x: optimalPosition.x,
    //         y: optimalPosition.y,
    //         width: cardWidth,
    //         height: cardHeight,
    //       });
    //     }
    //   });

    //   return positions;
    // }, [cards, alignmentStrategy, containerDimensions]);

    // 更新卡片位置
    // useEffect(() => {
    //   const positions = calculateCardPositions();
    //   setCardPositions(positions);
    // }, [calculateCardPositions]);

    // 默认卡片渲染器
    const defaultCardRenderer = useCallback(
      (card: CardData) => (
        <Card key={card.id} card={card} theme={theme} onClick={() => onCardClick?.(card)} isMobile={isMobile} />
      ),
      [theme, onCardClick, isMobile]
    );

    const renderCard = cardRenderer || defaultCardRenderer;

    // 空状态
    if (cards.length === 0) {
      return (
        <Container ref={ref} className={createClassName("card-list", "card-list--empty", className)}>
          <EmptyState>
            <EmptyIcon />
            <div>暂无卡片</div>
            <div style={{ fontSize: "12px", marginTop: "4px" }}>卡片将显示在这里</div>
          </EmptyState>
        </Container>
      );
    }

    return (
      <Container ref={ref} className={createClassName("card-list", `card-list--${alignmentStrategy}`, className)}>
        {/* 内联卡片 */}
        {needRenderedCards.map((card, index) => (
          <CardWrapper
            key={card.id}
            $strategy="inline"
            $isMobile={isMobile}
            ref={(el) => {
              if (el) {
                cardsWrappers[card.id] = el;
              }
            }}
          >
            {renderCard(card)}
          </CardWrapper>
        ))}
      </Container>
    );
  }
);
