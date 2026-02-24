import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Post, User, UserId } from '../backend';

// ─── Posts ───────────────────────────────────────────────────────────────────

export function useGetPosts(start = 0, limit = 50) {
  const { actor, isFetching } = useActor();

  return useQuery<Post[]>({
    queryKey: ['posts', start, limit],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPosts(BigInt(start), BigInt(limit));
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
  });
}

export function useCreatePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ content, image }: { content: string; image: string | null }) => {
      if (!actor) throw new Error('Actor not ready');
      return actor.createPost(content, image);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useReactToPost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: number) => {
      if (!actor) throw new Error('Actor not ready');
      return actor.reactToPost(postId);
    },
    onMutate: async (postId: number) => {
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      const previousPosts = queryClient.getQueriesData<Post[]>({ queryKey: ['posts'] });

      queryClient.setQueriesData<Post[]>({ queryKey: ['posts'] }, (old) => {
        if (!old) return old;
        return old.map((p) =>
          p.id === postId ? { ...p, bananaReactions: p.bananaReactions + BigInt(1) } : p
        );
      });

      return { previousPosts };
    },
    onError: (_err, _postId, context) => {
      if (context?.previousPosts) {
        context.previousPosts.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

// ─── Users ───────────────────────────────────────────────────────────────────

export function useGetUser(userId: UserId | null) {
  const { actor, isFetching } = useActor();

  return useQuery<User | null>({
    queryKey: ['user', userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return null;
      return actor.getUser(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useCreateUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ username, avatarEmoji }: { username: string; avatarEmoji: string }) => {
      if (!actor) throw new Error('Actor not ready');
      return actor.createUser(username, avatarEmoji);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
}

export function useFollowUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (followeeId: UserId) => {
      if (!actor) throw new Error('Actor not ready');
      return actor.followUser(followeeId);
    },
    onSuccess: (_data, followeeId) => {
      queryClient.invalidateQueries({ queryKey: ['user', followeeId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
    },
  });
}

export function useUnfollowUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (followeeId: UserId) => {
      if (!actor) throw new Error('Actor not ready');
      return actor.unfollowUser(followeeId);
    },
    onSuccess: (_data, followeeId) => {
      queryClient.invalidateQueries({ queryKey: ['user', followeeId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
    },
  });
}

export function useGetFollowing(userId: UserId | null) {
  const { actor, isFetching } = useActor();

  return useQuery<UserId[]>({
    queryKey: ['following', userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return [];
      return actor.getFollowing(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useGetFollowers(userId: UserId | null) {
  const { actor, isFetching } = useActor();

  return useQuery<UserId[]>({
    queryKey: ['followers', userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return [];
      return actor.getFollowers(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}
