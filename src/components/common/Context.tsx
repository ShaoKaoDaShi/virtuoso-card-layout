import { CardData, VirtualListItem } from "@/types";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

import {
  computePosition,
  getBoundingClientRect,
} from "./getBoundingClientRect";
import { useDebounceEffect } from "ahooks";

const getTargetLines = (cards: CardData[]) => {
  const lines = new Map<string, HTMLDivElement>();
  cards.forEach((card) => {
    if (card.lineNumber === undefined) return;
    const element = document.querySelector(
      `[uniq-card-key="${card.lineNumber}"]`
    ) as HTMLDivElement;
    if (element) {
      lines.set(card.id, element);
    }
  });
  return lines;
};

export const getRy = (el: HTMLElement) => Number(el.getAttribute("ry") || 0);
type PositionAreaItem = {
  el: HTMLElement;
  relativeY: number;
};
type PositionDomeItem = { id: string; el: HTMLElement };
export type Position = { top: number; bottom: number; [key: string]: any };
export const isYOverlap = (a: Position, b: Position) => {
  return a.top < b.bottom && b.top < a.bottom;
};

export const createCardsWrappersArr = (
  cardsWrappers: Record<string, HTMLElement>
) => {
  return Object.keys(cardsWrappers)
    .map((key) => ({
      id: key,
      el: cardsWrappers[key],
    }))
    .filter((item) => item.el.isConnected);
};

export const sortCardsWrappersArr = (
  cardsWrappersArr: { id: string; el: HTMLDivElement }[]
) => {
  return cardsWrappersArr.sort((a, b) => {
    const aRect = getBoundingClientRect(a.el);
    const bRect = getBoundingClientRect(b.el);
    return aRect.top - bRect.top;
  });
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
  const [cardsWrappers, setCardsWrappers] = useState<
    Record<string, HTMLDivElement>
  >({});
  const [renderedItems, setRenderedItems] = useState<VirtualListItem[]>([]);
  const [needRenderedCards, setNeedRenderedCards] = useState<CardData[]>([]);

  useDebounceEffect(
    () => {
      // 一定程度上保存卡片的状态
      if (needRenderedCards.length) {
        const needAlignCards = [...needRenderedCards]
          .sort((a, b) => (a.lineNumber ?? 0) - (b.lineNumber ?? 0))
          .map((card) => cardsWrappers[card.id]);

        const targets = getTargetLines(needRenderedCards);
        const batchUpdateCardsPostion = async (
          cards: CardData[],
          targets: Map<string, HTMLDivElement>
        ) => {
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
            // if (cardEl.getAttribute("ot")) {
            //   const ot = Number(cardEl.getAttribute("ot") || 0);
            //   if (ot !== cardEl.offsetTop) {
            //     const moveY = cardEl.offsetTop - ot;
            //     const ry = Number(cardEl.getAttribute("ry") || 0);
            //     cardEl.style.transform = `translateY(${ry - moveY}px)`;
            //     cardEl.setAttribute("ry", `${ry - moveY}`);
            //   }
            // }
            // if (cardEl.getAttribute("ry")) {
            //   const ry = Number(cardEl.getAttribute("ry") || 0);
            //   const cardRect = getBoundingClientRect(cardEl);
            //   willUpdatePositions.set(cardEl, {
            //     moveY: ry,
            //     area: { start: cardRect.top, end: cardRect.bottom },
            //   });
            //   continue;
            // }
            if (targetEl && cardEl) {
              const { offsetY, targetRect, sourceRect } = computePosition(
                targetEl,
                cardEl
              );
              const nextRegion = {
                start: targetRect.y,
                end: targetRect.y + sourceRect.height,
              };
              const ry = Number(cardEl.getAttribute("ry") || 0);
              /**
               * TODO: 如果前面的卡片被卸载了，那么当前的卡片定位就不准了，如何保持原有位置
               */
              // if (cardEl.getAttribute("ry")) {
              //   willUpdatePositions.set(cardEl, {
              //     moveY: nextRegion.start - cardRect.top + ry,
              //     area: nextRegion,
              //     targetRect,
              //   });
              //   continue;
              // }
              for (const [, { area }] of willUpdatePositions.entries()) {
                if (area) {
                  if (
                    nextRegion.start < area.end &&
                    nextRegion.end > area.start
                  ) {
                    // 卡片顶部在目标底部下面，需要调整卡片位置

                    nextRegion.start = area.end + 10;
                    nextRegion.end = area.end + sourceRect.height + 10;
                  }
                }
              }
              Object.assign(cardEl.style, {
                position: "relative",
                transform: `translateY(${
                  nextRegion.start - sourceRect.top + ry
                }px)`,
              });
              // 给cardEl添加自定义属性，记录调整后的位置
              cardEl.setAttribute(
                "ry",
                `${nextRegion.start - sourceRect.top + ry}`
              );
              cardEl.setAttribute("ot", `${cardEl.offsetTop}`);

              willUpdatePositions.set(cardEl, {
                moveY: nextRegion.start - sourceRect.top + ry,
                area: nextRegion,
                targetRect,
              });
            }
          }
        };

        //TODO： focuscard之后再次滚动位置混乱
        batchUpdateCardsPostion(needRenderedCards, targets);
        console.log("cardsWrappers needAlignCards", needAlignCards, targets);
      }
    },
    [needRenderedCards],
    { wait: 16 }
  );
  const hilightTarget = <T extends HTMLElement>(targetEl?: T) => {
    if (!targetEl) return;
    targetEl.style.backgroundColor = "red";
    const clearHilight = setTimeout(() => {
      targetEl.style.backgroundColor = "";
      clearTimeout(clearHilight);
    }, 2000);
  };
  function moveDownCards(
    bottomAreaCards: PositionDomeItem[],
    movedArea: { top: number; bottom: number },
    shouldUpdatePositionsCards: PositionAreaItem[]
  ) {
    for (let i = 0; i < bottomAreaCards.length; i++) {
      const bottomCard = bottomAreaCards[i];
      const bottomCardRect = getBoundingClientRect(bottomCard.el);
      const bottomCardTop = bottomCardRect.top;
      if (isYOverlap(movedArea, bottomCardRect)) {
        const bottomCardRy = getRy(bottomCard.el);
        const offsetY = movedArea.bottom - (bottomCardTop - 10);
        const relativeY = offsetY + bottomCardRy;
        shouldUpdatePositionsCards.push({
          el: bottomCard.el,
          relativeY,
        });
        movedArea.bottom = movedArea.bottom + (bottomCardRect.height + 10);
      }
    }
  }

  function moveUpCards(
    topAreaCards: PositionDomeItem[],
    movedArea: { top: number; bottom: number },
    shouldUpdatePositionsCards: PositionAreaItem[]
  ) {
    for (let i = topAreaCards.length - 1; i >= 0; i--) {
      const topCard = topAreaCards[i];
      const topCardRect = getBoundingClientRect(topCard.el);
      const topCardBottom = topCardRect.bottom;
      if (isYOverlap(movedArea, topCardRect)) {
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

  const chainMoveCards = async (card: CardData) => {
    const cardEl = cardsWrappers[card.id];

    const cardsWrappersArr = createCardsWrappersArr(cardsWrappers);
    sortCardsWrappersArr(cardsWrappersArr);

    const targets = getTargetLines(needRenderedCards);
    const targetEl = targets.get(card.id);
    hilightTarget(targetEl);
    const cardIndex = cardsWrappersArr.findIndex((item) => item.id === card.id);

    const topAreaCards = cardsWrappersArr.slice(0, cardIndex);
    const bottomAreaCards = cardsWrappersArr.slice(cardIndex + 1);

    const shouldUpdatePositionsCards: PositionAreaItem[] = [];
    if (targetEl && cardEl) {
      const cardRect = getBoundingClientRect(cardEl);
      const ry = getRy(cardEl);
      const { offsetY } = computePosition(targetEl, cardEl);

      const relativeY = offsetY + ry;

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
      // 检查了一下发现是把卡片id转换成Number导致的， 因为卡片id是string类型， 所以在比较的时候会出现问题

      if (offsetY > 0) {
        // 向下移动
        movedArea.bottom = movedArea.bottom + offsetY;
        moveDownCards(bottomAreaCards, movedArea, shouldUpdatePositionsCards);
      } else {
        movedArea.top = movedArea.top + offsetY;
        moveUpCards(topAreaCards, movedArea, shouldUpdatePositionsCards);
      }
      for (let card of shouldUpdatePositionsCards) {
        const resY = card.relativeY;
        card.el.setAttribute("ry", `${resY}`);
        Object.assign(card.el.style, {
          position: "relative",
          transform: `translateY(${resY}px)`,
          transition: "transform 0.1s ease-in-out",
        });
        const id = setTimeout(() => {
          Object.assign(card.el.style, {
            transition: "",
          });
          clearTimeout(id);
        }, 100);
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
