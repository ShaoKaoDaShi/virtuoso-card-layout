// 主要组件导出
export {
  VirtuosoCardLayout,
  createVirtuosoCardLayoutRef,
  CardList,
  Card,
  VirtualListItemComponent
} from './components';

// Hooks导出
export {
  useHeightSync,
  useCardManagement,
  useResponsive
} from './hooks';

// 工具函数导出
export {
  defaultTheme,
  darkTheme,
  mergeTheme,
  generateCSSVariables,
  getCardColor
} from './utils/theme';

export {
  debounce,
  throttle,
  generateId,
  deepMerge,
  calculateOptimalCardPosition,
  calculateYPositionFromLine,
  getCardTypeDisplayName,
  getCardPriorityDisplayName,
  createClassName
} from './utils/helpers';

// 类型导出
export type {
  // 主要接口
  VirtuosoCardLayoutProps,
  CardData,
  VirtualListItem,
  Theme,
  LayoutConfig,
  HeightSyncConfig,
  ScrollToOptions,
  CardAlignmentStrategy,
  ResponsiveConfig,
  Breakpoints,
  
  // Hook返回值类型
  UseHeightSyncReturn,
  UseCardManagementReturn,
  
  // 工具类型
  Rectangle
} from './types';

// 版本信息
export const VERSION = '1.0.0';