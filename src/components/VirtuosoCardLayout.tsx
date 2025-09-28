import React, { useMemo, useCallback, useEffect } from "react";
import { Virtuoso } from "react-virtuoso";
import styled, { ThemeProvider } from "styled-components";
import { VirtuosoCardLayoutProps, VirtualListItem, CardData } from "@/types";
import { useHeightSync } from "@/hooks/useHeightSync";
import { useCardManagement } from "@/hooks/useCardManagement";
import { useResponsive } from "@/hooks/useResponsive";
import { defaultTheme, mergeTheme, generateCSSVariables } from "@/utils/theme";
import { createClassName } from "@/utils/helpers";
import { CardList } from "./CardList";
import { VirtualListItemComponent } from "./VirtualListItem";
import {
  CardProvider,
  createCardsWrappersArr,
  getRy,
  isYOverlap,
  sortCardsWrappersArr,
  useCardContext,
} from "./common/Context";
import { isEqual } from "lodash-es";
import { getBoundingClientRect } from "./common/getBoundingClientRect";

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
  const mergedTheme = useMemo(
    () => mergeTheme(defaultTheme, customTheme),
    [customTheme]
  );
  const [customScrollParent, setCustomScrollParent] =
    React.useState<HTMLDivElement | null>(null);
  const {
    cardsWrappers,
    renderedItems,
    setRenderedItems,
    setNeedRenderedCards,
    needRenderedCards,
    chainMoveCards,
  } = useCardContext();

  useEffect(() => {
    if (!customScrollParent) {
      return;
    }
    let offsetY = 0; // 内容的偏移量

    const handleScroll = (e: WheelEvent) => {
      const contentHeight = customScrollParent.scrollHeight;
      const viewportHeight = customScrollParent.clientHeight;
      const target = e.target as HTMLElement;
      offsetY -= e.deltaY;
      const maxOffset = 0;
      const minOffset = viewportHeight - contentHeight;
      // console.log("offsetY > 滚动距离", offsetY, maxOffset, minOffset);
      if (offsetY > maxOffset) {
        // console.log("offsetY > 已滚动到顶部", offsetY, maxOffset, minOffset);
        offsetY = maxOffset;
        /**
         * 检测是否有卡片在顶部上面
         */
        const cardsWrappersArr = createCardsWrappersArr(cardsWrappers);
        sortCardsWrappersArr(cardsWrappersArr);
        const topCard = cardsWrappersArr[0];
        const topCardRect = getBoundingClientRect(topCard.el);
        const targetRect = getBoundingClientRect(customScrollParent);
        console.log(
          "offsetY > 已滚动到顶部",
          offsetY,
          topCardRect.top,
          targetRect.top,
          cardsWrappersArr
        );
        if (topCardRect.top < targetRect.top) {
          let deltaY = e.deltaY;
          if (topCardRect.top + deltaY >= targetRect.top) {
            deltaY = topCardRect.top - topCardRect.top;
          }
          // 顶部卡片与滚动目标重叠
          // chainMoveCards(topCard);
          // 把所有的卡片朝着滚轮滚动的方向移动 e.deltaY 像素
          cardsWrappersArr.forEach((cardWrapper) => {
            const ry = getRy(cardWrapper.el);
            const resRy = ry - deltaY;
            cardWrapper.el.style.transition =
              "transform .3s cubic-bezier(0, 0, .52, 1)";
            cardWrapper.el.style.transform = `translateY(${resRy}px)`;
            cardWrapper.el.setAttribute("ry", `${resRy}`);
          });
        }
      }
      if (offsetY < minOffset) {
        /**
         * 检测是否有卡片在底部下面
         */

        console.log("offsetY > 已滚动到底部", offsetY, minOffset);
        offsetY = minOffset;
      }
      return;
      /**
       * 如果滚动到顶部，并且有卡片在顶部上面，那么随着滚动调整卡片的位置模拟出来滚动效果
       * 如果滚动到底部，并且有卡片在底部下面，那么随着滚动调整卡片的位置模拟滚动效果
       */
      const scrollTop = target.scrollTop;
      const bottom = target.scrollHeight - target.clientHeight;

      if (scrollTop === 0) {
        // 滚动到顶部
        console.log("🚀 ~ handleScroll 已滚动到顶部:", scrollTop, target, e);
        // const topAreaCards = Object.keys(cardsWrappers).slice(0, cardIndex);
        // chainMoveCards(topAreaCards, {
        //   moveY: -scrollTop,
        // });
      } else if (Math.floor(scrollTop) === Math.floor(bottom)) {
        // 滚动到底部
        console.log("🚀 ~ handleScroll 已滚动到底部:", scrollTop);
        // 已经滚动到底部了，继续监听滚动事件

        // const bottomAreaCards = Object.keys(cardsWrappers).slice(cardIndex + 1);
        // chainMoveCards(bottomAreaCards, {
        //   moveY: scrollTop - bottom,
        // });
      } else {
        console.log("🚀 ~ handleScroll ~ scrollTop:", scrollTop, bottom);
      }
    };
    if (customScrollParent) {
      customScrollParent.addEventListener("wheel", handleScroll);
    }
    return () => {
      if (customScrollParent) {
        customScrollParent.removeEventListener("wheel", handleScroll);
      }
    };
  }, [customScrollParent]);

  // 生成CSS变量
  const cssVariables = useMemo(
    () => generateCSSVariables(mergedTheme),
    [mergedTheme]
  );

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
      <VirtualListItemComponent
        item={item}
        index={index}
        onClick={onItemClick}
        theme={mergedTheme}
      />
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
          <Virtuoso
            data={items}
            itemContent={(index, item) =>
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
              const vItems = items.slice(range.startIndex, range.endIndex + 1);
              const same = isEqual(vItems, renderedItems);
              console.log("🚀 ~ same:", range, same, vItems, renderedItems);
              if (same) return;
              setRenderedItems(vItems);
              const renderedItemsLine = vItems.map(
                (item) => item.metadata?.lineNumber
              );
              const newNeedRenderedCards = visibleCards.filter((card) =>
                renderedItemsLine.includes(card.lineNumber)
              );

              const sameCards = isEqual(
                needRenderedCards,
                newNeedRenderedCards
              );
              if (sameCards) return;
              console.log(
                "🚀 ~ needRenderedCards:",
                needRenderedCards,
                newNeedRenderedCards,
                same,
                visibleCards
              );
              setNeedRenderedCards(newNeedRenderedCards);
            }}
          />
        </VirtuosoContainer>

        <CardContainer $width={finalLayout.cardListWidth}>
          <CardList
            ref={cardListRef}
            cards={needRenderedCards}
            alignmentStrategy={alignmentStrategy}
            theme={mergedTheme}
            cardRenderer={cardRenderer}
            onCardClick={(card) => {
              chainMoveCards(card);
            }}
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
