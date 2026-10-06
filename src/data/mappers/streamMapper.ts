import type {
  AppPlatform,
  Stream,
  StreamCategory,
  StreamFormat,
} from '../../domain/entities/Stream';
import { CatalogError } from '../../domain/errors/CatalogError';
import type { StreamDto } from '../dto/StreamDto';

const FORMATS: StreamFormat[] = ['hls', 'dash'];
const CATEGORIES: StreamCategory[] = ['live', 'vod', 'lab'];
const PLATFORMS: AppPlatform[] = ['ios', 'android', 'web'];
const DEFAULT_COLORS: [string, string] = ['#7C5CFF', '#2EC5FF'];

function isStreamDto(value: unknown): value is StreamDto {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.title === 'string' &&
    typeof v.description === 'string' &&
    typeof v.url === 'string' &&
    FORMATS.includes(v.format as StreamFormat)
  );
}

export function toStream(dto: StreamDto): Stream {
  const isLive = dto.live ?? false;
  const category = CATEGORIES.includes(dto.category as StreamCategory)
    ? (dto.category as StreamCategory)
    : isLive
      ? 'live'
      : 'vod';
  const colors = dto.artwork?.colors;

  return {
    id: dto.id,
    title: dto.title,
    subtitle: dto.subtitle ?? '',
    description: dto.description,
    url: dto.url,
    format: dto.format as StreamFormat,
    category,
    isLive,
    featured: dto.featured ?? false,
    tags: dto.tags ?? [],
    artwork: {
      poster: dto.artwork?.poster,
      backdrop: dto.artwork?.backdrop,
      colors: colors && colors.length >= 2 ? [colors[0], colors[1]] : DEFAULT_COLORS,
    },
    platforms: dto.platforms?.filter((p): p is AppPlatform => PLATFORMS.includes(p as AppPlatform)),
  };
}

export function toStreams(payload: unknown): Stream[] {
  if (!Array.isArray(payload)) {
    throw new CatalogError('The catalog does not have the expected format');
  }
  return payload.filter(isStreamDto).map(toStream);
}
