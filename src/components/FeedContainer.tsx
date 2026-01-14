"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { FeedItem as FeedItemType } from "@/types";
import { FeedItem } from "./FeedItem";
import { getFeeds, getSortOrder } from "@/lib/storage";

const INITIAL_LOAD = 10;
const LOAD_MORE_COUNT = 10;
const BUFFER_SIZE = 3;

interface FeedContainerProps {
  initialItems?: FeedItemType[];
}

// Shuffle array using Fisher-Yates algorithm with seed
function shuffleArray<T>(array: T[], seed: number): T[] {
  const shuffled = [...array];
  let currentIndex = shuffled.length;

  // Simple seeded random
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
  const [visibleCount, setVisibleCount] = useState(INITIAL_LOAD);
  const [loading, setLoading] = useState(!initialItems);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const visibleItems = allItems.slice(0, visibleCount);
  const hasMore = visibleCount < allItems.length;

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

      // Apply sort order
      const sortOrder = getSortOrder();
      if (sortOrder === "random") {
        // Use today's date as seed so it's consistent for the session
        const today = new Date();
        const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
        items = shuffleArray(items, seed);
      }
      // chronological is already sorted by the API

      setAllItems(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load feeds");
    } finally {
      setLoading(false);
    }
  };

  const loadMore = useCallback(() => {
    if (hasMore) {
      setVisibleCount((prev) => Math.min(prev + LOAD_MORE_COUNT, allItems.length));
    }
  }, [hasMore, allItems.length]);

  // Track scroll position and load more when near the end
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const itemHeight = container.clientHeight; // Each item is 100dvh
      const newIndex = Math.round(scrollTop / itemHeight);

      setCurrentIndex(newIndex);

      // Load more when within BUFFER_SIZE of the end
      if (newIndex >= visibleCount - BUFFER_SIZE && hasMore) {
        loadMore();
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [visibleCount, hasMore, loadMore]);

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

  return (
    <div
      ref={containerRef}
      className="h-[100dvh] w-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar"
    >
      {visibleItems.map((item) => (
        <FeedItem key={item.id} item={item} />
      ))}
      {hasMore && (
        <div className="h-1 w-full" aria-hidden="true" />
      )}
    </div>
  );
}
