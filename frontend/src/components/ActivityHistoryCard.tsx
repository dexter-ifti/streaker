import { Calendar, TrendingUp, Award } from 'lucide-react';

import HeatMap from './HeatMap';

interface ActivityHistoryCardProps {
  longestStreak: number;
  currentStreak: number;
  heatmapData: Array<{ date: string; count: number }>;
}

export const ActivityHistoryCard = ({ longestStreak, currentStreak, heatmapData }: ActivityHistoryCardProps) => (
  <div className="bg-white/70 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-2xl border border-[#ebbcfc]/70">
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-6">
      <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 text-slate-900">
        <div className="bg-gradient-to-r from-[#ebbcfc] to-[#ff0061] p-2 rounded-xl">
          <Calendar className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
        </div>
        Activity History
      </h2>
      <div className="flex items-center gap-6 w-full sm:w-auto">
        <div className="flex items-center gap-3 bg-[#f9eafe]/90 px-4 py-3 rounded-xl border border-[#ebbcfc]/60">
          <Award className="w-6 h-6 text-[#ff0061]" />
          <div>
            <div className="text-sm text-slate-600">Best Streak</div>
            <div className="text-xl font-bold text-slate-900">{longestStreak} Days</div>
          </div>
        </div>
        <div className="hidden sm:block w-px h-12 bg-[#ebbcfc]" />
        <div className="flex items-center gap-3 bg-[#cadbfc]/60 px-4 py-3 rounded-xl border border-[#cadbfc]">
          <TrendingUp className="w-6 h-6 text-[#ff0061]" />
          <div>
            <div className="text-sm text-slate-600">Current</div>
            <div className="text-xl font-bold text-slate-900">{currentStreak} Days</div>
          </div>
        </div>
      </div>
    </div>
    <HeatMap data={heatmapData} />
  </div>
);
