import React, { useMemo, useCallback } from 'react';
import { Virtuoso } from 'react-virtuoso';
import styled, { ThemeProvider } from 'styled-components';
import { VirtuosoCardLayoutProps, VirtualListItem, CardData } from '@/types';
import { useHeightSync } from '@/hooks/useHeightSync';
import { useCardManagement } from '@/hooks/useCardManagement';
import { useResponsive } from '@/hooks/useResponsive';
import { defaultTheme, mergeTheme, generateCSSVariables } from '@/utils/theme';
import { createClassName } from '@/utils/helpers';
import { CardList } from './CardList';
import { VirtualListItemComponent } from './VirtualListItem';

const Container = styled.div<{ $cssVariables: Record<string, string> }>`
  display: flex;
  width: 100%;
  height: 100%;
  background-color: var(--vc-color-background);
  border: 1px solid var(--vc-color-border);
  border-radius: var(--vc-border-radius-md);
  overflow-y: auto;

  ${(props) =>
    Object.entries(props.$cssVariables)
      .map(([key, value]) => `${key}: ${value};`)
      .join("\n")}

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const VirtuosoContainer = styled.div<{ $width: string | number; $gap: string | number }>`
  flex: 0 0 ${(props) => (typeof props.$width === "number" ? `${props.$width}px` : props.$width)};
  height: 100%;
  border-right: 1px solid var(--vc-color-border);

  @media (max-width: 768px) {
    flex: 1;
    border-right: none;
    border-bottom: 1px solid var(--vc-color-border);
    margin-bottom: ${(props) => (typeof props.$gap === "number" ? `${props.$gap}px` : props.$gap)};
  }
`;

const CardContainer = styled.div<{ $width: string | number }>`
  flex: 0 0 ${(props) => (typeof props.$width === "number" ? `${props.$width}px` : props.$width)};
  height: 100%;
  overflow: hidden;

  @media (max-width: 768px) {
    flex: 1;
  }
`;

/**
 * Virtuoso虚拟滚动列表与卡片列表并排布局组件
 */
export const VirtuosoCardLayout: React.FC<VirtuosoCardLayoutProps> = ({
  items,
  cards,
  layout = {},
  heightSync = { enabled: true },
  alignmentStrategy = "hybrid",
  theme: customTheme = {},
  className,
  style,
  itemRenderer,
  cardRenderer,
  onItemClick,
  onCardClick,
  onScroll,
  onHeightChange,
  virtuosoProps = {},
}) => {
  // 合并主题
  const mergedTheme = useMemo(() => mergeTheme(defaultTheme, customTheme), [customTheme]);
  const [customScrollParent, setCustomScrollParent] = React.useState(null);

  // 生成CSS变量
  const cssVariables = useMemo(() => generateCSSVariables(mergedTheme), [mergedTheme]);

  // 响应式布局
  const { getResponsiveLayout, isMobile } = useResponsive();
  const responsiveLayout = getResponsiveLayout();

  // 合并布局配置
  const finalLayout = useMemo(
    () => ({
      ...{
        virtuosoWidth: "70%",
        cardListWidth: "30%",
        gap: "0",
        minHeight: "400px",
        maxHeight: "80vh",
      },
      ...responsiveLayout,
      ...layout,
    }),
    [layout, responsiveLayout]
  );

  // 高度同步
  const {
    containerRef,
    virtuosoRef,
    cardListRef,
    setVirtuosoRef,
    // height
  } = useHeightSync({ enabled: true });

  // 卡片管理
  const { visibleCards } = useCardManagement(cards);

  // 默认项目渲染器
  const defaultItemRenderer = useCallback(
    (item: VirtualListItem, index: number) => (
      <VirtualListItemComponent item={item} index={index} onClick={onItemClick} theme={mergedTheme} />
    ),
    [onItemClick, mergedTheme]
  );

  // 处理滚动事件
  const handleScroll = useCallback(
    (scrollTop: number) => {
      if (onScroll) {
        onScroll(scrollTop);
      }
    },
    [onScroll]
  );

  // Virtuoso配置
  const virtuosoConfig = {
    overscan: 200,
    increaseViewportBy: 200,
    ...virtuosoProps,
  };

  return (
    <ThemeProvider theme={mergedTheme}>
      <Container
        ref={setCustomScrollParent}
        className={createClassName("virtuoso-card-layout", className)}
        style={{
          ...style,
          minHeight: finalLayout.minHeight,
          maxHeight: finalLayout.maxHeight,
        }}
        $cssVariables={cssVariables}
      >
        <VirtuosoContainer $width={finalLayout.virtuosoWidth} $gap={finalLayout.gap} ref={setVirtuosoRef}>
          <Virtuoso
            data={items}
            itemContent={(index, item) => (itemRenderer || defaultItemRenderer)(item, index)}
            onScroll={(e) => handleScroll(e.target ? (e.target as HTMLElement).scrollTop : 0)}
            {...virtuosoConfig}
            style={{ height: "100%" }}
            customScrollParent={customScrollParent}
          />
        </VirtuosoContainer>

        <CardContainer $width={finalLayout.cardListWidth}>
          <CardList
            ref={cardListRef}
            cards={visibleCards}
            alignmentStrategy={alignmentStrategy}
            theme={mergedTheme}
            cardRenderer={cardRenderer}
            onCardClick={onCardClick}
            isMobile={isMobile}
          />
        </CardContainer>
      </Container>
    </ThemeProvider>
  );
};

// 导出高度同步相关的方法，供外部使用
export const createVirtuosoCardLayoutRef = () => {
  return {
    scrollToIndex: (_index: number, _options?: any) => {},
    scrollToTop: () => {},
    scrollToBottom: () => {},
    addCard: (_card: CardData) => {},
    removeCard: (_cardId: string) => {},
    updateCard: (_cardId: string, _updates: Partial<CardData>) => {},
    clearCards: () => {},
    getHeight: () => 0
  };
};
