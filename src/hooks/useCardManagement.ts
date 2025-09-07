import { useState, useCallback, useMemo, useEffect } from "react";
import { CardData, UseCardManagementReturn } from "@/types";

/**
 * 卡片管理Hook - 处理卡片的增删改查和位置管理
 */
export const useCardManagement = (initialCards: CardData[] = []): UseCardManagementReturn => {
  const [cards, setCards] = useState<CardData[]>(initialCards);

  useEffect(() => {
    setCards(initialCards);
  }, [initialCards]);

  // 添加卡片
  const addCard = useCallback((card: CardData) => {
    setCards((prevCards) => {
      // 检查是否已存在相同ID的卡片
      const existingIndex = prevCards.findIndex((c) => c.id === card.id);
      if (existingIndex !== -1) {
        // 如果存在，则更新
        const newCards = [...prevCards];
        newCards[existingIndex] = card;
        return newCards;
      }
      // 否则添加新卡片
      return [...prevCards, card];
    });
  }, []);

  // 移除卡片
  const removeCard = useCallback((cardId: string) => {
    setCards((prevCards) => prevCards.filter((card) => card.id !== cardId));
  }, []);

  // 更新卡片
  const updateCard = useCallback((cardId: string, updates: Partial<CardData>) => {
    setCards((prevCards) => prevCards.map((card) => (card.id === cardId ? { ...card, ...updates } : card)));
  }, []);

  // 清空所有卡片
  const clearCards = useCallback(() => {
    setCards([]);
  }, []);

  // 根据行号获取卡片
  const getCardsByLine = useCallback(
    (lineNumber: number) => {
      return cards.filter((card) => card.lineNumber === lineNumber);
    },
    [cards]
  );

  // 计算可见卡片（根据优先级和重叠避免算法）
  const visibleCards = useMemo(() => {
    // 按优先级排序：high > medium > low
    const priorityOrder = { high: 3, medium: 2, low: 1 };

    return cards.sort((a, b) => {
      // 首先按优先级排序

      // 如果优先级相同，按行号排序
      if (a.lineNumber && b.lineNumber) {
        return a.lineNumber - b.lineNumber;
      }

      // 最后按ID排序确保稳定性
      return a.id.localeCompare(b.id);
    });
  }, [cards]);

  return {
    visibleCards,
    addCard,
    removeCard,
    updateCard,
    clearCards,
    getCardsByLine,
  };
};
