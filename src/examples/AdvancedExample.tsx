import React, { useState, useCallback, useEffect } from "react";
import { VirtuosoCardLayout } from "../components/VirtuosoCardLayout";
import { CardData, VirtualListItem } from "../types";
import { generateId } from "../utils/helpers";
import { VirtuosoGroupCardLayout } from "@/components/VirtuosoGroupCardLayout";
import { generateCards, generateListItems } from "./common/mockData";
import { nanoid } from "nanoid";

const groupRepos = () =>
  Promise.resolve(
    Array.from({ length: 2 }, (_, index) => ({
      repoId: index,
      files: generateListItems(100000, String(index)),
    }))
  );

const groupCards = () =>
  Promise.resolve(
    Array.from({ length: 2 }, (_, index) => ({
      repoId: index,
      cards: generateCards(10000, String(index)),
    }))
  );
/**
 * 基础使用示例 - 展示Virtuoso虚拟滚动与卡片列表的基本功能
 */
export const AdvancedExample: React.FC = () => {
  const [items, setItems] = useState<VirtualListItem[][]>([]);
  const [cards, setCards] = useState<CardData[][]>([]);

  useEffect(() => {
    groupRepos().then((repos) => {
      setItems(repos.map((repo) => repo.files));
    });
    groupCards().then((repos) => {
      setCards(repos.map((repo) => repo.cards));
    });
  }, []);

  // 处理项目点击
  const handleItemClick = useCallback(
    (item: VirtualListItem, index: number) => {
      console.log("点击了项目:", item, "索引:", index);
      // alert(`点击了第 ${index + 1} 项`);
    },
    []
  );

  // 处理卡片点击
  const handleCardClick = useCallback((card: CardData) => {
    console.log("点击了卡片:", card);
    // alert(`点击了卡片: ${card.type} - ${card.id}`);
  }, []);

  // 处理滚动
  const handleScroll = useCallback((scrollTop: number) => {
    console.log("滚动位置:", scrollTop);
  }, []);

  // 处理高度变化
  const handleHeightChange = useCallback((height: number) => {
    console.log("容器高度变化:", height);
  }, []);

  return (
    <div
      style={{
        padding: "20px",
        height: "71vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ marginBottom: "20px" }}>
        <h1
          style={{ margin: "0 0 10px 0", fontSize: "24px", fontWeight: "bold" }}
        >
          VirtuosoGroup卡片布局 - 基础示例
        </h1>
        <p style={{ margin: "0 0 15px 0", color: "#666" }}>
          展示虚拟滚动列表与卡片列表的并排布局和高度同步功能
        </p>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <span
            style={{
              padding: "8px 12px",
              backgroundColor: "#f0f0f0",
              borderRadius: "4px",
              fontSize: "14px",
            }}
          >
            列表项: {items.length} | 卡片: {cards.length}
          </span>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        <VirtuosoGroupCardLayout
          items={items}
          cards={cards}
          layout={{
            virtuosoWidth: "70%",
            cardListWidth: "30%",
            gap: "1px",
            minHeight: "400px",
            maxHeight: "100%",
          }}
          heightSync={{
            enabled: true,
            debounceMs: 100,
            minHeight: 400,
          }}
          alignmentStrategy="hybrid"
          onItemClick={handleItemClick}
          onCardClick={handleCardClick}
          onScroll={handleScroll}
          onHeightChange={handleHeightChange}
          virtuosoProps={{
            overscan: 3600,
            increaseViewportBy: 1800,
          }}
        />
      </div>
    </div>
  );
};
