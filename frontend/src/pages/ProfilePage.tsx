import { useEffect, useState } from 'react';
import { useParams, Link } from '@tanstack/react-router';
import { useGetUser, useGetPosts, useFollowUser, useUnfollowUser, useGetFollowing } from '../hooks/useQueries';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useActor } from '../hooks/useActor';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import PostCard from '../components/PostCard';
import { Loader2, UserPlus, UserMinus } from 'lucide-react';
import type { UserId } from '../backend';
import { Principal } from '@dfinity/principal';

export default function ProfilePage() {
  const { userId } = useParams({ from: '/profile/$userId' });
  const { actor } = useActor();
  const { currentUser } = useCurrentUser();
  const [currentPrincipalStr, setCurrentPrincipalStr] = useState<string | null>(null);

  // Parse the userId param as a Principal
  let targetPrincipal: UserId | null = null;
  try {
    targetPrincipal = Principal.fromText(userId);
  } catch {
    // invalid principal
  }

  const userQuery = useGetUser(targetPrincipal);
  const postsQuery = useGetPosts(0, 100);
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  // Get current user's following list
  let currentPrincipal: UserId | null = null;
  try {
    if (currentPrincipalStr) currentPrincipal = Principal.fromText(currentPrincipalStr);
  } catch {}

  const followingQuery = useGetFollowing(currentPrincipal);

  useEffect(() => {
    if (!actor) return;
    const fetchPrincipal = async () => {
      try {
        const agent = (actor as any)._agent;
        if (agent) {
          const principal = await agent.getPrincipal();
          setCurrentPrincipalStr(principal.toString());
        }
      } catch {}
    };
    fetchPrincipal();
  }, [actor]);

  const profileUser = userQuery.data ?? null;
  const allPosts = postsQuery.data ?? [];

  // Filter posts by this user
  const userPosts = allPosts.filter((p) => p.authorId.toString() === userId);

  const isOwnProfile = currentPrincipalStr === userId;
  const isFollowing = followingQuery.data?.some((id) => id.toString() === userId) ?? false;
  const isFollowLoading = followMutation.isPending || unfollowMutation.isPending;

  const handleFollowToggle = async () => {
    if (!targetPrincipal) return;
    if (isFollowing) {
      await unfollowMutation.mutateAsync(targetPrincipal);
    } else {
      await followMutation.mutateAsync(targetPrincipal);
    }
  };

  if (userQuery.isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-card border border-banana/15 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="w-20 h-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-5xl mb-4">🍌</p>
        <h2 className="font-display font-bold text-xl text-banana-dark mb-2">User not found</h2>
        <p className="text-muted-foreground mb-6">This banana hasn't joined yet!</p>
        <Link to="/feed">
          <Button className="rounded-full bg-banana text-banana-dark font-bold hover:bg-banana-dark hover:text-banana-light">
            Back to Feed
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      {/* Profile Card */}
      <div className="bg-card border border-banana/20 rounded-2xl overflow-hidden shadow-card">
        {/* Banner strip */}
        <div className="h-24 bg-gradient-to-r from-banana/60 via-banana to-banana-light/80 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center opacity-20 text-6xl select-none">
            🍌🍌🍌🍌🍌🍌🍌🍌
          </div>
        </div>

        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className="w-20 h-20 rounded-full bg-banana/30 border-4 border-card flex items-center justify-center text-4xl shadow-md">
              {profileUser.avatarEmoji}
            </div>

            {!isOwnProfile && currentUser && (
              <Button
                onClick={handleFollowToggle}
                disabled={isFollowLoading}
                size="sm"
                className={`rounded-full font-bold px-5 transition-colors ${
                  isFollowing
                    ? 'bg-muted text-foreground hover:bg-destructive/10 hover:text-destructive border border-border'
                    : 'bg-banana text-banana-dark hover:bg-banana-dark hover:text-banana-light'
                }`}
              >
                {isFollowLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : isFollowing ? (
                  <>
                    <UserMinus size={14} className="mr-1.5" />
                    Unfollow
                  </>
                ) : (
                  <>
                    <UserPlus size={14} className="mr-1.5" />
                    Follow
                  </>
                )}
              </Button>
            )}

            {isOwnProfile && (
              <span className="text-xs font-semibold text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
                Your Profile
              </span>
            )}
          </div>

          {/* Info */}
          <div>
            <h1 className="font-display font-extrabold text-2xl text-foreground">
              {profileUser.username}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5 font-mono truncate">
              {userId.slice(0, 20)}...
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-4">
            <div className="text-center">
              <p className="font-extrabold text-xl text-banana-dark">
                {profileUser.followersCount.toString()}
              </p>
              <p className="text-xs text-muted-foreground font-medium">Followers</p>
            </div>
            <div className="text-center">
              <p className="font-extrabold text-xl text-banana-dark">
                {profileUser.followingCount.toString()}
              </p>
              <p className="text-xs text-muted-foreground font-medium">Following</p>
            </div>
            <div className="text-center">
              <p className="font-extrabold text-xl text-banana-dark">{userPosts.length}</p>
              <p className="text-xs text-muted-foreground font-medium">Posts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-3">
        <h2 className="font-display font-bold text-lg text-foreground px-1">Posts</h2>

        {postsQuery.isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-card border border-banana/15 rounded-2xl p-4 space-y-3">
                <div className="flex gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : userPosts.length === 0 ? (
          <div className="text-center py-12 bg-card border border-banana/15 rounded-2xl">
            <p className="text-4xl mb-3">🍌</p>
            <p className="text-muted-foreground font-medium">No posts yet!</p>
          </div>
        ) : (
          userPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              author={profileUser}
              onReact={(postId) => {}}
              isReacting={false}
            />
          ))
        )}
      </div>
    </div>
  );
}
