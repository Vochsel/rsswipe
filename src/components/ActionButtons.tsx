"use client";

import { FeedItem } from "@/types";
import { isItemSaved, saveItem, unsaveItem } from "@/lib/storage";
import { useState, useEffect } from "react";
import Link from "next/link";

interface ActionButtonsProps {
  item: FeedItem;
  onCommentClick: () => void;
}

export function ActionButtons({ item, onCommentClick }: ActionButtonsProps) {
  const [saved, setSaved] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  useEffect(() => {
    setSaved(isItemSaved(item.id));
  }, [item.id]);

  const handleSave = () => {
    if (saved) {
      unsaveItem(item.id);
      setSaved(false);
    } else {
      saveItem(item);
      setSaved(true);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: item.title,
      text: item.description,
      url: item.link,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or error - fall back to clipboard
        if ((err as Error).name !== "AbortError") {
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(item.link);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  return (
    <div className="fixed right-3 bottom-1/4 flex flex-col items-center gap-5 z-20">
      {/* Comment Button */}
      <button
        onClick={onCommentClick}
        className="flex flex-col items-center gap-1 text-white/90 active:scale-95 transition-transform"
        aria-label="View comments"
      >
        <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
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
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <span className="text-xs font-medium">Comments</span>
      </button>

      {/* Share Button */}
      <button
        onClick={handleShare}
        className="flex flex-col items-center gap-1 text-white/90 active:scale-95 transition-transform relative"
        aria-label="Share"
      >
        <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
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
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
        </div>
        <span className="text-xs font-medium">
          {showCopied ? "Copied!" : "Share"}
        </span>
      </button>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="flex flex-col items-center gap-1 text-white/90 active:scale-95 transition-transform"
        aria-label={saved ? "Unsave" : "Save"}
      >
        <div
          className={`w-12 h-12 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors ${
            saved ? "bg-yellow-500/80" : "bg-white/10"
          }`}
        >
          <svg
            className="w-6 h-6"
            fill={saved ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
        </div>
        <span className="text-xs font-medium">{saved ? "Saved" : "Save"}</span>
      </button>

      {/* Settings Button */}
      <Link
        href="/settings"
        className="flex flex-col items-center gap-1 text-white/90 active:scale-95 transition-transform"
        aria-label="Settings"
      >
        <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
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
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
        <span className="text-xs font-medium">Settings</span>
      </Link>
    </div>
  );
}
