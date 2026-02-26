import React, { useState } from 'react';
import { Plus, ChevronDown } from 'lucide-react';

export const CATEGORIES = [
  { name: 'General', color: 'neutral' },
  { name: 'Exercise', color: 'ice' },
  { name: 'Learning', color: 'blush' },
  { name: 'Work', color: 'orchid' },
  { name: 'Health', color: 'punch' },
  { name: 'Creative', color: 'lilac' },
  { name: 'Social', color: 'ice' },
  { name: 'Personal', color: 'blush' },
] as const;

export type CategoryName = typeof CATEGORIES[number]['name'];

export const getCategoryColor = (category: string): string => {
  const found = CATEGORIES.find(c => c.name === category);
  return found?.color || 'gray';
};

export const getCategoryBgClass = (category: string): string => {
  const colorMap: { [key: string]: string } = {
    neutral: 'bg-white/70 text-slate-700 border-[#ebbcfc]/70',
    ice: 'bg-[#cadbfc]/55 text-slate-800 border-[#cadbfc]',
    blush: 'bg-[#feecf5]/80 text-slate-800 border-[#feecf5]',
    orchid: 'bg-[#ebbcfc]/65 text-slate-800 border-[#ebbcfc]',
    punch: 'bg-[#ff0061]/15 text-[#ff0061] border-[#ff0061]/40',
    lilac: 'bg-[#f9eafe]/85 text-slate-800 border-[#f9eafe]',
  };
  const color = getCategoryColor(category);
  return colorMap[color] || colorMap.neutral;
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
          className="flex-1 px-4 py-2 rounded-lg border border-[#ebbcfc] bg-white/90 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#ff0061]"
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
            <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-[#ebbcfc] rounded-lg shadow-xl z-10 overflow-hidden">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => handleCategorySelect(cat.name)}
                  className={`w-full px-4 py-2 text-left hover:bg-[#f9eafe] transition-colors ${
                    category === cat.name ? 'bg-[#f9eafe]' : ''
                  }`}
                >
                  <span
                    className={`inline-block w-3 h-3 rounded-full mr-2 ${
                      cat.color === 'punch'
                        ? 'bg-[#ff0061]'
                        : cat.color === 'orchid'
                          ? 'bg-[#ebbcfc]'
                          : cat.color === 'lilac'
                            ? 'bg-[#f9eafe] border border-[#ebbcfc]'
                            : cat.color === 'ice'
                              ? 'bg-[#cadbfc]'
                              : cat.color === 'blush'
                                ? 'bg-[#feecf5] border border-[#ebbcfc]'
                                : 'bg-white border border-[#ebbcfc]'
                    }`}
                  />
                  <span className="text-slate-700">{cat.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className='flex gap-2'>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-gradient-to-r from-[#ebbcfc] to-[#ff0061] text-white rounded-lg hover:from-[#cadbfc] hover:to-[#ff0061] focus:outline-none focus:ring-2 focus:ring-[#ff0061] flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          <span>Add Activity</span>
        </button>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[#cadbfc] text-slate-800 rounded-lg hover:bg-[#ebbcfc] focus:outline-none focus:ring-2 focus:ring-[#ff0061] flex items-center justify-center gap-2"
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
