import { useState, useEffect } from 'react';
import { useGetPosts, useCreatePost, useReactToPost, useGetUser } from '../hooks/useQueries';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useActor } from '../hooks/useActor';
import ComposePost from '../components/ComposePost';
import PostCard from '../components/PostCard';
import CreateProfileModal from '../components/CreateProfileModal';
import { Skeleton } from '@/components/ui/skeleton';
import type { Post, User, UserId } from '../backend';
import { useQueryClient } from '@tanstack/react-query';

// Hook to fetch multiple users at once
function usePostAuthors(posts: Post[]) {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  const [authors, setAuthors] = useState<Map<string, User | null>>(new Map());

  useEffect(() => {
    if (!actor || isFetching || posts.length === 0) return;

    const uniqueAuthorIds = [...new Set(posts.map((p) => p.authorId.toString()))];

    const fetchAuthors = async () => {
      const newAuthors = new Map<string, User | null>();
      await Promise.all(
        uniqueAuthorIds.map(async (idStr) => {
          const post = posts.find((p) => p.authorId.toString() === idStr);
          if (!post) return;
          try {
            const user = await actor.getUser(post.authorId);
            newAuthors.set(idStr, user);
          } catch {
            newAuthors.set(idStr, null);
          }
        })
      );
      setAuthors(newAuthors);
    };

    fetchAuthors();
  }, [actor, isFetching, posts]);

  return authors;
}

export default function FeedPage() {
  const { currentUser, isLoadingUser, createUser, isCreatingUser, createUserError } = useCurrentUser();
  const { actor } = useActor();
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [principalStr, setPrincipalStr] = useState<string | null>(null);

  const postsQuery = useGetPosts(0, 50);
  const createPostMutation = useCreatePost();
  const reactMutation = useReactToPost();

  const posts = postsQuery.data ?? [];
  const authors = usePostAuthors(posts);

  // Determine principal
  useEffect(() => {
    if (!actor) return;
    const fetchPrincipal = async () => {
      try {
        const agent = (actor as any)._agent;
        if (agent) {
          const principal = await agent.getPrincipal();
          setPrincipalStr(principal.toString());
        }
      } catch {
        // ignore
      }
    };
    fetchPrincipal();
  }, [actor]);

  // Show create profile modal if user doesn't exist yet
  useEffect(() => {
    if (!isLoadingUser && currentUser === null && principalStr !== null) {
      setShowCreateProfile(true);
    } else if (currentUser !== null) {
      setShowCreateProfile(false);
    }
  }, [isLoadingUser, currentUser, principalStr]);

  const handlePost = async (content: string) => {
    await createPostMutation.mutateAsync(content);
  };

  const handleReact = (postId: number) => {
    reactMutation.mutate(postId);
  };

  return (
    <>
      <CreateProfileModal
        open={showCreateProfile}
        onSuccess={() => setShowCreateProfile(false)}
        createUser={createUser}
        isCreating={isCreatingUser}
        error={createUserError as Error | null}
      />

      {/* Banner */}
      <div className="w-full h-36 sm:h-48 overflow-hidden relative">
        <img
          src="/assets/generated/feed-banner.dim_1200x300.png"
          alt="Banana Social Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/60" />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-banana-dark drop-shadow-sm">
            🍌 The Banana Feed
          </h1>
          <p className="text-sm text-banana-dark/80 font-medium">Go bananas with the world!</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Compose */}
        {currentUser && (
          <ComposePost
            currentUser={currentUser}
            onPost={handlePost}
            isPosting={createPostMutation.isPending}
          />
        )}

        {/* Feed */}
        {postsQuery.isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card border border-banana/15 rounded-2xl p-4 space-y-3">
                <div className="flex gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : postsQuery.isError ? (
          <div className="text-center py-12">
            <p className="text-2xl mb-2">😵</p>
            <p className="text-muted-foreground">Failed to load posts. Please try again.</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🍌</p>
            <h2 className="font-display font-bold text-xl text-banana-dark mb-2">
              No posts yet!
            </h2>
            <p className="text-muted-foreground">
              Be the first to go bananas. Create a post above!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                author={authors.get(post.authorId.toString())}
                onReact={handleReact}
                isReacting={reactMutation.isPending && reactMutation.variables === post.id}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
