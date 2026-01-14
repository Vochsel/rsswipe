import { NextRequest, NextResponse } from "next/server";
import { parseFeed } from "@/lib/rss";
import { getCachedFeed, setCachedFeed } from "@/lib/cache";
import { FeedItem } from "@/types";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const feedsParam = searchParams.get("feeds");

  if (!feedsParam) {
    return NextResponse.json({ error: "No feeds provided" }, { status: 400 });
  }

  let feedUrls: string[];
  try {
    feedUrls = JSON.parse(feedsParam);
  } catch {
    return NextResponse.json({ error: "Invalid feeds parameter" }, { status: 400 });
  }

  if (!Array.isArray(feedUrls) || feedUrls.length === 0) {
    return NextResponse.json({ error: "No valid feed URLs" }, { status: 400 });
  }

  const allItems: FeedItem[] = [];

  await Promise.all(
    feedUrls.map(async (url) => {
      // Check cache first
      const cached = getCachedFeed(url);
      if (cached) {
        allItems.push(...cached);
        return;
      }

      // Fetch and parse feed
      const items = await parseFeed(url);
      if (items.length > 0) {
        setCachedFeed(url, items);
        allItems.push(...items);
      }
    })
  );

  // Sort by date, newest first
  allItems.sort((a, b) => {
    const dateA = new Date(a.pubDate).getTime();
    const dateB = new Date(b.pubDate).getTime();
    return dateB - dateA;
  });

  return NextResponse.json({ items: allItems });
}
