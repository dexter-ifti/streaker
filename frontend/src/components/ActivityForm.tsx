import React, { useState } from 'react';
import { Plus, ChevronDown } from 'lucide-react';

export const CATEGORIES = [
  { name: 'General', color: 'gray' },
  { name: 'Exercise', color: 'green' },
  { name: 'Learning', color: 'blue' },
  { name: 'Work', color: 'purple' },
  { name: 'Health', color: 'red' },
  { name: 'Creative', color: 'pink' },
  { name: 'Social', color: 'yellow' },
  { name: 'Personal', color: 'indigo' },
] as const;

export type CategoryName = typeof CATEGORIES[number]['name'];

export const getCategoryColor = (category: string): string => {
  const found = CATEGORIES.find(c => c.name === category);
  return found?.color || 'gray';
};

export const getCategoryBgClass = (category: string): string => {
  const colorMap: { [key: string]: string } = {
    gray: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    green: 'bg-green-500/20 text-green-300 border-green-500/30',
    blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    red: 'bg-red-500/20 text-red-300 border-red-500/30',
    pink: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    yellow: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    indigo: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  };
  const color = getCategoryColor(category);
  return colorMap[color] || colorMap.gray;
};

interface ActivityFormProps {
  onSubmit: (activity: string, category: string) => void;
}

const ActivityForm: React.FC<ActivityFormProps> = ({ onSubmit }) => {
  const [activity, setActivity] = useState('');
  const [category, setCategory] = useState<CategoryName>('General');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activity.trim()) {
      onSubmit(activity, category);
      setActivity('');
    }
  };

  const handleCategorySelect = (categoryName: CategoryName) => {
    setCategory(categoryName);
    setIsDropdownOpen(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 flex-col">
      <div className="flex gap-2 flex-col sm:flex-row">
        <input
          type="text"
          value={activity}
          onChange={(e) => setActivity(e.target.value)}
          placeholder="What did you accomplish today?"
          className="flex-1 px-4 py-2 rounded-lg border border-gray-600 bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`px-4 py-2 rounded-lg border flex items-center gap-2 min-w-[140px] justify-between ${getCategoryBgClass(category)}`}
          >
            <span>{category}</span>
            <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {isDropdownOpen && (
            <div className="absolute top-full mt-1 left-0 right-0 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-10 overflow-hidden">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => handleCategorySelect(cat.name)}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-700 transition-colors ${
                    category === cat.name ? 'bg-gray-700' : ''
                  }`}
                >
                  <span className={`inline-block w-3 h-3 rounded-full mr-2 bg-${cat.color}-500`}></span>
                  <span className="text-gray-200">{cat.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className='flex gap-2'>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          <span>Add Activity</span>
        </button>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>Refresh</span>
        </button>
      </div>
    </form>
  );
};

export default ActivityForm;