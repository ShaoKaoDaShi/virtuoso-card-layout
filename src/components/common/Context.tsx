import { CardData, VirtualListItem } from "@/types";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { computePosition, autoUpdate } from "@floating-ui/dom";

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
      const getTargetLines = (cards: CardData[]) => {
        const lines = new Map<string, HTMLDivElement>();
        cards.forEach((card) => {
          if (card.lineNumber === undefined) return;
          const element = document.querySelector(`[uniq-card-key="${card.lineNumber}"]`);
          if (element) {
            lines.set(card.id, element);
          }
        });
        console.log("element", lines.entries());
        return lines;
      };
      const targets = getTargetLines(needRenderedCards);

      const batchUpdateCardsPostion = (cards: CardData[], targets: Map<string, HTMLDivElement>) => {
        // 对齐的过程中记录所有卡片调整之后的位置，新卡片调整位置的时候需要计算出不跟其他卡片重叠的位置
        const willUpdatePositions = new Map<
          HTMLDivElement,
          { moveY: number; area: { start: number; end: number }; targetRect: DOMRect }
        >();
        cards.forEach((card, index) => {
          if (card.lineNumber === undefined) return;

          const targetEl = targets.get(card.id);
          const cardEl = cardsWrappers[card.id];

          if (targetEl && cardEl) {
            const cardRect = cardEl.getBoundingClientRect();
            const targetRect = targetEl.getBoundingClientRect();
            computePosition(targetEl, cardEl, {
              placement: "right-start",
            }).then(({ x, y }) => {
              console.log("x, y", x, y);
              const nextRegion = {
                start: y,
                end: y + cardRect.height,
              };
              Array.from(willUpdatePositions.entries()).forEach(([el, { area }]) => {
                if (area) {
                  if (nextRegion.start < area.end && nextRegion.end > area.start) {
                    // 卡片顶部在目标底部下面，需要调整卡片位置

                    nextRegion.start = area.end + 10;
                    nextRegion.end = area.end + cardRect.height + 10;
                  }
                }
              });
              Object.assign(cardEl.style, {
                position: "absolute",
                top: `${nextRegion.start}px`,
              });
              willUpdatePositions.set(cardEl, {
                moveY: nextRegion.start - targetRect.top,
                area: nextRegion,
                targetRect,
              });
            });
          }
        });
        return;
      };
      // 计算Y轴方向上是否有重叠

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
