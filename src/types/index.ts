import { ReactNode, CSSProperties } from 'react';

/**
 * 卡片数据接口
 */
export interface CardData {
  id: string;
  type: 'comment' | 'issue' | 'suggestion' | 'warning' | 'error';
  content: ReactNode;
  priority: 'high' | 'medium' | 'low';
  lineNumber?: number;
  metadata?: Record<string, any>;
}

/**
 * 虚拟列表项数据接口
 */
export interface VirtualListItem {
  id: string;
  content: ReactNode;
  height?: number;
  metadata?: Record<string, any>;
}

/**
 * 高度同步配置
 */
export interface HeightSyncConfig {
  enabled: boolean;
  debounceMs?: number;
  minHeight?: number;
  maxHeight?: number;
}

/**
 * 滚动定位选项
 */
export interface ScrollToOptions {
  align?: 'start' | 'center' | 'end';
  behavior?: 'smooth' | 'auto';
  offset?: number;
}

/**
 * 卡片对齐策略
 */
export type CardAlignmentStrategy = 'inline' | 'overlay' | 'hybrid';

/**
 * 布局配置
 */
export interface LayoutConfig {
  virtuosoWidth: string | number;
  cardListWidth: string | number;
  gap?: string | number;
  minHeight?: string | number;
  maxHeight?: string | number;
}

/**
 * 组件样式主题
 */
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    border: string;
    text: {
      primary: string;
      secondary: string;
      disabled: string;
    };
    card: {
      comment: string;
      issue: string;
      suggestion: string;
      warning: string;
      error: string;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
}

/**
 * Virtuoso卡片布局组件Props
 */
export interface VirtuosoCardLayoutProps {
  // 虚拟列表数据
  items: VirtualListItem[];
  // 卡片数据
  cards: CardData[];
  // 布局配置
  layout?: Partial<LayoutConfig>;
  // 高度同步配置
  heightSync?: Partial<HeightSyncConfig>;
  // 卡片对齐策略
  alignmentStrategy?: CardAlignmentStrategy;
  // 主题配置
  theme?: Partial<Theme>;
  // 自定义样式
  className?: string;
  style?: CSSProperties;
  // 虚拟列表项渲染函数
  itemRenderer?: (item: VirtualListItem, index: number) => ReactNode;
  // 卡片渲染函数
  cardRenderer?: (card: CardData) => ReactNode;
  // 事件回调
  onItemClick?: (item: VirtualListItem, index: number) => void;
  onCardClick?: (card: CardData) => void;
  onScroll?: (scrollTop: number) => void;
  onHeightChange?: (height: number) => void;
  // Virtuoso配置
  virtuosoProps?: {
    overscan?: number;
    increaseViewportBy?: number;
    initialTopMostItemIndex?: number;
  };
}

/**
 * 高度同步Hook返回值
 */
export interface UseHeightSyncReturn {
  containerRef: React.RefObject<HTMLDivElement>;
  virtuosoRef: React.RefObject<any>;
  cardListRef: React.RefObject<HTMLDivElement>;
  height: number;
  scrollToIndex: (index: number, options?: ScrollToOptions) => void;
  scrollToTop: () => void;
  scrollToBottom: () => void;
  setVirtuosoRef: (ref: any) => void;
}

/**
 * 卡片管理Hook返回值
 */
export interface UseCardManagementReturn {
  visibleCards: CardData[];
  addCard: (card: CardData) => void;
  removeCard: (cardId: string) => void;
  updateCard: (cardId: string, updates: Partial<CardData>) => void;
  clearCards: () => void;
  getCardsByLine: (lineNumber: number) => CardData[];
}

/**
 * 响应式断点
 */
export interface Breakpoints {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

/**
 * 响应式配置
 */
export interface ResponsiveConfig {
  breakpoints?: Partial<Breakpoints>;
  mobileFirst?: boolean;
}

/**
 * 矩形接口
 */
export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}
