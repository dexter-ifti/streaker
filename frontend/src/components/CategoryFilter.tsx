import React from 'react';
import { CATEGORIES, getCategoryBgClass } from './ActivityForm';

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

  const baseChip = 'px-3 py-1.5 rounded-full text-xs font-medium tracking-tight transition-colors border-2';
  const activeBorder = 'border-[#ebbcfc]';
  const inactiveBorder = 'border-transparent';

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter activities by category">
      <button
        onClick={() => onCategorySelect(null)}
        className={`${baseChip} bg-[#f9eafe] text-[#1f1b2d] ${
          selectedCategory === null ? activeBorder : inactiveBorder
        }`}
        aria-pressed={selectedCategory === null}
        type="button"
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
            className={`${baseChip} ${getCategoryBgClass(cat.name)} ${
              isSelected ? activeBorder : inactiveBorder
            }`}
            aria-pressed={isSelected}
            type="button"
          >
            {cat.name} ({count})
          </button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;
