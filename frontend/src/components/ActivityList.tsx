import { useState } from 'react';
import { Edit2, Trash2, Save, X } from 'lucide-react';

interface ActivityListProps {
  activities: any[];
  onDeleteItem: (activityId: string, index: number) => Promise<void>;
  onUpdateItem: (activityId: string, index: number, description: string) => Promise<void>;
  isDeleting: boolean;
  isUpdating: boolean;
}

const ActivityList = ({
  activities,
  onDeleteItem,
  onUpdateItem,
  isDeleting,
  isUpdating
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

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No activities yet. Add your first activity above!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="border border-gray-600/50 rounded-xl p-4 bg-gray-700/30 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-200">
              {new Date(activity.date || activity.createdAt).toLocaleDateString()}
            </h3>
            <span className="text-sm text-gray-400">
              {activity.description?.length || 0} {activity.description?.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          <div className="space-y-2">
            {activity.description?.map((desc: string, index: number) => (
              <div key={index} className="flex items-center justify-between bg-gray-800/50 p-3 rounded-lg border border-gray-600/30">
                {isCurrentlyEditing(activity.id, index) ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter activity description..."
                      onKeyDown={(e) => e.key === 'Enter' && handleSave(activity.id, index)}
                      autoFocus
                    />
                    <button
                      onClick={() => handleSave(activity.id, index)}
                      disabled={isUpdating}
                      className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors disabled:opacity-50"
                      title="Save"
                    >
                      <Save size={16} />
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={isUpdating}
                      className="p-2 text-gray-400 hover:bg-gray-600/50 rounded-lg transition-colors disabled:opacity-50"
                      title="Cancel"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center flex-1">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      <span className="text-gray-200">{desc}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(activity.id, index, desc)}
                        disabled={isUpdating || isDeleting || editingItem !== null}
                        className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors disabled:opacity-50"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => onDeleteItem(activity.id, index)}
                        disabled={isDeleting || isUpdating || editingItem !== null}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityList;
