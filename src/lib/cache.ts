import { FeedItem } from "@/types";

interface CacheEntry {
  data: FeedItem[];
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const TTL = 5 * 60 * 1000; // 5 minutes

export function getCachedFeed(feedUrl: string): FeedItem[] | null {
  const entry = cache.get(feedUrl);
  if (!entry) return null;

  if (Date.now() - entry.timestamp > TTL) {
    cache.delete(feedUrl);
    return null;
  }

  return entry.data;
}

export function setCachedFeed(feedUrl: string, data: FeedItem[]): void {
  cache.set(feedUrl, {
    data,
    timestamp: Date.now(),
  });
}

export function clearCache(): void {
  cache.clear();
}
