import { config as defaultConfig } from '@gluestack-ui/config';

export const config = {
  ...defaultConfig,
  tokens: {
    ...defaultConfig.tokens,
    colors: {
      ...defaultConfig.tokens.colors,
      primary: '#0a7ea4',
      secondary: '#7c3aed',
      surface: '#f5f5f5',
      surface2: '#e5e5e5',
      foreground: '#11181c',
      muted: '#687076',
      border: '#e5e7eb',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
    },
  },
};
