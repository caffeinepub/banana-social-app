import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import type { Post, User } from '../backend';

interface PostCardProps {
  post: Post;
  author: User | null | undefined;
  onReact: (postId: number) => void;
  isReacting: boolean;
}

function formatTimestamp(timestamp: bigint): string {
  const ms = Number(timestamp / BigInt(1_000_000));
  const date = new Date(ms);
  const now = Date.now();
  const diff = now - ms;

  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 604_800_000) return `${Math.floor(diff / 86_400_000)}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function PostCard({ post, author, onReact, isReacting }: PostCardProps) {
  const [justReacted, setJustReacted] = useState(false);

  const handleReact = () => {
    if (isReacting) return;
    setJustReacted(true);
    onReact(post.id);
    setTimeout(() => setJustReacted(false), 600);
  };

  const authorId = post.authorId.toString();

  return (
    <article className="bg-card border border-banana/15 rounded-2xl p-4 shadow-card hover:shadow-card-hover transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link
          to="/profile/$userId"
          params={{ userId: authorId }}
          className="flex-shrink-0 w-10 h-10 rounded-full bg-banana/25 flex items-center justify-center text-xl hover:bg-banana/40 transition-colors"
        >
          {author?.avatarEmoji ?? '🍌'}
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <Link
              to="/profile/$userId"
              params={{ userId: authorId }}
              className="font-bold text-foreground hover:text-banana-dark transition-colors truncate"
            >
              {author?.username ?? 'Anonymous Banana'}
            </Link>
            <span className="text-xs text-muted-foreground flex-shrink-0">
              {formatTimestamp(post.timestamp)}
            </span>
          </div>

          {/* Content */}
          {post.content && (
            <p className="mt-1.5 text-foreground leading-relaxed whitespace-pre-wrap break-words">
              {post.content}
            </p>
          )}

          {/* Image */}
          {post.image && (
            <div className="mt-2">
              <img
                src={`data:image/jpeg;base64,${post.image}`}
                alt="Post image"
                className="max-w-full rounded-xl border border-banana/15 object-cover"
                style={{ maxHeight: '400px' }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center gap-4 pl-13">
        <button
          onClick={handleReact}
          disabled={isReacting}
          className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full transition-all duration-150 ${
            justReacted
              ? 'bg-banana text-banana-dark scale-110'
              : 'text-muted-foreground hover:bg-banana/20 hover:text-banana-dark'
          }`}
          aria-label="React with banana"
        >
          <span className={`text-base transition-transform ${justReacted ? 'scale-125' : ''}`}>
            🍌
          </span>
          <span>{post.bananaReactions.toString()}</span>
        </button>
      </div>
    </article>
  );
}
