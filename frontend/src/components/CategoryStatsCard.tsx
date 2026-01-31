import React from 'react';
import { Flame, CheckCircle, ListTodo } from 'lucide-react';
import { CATEGORIES, getCategoryBgClass } from './ActivityForm';
import { CategoryStats } from '../hooks/useQueries';

interface CategoryStatsCardProps {
  stats: CategoryStats | undefined;
  isLoading: boolean;
}

const CategoryStatsCard: React.FC<CategoryStatsCardProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-gray-700/50">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-400" />
          Category Streaks
        </h3>
        <div className="animate-pulse grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-700/50 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-gray-700/50">
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <Flame className="w-5 h-5 text-orange-400" />
        Category Streaks
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {CATEGORIES.map((cat) => {
          const catStats = stats[cat.name] || { count: 0, completed: 0, streak: 0 };

          return (
            <div
              key={cat.name}
              className={`p-3 rounded-xl border ${getCategoryBgClass(cat.name)}`}
            >
              <div className="font-medium text-sm mb-2">{cat.name}</div>
              <div className="flex items-center gap-1 text-lg font-bold">
                <Flame className="w-4 h-4 text-orange-400" />
                <span>{catStats.streak}</span>
              </div>
              <div className="flex items-center gap-3 text-xs mt-1 opacity-80">
                <span className="flex items-center gap-1">
                  <ListTodo className="w-3 h-3" />
                  {catStats.count}
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  {catStats.completed}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryStatsCard;
