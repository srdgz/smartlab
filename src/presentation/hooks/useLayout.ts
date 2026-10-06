import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type Breakpoint = 'compact' | 'medium' | 'expanded';

const MAX_CONTENT_WIDTH = 1200;

export function getBreakpoint(width: number): Breakpoint {
  if (width >= 1024) return 'expanded';
  if (width >= 600) return 'medium';
  return 'compact';
}

export function useLayout() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const breakpoint = getBreakpoint(width);
  const isLandscape = width > height;
  const gutter = breakpoint === 'compact' ? 16 : breakpoint === 'medium' ? 24 : 32;
  const centeredOffset = Math.max(0, (width - MAX_CONTENT_WIDTH) / 2);

  return {
    width,
    height,
    insets,
    breakpoint,
    isLandscape,
    isCompact: breakpoint === 'compact' && !isLandscape,
    gutter,
    insetLeft: centeredOffset + gutter + insets.left,
    insetRight: centeredOffset + gutter + insets.right,
    contentWidth: Math.min(width, MAX_CONTENT_WIDTH) - gutter * 2 - insets.left - insets.right,
    splitPlayer: width >= 900 || (isLandscape && width >= 640),
  };
}

export type Layout = ReturnType<typeof useLayout>;
