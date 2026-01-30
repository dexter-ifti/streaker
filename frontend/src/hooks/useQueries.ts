import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchStreaks, fetchLongestStreak, fetchAllActivities, addActivity, editActivityItem, deleteActivityItem, fetchUserProfile, updateUserProfile, changePassword } from '../utils/api'
import { Activity } from '@ifti_taha/streaker-common';
import { useAuth } from '../utils/auth';

// Query keys
export const queryKeys = {
  streaks: 'streaks',
  longestStreak: 'longest-streak',
  activities: 'activities',
  allActivities: 'all-activities',
}

// Helper functions for localStorage
const getLocalStorageActivities = () => {
  try {
    const cachedActivities = localStorage.getItem('cachedActivities');
    return cachedActivities ? JSON.parse(cachedActivities) : null;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
};

const updateLocalStorageActivities = (newActivity : Activity) => {
  try {
    // Get current activities
    const existingActivities = getLocalStorageActivities() || { activities: [] };

    // Add the new activity at the beginning
    const updatedActivities = {
      ...existingActivities,
      activities: [newActivity, ...existingActivities.activities]
    };

    localStorage.setItem('cachedActivities', JSON.stringify(updatedActivities));

    // Also update other stats
    const currentStreak = localStorage.getItem('currentStreak');
    if (currentStreak) {
      localStorage.setItem('currentStreak', JSON.stringify(parseInt(JSON.parse(currentStreak)) + 1));
    } else {
      localStorage.setItem('currentStreak', JSON.stringify(1));
    }

    // Update longest streak if needed
    const longestStreak = localStorage.getItem('longestStreak');
    const currentStreakValue = localStorage.getItem('currentStreak') || '0';
    const updatedCurrentStreak = parseInt(currentStreakValue);
    if (!longestStreak || updatedCurrentStreak > parseInt(JSON.parse(longestStreak))) {
      localStorage.setItem('longestStreak', JSON.stringify(updatedCurrentStreak));
    }

    return updatedActivities;
  } catch (error) {
    console.error('Error updating localStorage:', error);
    return null;
  }
};

export function useStreaks(token: string) {
  return useQuery({
    queryKey: [queryKeys.streaks, token],
    queryFn: () => fetchStreaks(token),
    enabled: !!token,
    placeholderData: () => {
      try {
        const cachedStreak = localStorage.getItem('currentStreak');
        return cachedStreak ? JSON.parse(cachedStreak) : 0;
      } catch (error) {
        return 0;
      }
    }
  })
}

export function useLongestStreak(token: string) {
  return useQuery({
    queryKey: [queryKeys.longestStreak, token],
    queryFn: () => fetchLongestStreak(token),
    enabled: !!token,
    placeholderData: () => {
      try {
        const cachedLongestStreak = localStorage.getItem('longestStreak');
        return cachedLongestStreak ? JSON.parse(cachedLongestStreak) : 0;
      } catch (error) {
        return 0;
      }
    }
  })
}

export function useAllActivities(token: string, page: number, limit: number, options?: { onSuccess?: (data: { activities: Activity[] }) => void }) {
  return useQuery({
    queryKey: [queryKeys.allActivities, token],
    queryFn: async () => {
      const data = await fetchAllActivities(token, page, limit);
      // Update localStorage with the latest data from server
      localStorage.setItem('cachedActivities', JSON.stringify(data));
      localStorage.setItem('currentStreak', JSON.stringify(await fetchStreaks(token)));
      localStorage.setItem('longestStreak', JSON.stringify(await fetchLongestStreak(token)));
      return data;
    },
    enabled: !!token,
    placeholderData: () => {
      const cachedData = getLocalStorageActivities();
      return cachedData || { activities: [] };
    },
    ...options
  })
}

export function useActivities(token: string, page: number, limit: number) {
  return useQuery({
    queryKey: [queryKeys.activities, token, page, limit],
    queryFn: () => fetchAllActivities(token, page, limit),
    enabled: !!token,
    placeholderData: (previousData) => {
      if (previousData) return previousData;

      // Get from localStorage if no previous data
      const cachedData = getLocalStorageActivities();
      if (cachedData) {
        // Simulate pagination from local cache
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedActivities = cachedData.activities.slice(startIndex, endIndex);

        return {
          activities: paginatedActivities,
          totalPages: Math.ceil(cachedData.activities.length / limit)
        };
      }

      return { activities: [], totalPages: 1 };
    }
  })
}

export function useAddActivity() {
  const queryClient = useQueryClient();
  const { authUser } = useAuth();

  return useMutation({
    mutationFn: ({ token, description }: { token: string, description: string }) =>
      addActivity(token, description),
    onMutate: async ({ description }) => {
      // Create optimistic activity
      const now = new Date().toISOString();
      const newActivity = {
        id: `temp-${Date.now()}`,
        description,
        date: new Date(now),
        createdAt: new Date(now),
        updatedAt: new Date(now),
        userId: authUser?.user.id
      };

      // Update local storage
      updateLocalStorageActivities(newActivity);

      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: [queryKeys.activities] });
      await queryClient.cancelQueries({ queryKey: [queryKeys.allActivities] });

      // Snapshot the previous value
      const previousActivities = queryClient.getQueryData([queryKeys.activities]);
      const previousAllActivities = queryClient.getQueryData([queryKeys.allActivities]);

      // Optimistically update the activities query
      queryClient.setQueryData([queryKeys.activities], (old: { activities: Activity[] } | undefined) => {
        return old ? { activities: [newActivity, ...old.activities] } : { activities: [newActivity] };
      });

      // Optimistically update the all activities query
      queryClient.setQueryData([queryKeys.allActivities], (old: { activities: Activity[] } | undefined) => {
        return old ? { activities: [newActivity, ...old.activities] } : { activities: [newActivity] };
      });

      // Return a context object with the snapshotted value
      return { previousActivities, previousAllActivities };
    },
    onError: (err, variables, context) => {
      // Rollback the optimistic updates on error
      if (context?.previousActivities) {
        queryClient.setQueryData([queryKeys.activities], context.previousActivities);
      }
      if (context?.previousAllActivities) {
        queryClient.setQueryData([queryKeys.allActivities], context.previousAllActivities);
      }
    },
    onSuccess: () => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: [queryKeys.activities] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.allActivities] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.streaks] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.longestStreak] });
    }
  });
}

export function useUpdateActivityItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ token, activityId, index, description }: { token: string, activityId: string, index: number, description: string }) =>
      editActivityItem(token, activityId, index, description),
    onSuccess: () => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: [queryKeys.activities] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.allActivities] });
    }
  });
}

export function useDeleteActivityItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ token, activityId, index }: { token: string, activityId: string, index: number }) =>
      deleteActivityItem(token, activityId, index),
    onSuccess: () => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: [queryKeys.activities] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.allActivities] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.streaks] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.longestStreak] });
    }
  });
}

export function useUser(token: string) {
  return useQuery({
    queryKey: ['user'],
    queryFn: () => fetchUserProfile(token),
    enabled: !!token,
    placeholderData: (previousData) => previousData
  })
}

interface profileDataType {
  name: string,
  username: string,
  email: string
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ token, profileData }: { token: string, profileData: profileDataType }) => {
      return updateUserProfile(token, profileData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
    }
  })
}

export function useChangePassword() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ token, oldPassword, newPassword }: { token: string, oldPassword: string, newPassword: string }) => {
      return changePassword(token, oldPassword, newPassword)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
    }
  })
}