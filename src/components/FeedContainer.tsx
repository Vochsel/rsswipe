"use client";

import { useState, useEffect } from "react";
import { FeedItem as FeedItemType } from "@/types";
import { FeedItem } from "./FeedItem";
import { getFeeds } from "@/lib/storage";

interface FeedContainerProps {
  initialItems?: FeedItemType[];
}

export function FeedContainer({ initialItems }: FeedContainerProps) {
  const [items, setItems] = useState<FeedItemType[]>(initialItems || []);
  const [loading, setLoading] = useState(!initialItems);
  const [error, setError] = useState<string | null>(null);

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
      setItems(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load feeds");
    } finally {
      setLoading(false);
    }
  };

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

  if (items.length === 0) {
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
    <div className="h-[100dvh] w-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar">
      {items.map((item) => (
        <FeedItem key={item.id} item={item} />
      ))}
    </div>
  );
}
