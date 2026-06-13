import React from 'react';
import { Crown } from 'lucide-react';

interface LongestStreakProps {
  count: number;
}

const LongestStreak: React.FC<LongestStreakProps> = ({ count }) => {
  return (
    <div className="flex items-center gap-2 text-lg font-semibold text-brand-punch">
      <Crown size={24} className="text-brand-punch" />
      <span>Best Streak: {count} Days</span>
    </div>
  );
};

export default LongestStreak;
