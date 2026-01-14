"use client";

import { FeedItem, FeedSource } from "@/types";

const FEEDS_KEY = "rsswipe_feeds";
const SAVED_KEY = "rsswipe_saved";

const DEFAULT_FEEDS: FeedSource[] = [
  { url: "https://hnrss.org/frontpage", title: "Hacker News" },
  { url: "https://feeds.bbci.co.uk/news/rss.xml", title: "BBC News" },
  { url: "https://techcrunch.com/feed/", title: "TechCrunch" },
];

export function getFeeds(): FeedSource[] {
  if (typeof window === "undefined") return DEFAULT_FEEDS;

  const stored = localStorage.getItem(FEEDS_KEY);
  if (!stored) {
    // Initialize with defaults on first load
    localStorage.setItem(FEEDS_KEY, JSON.stringify(DEFAULT_FEEDS));
    return DEFAULT_FEEDS;
  }

  try {
    return JSON.parse(stored);
  } catch {
    return DEFAULT_FEEDS;
  }
}

export function addFeed(url: string, title?: string): FeedSource[] {
  const feeds = getFeeds();
  const exists = feeds.some((f) => f.url === url);
  if (exists) return feeds;

  const newFeeds = [...feeds, { url, title }];
  localStorage.setItem(FEEDS_KEY, JSON.stringify(newFeeds));
  return newFeeds;
}

export function removeFeed(url: string): FeedSource[] {
  const feeds = getFeeds();
  const newFeeds = feeds.filter((f) => f.url !== url);
  localStorage.setItem(FEEDS_KEY, JSON.stringify(newFeeds));
  return newFeeds;
}

export function getSavedItems(): FeedItem[] {
  if (typeof window === "undefined") return [];

  const stored = localStorage.getItem(SAVED_KEY);
  if (!stored) return [];

  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveItem(item: FeedItem): FeedItem[] {
  const saved = getSavedItems();
  const exists = saved.some((s) => s.id === item.id);
  if (exists) return saved;

  const newSaved = [item, ...saved];
  localStorage.setItem(SAVED_KEY, JSON.stringify(newSaved));
  return newSaved;
}

export function unsaveItem(itemId: string): FeedItem[] {
  const saved = getSavedItems();
  const newSaved = saved.filter((s) => s.id !== itemId);
  localStorage.setItem(SAVED_KEY, JSON.stringify(newSaved));
  return newSaved;
}

export function isItemSaved(itemId: string): boolean {
  const saved = getSavedItems();
  return saved.some((s) => s.id === itemId);
}
