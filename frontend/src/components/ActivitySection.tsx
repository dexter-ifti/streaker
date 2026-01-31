import { useState, useMemo } from 'react';
import { Plus, Calendar } from 'lucide-react';
import { ActivityForm, ActivityList } from '.';
import CategoryFilter from './CategoryFilter';
import CategoryStatsCard from './CategoryStatsCard';
import { useDeleteActivityItem, useUpdateActivityItem, useToggleActivityComplete, useCategoryStats } from '../hooks/useQueries';
import { useAuth } from '../utils/auth';
import { toast } from 'react-toastify';

interface ActivitySectionProps {
  activities: any[];
  currentPage: number;
  totalPages: number;
  onSubmit: (description: string, category: string) => Promise<void>;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

export const ActivitySection = ({
  activities,
  currentPage,
  totalPages,
  onSubmit,
  onPreviousPage,
  onNextPage
}: ActivitySectionProps) => {
  const { authUser } = useAuth();
  const deleteActivityMutation = useDeleteActivityItem();
  const updateActivityMutation = useUpdateActivityItem();
  const toggleCompleteMutation = useToggleActivityComplete();
  const { data: categoryStats, isLoading: isLoadingStats } = useCategoryStats(authUser?.token || '');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Calculate category counts from activities
  const categoryCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    activities.forEach((activity) => {
      const categories = activity.category || [];
      activity.description?.forEach((_: string, index: number) => {
        const cat = categories[index] || 'General';
        counts[cat] = (counts[cat] || 0) + 1;
      });
    });
    return counts;
  }, [activities]);

  // Filter activities based on selected category
  const filteredActivities = useMemo(() => {
    if (!selectedCategory) return activities;

    return activities
      .map((activity) => {
        const categories = activity.category || [];
        const filteredIndices: number[] = [];

        activity.description?.forEach((_: string, index: number) => {
          const cat = categories[index] || 'General';
          if (cat === selectedCategory) {
            filteredIndices.push(index);
          }
        });

        if (filteredIndices.length === 0) return null;

        return {
          ...activity,
          description: filteredIndices.map((i) => activity.description[i]),
          completed: filteredIndices.map((i) => activity.completed?.[i] ?? false),
          category: filteredIndices.map((i) => categories[i] || 'General'),
          _originalIndices: filteredIndices,
        };
      })
      .filter(Boolean);
  }, [activities, selectedCategory]);

  // Get original index when filtering is active
  const getOriginalIndex = (activityId: string, filteredIndex: number): number => {
    if (!selectedCategory) return filteredIndex;

    const filteredActivity = filteredActivities.find((a: any) => a?.id === activityId);
    if (filteredActivity?._originalIndices) {
      return filteredActivity._originalIndices[filteredIndex];
    }
    return filteredIndex;
  };

  const handleDeleteActivityItem = async (activityId: string, index: number) => {
    if (!authUser?.token) {
      toast.error('Authentication required');
      return;
    }

    const originalIndex = getOriginalIndex(activityId, index);

    if (window.confirm('Are you sure you want to delete this activity item?')) {
      try {
        await deleteActivityMutation.mutateAsync({
          token: authUser.token,
          activityId,
          index: originalIndex
        });
        toast.success('Activity item deleted successfully');
      } catch (error) {
        console.error('Error deleting activity item:', error);
        toast.error('Failed to delete activity item. Please try again later.');
      }
    }
  };

  const handleUpdateActivityItem = async (activityId: string, index: number, description: string) => {
    if (!authUser?.token) {
      toast.error('Authentication required');
      return;
    }

    if (!description.trim()) {
      toast.error('Description cannot be empty');
      return;
    }

    const originalIndex = getOriginalIndex(activityId, index);

    try {
      await updateActivityMutation.mutateAsync({
        token: authUser.token,
        activityId,
        index: originalIndex,
        description: description.trim()
      });
      toast.success('Activity item updated successfully');
    } catch (error) {
      console.error('Error updating activity item:', error);
      toast.error('Failed to update activity item. Please try again later.');
    }
  };

  const handleToggleComplete = async (activityId: string, index: number) => {
    if (!authUser?.token) {
      toast.error('Authentication required');
      return;
    }

    const originalIndex = getOriginalIndex(activityId, index);

    try {
      await toggleCompleteMutation.mutateAsync({
        token: authUser.token,
        activityId,
        index: originalIndex
      });
    } catch (error) {
      console.error('Error toggling activity completion:', error);
      toast.error('Failed to update activity status. Please try again later.');
    }
  };

  return (
    <div className="space-y-6">
      <CategoryStatsCard stats={categoryStats} isLoading={isLoadingStats} />

      <div className="bg-gray-800/50 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-700/50">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 flex items-center gap-3 text-white">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-2 rounded-xl">
            <Plus className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          Today's Activities
        </h2>

        <div className="mb-8">
          <ActivityForm onSubmit={onSubmit} />
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-5 h-5 text-blue-400" />
            <h3 className="text-xl font-semibold text-white">Recent Activities</h3>
          </div>

          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
            categoryCounts={categoryCounts}
          />

          <ActivityList
            activities={filteredActivities}
            onDeleteItem={handleDeleteActivityItem}
            onUpdateItem={handleUpdateActivityItem}
            onToggleComplete={handleToggleComplete}
            isDeleting={deleteActivityMutation.isPending}
            isUpdating={updateActivityMutation.isPending}
            isToggling={toggleCompleteMutation.isPending}
          />
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8 gap-4">
            <button
              onClick={onPreviousPage}
              disabled={currentPage === 1}
              className="px-6 py-3 bg-gray-700/50 hover:bg-gray-600/50 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 border border-gray-600/50"
            >
              Previous
            </button>
            <span className="text-lg text-gray-300 bg-gray-700/30 px-4 py-2 rounded-xl">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={onNextPage}
              disabled={currentPage === totalPages}
              className="px-6 py-3 bg-gray-700/50 hover:bg-gray-600/50 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 border border-gray-600/50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};