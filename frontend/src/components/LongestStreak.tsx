import React from 'react';
import { Crown } from 'lucide-react';

interface LongestStreakProps {
  count: number;
}

const LongestStreak: React.FC<LongestStreakProps> = ({ count }) => {
  return (
    <div className="flex items-center gap-2 text-lg font-semibold text-[#ff0061]">
      <Crown size={24} className="text-[#ff0061]" />
      <span>Best Streak: {count} Days</span>
    </div>
  );
};

export default LongestStreak;
