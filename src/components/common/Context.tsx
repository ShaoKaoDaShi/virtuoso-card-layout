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
        // 对齐的过程中记录所有卡片调整之后的位置，新卡片调整位置的时候需要计算出不跟其他卡片重叠的位置
        const willUpdatePositions = new Map<HTMLDivElement, { moveY: number; area: { start: number; end: number } }>();
        cards.forEach((card) => {
          if (card.lineNumber === undefined) return;

          const targetEl = targets.get(card.lineNumber);
          const cardEl = cardsWrappers[card.lineNumber];
          if (targetEl && cardEl) {
            // 计算是否有重叠的情况

            computePosition(targetEl, cardEl, {
              placement: "right-start",
              strategy: "absolute",
            }).then(({ x, y }) => {
              return;
            });
            return;
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
