export interface ThemeColors {
  background: string;
  surface: string;
  surfaceCard: string;
  primaryTeal: string;
  primaryBlue: string;
  accentPurple: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderLight: string;
  success: string;
  warning: string;
  danger: string;
  cardGradient: string[];
  tealGradient: string[];
  statusBarStyle: 'light' | 'dark';
}

export const darkTheme: ThemeColors = {
  background: '#0B0F19',
  surface: '#151C2C',
  surfaceCard: '#1E293B',
  primaryTeal: '#00F2FE',
  primaryBlue: '#4FACFE',
  accentPurple: '#7F00FF',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  border: '#334155',
  borderLight: '#1E293B',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  cardGradient: ['#1E293B', '#0F172A'],
  tealGradient: ['#00F2FE', '#4FACFE'],
  statusBarStyle: 'light',
};

export const lightTheme: ThemeColors = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceCard: '#F1F5F9',
  primaryTeal: '#00A8B5',
  primaryBlue: '#0284C7',
  accentPurple: '#6D28D9',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  borderLight: '#CBD5E1',
  success: '#059669',
  warning: '#D97706',
  danger: '#DC2626',
  cardGradient: ['#FFFFFF', '#F1F5F9'],
  tealGradient: ['#00A8B5', '#0284C7'],
  statusBarStyle: 'dark',
};

// Default fallback export for backwards compatibility
export const Colors = darkTheme;
