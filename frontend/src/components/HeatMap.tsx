import { useEffect, useState, useRef } from 'react';
import { format, eachDayOfInterval, startOfMonth, endOfMonth, getDay } from 'date-fns';

interface HeatMapProps {
    data: { date: string; count: number }[];
}

const HeatMap: React.FC<HeatMapProps> = ({ data }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [monthsData, setMonthsData] = useState<{ month: string; days: Date[] }[]>([]);
    const [activityMap, setActivityMap] = useState<Map<string, number>>(new Map());
    const [cellSize, setCellSize] = useState(14); // px
    const [monthsToShow, setMonthsToShow] = useState(12);

    // Compute cell size and month count from the actual container width
    useEffect(() => {
        const compute = () => {
            const width = containerRef.current?.offsetWidth ?? window.innerWidth;

            // Rough heuristics: each month column ≈ 6 cells + 1 gap
            // Cell sizes: xs=9, sm=11, md=13, lg=15
            if (width < 360) {
                setCellSize(8);
                setMonthsToShow(5);
            } else if (width < 480) {
                setCellSize(9);
                setMonthsToShow(6);
            } else if (width < 640) {
                setCellSize(10);
                setMonthsToShow(7);
            } else if (width < 768) {
                setCellSize(11);
                setMonthsToShow(8);
            } else if (width < 1024) {
                setCellSize(12);
                setMonthsToShow(10);
            } else {
                setCellSize(14);
                setMonthsToShow(12);
            }
        };

        compute();
        const observer = new ResizeObserver(compute);
        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const newMonthsData: { month: string; days: Date[] }[] = [];

        for (let i = 0; i < monthsToShow; i++) {
            const currentDate = new Date();
            currentDate.setMonth(currentDate.getMonth() - i);

            const firstDay = startOfMonth(currentDate);
            const lastDay = endOfMonth(currentDate);
            const days = eachDayOfInterval({ start: firstDay, end: lastDay });
            const monthName = format(firstDay, 'MMM');
            newMonthsData.unshift({ month: monthName, days });
        }

        setMonthsData(newMonthsData);

        const newActivityMap = new Map<string, number>();
        data.forEach(({ date, count }) => {
            newActivityMap.set(date, count);
        });
        setActivityMap(newActivityMap);
    }, [data, monthsToShow]);

    const getColorClass = (count: number): string => {
        if (count === 0) return 'bg-gray-800';
        if (count <= 2) return 'bg-green-900';
        if (count <= 4) return 'bg-green-700';
        return 'bg-green-500';
    };

    const getDayMatrix = (days: Date[]) => {
        const matrix: (Date | null)[][] = Array(7).fill(null).map(() => Array(6).fill(null));
        days.forEach(day => {
            const dayOfWeek = getDay(day);
            const firstDayOfMonthWeekday = getDay(startOfMonth(day));
            const dayOfMonth = parseInt(format(day, 'd'));
            const weekInMonth = Math.floor((dayOfMonth - 1 + firstDayOfMonthWeekday) / 7);
            matrix[dayOfWeek][weekInMonth] = day;
        });
        return matrix;
    };

    const gap = Math.max(2, Math.floor(cellSize / 6)); // proportional gap
    const cellPx = `${cellSize}px`;
    const gapPx = `${gap}px`;

    return (
        <div ref={containerRef} className="p-3 sm:p-4 bg-gray-900 rounded-lg shadow-lg text-gray-300 w-full">
            {/* Scrollable only when content truly can't fit */}
            <div className="overflow-x-auto overflow-y-hidden">
                <div className="flex" style={{ gap: gapPx }}>
                    {/* Day-of-week labels */}
                    <div
                        className="flex flex-col justify-around text-gray-500 flex-shrink-0"
                        style={{
                            fontSize: Math.max(8, cellSize - 3),
                            width: Math.max(18, cellSize * 1.8),
                            paddingTop: cellSize + gap + 4, // offset for month label
                            gap: gapPx,
                        }}
                    >
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                            <span key={i} style={{ height: cellPx, lineHeight: cellPx, display: 'block', textAlign: 'right' }}>
                                {d}
                            </span>
                        ))}
                    </div>

                    {/* Month columns */}
                    {monthsData.map((monthData, monthIdx) => {
                        const dayMatrix = getDayMatrix(monthData.days);
                        return (
                            <div key={monthIdx} className="flex flex-col flex-shrink-0">
                                {/* Month label */}
                                <div
                                    className="text-gray-400 text-center mb-1 font-medium"
                                    style={{ fontSize: Math.max(8, cellSize - 2), height: cellSize + gap }}
                                >
                                    {monthData.month}
                                </div>

                                {/* Day rows */}
                                <div className="flex flex-col" style={{ gap: gapPx }}>
                                    {Array(7).fill(0).map((_, rowIdx) => (
                                        <div key={rowIdx} className="flex" style={{ gap: gapPx }}>
                                            {Array(6).fill(0).map((_, colIdx) => {
                                                const day = dayMatrix[rowIdx][colIdx];

                                                if (!day) return (
                                                    <div
                                                        key={colIdx}
                                                        style={{ width: cellPx, height: cellPx }}
                                                        className="opacity-0 flex-shrink-0"
                                                    />
                                                );

                                                const dateStr = format(day, 'yyyy-MM-dd');
                                                const count = activityMap.get(dateStr) || 0;

                                                return (
                                                    <div
                                                        key={colIdx}
                                                        style={{ width: cellPx, height: cellPx, borderRadius: Math.max(1, cellSize / 8) }}
                                                        className={`flex-shrink-0 ${getColorClass(count)} transition-colors duration-200 hover:ring-1 hover:ring-gray-400 cursor-default`}
                                                        title={`${format(day, 'MMM d, yyyy')}: ${count} ${count === 1 ? 'activity' : 'activities'}`}
                                                    />
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="mt-3 flex items-center text-gray-500 justify-end" style={{ fontSize: Math.max(9, cellSize - 3) }}>
                <span className="mr-2">Less</span>
                <div className="flex gap-1">
                    <div className="bg-gray-800 rounded-sm" style={{ width: cellPx, height: cellPx }} />
                    <div className="bg-green-900 rounded-sm" style={{ width: cellPx, height: cellPx }} />
                    <div className="bg-green-700 rounded-sm" style={{ width: cellPx, height: cellPx }} />
                    <div className="bg-green-500 rounded-sm" style={{ width: cellPx, height: cellPx }} />
                </div>
                <span className="ml-2">More</span>
            </div>
        </div>
    );
};

export default HeatMap;