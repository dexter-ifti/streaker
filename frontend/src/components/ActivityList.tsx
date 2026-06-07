import { useState } from 'react';
import { Edit2, Trash2, Save, X, Check } from 'lucide-react';
import { getCategoryBgClass } from './ActivityForm';

interface ActivityListProps {
  activities: any[];
  onDeleteItem: (activityId: string, index: number) => Promise<void>;
  onUpdateItem: (activityId: string, index: number, description: string) => Promise<void>;
  onToggleComplete: (activityId: string, index: number) => Promise<void>;
  isDeleting: boolean;
  isUpdating: boolean;
  isToggling: boolean;
}

const ActivityList = ({
  activities,
  onDeleteItem,
  onUpdateItem,
  onToggleComplete,
  isDeleting,
  isUpdating,
  isToggling
}: ActivityListProps) => {
  const [editingItem, setEditingItem] = useState<{ activityId: string; index: number } | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleEdit = (activityId: string, index: number, currentDescription: string) => {
    setEditingItem({ activityId, index });
    setEditValue(currentDescription);
  };

  const handleSave = async (activityId: string, index: number) => {
    if (editValue.trim()) {
      await onUpdateItem(activityId, index, editValue.trim());
      setEditingItem(null);
      setEditValue('');
    }
  };

  const handleCancel = () => {
    setEditingItem(null);
    setEditValue('');
  };

  const isCurrentlyEditing = (activityId: string, index: number) => {
    return editingItem?.activityId === activityId && editingItem?.index === index;
  };

  const isItemCompleted = (activity: any, index: number): boolean => {
    return activity.completed?.[index] ?? false;
  };

  const getItemCategory = (activity: any, index: number): string => {
    return activity.category?.[index] || 'General';
  };

  const getCompletedCount = (activity: any): number => {
    if (!activity.completed || !Array.isArray(activity.completed)) return 0;
    return activity.completed.filter((c: boolean) => c).length;
  };

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-[#5f5477] text-sm">No activities yet. Add one above to start your chain.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {activities.map((activity) => {
        const completedCount = getCompletedCount(activity);
        const totalCount = activity.description?.length || 0;

        return (
          <div key={activity.id}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-[#1f1b2d]">
                {new Date(activity.date || activity.createdAt).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </h3>
              <div className="flex items-center gap-2 text-xs text-[#5f5477]">
                {completedCount > 0 && (
                  <span className="font-medium text-[#1f1b2d]">
                    {completedCount}/{totalCount} done
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              {activity.description?.map((desc: string, index: number) => {
                const isCompleted = isItemCompleted(activity, index);
                const itemCategory = getItemCategory(activity, index);

                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                      isCompleted
                        ? 'bg-[#ff0061]/8 border-[#ff0061]/25'
                        : 'bg-white border-[#ebbcfc]/60'
                    }`}
                  >
                    {isCurrentlyEditing(activity.id, index) ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="streaker-input flex-1 py-2"
                          placeholder="Update description"
                          onKeyDown={(e) => e.key === 'Enter' && handleSave(activity.id, index)}
                          autoFocus
                        />
                        <button
                          onClick={() => handleSave(activity.id, index)}
                          disabled={isUpdating}
                          className="p-2 text-[#ff0061] hover:bg-[#feecf5] rounded-lg transition-colors disabled:opacity-50"
                          title="Save"
                          type="button"
                        >
                          <Save size={16} aria-hidden="true" />
                        </button>
                        <button
                          onClick={handleCancel}
                          disabled={isUpdating}
                          className="p-2 text-[#5f5477] hover:bg-[#f9eafe] rounded-lg transition-colors disabled:opacity-50"
                          title="Cancel"
                          type="button"
                        >
                          <X size={16} aria-hidden="true" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center flex-1 gap-3 min-w-0">
                          <button
                            onClick={() => onToggleComplete(activity.id, index)}
                            disabled={isToggling || isDeleting || isUpdating || editingItem !== null}
                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors disabled:opacity-50 flex-shrink-0 ${
                              isCompleted
                                ? 'bg-[#ff0061] border-[#ff0061] text-white'
                                : 'bg-white border-[#ebbcfc] hover:border-[#ff0061]'
                            }`}
                            title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                            type="button"
                            aria-pressed={isCompleted}
                          >
                            {isCompleted && <Check size={12} strokeWidth={3} aria-hidden="true" />}
                          </button>
                          <span
                            className={`text-sm sm:text-base truncate ${
                              isCompleted ? 'text-[#5f5477] line-through' : 'text-[#1f1b2d]'
                            }`}
                          >
                            {desc}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryBgClass(itemCategory)} flex-shrink-0`}>
                            {itemCategory}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => handleEdit(activity.id, index, desc)}
                            disabled={isUpdating || isDeleting || isToggling || editingItem !== null}
                            className="p-2 text-[#5f5477] hover:text-[#1f1b2d] hover:bg-[#f9eafe] rounded-lg transition-colors disabled:opacity-50"
                            title="Edit"
                            type="button"
                            aria-label="Edit item"
                          >
                            <Edit2 size={16} aria-hidden="true" />
                          </button>
                          <button
                            onClick={() => onDeleteItem(activity.id, index)}
                            disabled={isDeleting || isUpdating || isToggling || editingItem !== null}
                            className="p-2 text-[#5f5477] hover:text-[#ff0061] hover:bg-[#feecf5] rounded-lg transition-colors disabled:opacity-50"
                            title="Delete"
                            type="button"
                            aria-label="Delete item"
                          >
                            <Trash2 size={16} aria-hidden="true" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActivityList;
