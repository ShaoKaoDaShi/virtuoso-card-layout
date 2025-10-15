import { useRef, useEffect, useState } from "react";

// 同步高度配置选项
interface SyncHeightOptions {
  // 是否在窗口 resize 时重新计算
  syncOnResize?: boolean;
  // 最小高度限制
  minHeight?: number;
  // 最大高度限制
  maxHeight?: number;
}

/**
 * 以目标元素为基准的同步高度 hooks
 * @param count 需要同步高度的元素数量
 * @param targetIndex 目标元素索引（以此元素高度为基准）
 * @param options 同步配置选项
 * @returns 返回 ref 数组和同步状态
 */
const DefaultHeightOptions = {};
const useSyncHeight = (
  count: number,
  targetIndex = 0,
  options: SyncHeightOptions = DefaultHeightOptions
) => {
  const { syncOnResize = true, minHeight, maxHeight } = options;
  const elementsRef = useRef<(HTMLElement | null)[]>([]);
  const targetObserverRef = useRef<ResizeObserver | null>(null);
  const [isSynced, setIsSynced] = useState(false);

  // 设置元素 ref
  const setElementRef = (index: number) => (el: HTMLElement | null) => {
    if (el) {
      elementsRef.current[index] = el;
      // 只为目标元素创建 ResizeObserver
      if (index === targetIndex) {
        // 先清理可能存在的旧观察者
        if (targetObserverRef.current) {
          targetObserverRef.current.disconnect();
        }
        // 创建新的 ResizeObserver 观察目标元素
        const observer = new ResizeObserver((entries) => {
          if (entries.length > 0) {
            syncHeights();
          }
        });
        observer.observe(el);
        targetObserverRef.current = observer;
      }
    }
  };

  // 同步高度核心逻辑 - 以目标元素高度为基准
  const syncHeights = () => {
    const targetElement = elementsRef.current[targetIndex];
    if (!targetElement) {
      return;
    }

    // 获取目标元素高度
    let targetHeight = targetElement.offsetHeight;

    // 应用高度限制
    if (minHeight !== undefined) {
      targetHeight = Math.max(targetHeight, minHeight);
    }
    if (maxHeight !== undefined) {
      targetHeight = Math.min(targetHeight, maxHeight);
    }

    // 设置所有元素高度（除了目标元素本身）
    elementsRef.current.forEach((el, index) => {
      if (el && index !== targetIndex) {
        el.style.height = `${targetHeight}px`;
      }
    });

    setIsSynced(true);
  };

  // 初始同步和窗口 resize 同步
  useEffect(() => {
    // 初始同步（给 DOM 渲染时间）
    const initialSyncTimer = setTimeout(() => {
      syncHeights();
    }, 0);

    // 窗口 resize 同步
    const handleResize = () => {
      clearTimeout(initialSyncTimer);
      const resizeTimer = setTimeout(() => {
        syncHeights();
      }, 100);
      return () => clearTimeout(resizeTimer);
    };

    if (syncOnResize) {
      window.addEventListener("resize", handleResize);
    }

    // 清理函数
    return () => {
      clearTimeout(initialSyncTimer);
      if (syncOnResize) {
        window.removeEventListener("resize", handleResize);
      }
      // 清理目标元素的 ResizeObserver
      if (targetObserverRef.current) {
        targetObserverRef.current.disconnect();
        targetObserverRef.current = null;
      }
    };
  }, [syncOnResize, minHeight, maxHeight, targetIndex]);

  return {
    refs: Array.from({ length: count }, (_, i) => setElementRef(i)),
    isSynced,
    // 暴露手动同步方法
    syncHeights,
  };
};

export default useSyncHeight;
