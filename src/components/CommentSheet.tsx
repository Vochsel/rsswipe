"use client";

import { useState, useEffect } from "react";
import { Comment } from "@/types";

interface CommentSheetProps {
  isOpen: boolean;
  onClose: () => void;
  commentsUrl?: string;
  articleUrl: string;
}

export function CommentSheet({
  isOpen,
  onClose,
  commentsUrl,
  articleUrl,
}: CommentSheetProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [fallbackUrl, setFallbackUrl] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && (commentsUrl || articleUrl)) {
      fetchComments();
    }
  }, [isOpen, commentsUrl, articleUrl]);

  const fetchComments = async () => {
    setLoading(true);
    setError(null);
    setComments([]);
    setFallbackUrl(undefined);

    const urlToFetch = commentsUrl || articleUrl;

    try {
      const response = await fetch(
        `/api/comments?url=${encodeURIComponent(urlToFetch)}`
      );
      const data = await response.json();

      if (data.comments && data.comments.length > 0) {
        setComments(data.comments);
      } else {
        setFallbackUrl(data.fallbackUrl || urlToFetch);
      }
    } catch {
      setError("Failed to load comments");
      setFallbackUrl(urlToFetch);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 rounded-t-3xl z-50 max-h-[70vh] flex flex-col animate-slide-up">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-zinc-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3 border-b border-zinc-800">
          <h2 className="text-lg font-semibold">Comments</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
            aria-label="Close"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white rounded-full" />
            </div>
          )}

          {error && (
            <div className="text-center py-8 text-zinc-400">
              <p>{error}</p>
            </div>
          )}

          {!loading && comments.length > 0 && (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-zinc-800 rounded-xl p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-medium">
                      {comment.author.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{comment.author}</p>
                      {comment.date && (
                        <p className="text-xs text-zinc-500">{comment.date}</p>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
          )}

          {!loading && comments.length === 0 && fallbackUrl && (
            <div className="text-center py-8">
              <p className="text-zinc-400 mb-4">
                Comments are available on the original site
              </p>
              <a
                href={fallbackUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-medium rounded-full hover:bg-zinc-200 transition-colors"
              >
                View on site
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
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
