import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

const AVATAR_EMOJIS = ['🐵', '🦊', '🐸', '🐼', '🦁', '🐯', '🐨', '🐻', '🦝', '🐺', '🦄', '🐙'];

interface CreateProfileModalProps {
  open: boolean;
  onSuccess: () => void;
  createUser: (args: { username: string; avatarEmoji: string }) => Promise<void>;
  isCreating: boolean;
  error: Error | null;
}

export default function CreateProfileModal({
  open,
  onSuccess,
  createUser,
  isCreating,
  error,
}: CreateProfileModalProps) {
  const [username, setUsername] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState(AVATAR_EMOJIS[0]);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) {
      setLocalError('Please enter a username');
      return;
    }
    if (trimmed.length < 2) {
      setLocalError('Username must be at least 2 characters');
      return;
    }
    if (trimmed.length > 30) {
      setLocalError('Username must be 30 characters or less');
      return;
    }
    setLocalError('');
    try {
      await createUser({ username: trimmed, avatarEmoji: selectedEmoji });
      onSuccess();
    } catch (err) {
      // error handled by parent
    }
  };

  const displayError = localError || (error ? 'Failed to create profile. Please try again.' : '');

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md bg-card border-banana/30 rounded-2xl"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex justify-center mb-2">
            <span className="text-5xl">🍌</span>
          </div>
          <DialogTitle className="text-center font-display text-2xl text-banana-dark">
            Welcome to BananaSocial!
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Create your profile to start posting and reacting.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          <div className="space-y-2">
            <Label htmlFor="username" className="font-semibold text-foreground">
              Username
            </Label>
            <Input
              id="username"
              placeholder="e.g. BananaKing"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={30}
              className="rounded-xl border-banana/40 focus:border-banana focus:ring-banana/30"
              disabled={isCreating}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label className="font-semibold text-foreground">Pick your avatar</Label>
            <div className="grid grid-cols-6 gap-2">
              {AVATAR_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`text-2xl p-2 rounded-xl transition-all duration-150 ${
                    selectedEmoji === emoji
                      ? 'bg-banana shadow-md scale-110'
                      : 'bg-muted hover:bg-banana/30'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {displayError && (
            <p className="text-sm text-destructive font-medium">{displayError}</p>
          )}

          <Button
            type="submit"
            disabled={isCreating || !username.trim()}
            className="w-full rounded-xl bg-banana text-banana-dark font-bold text-base hover:bg-banana-dark hover:text-banana-light transition-colors"
          >
            {isCreating ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                Creating...
              </>
            ) : (
              <>🍌 Let's Go Bananas!</>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
