export function formatBitrate(bitsPerSecond: number | null | undefined): string {
  if (!bitsPerSecond || bitsPerSecond <= 0) return '—';
  if (bitsPerSecond >= 1_000_000) return `${(bitsPerSecond / 1_000_000).toFixed(1)} Mbps`;
  return `${Math.round(bitsPerSecond / 1000)} kbps`;
}

export function formatTime(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return '0:00';
  const seconds = Math.floor(totalSeconds % 60);
  const minutes = Math.floor((totalSeconds / 60) % 60);
  const hours = Math.floor(totalSeconds / 3600);
  const mm = hours > 0 ? String(minutes).padStart(2, '0') : String(minutes);
  const ss = String(seconds).padStart(2, '0');
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function formatMs(ms: number | null): string {
  if (ms === null) return '—';
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)} s` : `${Math.round(ms)} ms`;
}

export function formatLanguage(code: string | undefined, fallback: string): string {
  if (!code) return fallback;
  try {
    const name = new Intl.DisplayNames(['es'], { type: 'language' }).of(code);
    return name ? name.charAt(0).toUpperCase() + name.slice(1) : fallback;
  } catch {
    return code.toUpperCase();
  }
}
