# Virtuoso Card Layout

> 🚀 React虚拟滚动列表与卡片列表并排布局解决方案

一个基于 React 和 react-virtuoso 的高性能组件库，实现虚拟滚动列表与卡片列表的并排布局，并确保两者高度始终保持同步。特别适用于代码审查、文档注释、数据标注等需要将内容与相关信息并排显示的场景。

## ✨ 核心特性

- **🎯 高度同步**: 自动确保卡片列表高度与虚拟滚动容器高度保持一致
- **⚡ 高性能**: 基于 react-virtuoso 的虚拟滚动，支持大量数据渲染
- **📱 响应式设计**: 支持移动端、平板和桌面端的自适应布局
- **🎨 灵活主题**: 内置亮色/暗色主题，支持完全自定义
- **🔧 高度可配置**: 丰富的配置选项，满足各种使用场景
- **🎪 多种对齐策略**: 支持内联、覆盖、混合三种卡片对齐策略
- **🔍 精确定位**: 支持滚动到指定位置，卡片与内容精确对齐
- **♿ 无障碍访问**: 完整的键盘导航和屏幕阅读器支持

## 📦 安装

```bash
npm install virtuoso-card-layout
# 或
yarn add virtuoso-card-layout
# 或
pnpm add virtuoso-card-layout
```

### 依赖要求

```json
{
  "react": ">=18.0.0",
  "react-dom": ">=18.0.0",
  "react-virtuoso": ">=4.0.0",
  "styled-components": ">=5.0.0"
}
```

## 🚀 快速开始

### 基础使用

```tsx
import React from 'react';
import { VirtuosoCardLayout } from 'virtuoso-card-layout';
import type { VirtualListItem, CardData } from 'virtuoso-card-layout';

const App: React.FC = () => {
  // 虚拟列表数据
  const items: VirtualListItem[] = [
    {
      id: '1',
      content: '第一行内容',
      height: 50,
      metadata: { lineNumber: 1 }
    },
    {
      id: '2',
      content: '第二行内容',
      height: 50,
      metadata: { lineNumber: 2 }
    }
    // ... 更多数据
  ];

  // 卡片数据
  const cards: CardData[] = [
    {
      id: 'card-1',
      type: 'comment',
      priority: 'high',
      content: '这是一个评论卡片',
      lineNumber: 1
    },
    {
      id: 'card-2',
      type: 'issue',
      priority: 'medium',
      content: '这是一个问题卡片',
      lineNumber: 2
    }
    // ... 更多卡片
  ];

  return (
    <VirtuosoCardLayout
      items={items}
      cards={cards}
      layout={{
        virtuosoWidth: '70%',
        cardListWidth: '30%',
        minHeight: '400px'
      }}
      heightSync={{ enabled: true }}
      onItemClick={(item, index) => console.log('点击项目:', item)}
      onCardClick={(card) => console.log('点击卡片:', card)}
    />
  );
};
```

### 高级配置

```tsx
import React, { useRef } from 'react';
import { 
  VirtuosoCardLayout, 
  useHeightSync, 
  useCardManagement,
  darkTheme 
} from 'virtuoso-card-layout';

const AdvancedExample: React.FC = () => {
  // 使用高度同步 Hook
  const { virtuosoRef, scrollToIndex } = useHeightSync({
    enabled: true,
    debounceMs: 100,
    minHeight: 500
  });

  // 使用卡片管理 Hook
  const { addCard, removeCard, visibleCards } = useCardManagement([]);

  return (
    <VirtuosoCardLayout
      items={items}
      cards={visibleCards}
      layout={{
        virtuosoWidth: '65%',
        cardListWidth: '35%',
        gap: '1rem',
        minHeight: '600px',
        maxHeight: '80vh'
      }}
      heightSync={{
        enabled: true,
        debounceMs: 50,
        minHeight: 500,
        maxHeight: 1200
      }}
      alignmentStrategy="hybrid"
      theme={darkTheme}
      virtuosoProps={{
        overscan: 200,
        increaseViewportBy: 100
      }}
      onItemClick={(item, index) => {
        // 滚动到指定位置
        scrollToIndex(index, { align: 'center', behavior: 'smooth' });
      }}
      onCardClick={(card) => {
        if (card.lineNumber) {
          scrollToIndex(card.lineNumber - 1);
        }
      }}
    />
  );
};
```

## 📚 API 文档

### VirtuosoCardLayout Props

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `items` | `VirtualListItem[]` | **必需** | 虚拟列表数据 |
| `cards` | `CardData[]` | **必需** | 卡片数据 |
| `layout` | `Partial<LayoutConfig>` | `{}` | 布局配置 |
| `heightSync` | `Partial<HeightSyncConfig>` | `{ enabled: true }` | 高度同步配置 |
| `alignmentStrategy` | `'inline' \| 'overlay' \| 'hybrid'` | `'hybrid'` | 卡片对齐策略 |
| `theme` | `Partial<Theme>` | `defaultTheme` | 主题配置 |
| `onItemClick` | `(item: VirtualListItem, index: number) => void` | - | 项目点击回调 |
| `onCardClick` | `(card: CardData) => void` | - | 卡片点击回调 |
| `onScroll` | `(scrollTop: number) => void` | - | 滚动回调 |
| `onHeightChange` | `(height: number) => void` | - | 高度变化回调 |

### 数据类型

#### VirtualListItem

```tsx
interface VirtualListItem {
  id: string;                    // 唯一标识
  content: ReactNode;            // 内容
  height?: number;               // 高度（可选）
  metadata?: Record<string, any>; // 元数据
}
```

#### CardData

```tsx
interface CardData {
  id: string;                           // 唯一标识
  type: 'comment' | 'issue' | 'suggestion' | 'warning' | 'error'; // 卡片类型
  priority: 'high' | 'medium' | 'low';  // 优先级
  content: ReactNode;                   // 内容
  lineNumber?: number;                  // 关联的行号
  metadata?: Record<string, any>;       // 元数据
}
```

#### LayoutConfig

```tsx
interface LayoutConfig {
  virtuosoWidth: string | number;   // 虚拟列表宽度
  cardListWidth: string | number;   // 卡片列表宽度
  gap?: string | number;            // 间距
  minHeight?: string | number;      // 最小高度
  maxHeight?: string | number;      // 最大高度
}
```

## 🎨 主题定制

### 使用内置主题

```tsx
import { VirtuosoCardLayout, darkTheme } from 'virtuoso-card-layout';

<VirtuosoCardLayout theme={darkTheme} {...otherProps} />
```

### 自定义主题

```tsx
const customTheme = {
  colors: {
    primary: '#1890ff',
    secondary: '#722ed1',
    background: '#ffffff',
    surface: '#fafafa',
    border: '#d9d9d9',
    text: {
      primary: '#262626',
      secondary: '#595959',
      disabled: '#bfbfbf'
    },
    card: {
      comment: '#e6f7ff',
      issue: '#fff2e8',
      suggestion: '#f6ffed',
      warning: '#fffbe6',
      error: '#fff1f0'
    }
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px'
  }
};

<VirtuosoCardLayout theme={customTheme} {...otherProps} />
```

## 🔧 Hooks API

### useHeightSync

管理高度同步和滚动控制的 Hook。

```tsx
const {
  containerRef,
  virtuosoRef,
  cardListRef,
  height,
  scrollToIndex,
  scrollToTop,
  scrollToBottom
} = useHeightSync({
  enabled: true,
  debounceMs: 100,
  minHeight: 400,
  maxHeight: 1000
});
```

### useCardManagement

管理卡片状态的 Hook。

```tsx
const {
  visibleCards,
  addCard,
  removeCard,
  updateCard,
  clearCards,
  getCardsByLine
} = useCardManagement(initialCards);
```

### useResponsive

响应式布局管理的 Hook。

```tsx
const {
  windowWidth,
  currentBreakpoint,
  isMobile,
  isTablet,
  isDesktop,
  getResponsiveLayout
} = useResponsive({
  breakpoints: {
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200
  }
});
```

## 📱 响应式设计

组件内置响应式支持，会根据屏幕尺寸自动调整布局：

- **桌面端 (≥992px)**: 并排布局，虚拟列表70%，卡片列表30%
- **平板端 (768px-991px)**: 并排布局，虚拟列表60%，卡片列表40%
- **移动端 (<768px)**: 垂直布局，上下排列

## 🎯 卡片对齐策略

### 1. 内联对齐 (inline)
卡片作为列表项的一部分直接渲染，性能最佳，但布局灵活性较低。

### 2. 覆盖对齐 (overlay)
卡片在独立图层上渲染，可以精确定位，支持复杂交互，但实现复杂度较高。

### 3. 混合对齐 (hybrid) - 推荐
根据卡片优先级智能选择策略：
- 高优先级卡片使用覆盖对齐
- 中低优先级卡片使用内联对齐

## 🚀 性能优化

### 虚拟滚动配置

```tsx
<VirtuosoCardLayout
  virtuosoProps={{
    overscan: 200,              // 预渲染项目数量
    increaseViewportBy: 100,    // 扩展视口大小
    initialTopMostItemIndex: 0  // 初始滚动位置
  }}
/>
```

### 高度同步优化

```tsx
<VirtuosoCardLayout
  heightSync={{
    enabled: true,
    debounceMs: 100,    // 防抖延迟
    minHeight: 400,     // 最小高度限制
    maxHeight: 1200     // 最大高度限制
  }}
/>
```

## 🛠️ 开发指南

### 本地开发

```bash
# 克隆项目
git clone <repository-url>
cd virtuoso-card-layout

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建项目
npm run build

# 类型检查
npm run type-check

# 代码检查
npm run lint
```

### 项目结构

```
virtuoso-card-layout/
├── src/
│   ├── components/          # 核心组件
│   │   ├── VirtuosoCardLayout.tsx
│   │   ├── CardList.tsx
│   │   ├── Card.tsx
│   │   └── VirtualListItem.tsx
│   ├── hooks/              # React Hooks
│   │   ├── useHeightSync.ts
│   │   ├── useCardManagement.ts
│   │   └── useResponsive.ts
│   ├── types/              # TypeScript 类型定义
│   │   └── index.ts
│   ├── utils/              # 工具函数
│   │   ├── theme.ts
│   │   └── helpers.ts
│   ├── examples/           # 使用示例
│   │   ├── BasicExample.tsx
│   │   └── AdvancedExample.tsx
│   ├── demo/              # 演示应用
│   │   ├── App.tsx
│   │   ├── App.css
│   │   └── main.tsx
│   └── index.ts           # 主入口文件
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🤝 贡献指南

我们欢迎所有形式的贡献！请查看以下指南：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 开发规范

- 使用 TypeScript 编写代码
- 遵循 ESLint 规则
- 添加适当的测试用例
- 更新相关文档

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [react-virtuoso](https://github.com/petyosi/react-virtuoso) - 优秀的虚拟滚动库
- [styled-components](https://github.com/styled-components/styled-components) - CSS-in-JS 解决方案
- [React](https://github.com/facebook/react) - 用户界面构建库

## 📞 支持

如果您在使用过程中遇到问题或有任何建议，请通过以下方式联系我们：

- 提交 [Issue](../../issues)
- 发送邮件至：[your-email@example.com]
- 查看 [文档](../../wiki)

---

**Made with ❤️ by 裴双恒**