"use client";

import { useState, memo, useMemo } from "react";
import { FeedItem as FeedItemType } from "@/types";
import { GradientBackground } from "./GradientBackground";
import { ActionButtons } from "./ActionButtons";
import { CommentSheet } from "./CommentSheet";

interface FeedItemProps {
  item: FeedItemType;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export const FeedItem = memo(function FeedItem({ item }: FeedItemProps) {
  const [showComments, setShowComments] = useState(false);
  const [imageError, setImageError] = useState(false);

  const hasMedia = item.media && !imageError;
  const formattedDate = useMemo(() => formatDate(item.pubDate), [item.pubDate]);

  return (
    <div className="h-[100dvh] w-full relative snap-start flex flex-col">
      {/* Media Section - Top Half */}
      <div className="relative flex-1 min-h-0">
        {hasMedia ? (
          item.media!.type === "video" ? (
            <video
              src={item.media!.url}
              className="absolute inset-0 w-full h-full object-cover"
              controls
              playsInline
              muted
              preload="none"
            />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={item.media!.url}
              alt={item.title}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          )
        ) : (
          <GradientBackground id={item.id} />
        )}

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
      </div>

      {/* Content Section - Bottom Half */}
      <div className="relative bg-black px-4 pb-8 pt-4 pr-20">
        {/* Source */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-white/60 bg-white/10 px-2 py-1 rounded-full">
            {item.feedTitle}
          </span>
          <span className="text-xs text-white/40">{formattedDate}</span>
        </div>

        {/* Title */}
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <h2 className="text-xl font-bold leading-tight mb-2 line-clamp-3 hover:underline">
            {item.title}
          </h2>
        </a>

        {/* Description */}
        {item.description && (
          <p className="text-sm text-white/70 leading-relaxed line-clamp-3">
            {item.description}
          </p>
        )}

        {/* Read more link */}
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-blue-400 hover:text-blue-300"
        >
          Read article
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </div>

      {/* Action Buttons */}
      <ActionButtons item={item} onCommentClick={() => setShowComments(true)} />

      {/* Comment Sheet */}
      <CommentSheet
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        commentsUrl={item.commentsUrl}
        articleUrl={item.link}
      />
    </div>
  );
});
