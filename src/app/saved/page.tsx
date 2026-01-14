"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FeedItem as FeedItemType } from "@/types";
import { getSavedItems } from "@/lib/storage";
import { FeedItem } from "@/components/FeedItem";

export default function SavedPage() {
  const [items, setItems] = useState<FeedItemType[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setItems(getSavedItems());
  }, []);

  if (!mounted) {
    return (
      <div className="h-[100dvh] w-full flex items-center justify-center bg-black">
        <div className="animate-spin w-12 h-12 border-3 border-white/20 border-t-white rounded-full" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[100dvh] bg-black text-white">
        {/* Header */}
        <header className="sticky top-0 bg-black/90 backdrop-blur-sm border-b border-zinc-800 z-10">
          <div className="flex items-center justify-between px-4 py-4">
            <Link
              href="/settings"
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span>Back</span>
            </Link>
            <h1 className="text-lg font-semibold">Saved</h1>
            <div className="w-16" />
          </div>
        </header>

        <div className="flex flex-col items-center justify-center px-4 py-20">
          <div className="text-6xl mb-4">🔖</div>
          <h2 className="text-xl font-bold mb-2">No saved items</h2>
          <p className="text-white/60 mb-6 text-center">
            Save articles by tapping the bookmark icon while browsing
          </p>
          <Link
            href="/"
            className="px-6 py-3 bg-white text-black font-medium rounded-full hover:bg-zinc-200 transition-colors"
          >
            Browse feeds
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full bg-black">
      {/* Floating back button */}
      <Link
        href="/settings"
        className="fixed top-4 left-4 z-30 flex items-center gap-2 px-3 py-2 bg-black/60 backdrop-blur-sm rounded-full text-white/80 hover:text-white hover:bg-black/80 transition-colors"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        <span className="text-sm font-medium">Saved ({items.length})</span>
      </Link>

      {/* Feed container */}
      <div className="h-[100dvh] w-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar">
        {items.map((item) => (
          <FeedItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
