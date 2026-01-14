import * as cheerio from "cheerio";
import { Comment } from "@/types";

export async function scrapeComments(url: string): Promise<{
  comments: Comment[];
  fallbackUrl?: string;
}> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; RSSWipe/1.0)",
      },
    });

    if (!response.ok) {
      return { comments: [], fallbackUrl: url };
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Try to detect and parse comments based on the site
    const hostname = new URL(url).hostname;

    // Hacker News
    if (hostname.includes("ycombinator.com") || hostname.includes("news.ycombinator")) {
      return parseHackerNews($);
    }

    // Reddit
    if (hostname.includes("reddit.com")) {
      return { comments: [], fallbackUrl: url };
    }

    // Generic comment extraction
    return parseGenericComments($, url);
  } catch (error) {
    console.error("Error scraping comments:", error);
    return { comments: [], fallbackUrl: url };
  }
}

type CheerioAPI = ReturnType<typeof cheerio.load>;

function parseHackerNews($: CheerioAPI): { comments: Comment[] } {
  const comments: Comment[] = [];

  $(".athing.comtr").each((i, el) => {
    if (i >= 20) return false; // Limit to 20 comments

    const $el = $(el);
    const author = $el.find(".hnuser").first().text();
    const content = $el.find(".commtext").first().text().trim();
    const age = $el.find(".age").first().text();

    if (content) {
      comments.push({
        id: $el.attr("id") || String(i),
        author: author || "anonymous",
        content: content.slice(0, 500),
        date: age,
      });
    }
  });

  return { comments };
}

function parseGenericComments(
  $: CheerioAPI,
  url: string
): { comments: Comment[]; fallbackUrl?: string } {
  const comments: Comment[] = [];

  // Try common comment selectors
  const commentSelectors = [
    ".comment",
    ".comments .comment-body",
    '[class*="comment"]',
    "#comments .comment-content",
    ".post-comments .comment",
  ];

  for (const selector of commentSelectors) {
    $(selector).each((i, el) => {
      if (i >= 20) return false;

      const $el = $(el);
      const content = $el.find("p, .content, .text").first().text().trim() || $el.text().trim();

      if (content && content.length > 10) {
        comments.push({
          id: String(i),
          author: $el.find('[class*="author"], .username, .name').first().text() || "User",
          content: content.slice(0, 500),
        });
      }
    });

    if (comments.length > 0) break;
  }

  // If no comments found, return fallback URL
  if (comments.length === 0) {
    return { comments: [], fallbackUrl: url };
  }

  return { comments };
}
