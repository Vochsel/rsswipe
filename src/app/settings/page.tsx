"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FeedSource } from "@/types";
import { getFeeds, addFeed, removeFeed, getSortOrder, setSortOrder, SortOrder } from "@/lib/storage";

export default function SettingsPage() {
  const [feeds, setFeeds] = useState<FeedSource[]>([]);
  const [newFeedUrl, setNewFeedUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrderState] = useState<SortOrder>("chronological");

  useEffect(() => {
    setFeeds(getFeeds());
    setSortOrderState(getSortOrder());
  }, []);

  const handleAddFeed = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const url = newFeedUrl.trim();
    if (!url) return;

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      setError("Please enter a valid URL");
      return;
    }

    const updated = addFeed(url);
    setFeeds(updated);
    setNewFeedUrl("");
  };

  const handleRemoveFeed = (url: string) => {
    const updated = removeFeed(url);
    setFeeds(updated);
  };

  const handleSortOrderChange = (order: SortOrder) => {
    setSortOrder(order);
    setSortOrderState(order);
  };

  return (
    <div className="min-h-[100dvh] bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 bg-black/90 backdrop-blur-sm border-b border-zinc-800 z-10">
        <div className="flex items-center justify-between px-4 py-4">
          <Link
            href="/"
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
          <h1 className="text-lg font-semibold">Settings</h1>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>
      </header>

      <div className="px-4 py-6 max-w-lg mx-auto">
        {/* Sort Order Section */}
        <section className="mb-8">
          <h2 className="text-sm font-medium text-white/60 uppercase tracking-wide mb-3">
            Feed Order
          </h2>
          <div className="bg-zinc-900 rounded-xl p-1 flex">
            <button
              onClick={() => handleSortOrderChange("chronological")}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                sortOrder === "chronological"
                  ? "bg-white text-black"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Chronological
            </button>
            <button
              onClick={() => handleSortOrderChange("random")}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                sortOrder === "random"
                  ? "bg-white text-black"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Random
            </button>
          </div>
          <p className="text-xs text-zinc-500 mt-2 px-1">
            {sortOrder === "chronological"
              ? "Newest articles appear first"
              : "Articles are shuffled daily"}
          </p>
        </section>

        {/* Add Feed Section */}
        <section className="mb-8">
          <h2 className="text-sm font-medium text-white/60 uppercase tracking-wide mb-3">
            Add RSS Feed
          </h2>
          <form onSubmit={handleAddFeed} className="space-y-3">
            <input
              type="url"
              value={newFeedUrl}
              onChange={(e) => setNewFeedUrl(e.target.value)}
              placeholder="https://example.com/rss.xml"
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full py-3 bg-white text-black font-medium rounded-xl hover:bg-zinc-200 transition-colors"
            >
              Add Feed
            </button>
          </form>
        </section>

        {/* Current Feeds Section */}
        <section className="mb-8">
          <h2 className="text-sm font-medium text-white/60 uppercase tracking-wide mb-3">
            Your Feeds ({feeds.length})
          </h2>
          {feeds.length === 0 ? (
            <p className="text-zinc-500 text-center py-8">No feeds added yet</p>
          ) : (
            <div className="space-y-2">
              {feeds.map((feed) => (
                <div
                  key={feed.url}
                  className="flex items-center justify-between bg-zinc-900 rounded-xl p-4 group"
                >
                  <div className="flex-1 min-w-0 mr-4">
                    {feed.title && (
                      <p className="font-medium truncate">{feed.title}</p>
                    )}
                    <p className="text-sm text-zinc-500 truncate">{feed.url}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveFeed(feed.url)}
                    className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    aria-label="Remove feed"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Saved Items Section */}
        <section>
          <h2 className="text-sm font-medium text-white/60 uppercase tracking-wide mb-3">
            Saved Items
          </h2>
          <Link
            href="/saved"
            className="flex items-center justify-between bg-zinc-900 rounded-xl p-4 hover:bg-zinc-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-yellow-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <span className="font-medium">View Saved Items</span>
            </div>
            <svg
              className="w-5 h-5 text-zinc-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </section>
      </div>
    </div>
  );
}
