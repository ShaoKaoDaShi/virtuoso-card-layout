import { CardData, VirtualListItem } from "@/types";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
// import { computePosition, autoUpdate, platform } from "@floating-ui/dom";
import { computePosition, getBoundingClientRect } from "./getBoundingClientRect";

import alignElement from "../domAlign/src/index";
import getRegion from "../domAlign/src/getRegion";
import { transform } from "lodash-es";

const getTargetLines = (cards: CardData[]) => {
  const lines = new Map<string, HTMLDivElement>();
  cards.forEach((card) => {
    if (card.lineNumber === undefined) return;
    const element = document.querySelector(`[uniq-card-key="${card.lineNumber}"]`) as HTMLDivElement;
    if (element) {
      lines.set(card.id, element);
    }
  });
  console.log("element", lines.entries());
  return lines;
};
const CardContext = createContext<{
  cards: CardData[];
  cardsWrappers: Record<string, HTMLDivElement>;
  setCardsWrappers: (cardsWrappers: Record<string, HTMLDivElement>) => void;
  setCards: (cards: CardData[]) => void; // 添加这个方法
  renderedItems: VirtualListItem[];
  setRenderedItems: (renderedItems: VirtualListItem[]) => void;
  needRenderedCards: CardData[];
  setNeedRenderedCards: (needRenderedCards: CardData[]) => void;
  chainMoveCards: (card: CardData) => Promise<void>;
}>({
  cards: [],
  cardsWrappers: {},
  setCardsWrappers: () => {},
  setCards: () => {}, // 默认实现
  renderedItems: [],
  setRenderedItems: () => {},
  needRenderedCards: [],
  setNeedRenderedCards: () => {},
  chainMoveCards: async (card: CardData) => {},
});

// 在Provider中提供setCards方法
export const CardProvider = ({ children }: { children: ReactNode }) => {
  const [cards, setCards] = useState<CardData[]>([]);
  const [cardsWrappers, setCardsWrappers] = useState<Record<string, HTMLDivElement>>({});
  const [renderedItems, setRenderedItems] = useState<VirtualListItem[]>([]);
  const [needRenderedCards, setNeedRenderedCards] = useState<CardData[]>([]);
  // const [willUpdatePositions, setWillUpdatePositions] = useState<
  //   Map<HTMLDivElement, { moveY: number; area: { start: number; end: number }; targetRect: DOMRect }>
  // >(new Map());

  useEffect(() => {
    if (needRenderedCards.length) {
      console.log("cardsWrappers", cardsWrappers, needRenderedCards);
      // 清除 在needRenderedCards之外的卡片

      const needAlignCards = needRenderedCards
        .sort((a, b) => (a.lineNumber ?? 0) - (b.lineNumber ?? 0))
        .map((card) => cardsWrappers[card.id]);
      // willUpdatePositions.forEach((_, key) => {
      //   if (!needAlignCards.find((card) => card === key)) {
      //     willUpdatePositions.delete(key);
      //   }
      // });

      const targets = getTargetLines(needRenderedCards);
      const batchUpdateCardsPostion = async (cards: CardData[], targets: Map<string, HTMLDivElement>) => {
        // 对齐的过程中记录所有卡片调整之后的位置，新卡片调整位置的时候需要计算出不跟其他卡片重叠的位置
        const willUpdatePositions = new Map<
          HTMLDivElement,
          {
            moveY: number;
            area: { start: number; end: number };
            targetRect: DOMRect;
          }
        >();
        for (const card of cards) {
          if (card.lineNumber === undefined) continue;

          const targetEl = targets.get(card.id);
          const cardEl = cardsWrappers[card.id];

          if (targetEl && cardEl) {
            const { offsetY, targetRect, cardRect } = computePosition(targetEl, cardEl);
            const nextRegion = {
              start: targetRect.y,
              end: targetRect.y + cardRect.height,
            };
            for (const [, { area }] of willUpdatePositions.entries()) {
              if (area) {
                if (nextRegion.start < area.end && nextRegion.end > area.start) {
                  // 卡片顶部在目标底部下面，需要调整卡片位置

                  nextRegion.start = area.end + 10;
                  nextRegion.end = area.end + cardRect.height + 10;
                }
              }
            }
            // debugger;
            const ry = Number(cardEl.getAttribute("ry") || 0);
            Object.assign(cardEl.style, {
              position: "relative",
              transform: `translateY(${nextRegion.start - cardRect.top + ry}px)`,
            });
            // 给cardEl添加自定义属性，记录调整后的位置
            cardEl.setAttribute("ry", `${nextRegion.start - cardRect.top + ry}`);

            willUpdatePositions.set(cardEl, {
              moveY: nextRegion.start - cardRect.top + ry,
              area: nextRegion,
              targetRect,
            });
          }
        }
      };
      // 计算Y轴方向上是否有重叠
      //TODO： focuscard之后再次滚动位置混乱
      batchUpdateCardsPostion(needRenderedCards, targets);
      console.log("cardsWrappers needAlignCards", needAlignCards, targets);
    }
  }, [needRenderedCards]);
  const hilightTarget = <T extends HTMLElement>(targetEl?: T) => {
    if (!targetEl) return;
    targetEl.style.backgroundColor = "red";
    const clearHilight = setTimeout(() => {
      targetEl.style.backgroundColor = "";
      clearTimeout(clearHilight);
    }, 2000);
  };

  const getRy = (el: HTMLElement) => Number(el.getAttribute("ry") || 0);
  const chainMoveCards = async (card: CardData) => {
    const cardEl = cardsWrappers[card.id];

    const cardsWrappersArr = Object.keys(cardsWrappers).map((key) => ({ id: key, el: cardsWrappers[key] }));
    cardsWrappersArr.sort((a, b) => {
      const aRect = getBoundingClientRect(a.el);
      const bRect = getBoundingClientRect(b.el);
      return aRect.top - bRect.top;
    });
    const targets = getTargetLines(needRenderedCards);
    const targetEl = targets.get(card.id);
    hilightTarget(targetEl);
    const cardIndex = cardsWrappersArr.findIndex((item) => Number(item.id) === Number(card.id));
    const topAreaCards = cardsWrappersArr.slice(0, cardIndex);

    const shouldUpdatePositionsCards = [];
    if (targetEl && cardEl) {
      const cardRect = getBoundingClientRect(cardEl);
      const ry = getRy(cardEl);
      const { offsetY } = computePosition(targetEl, cardEl);

      const relativeY = offsetY + ry;
      console.log("🚀 ~ chainMoveCards ~ relativeY:", relativeY, offsetY, ry, Math.floor(offsetY));
      const movedArea = {
        top: cardRect.top,
        bottom: cardRect.bottom,
      };

      if (Math.floor(Number(offsetY.toFixed(1))) === 0) return;
      shouldUpdatePositionsCards.push({
        el: cardEl,
        relativeY,
      });
      //TODO：在这里更新位置是正确的， 但是涉及到向上向下移动之后，向上的卡片移动的位置刚好超出魔表位置一个卡片的高度
      for (let card of shouldUpdatePositionsCards) {
        const resY = card.relativeY;
        card.el.setAttribute("ry", `${resY}`);
        Object.assign(card.el.style, {
          position: "relative",
          transform: `translateY(${resY}px)`,
          transition: "transform 0.1s ease-in-out",
        });
      }
      return;
      if (offsetY > 0) {
        // 向下移动
        // shouldUpdatePositionsCards.push(...bottomAreaCards);
      } else {
        movedArea.top = movedArea.top + offsetY;
        for (let i = topAreaCards.length - 1; i >= 0; i--) {
          const topCard = topAreaCards[i];
          const topCardRect = getBoundingClientRect(topCard.el);
          const topCardBottom = topCardRect.bottom;
          const topCardTop = topCardRect.top;
          if (movedArea.top < topCardBottom && movedArea.bottom > topCardTop) {
            const topCardRy = getRy(topCard.el);
            const offsetY = movedArea.top - (topCardBottom + 10);
            const relativeY = offsetY + topCardRy;
            shouldUpdatePositionsCards.push({
              el: topCard.el,
              relativeY,
            });
            movedArea.top = movedArea.top - (topCardRect.height + 10);
          }
        }
      }
    }
  };
  return (
    <CardContext.Provider
      value={{
        cards,
        cardsWrappers,
        setCardsWrappers,
        setCards,
        renderedItems,
        setRenderedItems,
        needRenderedCards,
        setNeedRenderedCards,
        chainMoveCards,
      }}
    >
      {children}
    </CardContext.Provider>
  );
};

export const useCardContext = () => useContext(CardContext);
