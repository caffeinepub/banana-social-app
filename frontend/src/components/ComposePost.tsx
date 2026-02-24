import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import type { User } from '../backend';

const MAX_CHARS = 280;

interface ComposePostProps {
  currentUser: User | null;
  onPost: (content: string) => Promise<void>;
  isPosting: boolean;
}

export default function ComposePost({ currentUser, onPost, isPosting }: ComposePostProps) {
  const [content, setContent] = useState('');

  const remaining = MAX_CHARS - content.length;
  const isOverLimit = remaining < 0;
  const isEmpty = content.trim().length === 0;
  const canSubmit = !isEmpty && !isOverLimit && !isPosting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    await onPost(content.trim());
    setContent('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && canSubmit) {
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="bg-card border border-banana/20 rounded-2xl p-4 shadow-card">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-banana/30 flex items-center justify-center text-xl">
          {currentUser?.avatarEmoji ?? '🍌'}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 space-y-3">
          <Textarea
            placeholder={
              currentUser
                ? `What's going bananas, ${currentUser.username}? 🍌`
                : "What's going bananas? 🍌"
            }
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isPosting}
            className="resize-none border-0 border-b border-banana/20 rounded-none bg-transparent focus-visible:ring-0 focus-visible:border-banana text-base placeholder:text-muted-foreground/60 min-h-[80px] px-0"
          />

          <div className="flex items-center justify-between">
            {/* Character counter */}
            <span
              className={`text-sm font-medium tabular-nums ${
                isOverLimit
                  ? 'text-destructive'
                  : remaining <= 20
                  ? 'text-amber-600'
                  : 'text-muted-foreground'
              }`}
            >
              {remaining}
            </span>

            <Button
              type="submit"
              disabled={!canSubmit}
              size="sm"
              className="rounded-full px-5 bg-banana text-banana-dark font-bold hover:bg-banana-dark hover:text-banana-light transition-colors disabled:opacity-50"
            >
              {isPosting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <>🍌 Post</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
