import HeatMap from './HeatMap';

interface ActivityHistoryCardProps {
  heatmapData: Array<{ date: string; count: number }>;
}

export const ActivityHistoryCard = ({ heatmapData }: ActivityHistoryCardProps) => (
  <section
    className="streaker-panel p-6 sm:p-8"
    aria-label="Activity heatmap"
  >
    <div className="mb-5 sm:mb-6">
      <h2 className="text-xl sm:text-2xl font-bold text-[#1f1b2d] tracking-[-0.01em]">
        This year
      </h2>
      <p className="mt-1 text-sm text-[#5f5477]">
        Every ticked day is a chain link. Hover a square to see the count.
      </p>
    </div>
    <HeatMap data={heatmapData} />
  </section>
);
