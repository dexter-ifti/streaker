import React, { useState } from 'react';
import { Plus, ChevronDown, RefreshCw } from 'lucide-react';

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
  return found?.color || 'neutral';
};

export const getCategoryBgClass = (category: string): string => {
  const colorMap: { [key: string]: string } = {
    neutral: 'bg-surface text-ink',
    ice: 'bg-brand-ice text-ink',
    blush: 'bg-brand-blush text-ink',
    orchid: 'bg-brand-orchid text-ink',
    punch: 'bg-brand-punch/15 text-brand-punch',
    lilac: 'bg-brand-lilac text-ink',
  };
  const color = getCategoryColor(category);
  return colorMap[color] || colorMap.neutral;
};

const dotClass = (color: string) => {
  switch (color) {
    case 'punch': return 'bg-brand-punch';
    case 'orchid': return 'bg-brand-orchid';
    case 'lilac': return 'bg-brand-lilac border border-brand-orchid';
    case 'ice': return 'bg-brand-ice';
    case 'blush': return 'bg-brand-blush border border-brand-orchid';
    default: return 'bg-surface border border-brand-orchid';
  }
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex gap-2 flex-col sm:flex-row">
        <input
          type="text"
          value={activity}
          onChange={(e) => setActivity(e.target.value)}
          placeholder="What did you do?"
          className="streaker-input flex-1"
          aria-label="Activity description"
        />
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`inline-flex items-center justify-between gap-2 min-w-[160px] px-4 py-3 rounded-xl font-medium text-sm tracking-tight border border-brand-orchid ${getCategoryBgClass(category)}`}
            aria-haspopup="listbox"
            aria-expanded={isDropdownOpen}
          >
            <span>{category}</span>
            <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>
          {isDropdownOpen && (
            <div
              className="absolute top-full mt-2 left-0 right-0 bg-surface border border-brand-orchid rounded-xl z-10 overflow-hidden"
              style={{ boxShadow: 'var(--shadow-panel-lift)' }}
              role="listbox"
            >
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => handleCategorySelect(cat.name)}
                  className={`w-full px-4 py-2.5 text-left flex items-center gap-2 hover:bg-brand-lilac transition-colors ${
                    category === cat.name ? 'bg-brand-lilac' : ''
                  }`}
                  role="option"
                  aria-selected={category === cat.name}
                >
                  <span className={`inline-block w-3 h-3 rounded-full ${dotClass(cat.color)}`} aria-hidden="true" />
                  <span className="text-ink text-sm font-medium">{cat.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="streaker-btn-primary flex-1"
        >
          <Plus size={18} aria-hidden="true" />
          <span>Add activity</span>
        </button>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="streaker-btn-secondary"
          aria-label="Refresh activities"
        >
          <RefreshCw size={18} aria-hidden="true" />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>
    </form>
  );
};

export default ActivityForm;
