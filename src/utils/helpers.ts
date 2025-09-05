import { CardData } from '@/types';

/**
 * 防抖函数
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
};

/**
 * 节流函数
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * 生成唯一ID
 */
export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * 深度合并对象
 */
export const deepMerge = <T extends Record<string, any>>(
  target: T,
  source: Partial<T>
): T => {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {} as any, source[key] as any);
    } else {
      result[key] = source[key] as any;
    }
  }
  
  return result;
};

/**
 * 检测两个矩形是否重叠
 */
export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const isRectangleOverlap = (rect1: Rectangle, rect2: Rectangle): boolean => {
  return !(
    rect1.x + rect1.width <= rect2.x ||
    rect2.x + rect2.width <= rect1.x ||
    rect1.y + rect1.height <= rect2.y ||
    rect2.y + rect2.height <= rect1.y
  );
};

/**
 * 计算卡片的最佳位置以避免重叠
 */
export const calculateOptimalCardPosition = (
  newCard: { width: number; height: number; preferredY: number },
  existingCards: Array<{ x: number; y: number; width: number; height: number }>,
  _containerWidth: number,
  containerHeight: number
): { x: number; y: number } => {
  const { width, height, preferredY } = newCard;
  const margin = 8; // 卡片间距
  
  // 尝试在首选Y位置放置
  let bestPosition = { x: margin, y: preferredY };
  
  // 检查是否与现有卡片重叠
  const hasOverlap = (pos: { x: number; y: number }) => {
    const newRect = { x: pos.x, y: pos.y, width, height };
    return existingCards.some(card => isRectangleOverlap(newRect, card));
  };
  
  // 如果没有重叠，直接返回
  if (!hasOverlap(bestPosition)) {
    return bestPosition;
  }
  
  // 尝试向下偏移
  let offsetY = preferredY;
  const maxAttempts = 10;
  let attempts = 0;
  
  while (attempts < maxAttempts && offsetY + height < containerHeight) {
    offsetY += height + margin;
    const testPosition = { x: margin, y: offsetY };
    
    if (!hasOverlap(testPosition)) {
      return testPosition;
    }
    
    attempts++;
  }
  
  // 如果向下偏移失败，尝试向上偏移
  offsetY = preferredY;
  attempts = 0;
  
  while (attempts < maxAttempts && offsetY > 0) {
    offsetY -= height + margin;
    const testPosition = { x: margin, y: Math.max(0, offsetY) };
    
    if (!hasOverlap(testPosition)) {
      return testPosition;
    }
    
    attempts++;
  }
  
  // 如果都失败了，返回原始位置（可能会重叠）
  return bestPosition;
};

/**
 * 根据行号计算Y坐标
 */
export const calculateYPositionFromLine = (
  lineNumber: number,
  lineHeight: number = 20,
  containerScrollTop: number = 0
): number => {
  return lineNumber * lineHeight - containerScrollTop;
};

/**
 * 格式化文件大小
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * 获取卡片类型的显示名称
 */
export const getCardTypeDisplayName = (type: CardData['type']): string => {
  const typeNames = {
    comment: '评论',
    issue: '问题',
    suggestion: '建议',
    warning: '警告',
    error: '错误'
  };
  
  return typeNames[type] || type;
};

/**
 * 获取卡片颜色
 */
export const getCardColor = (theme: any, cardType: string): string => {
  if (theme?.colors?.card?.[cardType]) {
    return theme.colors.card[cardType];
  }
  return theme?.colors?.card?.comment || '#e6f7ff';
};

/**
 * 获取卡片优先级的显示名称
 */
export const getCardPriorityDisplayName = (priority: CardData['priority']): string => {
  const priorityNames = {
    high: '高',
    medium: '中',
    low: '低'
  };
  
  return priorityNames[priority] || priority;
};

/**
 * 检查是否为移动设备
 */
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

/**
 * 获取滚动条宽度
 */
export const getScrollbarWidth = (): number => {
  if (typeof document === 'undefined') return 0;
  
  const outer = document.createElement('div');
  outer.style.visibility = 'hidden';
  outer.style.overflow = 'scroll';
  (outer.style as any).msOverflowStyle = 'scrollbar';
  document.body.appendChild(outer);
  
  const inner = document.createElement('div');
  outer.appendChild(inner);
  
  const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
  
  outer.parentNode?.removeChild(outer);
  
  return scrollbarWidth;
};

/**
 * 安全地解析JSON
 */
export const safeJsonParse = <T = any>(jsonString: string, defaultValue: T): T => {
  try {
    return JSON.parse(jsonString);
  } catch {
    return defaultValue;
  }
};

/**
 * 创建CSS类名
 */
export const createClassName = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};