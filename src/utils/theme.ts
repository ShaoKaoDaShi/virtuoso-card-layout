import { Theme } from '@/types';

/**
 * 默认主题配置
 */
export const defaultTheme: Theme = {
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
  },
  borderRadius: {
    sm: '2px',
    md: '6px',
    lg: '8px'
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
    md: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
    lg: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
  }
};

/**
 * 深色主题配置
 */
export const darkTheme: Theme = {
  ...defaultTheme,
  colors: {
    ...defaultTheme.colors,
    primary: '#1890ff',
    secondary: '#722ed1',
    background: '#141414',
    surface: '#1f1f1f',
    border: '#434343',
    text: {
      primary: '#ffffff',
      secondary: '#a6a6a6',
      disabled: '#595959'
    },
    card: {
      comment: '#111a2c',
      issue: '#2b1d16',
      suggestion: '#162312',
      warning: '#2b2611',
      error: '#2a1215'
    }
  }
};

/**
 * 合并主题配置
 */
export const mergeTheme = (baseTheme: Theme, customTheme: Partial<Theme>): Theme => {
  return {
    colors: {
      ...baseTheme.colors,
      ...customTheme.colors,
      text: {
        ...baseTheme.colors.text,
        ...customTheme.colors?.text
      },
      card: {
        ...baseTheme.colors.card,
        ...customTheme.colors?.card
      }
    },
    spacing: {
      ...baseTheme.spacing,
      ...customTheme.spacing
    },
    borderRadius: {
      ...baseTheme.borderRadius,
      ...customTheme.borderRadius
    },
    shadows: {
      ...baseTheme.shadows,
      ...customTheme.shadows
    }
  };
};

/**
 * 获取卡片颜色
 */
export const getCardColor = (theme: Theme, cardType: keyof Theme['colors']['card']): string => {
  return theme.colors.card[cardType] || theme.colors.card.comment;
};

/**
 * 生成CSS变量
 */
export const generateCSSVariables = (theme: Theme): Record<string, string> => {
  return {
    '--vc-color-primary': theme.colors.primary,
    '--vc-color-secondary': theme.colors.secondary,
    '--vc-color-background': theme.colors.background,
    '--vc-color-surface': theme.colors.surface,
    '--vc-color-border': theme.colors.border,
    '--vc-color-text-primary': theme.colors.text.primary,
    '--vc-color-text-secondary': theme.colors.text.secondary,
    '--vc-color-text-disabled': theme.colors.text.disabled,
    '--vc-spacing-xs': theme.spacing.xs,
    '--vc-spacing-sm': theme.spacing.sm,
    '--vc-spacing-md': theme.spacing.md,
    '--vc-spacing-lg': theme.spacing.lg,
    '--vc-spacing-xl': theme.spacing.xl,
    '--vc-border-radius-sm': theme.borderRadius.sm,
    '--vc-border-radius-md': theme.borderRadius.md,
    '--vc-border-radius-lg': theme.borderRadius.lg,
    '--vc-shadow-sm': theme.shadows.sm,
    '--vc-shadow-md': theme.shadows.md,
    '--vc-shadow-lg': theme.shadows.lg
  };
};