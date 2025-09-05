import { useRef, useEffect, useState, useCallback } from "react";
import { UseHeightSyncReturn, ScrollToOptions, HeightSyncConfig } from "@/types";

/**
 * 高度同步Hook - 确保卡片列表高度与Virtuoso容器高度保持一致
 */
export const useHeightSync = (config: HeightSyncConfig = { enabled: true }): UseHeightSyncReturn => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [virtuosoRef, setVirtuosoRef] = useState<any>(null);
  const cardListRef = useRef<HTMLDivElement>(null);

  const [height, setHeight] = useState<number>(0);

  const { enabled = true, debounceMs = 100, minHeight = 200 } = config;

  // 防抖函数
  const debounce = useCallback((func: Function, wait: number) => {
    let timeout: ReturnType<typeof setTimeout>;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(null, args), wait);
    };
  }, []);
  const getScroller = () => {
    if (!virtuosoRef) return null;
    const scroller = virtuosoRef.querySelector("div[data-virtuoso-scroller]");
    console.log("getScroller()", !virtuosoRef, virtuosoRef, scroller);
    return scroller;
  };
  const getVirtuosoHeight = () => {
    if (!virtuosoRef) return 0;
    const scroller = getScroller();
    // console.log("🚀 ~ getVirtuosoHeight ~ scroller:", scroller, scroller.getBoundingClientRect().height);
    return scroller.getBoundingClientRect().height;
  };
  // 更新高度的核心函数
  const updateHeight = () => {
    if (!enabled) return;

    let newHeight = getVirtuosoHeight();

    // 应用最小和最大高度限制
    if (minHeight && newHeight < minHeight) {
      newHeight = minHeight;
    }

    // setHeight(newHeight);

    // 同步卡片列表高度
    if (cardListRef.current) {
      cardListRef.current.style.height = `${newHeight}px`;
      console.log("🚀 ~ useHeightSync ~ cardListRef.current:", cardListRef.current, newHeight);
    }
  };

  // 防抖的高度更新函数
  const debouncedUpdateHeight = useCallback(debounce(updateHeight, debounceMs), [updateHeight, debounceMs]);

  // ResizeObserver监听容器尺寸变化
  useEffect(() => {
    if (!enabled) return;

    if (!virtuosoRef) return;
    const resizeObserver = new ResizeObserver(() => {
      debouncedUpdateHeight();
    });

    console.log("virtuosoRef", virtuosoRef, virtuosoRef, !virtuosoRef, getScroller());
    resizeObserver.observe(getScroller());

    // 初始化高度
    updateHeight();

    return () => {
      resizeObserver.disconnect();
    };
  }, [enabled, debouncedUpdateHeight, virtuosoRef]);

  // 监听窗口大小变化
  useEffect(() => {
    if (!enabled) return;

    const handleResize = () => {
      debouncedUpdateHeight();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [enabled, debouncedUpdateHeight]);

  return {
    containerRef,
    virtuosoRef,
    cardListRef,
    height,
    setVirtuosoRef,
  };
};
