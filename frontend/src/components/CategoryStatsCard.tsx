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
      <section className="streaker-panel p-6" aria-label="Category streaks">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-ink tracking-[-0.01em]">Category streaks</h3>
          <p className="mt-1 text-sm text-ink-muted">Loading…</p>
        </div>
        <div className="animate-pulse grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-20 bg-brand-lilac rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <section className="streaker-panel p-6" aria-label="Category streaks">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-ink tracking-[-0.01em]">Category streaks</h3>
        <p className="mt-1 text-sm text-ink-muted">Where your chains are growing.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {CATEGORIES.map((cat) => {
          const catStats = stats[cat.name] || { count: 0, completed: 0, streak: 0 };
          const isLive = catStats.streak > 0;

          return (
            <div
              key={cat.name}
              className={`p-3 rounded-xl ${getCategoryBgClass(cat.name)}`}
            >
              <div className="font-medium text-sm mb-1.5">{cat.name}</div>
              <div className="flex items-baseline gap-1.5">
                <Flame
                  className={`w-4 h-4 ${isLive ? 'text-brand-punch' : 'text-ink-muted'}`}
                  strokeWidth={2.25}
                  aria-hidden="true"
                />
                <span className="text-lg font-bold tracking-[-0.01em]">{catStats.streak}</span>
                <span className="text-xs text-ink-muted">
                  {catStats.streak === 1 ? 'day' : 'days'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs mt-2 text-ink-muted">
                <span className="flex items-center gap-1">
                  <ListTodo className="w-3 h-3" aria-hidden="true" />
                  {catStats.count}
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" aria-hidden="true" />
                  {catStats.completed}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryStatsCard;
