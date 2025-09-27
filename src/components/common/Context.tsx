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

      batchUpdateCardsPostion(needRenderedCards, targets);
      console.log("cardsWrappers needAlignCards", needAlignCards, targets);
    }
  }, [needRenderedCards]);

  const chainMoveCards = async (card: CardData) => {
    const cardEl = cardsWrappers[card.id];
    const cardRect = cardEl.getBoundingClientRect();
    const cardRect2 = getBoundingClientRect(cardEl);
    console.log("cardRect", cardRect, cardRect2);

    const cardsWrappersArr = Object.keys(cardsWrappers).map((key) => ({ id: key, el: cardsWrappers[key] }));
    cardsWrappersArr.sort((a, b) => a.el.offsetTop - b.el.offsetTop);
    const targets = getTargetLines(needRenderedCards);
    const targetEl = targets.get(card.id);
    targetEl.style.backgroundColor = "red";
    setTimeout(() => {
      targetEl.style.backgroundColor = "";
    }, 2000);
    const cardIndex = cardsWrappersArr.findIndex((item) => Number(item.id) === Number(card.id));
    const topAreaCards = cardsWrappersArr.slice(0, cardIndex);
    const bottomAreaCards = cardsWrappersArr.slice(cardIndex + 1);
    return;
    const shouldUpdatePositionsCards = [];
    if (targetEl && cardEl) {
      const { y } = await computePosition(targetEl, cardEl, {
        placement: "right-start",
      });

      const relativeY = y - cardEl.offsetTop;

      const movedArea = {
        start: cardEl.offsetTop,
        end: cardEl.offsetTop + cardEl.offsetHeight,
      };
      if (relativeY === 0) return;
      shouldUpdatePositionsCards.push({
        el: cardEl,
        relativeY,
      });

      if (relativeY > 0) {
        // 向下移动
        // shouldUpdatePositionsCards.push(...bottomAreaCards);
      } else {
        movedArea.start = y;
        for (let i = topAreaCards.length - 1; i >= 0; i--) {
          const topCard = topAreaCards[i];
          const topCardBottom = topCard.el.offsetTop + topCard.el.offsetHeight;
          const topCardTop = topCard.el.offsetTop;
          if (movedArea.start < topCardBottom && movedArea.end > topCardTop) {
            const relativeY = movedArea.start - (topCardBottom + 10);
            shouldUpdatePositionsCards.push({
              el: topCard.el,
              relativeY,
            });
            movedArea.start = topCardTop + relativeY;
          }
        }
      }

      for (let card of shouldUpdatePositionsCards) {
        const resY = Number(card.el.getAttribute("relativeY")) + card.relativeY;
        card.el.setAttribute("relativeY", `${resY}`);
        Object.assign(card.el.style, {
          position: "relative",
          transform: `translateY(${resY}px)`,
        });
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
