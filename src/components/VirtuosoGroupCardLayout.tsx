import React, { useMemo, useCallback, useEffect } from "react";
import { GroupedVirtuoso, Virtuoso } from "react-virtuoso";
import styled, { ThemeProvider } from "styled-components";
import { VirtuosoCardLayoutProps, VirtualListItem, CardData } from "@/types";
import { useHeightSync } from "@/hooks/useHeightSync";
import { useCardManagement } from "@/hooks/useCardManagement";
import { useResponsive } from "@/hooks/useResponsive";
import { defaultTheme, mergeTheme, generateCSSVariables } from "@/utils/theme";
import { createClassName } from "@/utils/helpers";
import { CardList } from "./CardList";
import { VirtualListItemComponent } from "./VirtualListItem";
import { CardProvider, useCardContext } from "./common/Context";
import { isEqual } from "lodash-es";
import { useGroupCardContext } from "./common/GroupContext";
import { GroupCardList } from "./GroupCardList";

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

const VirtuosoContainer = styled.div<{
  $width: string | number;
  $gap: string | number;
}>`
  flex: 0 0
    ${(props) =>
      typeof props.$width === "number" ? `${props.$width}px` : props.$width};
  height: 100%;

  @media (max-width: 768px) {
    flex: 1;
    border-right: none;
    border-bottom: 1px solid var(--vc-color-border);
    margin-bottom: ${(props) =>
      typeof props.$gap === "number" ? `${props.$gap}px` : props.$gap};
  }
`;

const CardContainer = styled.div<{ $width: string | number }>`
  flex: 0 0
    ${(props) =>
      typeof props.$width === "number" ? `${props.$width}px` : props.$width};
  height: 100%;

  @media (max-width: 768px) {
    flex: 1;
  }
`;

/**
 * Virtuoso虚拟滚动列表与卡片列表并排布局组件
 */
type VirtuosoGroupCardLayoutProps = Omit<
  VirtuosoCardLayoutProps,
  "items" | "cards"
> & {
  items: VirtualListItem[][];
  cards: CardData[][];
};
export const VirtuosoGroupCardLayout: React.FC<
  VirtuosoGroupCardLayoutProps
> = ({
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
  const mergedTheme = useMemo(
    () => mergeTheme(defaultTheme, customTheme),
    [customTheme]
  );
  const [customScrollParent, setCustomScrollParent] = React.useState(null);
  const {
    cardsWrappers,
    renderedItems,
    setRenderedItems,
    setNeedRenderedCards,
    needRenderedCards,
  } = useGroupCardContext();

  // 生成CSS变量
  const cssVariables = useMemo(
    () => generateCSSVariables(mergedTheme),
    [mergedTheme]
  );

  // 响应式布局
  const { getResponsiveLayout, isMobile } = useResponsive();
  const responsiveLayout = getResponsiveLayout();

  const groupData = useMemo(() => {
    // 分组的时候 标题会占用一个item, 所以需要在每个group的开头添加一个title item
    const groupItems = items
      .map((item, index) => [
        { repoId: `${index}`, type: "title", title: `repo ${index}` },
        ...item,
      ])
      .flat();
    return groupItems;
  }, [items]);
  const groupCards = useMemo(() => cards.flat(), [cards]);

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
  const { visibleCards } = useCardManagement(groupCards);

  // 默认项目渲染器
  const defaultItemRenderer = useCallback(
    (item: VirtualListItem, index: number) => {
      return (
        <VirtualListItemComponent
          item={item}
          index={index}
          onClick={onItemClick}
          theme={mergedTheme}
        />
      );
    },
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
    overscan: 3600,
    increaseViewportBy: 1800,
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
        <VirtuosoContainer
          $width={finalLayout.virtuosoWidth}
          $gap={finalLayout.gap}
          ref={setVirtuosoRef}
        >
          <GroupedVirtuoso
            data={groupData}
            groupCounts={items.map((group) => group.length)}
            groupContent={(index) => (
              <h1 key={index} style={{ backgroundColor: "#f0f0f0", margin: 0 }}>
                repo {index}
              </h1>
            )}
            itemContent={(index, groupIndex, item) =>
              (itemRenderer || defaultItemRenderer)(item, index)
            }
            onScroll={(e) =>
              handleScroll(e.target ? (e.target as HTMLElement).scrollTop : 0)
            }
            {...virtuosoConfig}
            style={{ height: "100%" }}
            customScrollParent={customScrollParent}
            // increaseViewportBy={1800}
            // itemsRendered={(items) => {
            //   const vItems = items.map((item) => item.data!);
            //   console.log("🚀 ~ vItems:", vItems);
            //   // setRenderedItems(vItems);
            // }}
            rangeChanged={(range) => {
              const vItems = groupData.slice(
                range.startIndex,
                range.endIndex + 1
              );
              const same = isEqual(vItems, renderedItems);
              console.log(
                "🚀 ~ group same:",
                range,
                same,
                vItems,
                renderedItems
              );
              if (same) return;
              setRenderedItems(vItems);
              const renderedItemsLine = vItems.map((item) => {
                return {
                  lineNumber: item.metadata?.lineNumber,
                  repoId: item.repoId,
                };
              });

              const newNeedRenderedCards = visibleCards.filter((card) =>
                renderedItemsLine.find(
                  (item) =>
                    item.repoId === card.repoId &&
                    item.lineNumber === card.lineNumber
                )
              );

              const sameCards = isEqual(
                needRenderedCards,
                newNeedRenderedCards
              );
              if (sameCards) return;

              setNeedRenderedCards(newNeedRenderedCards);
            }}
          />
        </VirtuosoContainer>

        <CardContainer $width={finalLayout.cardListWidth}>
          <GroupCardList
            ref={cardListRef}
            cards={needRenderedCards}
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
    getHeight: () => 0,
  };
};
