import { Calendar, TrendingUp, Award } from 'lucide-react';
import { LongestStreak, StreakCounter } from '.';
import HeatMap from './HeatMap';

interface ActivityHistoryCardProps {
  longestStreak: number;
  currentStreak: number;
  heatmapData: Array<{ date: string; count: number }>;
}

export const ActivityHistoryCard = ({ longestStreak, currentStreak, heatmapData }: ActivityHistoryCardProps) => (
  <div className="bg-gray-800/50 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-700/50">
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-6">
      <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 text-white">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
          <Calendar className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
        </div>
        Activity History
      </h2>
      <div className="flex items-center gap-6 w-full sm:w-auto">
        <div className="flex items-center gap-3 bg-purple-500/20 px-4 py-3 rounded-xl border border-purple-500/30">
          <Award className="w-6 h-6 text-purple-400" />
          <div>
            <div className="text-sm text-purple-300">Best Streak</div>
            <div className="text-xl font-bold text-purple-400">{longestStreak} Days</div>
          </div>
        </div>
        <div className="hidden sm:block w-px h-12 bg-gray-600" />
        <div className="flex items-center gap-3 bg-orange-500/20 px-4 py-3 rounded-xl border border-orange-500/30">
          <TrendingUp className="w-6 h-6 text-orange-400" />
          <div>
            <div className="text-sm text-orange-300">Current</div>
            <div className="text-xl font-bold text-orange-400">{currentStreak} Days</div>
          </div>
        </div>
      </div>
    </div>
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <div className="min-w-fit px-4 sm:px-0">
        <HeatMap data={heatmapData} />
      </div>
    </div>
  </div>
);