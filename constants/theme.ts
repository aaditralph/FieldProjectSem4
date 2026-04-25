export type Theme = {
  light: {
    text: string;
    background: string;
    tint: string;
    icon: string;
    tabIconDefault: string;
    tabIconSelected: string;
    surface: string;
    border: string;
    muted: string;
    success: string;
    warning: string;
    error: string;
    accent: string;
  };
  dark: {
    text: string;
    background: string;
    tint: string;
    icon: string;
    tabIconDefault: string;
    tabIconSelected: string;
    surface: string;
    border: string;
    muted: string;
    success: string;
    warning: string;
    error: string;
    accent: string;
  };
};

export const Colors: Theme = {
  light: {
    text: '#0F172A',
    background: '#F8FAFC',
    tint: '#10B981',
    icon: '#64748B',
    tabIconDefault: '#64748B',
    tabIconSelected: '#10B981',
    surface: '#FFFFFF',
    border: '#E2E8F0',
    muted: '#94A3B8',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    accent: '#F59E0B',
  },
  dark: {
    text: '#F8FAFC',
    background: '#0F172A',
    tint: '#10B981',
    icon: '#94A3B8',
    tabIconDefault: '#94A3B8',
    tabIconSelected: '#10B981',
    surface: '#1E293B',
    border: '#334155',
    muted: '#64748B',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    accent: '#F59E0B',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const BorderRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const FontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
};