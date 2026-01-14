export interface FeedItem {
  id: string;
  feedUrl: string;
  feedTitle: string;
  title: string;
  description: string;
  link: string;
  pubDate: string;
  media?: {
    type: "image" | "video";
    url: string;
  };
  commentsUrl?: string;
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  date?: string;
}

export interface FeedSource {
  url: string;
  title?: string;
}
