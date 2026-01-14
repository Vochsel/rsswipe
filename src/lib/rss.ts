import Parser from "rss-parser";
import * as cheerio from "cheerio";
import { FeedItem } from "@/types";

const parser = new Parser({
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: true }],
      ["media:thumbnail", "mediaThumbnail"],
      ["enclosure", "enclosure"],
      ["comments", "comments"],
    ],
  },
});

interface ExtendedItem extends Parser.Item {
  mediaContent?: Array<{ $: { url: string; medium?: string; type?: string } }>;
  mediaThumbnail?: { $: { url: string } };
  enclosure?: { url: string; type?: string };
}

function extractMedia(item: ExtendedItem): FeedItem["media"] | undefined {
  // 1. Check enclosure (common for podcasts and media RSS)
  if (item.enclosure?.url) {
    const type = item.enclosure.type || "";
    if (type.startsWith("video/")) {
      return { type: "video", url: item.enclosure.url };
    }
    if (type.startsWith("image/")) {
      return { type: "image", url: item.enclosure.url };
    }
  }

  // 2. Check media:content
  if (item.mediaContent && item.mediaContent.length > 0) {
    for (const media of item.mediaContent) {
      const url = media.$?.url;
      const medium = media.$?.medium;
      const type = media.$?.type || "";

      if (url) {
        if (medium === "video" || type.startsWith("video/")) {
          return { type: "video", url };
        }
        if (
          medium === "image" ||
          type.startsWith("image/") ||
          /\.(jpg|jpeg|png|gif|webp)$/i.test(url)
        ) {
          return { type: "image", url };
        }
      }
    }
  }

  // 3. Check media:thumbnail
  if (item.mediaThumbnail?.$?.url) {
    return { type: "image", url: item.mediaThumbnail.$.url };
  }

  // 4. Extract first image from content/description
  const itemAny = item as Record<string, unknown>;
  const content = (itemAny["content:encoded"] || itemAny.content || itemAny.contentSnippet || "") as string;
  const description = (itemAny.description || "") as string;
  const html = content + description;

  if (html) {
    const $ = cheerio.load(html);
    const firstImg = $("img").first();
    if (firstImg.length) {
      const src = firstImg.attr("src");
      if (src && src.startsWith("http")) {
        return { type: "image", url: src };
      }
    }
  }

  return undefined;
}

function cleanDescription(html: string): string {
  if (!html) return "";
  const $ = cheerio.load(html);
  // Remove images and scripts
  $("img, script, style").remove();
  // Get text content
  let text = $("body").text().trim();
  // Collapse whitespace
  text = text.replace(/\s+/g, " ");
  // Limit length
  if (text.length > 300) {
    text = text.slice(0, 297) + "...";
  }
  return text;
}

function generateId(feedUrl: string, itemLink: string, itemTitle: string): string {
  const str = `${feedUrl}|${itemLink}|${itemTitle}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export async function parseFeed(feedUrl: string): Promise<FeedItem[]> {
  try {
    const feed = await parser.parseURL(feedUrl);
    const feedTitle = feed.title || new URL(feedUrl).hostname;

    return feed.items.map((rawItem) => {
      const item = rawItem as unknown as ExtendedItem & {
        description?: string;
        contentSnippet?: string;
        comments?: string;
      };
      const id = generateId(feedUrl, item.link || "", item.title || "");

      return {
        id,
        feedUrl,
        feedTitle,
        title: item.title || "Untitled",
        description: cleanDescription(item.description || item.contentSnippet || ""),
        link: item.link || "",
        pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
        media: extractMedia(item),
        commentsUrl: item.comments || undefined,
      };
    });
  } catch (error) {
    console.error(`Error parsing feed ${feedUrl}:`, error);
    return [];
  }
}
