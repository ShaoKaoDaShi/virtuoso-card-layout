import { CardData } from "@/types";

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
