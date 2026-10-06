import type { Breakpoint, Layout } from '../../hooks/useLayout';

export function posterCardWidth(breakpoint: Breakpoint): number {
  if (breakpoint === 'expanded') return 190;
  if (breakpoint === 'medium') return 165;
  return 140;
}

export function channelCardWidth({
  breakpoint,
  width,
}: Pick<Layout, 'breakpoint' | 'width'>): number {
  if (breakpoint === 'compact') return Math.min(width * 0.72, 300);
  return breakpoint === 'medium' ? 320 : 360;
}
