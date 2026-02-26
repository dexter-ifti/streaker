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
        <p className="text-slate-600">No activities yet. Add your first activity above!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const completedCount = getCompletedCount(activity);
        const totalCount = activity.description?.length || 0;

        return (
          <div key={activity.id} className="border border-[#ebbcfc]/70 rounded-xl p-4 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-slate-800">
                {new Date(activity.date || activity.createdAt).toLocaleDateString()}
              </h3>
              <div className="flex items-center gap-2">
                {completedCount > 0 && (
                  <span className="text-xs px-2 py-1 bg-[#cadbfc]/60 text-slate-800 rounded-full border border-[#cadbfc]">
                    {completedCount}/{totalCount} done
                  </span>
                )}
                <span className="text-sm text-slate-600">
                  {totalCount} {totalCount === 1 ? 'item' : 'items'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {activity.description?.map((desc: string, index: number) => {
                const isCompleted = isItemCompleted(activity, index);
                const itemCategory = getItemCategory(activity, index);

                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                      isCompleted
                        ? 'bg-[#cadbfc]/45 border-[#cadbfc]'
                        : 'bg-[#f9eafe]/55 border-[#ebbcfc]/60'
                    }`}
                  >
                    {isCurrentlyEditing(activity.id, index) ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="flex-1 px-3 py-2 bg-white border border-[#ebbcfc] rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#ff0061] focus:border-transparent"
                          placeholder="Enter activity description..."
                          onKeyDown={(e) => e.key === 'Enter' && handleSave(activity.id, index)}
                          autoFocus
                        />
                        <button
                          onClick={() => handleSave(activity.id, index)}
                          disabled={isUpdating}
                          className="p-2 text-[#ff0061] hover:bg-[#feecf5] rounded-lg transition-colors disabled:opacity-50"
                          title="Save"
                        >
                          <Save size={16} />
                        </button>
                        <button
                          onClick={handleCancel}
                          disabled={isUpdating}
                          className="p-2 text-slate-500 hover:bg-[#f9eafe] rounded-lg transition-colors disabled:opacity-50"
                          title="Cancel"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center flex-1 gap-3">
                          <button
                            onClick={() => onToggleComplete(activity.id, index)}
                            disabled={isToggling || isDeleting || isUpdating || editingItem !== null}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 disabled:opacity-50 flex-shrink-0 ${
                              isCompleted
                                ? 'bg-[#ff0061] border-[#ff0061] text-white'
                                : 'border-[#ebbcfc] hover:border-[#ff0061]'
                            }`}
                            title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                          >
                            {isCompleted && <Check size={12} strokeWidth={3} />}
                          </button>
                          <span
                            className={`transition-all duration-200 ${
                              isCompleted
                                ? 'text-slate-500 line-through'
                                : 'text-slate-800'
                            }`}
                          >
                            {desc}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${getCategoryBgClass(itemCategory)}`}>
                            {itemCategory}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleEdit(activity.id, index, desc)}
                            disabled={isUpdating || isDeleting || isToggling || editingItem !== null}
                            className="p-2 text-[#ff0061] hover:bg-[#feecf5] rounded-lg transition-colors disabled:opacity-50"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => onDeleteItem(activity.id, index)}
                            disabled={isDeleting || isUpdating || isToggling || editingItem !== null}
                            className="p-2 text-[#ff0061] hover:bg-[#feecf5] rounded-lg transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 size={16} />
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
