export const colors = {
  background: '#07080C',
  surface: '#11131A',
  surfaceRaised: '#191C26',
  surfaceGlass: 'rgba(17, 19, 26, 0.72)',
  border: 'rgba(255, 255, 255, 0.08)',
  borderStrong: 'rgba(255, 255, 255, 0.16)',
  text: '#F5F6FA',
  textMuted: '#A3A9BC',
  textSubtle: '#6B7186',
  primary: '#8B6CFF',
  primarySoft: 'rgba(139, 108, 255, 0.16)',
  cyan: '#2EC5FF',
  live: '#FF3B5C',
  liveSoft: 'rgba(255, 59, 92, 0.16)',
  success: '#34D399',
  warning: '#FBBF24',
  danger: '#F87171',
  white: '#FFFFFF',
  black: '#000000',
};

export const gradients = {
  brand: ['#8B6CFF', '#2EC5FF'] as const,
  scrimTop: ['rgba(7,8,12,0.7)', 'rgba(7,8,12,0)'] as const,
  scrimBottom: ['rgba(7,8,12,0)', 'rgba(7,8,12,0.55)', '#07080C'] as const,
  scrimCard: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.85)'] as const,
};

export const spacing = { xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 };

export const radius = { sm: 8, md: 12, lg: 16, xl: 22, pill: 999 };

export const fonts = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
};

export const typography = {
  display: { fontFamily: fonts.extrabold, fontSize: 34, lineHeight: 38, letterSpacing: -0.8 },
  title: { fontFamily: fonts.extrabold, fontSize: 24, lineHeight: 30, letterSpacing: -0.4 },
  headline: { fontFamily: fonts.bold, fontSize: 18, lineHeight: 24, letterSpacing: -0.2 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 22 },
  caption: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18 },
  overline: { fontFamily: fonts.bold, fontSize: 11, lineHeight: 14, letterSpacing: 1.2 },
  metric: { fontFamily: fonts.bold, fontSize: 20, lineHeight: 24, letterSpacing: -0.3 },
} as const;

export type TypographyVariant = keyof typeof typography;
