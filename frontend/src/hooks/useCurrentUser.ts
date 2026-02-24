import { useState, useEffect, useCallback } from 'react';
import { useActor } from './useActor';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { User } from '../backend';

const STORAGE_KEY = 'banana_social_principal';

export function useCurrentUser() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  // Fetch the current user from the backend using the anonymous principal
  const userQuery = useQuery<User | null>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      if (!actor) return null;
      // Get the principal from the actor's agent
      try {
        const agent = (actor as any)._agent;
        if (agent) {
          const principal = await agent.getPrincipal();
          return actor.getUser(principal);
        }
        return null;
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });

  const createUserMutation = useMutation({
    mutationFn: async ({ username, avatarEmoji }: { username: string; avatarEmoji: string }) => {
      if (!actor) throw new Error('Actor not ready');
      return actor.createUser(username, avatarEmoji);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });

  return {
    currentUser: userQuery.data ?? null,
    isLoadingUser: userQuery.isLoading,
    createUser: createUserMutation.mutateAsync,
    isCreatingUser: createUserMutation.isPending,
    createUserError: createUserMutation.error,
    refetchCurrentUser: userQuery.refetch,
  };
}
