"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { FeedItem as FeedItemType } from "@/types";
import { FeedItem } from "./FeedItem";
import { getFeeds, getSortOrder } from "@/lib/storage";

const INITIAL_LOAD = 10;
const LOAD_MORE_COUNT = 10;
const BUFFER_SIZE = 3;
const WINDOW_SIZE = 5; // Render this many items before and after current

interface FeedContainerProps {
  initialItems?: FeedItemType[];
}

// Shuffle array using Fisher-Yates algorithm with seed
function shuffleArray<T>(array: T[], seed: number): T[] {
  const shuffled = [...array];
  let currentIndex = shuffled.length;

  const seededRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  while (currentIndex > 0) {
    const randomIndex = Math.floor(seededRandom() * currentIndex);
    currentIndex--;
    [shuffled[currentIndex], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[currentIndex]];
  }

  return shuffled;
}

export function FeedContainer({ initialItems }: FeedContainerProps) {
  const [allItems, setAllItems] = useState<FeedItemType[]>(initialItems || []);
  const [loadedCount, setLoadedCount] = useState(INITIAL_LOAD);
  const [loading, setLoading] = useState(!initialItems);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use refs for values needed in scroll handler to avoid stale closures
  const loadedCountRef = useRef(loadedCount);
  const allItemsLengthRef = useRef(allItems.length);

  useEffect(() => {
    loadedCountRef.current = loadedCount;
  }, [loadedCount]);

  useEffect(() => {
    allItemsLengthRef.current = allItems.length;
  }, [allItems.length]);

  const hasMore = loadedCount < allItems.length;
  const availableItems = allItems.slice(0, loadedCount);

  // Calculate which items to render (window around current position)
  const windowStart = Math.max(0, currentIndex - WINDOW_SIZE);
  const windowEnd = Math.min(availableItems.length, currentIndex + WINDOW_SIZE + 1);
  const visibleItems = availableItems.slice(windowStart, windowEnd);

  useEffect(() => {
    if (!initialItems) {
      fetchFeeds();
    }
  }, [initialItems]);

  const fetchFeeds = async () => {
    setLoading(true);
    setError(null);

    const feeds = getFeeds();
    if (feeds.length === 0) {
      setLoading(false);
      return;
    }

    try {
      const feedUrls = feeds.map((f) => f.url);
      const response = await fetch(
        `/api/feeds?feeds=${encodeURIComponent(JSON.stringify(feedUrls))}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch feeds");
      }

      const data = await response.json();
      let items = data.items || [];

      const sortOrder = getSortOrder();
      if (sortOrder === "random") {
        const today = new Date();
        const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
        items = shuffleArray(items, seed);
      }

      setAllItems(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load feeds");
    } finally {
      setLoading(false);
    }
  };

  const loadMore = useCallback(() => {
    setLoadedCount((prev) => {
      const newCount = Math.min(prev + LOAD_MORE_COUNT, allItemsLengthRef.current);
      return newCount;
    });
  }, []);

  // Track scroll position
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const itemHeight = window.innerHeight; // Each item is 100dvh = window height
      const scrollTop = container.scrollTop;
      const newIndex = Math.round(scrollTop / itemHeight);

      setCurrentIndex(newIndex);

      // Load more when within BUFFER_SIZE of the end
      const currentLoaded = loadedCountRef.current;
      const totalItems = allItemsLengthRef.current;

      if (newIndex >= currentLoaded - BUFFER_SIZE && currentLoaded < totalItems) {
        loadMore();
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [loadMore]);

  if (loading) {
    return (
      <div className="h-[100dvh] w-full flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-3 border-white/20 border-t-white rounded-full mx-auto mb-4" />
          <p className="text-white/60">Loading your feeds...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[100dvh] w-full flex items-center justify-center bg-black px-4">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchFeeds}
            className="px-6 py-3 bg-white text-black font-medium rounded-full hover:bg-zinc-200 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (allItems.length === 0) {
    return (
      <div className="h-[100dvh] w-full flex items-center justify-center bg-black px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">📰</div>
          <h2 className="text-xl font-bold mb-2">No feeds yet</h2>
          <p className="text-white/60 mb-6">
            Add some RSS feeds to get started
          </p>
          <a
            href="/settings"
            className="inline-block px-6 py-3 bg-white text-black font-medium rounded-full hover:bg-zinc-200 transition-colors"
          >
            Add feeds
          </a>
        </div>
      </div>
    );
  }

  // Calculate spacer heights for virtualization
  const itemHeight = typeof window !== "undefined" ? window.innerHeight : 800;
  const topSpacerHeight = windowStart * itemHeight;
  const bottomSpacerHeight = Math.max(0, (availableItems.length - windowEnd) * itemHeight);

  return (
    <div
      ref={containerRef}
      className="h-[100dvh] w-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar"
    >
      {/* Top spacer for items scrolled past */}
      {topSpacerHeight > 0 && (
        <div style={{ height: topSpacerHeight }} aria-hidden="true" />
      )}

      {/* Visible items in the window */}
      {visibleItems.map((item) => (
        <FeedItem key={item.id} item={item} />
      ))}

      {/* Bottom spacer for items not yet rendered */}
      {bottomSpacerHeight > 0 && (
        <div style={{ height: bottomSpacerHeight }} aria-hidden="true" />
      )}
    </div>
  );
}
