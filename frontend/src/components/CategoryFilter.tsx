import React from 'react';
import { CATEGORIES, getCategoryBgClass, CategoryName } from './ActivityForm';

interface CategoryFilterProps {
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
  categoryCounts: { [key: string]: number };
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onCategorySelect,
  categoryCounts,
}) => {
  const totalCount = Object.values(categoryCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <button
        onClick={() => onCategorySelect(null)}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
          selectedCategory === null
            ? 'bg-white/20 text-white border-white/40'
            : 'bg-gray-700/30 text-gray-400 border-gray-600/30 hover:bg-gray-700/50'
        }`}
      >
        All ({totalCount})
      </button>
      {CATEGORIES.map((cat) => {
        const count = categoryCounts[cat.name] || 0;
        const isSelected = selectedCategory === cat.name;

        return (
          <button
            key={cat.name}
            onClick={() => onCategorySelect(cat.name)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
              isSelected
                ? getCategoryBgClass(cat.name).replace('/20', '/40').replace('/30', '/50')
                : `${getCategoryBgClass(cat.name)} opacity-70 hover:opacity-100`
            }`}
          >
            {cat.name} ({count})
          </button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;
