import { useState, useEffect, useCallback } from 'react';
import { ResponsiveConfig, Breakpoints } from '@/types';

/**
 * 响应式设计Hook - 处理不同屏幕尺寸下的布局适配
 */
export const useResponsive = (config: ResponsiveConfig = {}) => {
  const defaultBreakpoints: Breakpoints = {
    xs: 0,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200
  };

  const breakpoints = { ...defaultBreakpoints, ...config.breakpoints };
  const { mobileFirst = true } = config;

  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  // 获取当前断点
  const getCurrentBreakpoint = useCallback((width: number): keyof Breakpoints => {
    const sortedBreakpoints = Object.entries(breakpoints)
      .sort(([, a], [, b]) => mobileFirst ? b - a : a - b);

    for (const [name, value] of sortedBreakpoints) {
      if (mobileFirst ? width >= value : width <= value) {
        return name as keyof Breakpoints;
      }
    }

    return mobileFirst ? 'xs' : 'xl';
  }, [breakpoints, mobileFirst]);

  const [currentBreakpoint, setCurrentBreakpoint] = useState<keyof Breakpoints>(
    getCurrentBreakpoint(windowWidth)
  );

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      setWindowWidth(newWidth);
      setCurrentBreakpoint(getCurrentBreakpoint(newWidth));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getCurrentBreakpoint]);

  // 检查是否匹配指定断点
  const isBreakpoint = useCallback((breakpoint: keyof Breakpoints) => {
    return currentBreakpoint === breakpoint;
  }, [currentBreakpoint]);

  // 检查是否大于等于指定断点
  const isBreakpointUp = useCallback((breakpoint: keyof Breakpoints) => {
    return windowWidth >= breakpoints[breakpoint];
  }, [windowWidth, breakpoints]);

  // 检查是否小于指定断点
  const isBreakpointDown = useCallback((breakpoint: keyof Breakpoints) => {
    return windowWidth < breakpoints[breakpoint];
  }, [windowWidth, breakpoints]);

  // 获取响应式布局配置
  const getResponsiveLayout = useCallback(() => {
    if (isBreakpointDown('md')) {
      // 移动端：垂直布局
      return {
        direction: 'column' as const,
        virtuosoWidth: '100%',
        cardListWidth: '100%',
        gap: '1rem'
      };
    } else if (isBreakpointDown('lg')) {
      // 平板端：紧凑布局
      return {
        direction: 'row' as const,
        virtuosoWidth: '60%',
        cardListWidth: '40%',
        gap: '0.75rem'
      };
    } else {
      // 桌面端：标准布局
      return {
        direction: 'row' as const,
        virtuosoWidth: '70%',
        cardListWidth: '30%',
        gap: '1rem'
      };
    }
  }, [isBreakpointDown]);

  return {
    windowWidth,
    currentBreakpoint,
    breakpoints,
    isBreakpoint,
    isBreakpointUp,
    isBreakpointDown,
    getResponsiveLayout,
    isMobile: isBreakpointDown('md'),
    isTablet: isBreakpointUp('md') && isBreakpointDown('lg'),
    isDesktop: isBreakpointUp('lg')
  };
};