import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    fetchStreaks,
    fetchLongestStreak,
    fetchAllActivities,
    addActivity,
    editActivityItem,
    deleteActivityItem,
    toggleActivityComplete,
    fetchCategoryStats,
    fetchCategoryStreak,
    fetchUserProfile,
    updateUserProfile,
    changePassword,
    createGoal,
    fetchGoals,
    fetchGoalById,
    updateGoal,
    deleteGoal,
    updateGoalProgress,
    fetchGoalProgress,
    fetchGoalTemplates,
    createGoalFromTemplate,
    fetchUserBadges,
    fetchAllBadges,
    checkBadges,
    Goal,
    GoalTemplate,
    GoalProgress,
    Badge,
    CreateGoalData,
    UpdateGoalData
} from '../utils/api'
import { Activity } from '@ifti_taha/streaker-common';
import { useAuth } from '../utils/auth';

// Query keys
export const queryKeys = {
  streaks: 'streaks',
  longestStreak: 'longest-streak',
  activities: 'activities',
  allActivities: 'all-activities',
  categoryStats: 'category-stats',
  categoryStreak: 'category-streak',
  goals: 'goals',
  goal: 'goal',
  goalProgress: 'goal-progress',
  goalTemplates: 'goal-templates',
  userBadges: 'user-badges',
  allBadges: 'all-badges',
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

    // NOTE: Streaks are NOT updated here anymore
    // Streaks only count when activities are marked as completed

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
    mutationFn: ({ token, description, category }: { token: string, description: string, category?: string }) =>
      addActivity(token, description, category || 'General'),
    onMutate: async ({ description, category }) => {
      // Create optimistic activity
      const now = new Date().toISOString();
      const newActivity = {
        id: `temp-${Date.now()}`,
        description,
        category: category || 'General',
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
    onError: (_err, _variables, context) => {
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
      queryClient.invalidateQueries({ queryKey: [queryKeys.categoryStats] });
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
      queryClient.invalidateQueries({ queryKey: [queryKeys.categoryStats] });
    }
  });
}

export function useToggleActivityComplete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ token, activityId, index }: { token: string, activityId: string, index: number }) =>
      toggleActivityComplete(token, activityId, index),
    onSuccess: () => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: [queryKeys.activities] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.allActivities] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.categoryStats] });
      // Recalculate streaks when completion status changes
      queryClient.invalidateQueries({ queryKey: [queryKeys.streaks] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.longestStreak] });
    }
  });
}

export interface CategoryStats {
  [category: string]: {
    count: number;
    completed: number;
    streak: number;
  };
}

export function useCategoryStats(token: string) {
  return useQuery<CategoryStats>({
    queryKey: [queryKeys.categoryStats, token],
    queryFn: () => fetchCategoryStats(token),
    enabled: !!token,
  });
}

export function useCategoryStreak(token: string, category: string) {
  return useQuery<number>({
    queryKey: [queryKeys.categoryStreak, token, category],
    queryFn: () => fetchCategoryStreak(token, category),
    enabled: !!token && !!category,
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

// Goal Queries and Mutations
export function useGoals(token: string, status?: string) {
  return useQuery<Goal[]>({
    queryKey: [queryKeys.goals, token, status],
    queryFn: () => fetchGoals(token, status),
    enabled: !!token,
  });
}

export function useGoalById(token: string, goalId: string) {
  return useQuery<Goal>({
    queryKey: [queryKeys.goal, token, goalId],
    queryFn: () => fetchGoalById(token, goalId),
    enabled: !!token && !!goalId,
  });
}

export function useGoalProgress(token: string, goalId: string) {
  return useQuery<GoalProgress[]>({
    queryKey: [queryKeys.goalProgress, token, goalId],
    queryFn: () => fetchGoalProgress(token, goalId),
    enabled: !!token && !!goalId,
  });
}

export function useGoalTemplates(token: string, category?: string) {
  return useQuery<GoalTemplate[]>({
    queryKey: [queryKeys.goalTemplates, token, category],
    queryFn: () => fetchGoalTemplates(token, category),
    enabled: !!token,
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ token, data }: { token: string, data: CreateGoalData }) =>
      createGoal(token, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.goals] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.userBadges] });
    }
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ token, goalId, data }: { token: string, goalId: string, data: UpdateGoalData }) =>
      updateGoal(token, goalId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.goals] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.goal] });
    }
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ token, goalId }: { token: string, goalId: string }) =>
      deleteGoal(token, goalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.goals] });
    }
  });
}

export function useUpdateGoalProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ token, goalId, incrementBy }: { token: string, goalId: string, incrementBy?: number }) =>
      updateGoalProgress(token, goalId, incrementBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.goals] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.goal] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.goalProgress] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.userBadges] });
    }
  });
}

export function useCreateGoalFromTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ token, templateId, startDate }: { token: string, templateId: string, startDate: string }) =>
      createGoalFromTemplate(token, templateId, startDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.goals] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.userBadges] });
    }
  });
}

// Badge Queries and Mutations
export function useUserBadges(token: string) {
  return useQuery<Badge[]>({
    queryKey: [queryKeys.userBadges, token],
    queryFn: () => fetchUserBadges(token),
    enabled: !!token,
  });
}

export function useAllBadges(token: string) {
  return useQuery<Badge[]>({
    queryKey: [queryKeys.allBadges, token],
    queryFn: () => fetchAllBadges(token),
    enabled: !!token,
  });
}

export function useCheckBadges() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ token }: { token: string }) => checkBadges(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.userBadges] });
    }
  });
}