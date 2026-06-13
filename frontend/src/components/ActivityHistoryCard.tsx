import { useMemo } from 'react';
import { format, isSameDay } from 'date-fns';
import HeatMap from './HeatMap';

interface ActivityHistoryCardProps {
  heatmapData: Array<{ date: string; count: number; loggedCount?: number }>;
}

const DAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export const ActivityHistoryCard = ({ heatmapData }: ActivityHistoryCardProps) => {
  const metrics = useMemo(() => {
    const now = new Date();
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const totalDaysInWindow = Math.max(
      1,
      Math.ceil((now.getTime() - oneYearAgo.getTime()) / 86_400_000)
    );

    const inWindow = heatmapData.filter((d) => {
      const date = new Date(d.date);
      return date >= oneYearAgo && date <= now;
    });

    const totalActiveDays = inWindow.length;
    const activityRate = Math.round((totalActiveDays / totalDaysInWindow) * 100);
    const activeMonths = new Set(inWindow.map((d) => d.date.slice(0, 7))).size;

    const day = now.getDay();
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - day);
    sunday.setHours(0, 0, 0, 0);

    const byDate = new Map(
      inWindow.map((d) => [d.date, { count: d.count, loggedCount: d.loggedCount ?? d.count }])
    );

    const thisWeek = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const entry = byDate.get(dateStr);
      return {
        date: d,
        count: entry?.count ?? 0,
        loggedCount: entry?.loggedCount ?? 0,
        isFuture: d > now && !isSameDay(d, now),
        isToday: isSameDay(d, now),
      };
    });

    const weekDone = thisWeek.filter((d) => d.count > 0).length;

    return { totalActiveDays, activityRate, activeMonths, thisWeek, weekDone };
  }, [heatmapData]);

  return (
    <section
      className="streaker-panel p-6 sm:p-8"
      aria-label="Activity heatmap"
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5 mb-6">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-[#1f1b2d] tracking-[-0.01em]">
            Past 12 months
          </h2>
          <p className="mt-2 text-sm text-[#5f5477] flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span>
              <span className="text-[#1f1b2d] font-semibold tabular-nums">
                {metrics.totalActiveDays}
              </span>{' '}
              active days
            </span>
            <span className="text-[#ebbcfc]" aria-hidden="true">·</span>
            <span>
              <span className="text-[#1f1b2d] font-semibold tabular-nums">
                {metrics.activityRate}%
              </span>{' '}
              of days
            </span>
            <span className="text-[#ebbcfc]" aria-hidden="true">·</span>
            <span>
              active in{' '}
              <span className="text-[#1f1b2d] font-semibold tabular-nums">
                {metrics.activeMonths}
              </span>{' '}
              months
            </span>
          </p>
        </div>

        <div
          className="flex-shrink-0"
          aria-label={`This week: ${metrics.weekDone} of 7 days logged`}
        >
          <div className="flex items-center justify-between sm:justify-end gap-2 mb-2">
            <span className="text-xs font-medium text-[#5f5477]">This week</span>
            <span className="text-xs tabular-nums text-[#1f1b2d] font-semibold">
              {metrics.weekDone}<span className="text-[#5f5477] font-normal">/7</span>
            </span>
          </div>
          <div className="flex gap-1.5" aria-hidden="true">
            {metrics.thisWeek.map((d, i) => {
              const done = d.count > 0;
              const pending = !done && d.loggedCount > 0;
              let cellClass: string;
              if (done) {
                cellClass = 'bg-[#ff0061]';
              } else if (pending) {
                cellClass = 'bg-[#ebbcfc]';
              } else if (d.isFuture) {
                cellClass = 'bg-[#f9eafe]';
              } else {
                cellClass = 'bg-transparent border-2 border-dashed border-[#ebbcfc]';
              }
              let titleSuffix: string;
              if (d.isFuture) {
                titleSuffix = ' (upcoming)';
              } else if (done) {
                titleSuffix = `: ${d.count} done${d.loggedCount > d.count ? `, ${d.loggedCount - d.count} pending` : ''}`;
              } else if (pending) {
                titleSuffix = `: ${d.loggedCount} logged, nothing done yet`;
              } else {
                titleSuffix = ': nothing logged';
              }
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-6 h-6 rounded-md ${cellClass} ${
                      d.isToday ? 'ring-2 ring-[#ff0061]/45 ring-offset-1 ring-offset-white' : ''
                    }`}
                    title={`${format(d.date, 'EEE, MMM d')}${titleSuffix}`}
                  />
                  <span className="text-[10px] text-[#5f5477] tabular-nums">
                    {DAY_INITIALS[i]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <HeatMap data={heatmapData} />
    </section>
  );
};
