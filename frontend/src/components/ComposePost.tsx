import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ImagePlus, X } from 'lucide-react';
import type { User } from '../backend';

const MAX_CHARS = 280;
const MAX_IMAGE_BYTES = 1 * 1024 * 1024; // 1 MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

interface ComposePostProps {
  currentUser: User | null;
  onPost: (content: string, image: string | null) => Promise<void>;
  isPosting: boolean;
}

export default function ComposePost({ currentUser, onPost, isPosting }: ComposePostProps) {
  const [content, setContent] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const remaining = MAX_CHARS - content.length;
  const isOverLimit = remaining < 0;
  const isEmpty = content.trim().length === 0 && !imageBase64;
  const canSubmit = !isEmpty && !isOverLimit && !isPosting;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setImageError('Only JPEG, PNG, GIF, or WebP images are supported.');
      e.target.value = '';
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setImageError('Image must be smaller than 1 MB.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      // result is "data:image/png;base64,XXXX..." — extract just the base64 part
      const base64 = result.split(',')[1];
      setImageBase64(base64);
      setImagePreview(result); // keep full data URL for preview
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageBase64(null);
    setImageError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    await onPost(content.trim(), imageBase64);
    setContent('');
    setImagePreview(null);
    setImageBase64(null);
    setImageError(null);
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

          {/* Image preview */}
          {imagePreview && (
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Attachment preview"
                className="max-h-48 max-w-full rounded-xl border border-banana/20 object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-1.5 right-1.5 bg-background/80 hover:bg-background text-foreground rounded-full p-0.5 transition-colors shadow"
                aria-label="Remove image"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Image error */}
          {imageError && (
            <p className="text-sm text-destructive font-medium">{imageError}</p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
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

              {/* Image attach button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isPosting}
                className="p-1.5 rounded-full text-muted-foreground hover:text-banana-dark hover:bg-banana/20 transition-colors disabled:opacity-50"
                aria-label="Attach image"
              >
                <ImagePlus size={18} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>

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
