import { CardData, VirtualListItem } from "@/types";
import { generateId } from "@/utils/helpers";
import { nanoid } from "nanoid";

// 生成示例虚拟列表数据
export const generateListItems = (
  count: number,
  repoId?: string
): VirtualListItem[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: nanoid(),
    repoId,
    content: `
        <div style="padding: 8px;">
          <div style="font-weight: 600; margin-bottom: 4px;">代码行 ${
            index + 1
          }</div>
          <div style="font-family: 'Monaco', 'Menlo', monospace; font-size: 13px; color: #666;">
            ${
              index % 3 === 0
                ? "function calculateSum(a, b) {"
                : index % 3 === 1
                ? "  return a + b;"
                : "}"
            }
          </div>
        </div>
      `,
    height: 60,
    metadata: {
      type: "code-line",
      lineNumber: index + 1,
      timestamp: Date.now(),
    },
  }));
};

// 生成示例卡片数据
export const generateCards = (
  count: number,
  repoId?: string,
  lineCount?: number
): CardData[] => {
  const cardTypes: CardData["type"][] = [
    "comment",
    "issue",
    "suggestion",
    "warning",
    "error",
  ];
  const priorities: CardData["priority"][] = ["high", "medium", "low"];

  return Array.from({ length: count }, (_, index) => {
    const lineNumber = Math.floor(Math.random() * (lineCount || 100000)) + 1;
    return {
      id: nanoid(),
      repoId,
      type: cardTypes[index % cardTypes.length],
      priority: priorities[index % priorities.length],
      content: `
        <div>
          <p><strong>卡片 ${index + 1}</strong></p>
          <p>这是一个示例卡片，展示了不同类型的内容。</p>
          <p>行号: ${lineNumber}</p>
        </div>
      `,
      lineNumber,
      metadata: {
        author: "开发者",
        timestamp: Date.now() - Math.random() * 86400000,
        tags: ["示例", "测试"],
      },
    };
  });
};
