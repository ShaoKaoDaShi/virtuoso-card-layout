import { CardData, VirtualListItem } from "@/types";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";

const CardContext = createContext<{
  cards: CardData[];
  cardsWrappers: Record<string, HTMLDivElement>;
  setCardsWrappers: (cardsWrappers: Record<string, HTMLDivElement>) => void;
  setCards: (cards: CardData[]) => void; // 添加这个方法
  renderedItems: VirtualListItem[];
  setRenderedItems: (renderedItems: VirtualListItem[]) => void;
  needRenderedCards: CardData[];
  setNeedRenderedCards: (needRenderedCards: CardData[]) => void;
}>({
  cards: [],
  cardsWrappers: {},
  setCardsWrappers: () => {},
  setCards: () => {}, // 默认实现
  renderedItems: [],
  setRenderedItems: () => {},
  needRenderedCards: [],
  setNeedRenderedCards: () => {},
});

// 在Provider中提供setCards方法
export const CardProvider = ({ children }: { children: ReactNode }) => {
  const [cards, setCards] = useState<CardData[]>([]);
  const [cardsWrappers, setCardsWrappers] = useState<Record<string, HTMLDivElement>>({});
  const [renderedItems, setRenderedItems] = useState<VirtualListItem[]>([]);
  const [needRenderedCards, setNeedRenderedCards] = useState<CardData[]>([]);
  useEffect(() => {
    if (needRenderedCards.length) {
      console.log("cardsWrappers", cardsWrappers, needRenderedCards);
      const needAlignCards = needRenderedCards.map((card) => cardsWrappers[card.lineNumber ?? 0]);
      const getTargetLines = (cards: CardData[]) => {
        const lines = new Map<number, HTMLDivElement>();
        cards.forEach((card) => {
          if (card.lineNumber === undefined) return;
          const element = document.querySelector(`[uniq-card-key="${card.lineNumber}"]`);
          if (element) {
            lines.set(card.lineNumber, element);
          }
        });
        console.log("element", lines.entries());
        return lines;
      };
      const targets = getTargetLines(needRenderedCards);
      const batchUpdateCardsPostion = (cards: CardData[], targets: Map<number, HTMLDivElement>) => {
        const willUpdatePositions = new Map<HTMLDivElement, { moveY: number; area: { start: number; end: number } }>();
        cards.forEach((card) => {
          if (card.lineNumber === undefined) return;
          const targetEl = targets.get(card.lineNumber);
          const cardEl = cardsWrappers[card.lineNumber];
          if (targetEl && cardEl) {
            const targetElRect = targetEl.getBoundingClientRect();
            const cardElRect = cardEl.getBoundingClientRect();
            const calculateMoveY = () => {
              let moveY = targetElRect.top - cardElRect.top;
              const currentCardArea = {
                start: cardElRect.top + moveY,
                end: cardElRect.bottom + moveY,
              };
              // 计算当前卡片的区域是否与其他卡片的区域有重叠;
              Array.from(willUpdatePositions.values()).forEach((item) => {
                if (currentCardArea.start < item.area.end && currentCardArea.end > item.area.start) {
                  moveY = item.area.end - cardElRect.top;
                  currentCardArea.start = cardElRect.top + moveY;
                  currentCardArea.end = cardElRect.bottom + moveY;
                }
              });
              return moveY;
            };
            const moveY = calculateMoveY();
            const nextCardArea = {
              start: cardElRect.top + moveY,
              end: cardElRect.bottom + moveY,
            };

            console.log("targetElRect", targetElRect, cardElRect, moveY, nextCardArea);
            if (moveY !== 0) {
              willUpdatePositions.set(cardEl, { moveY, area: nextCardArea });
            }
            // element.style.transform = `translateY(${card.position}px)`;
          }
        });

        Array.from(willUpdatePositions.entries()).forEach(([cardEl, { moveY }]) => {
          cardEl.style.transform = `translateY(${moveY}px)`;
        });

        return willUpdatePositions;
      };
      batchUpdateCardsPostion(needRenderedCards, targets);
      console.log("cardsWrappers needAlignCards", needAlignCards, targets);
    }
  }, [needRenderedCards]);
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
      }}
    >
      {children}
    </CardContext.Provider>
  );
};

export const useCardContext = () => useContext(CardContext);
