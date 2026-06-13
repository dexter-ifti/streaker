import { useEffect, useState, useRef, useMemo } from 'react';
import { format } from 'date-fns';

interface HeatMapProps {
    data: { date: string; count: number }[];
}

interface DayCell {
    date: Date;
    dateStr: string;
    isToday: boolean;
}

const DAY_ROW_LABELS: Record<number, string> = { 1: 'Mon', 3: 'Wed', 5: 'Fri' };
const LABEL_WIDTH = 32;

const HeatMap: React.FC<HeatMapProps> = ({ data }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [cellSize, setCellSize] = useState(14);
    const [weeksToShow, setWeeksToShow] = useState(53);

    useEffect(() => {
        const compute = () => {
            const width = containerRef.current?.offsetWidth ?? 800;
            let weeks: number;
            if (width < 360) weeks = 22;
            else if (width < 480) weeks = 28;
            else if (width < 640) weeks = 36;
            else if (width < 768) weeks = 44;
            else weeks = 53;

            const gap = 3;
            const available = width - LABEL_WIDTH - (weeks - 1) * gap - 4;
            const cell = Math.max(9, Math.min(18, Math.floor(available / weeks)));

            setWeeksToShow(weeks);
            setCellSize(cell);
        };

        compute();
        const observer = new ResizeObserver(compute);
        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    const activityMap = useMemo(() => {
        const m = new Map<string, number>();
        data.forEach(({ date, count }) => m.set(date, count));
        return m;
    }, [data]);

    const { weeks, monthLabels } = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayMs = today.getTime();

        const currentSunday = new Date(today);
        currentSunday.setDate(today.getDate() - today.getDay());

        const startSunday = new Date(currentSunday);
        startSunday.setDate(currentSunday.getDate() - (weeksToShow - 1) * 7);

        const computedWeeks: Array<Array<DayCell | null>> = [];
        const computedMonthLabels: Array<string | null> = [];
        let prevMonth = -1;

        for (let w = 0; w < weeksToShow; w++) {
            const week: Array<DayCell | null> = [];
            for (let d = 0; d < 7; d++) {
                const date = new Date(startSunday);
                date.setDate(startSunday.getDate() + w * 7 + d);
                date.setHours(0, 0, 0, 0);
                const dateMs = date.getTime();
                if (dateMs > todayMs) {
                    week.push(null);
                } else {
                    week.push({
                        date,
                        dateStr: format(date, 'yyyy-MM-dd'),
                        isToday: dateMs === todayMs,
                    });
                }
            }
            computedWeeks.push(week);

            const sunday = new Date(startSunday);
            sunday.setDate(startSunday.getDate() + w * 7);
            const monthOfWeek = sunday.getMonth();
            computedMonthLabels.push(monthOfWeek !== prevMonth ? format(sunday, 'MMM') : null);
            prevMonth = monthOfWeek;
        }

        return { weeks: computedWeeks, monthLabels: computedMonthLabels };
    }, [weeksToShow]);

    const getColorClass = (count: number): string => {
        if (count === 0) return 'bg-brand-lilac';
        if (count === 1) return 'bg-brand-orchid';
        if (count <= 3) return 'bg-brand-punch/55';
        return 'bg-brand-punch';
    };

    const gap = Math.max(3, Math.floor(cellSize / 5));
    const cellPx = `${cellSize}px`;
    const gapPx = `${gap}px`;
    const labelFontPx = Math.max(10, cellSize - 4);
    const monthLabelHeight = labelFontPx + 6;
    const cellRadius = Math.max(2, Math.floor(cellSize / 6));

    return (
        <div ref={containerRef} className="w-full text-ink-muted">
            <div className="flex" style={{ gap: gapPx }}>
                <div
                    className="flex flex-col flex-shrink-0"
                    style={{
                        width: LABEL_WIDTH,
                        paddingTop: monthLabelHeight + gap,
                        gap: gapPx,
                        fontSize: labelFontPx,
                    }}
                >
                    {Array.from({ length: 7 }).map((_, i) => (
                        <span
                            key={i}
                            style={{
                                height: cellPx,
                                lineHeight: cellPx,
                                textAlign: 'right',
                                paddingRight: 6,
                                display: 'block',
                            }}
                        >
                            {DAY_ROW_LABELS[i] ?? ''}
                        </span>
                    ))}
                </div>

                <div className="flex min-w-0" style={{ gap: gapPx }}>
                    {weeks.map((week, wIdx) => (
                        <div key={wIdx} className="flex flex-col" style={{ gap: gapPx }}>
                            <div
                                className="text-ink-muted font-medium tracking-tight whitespace-nowrap"
                                style={{
                                    fontSize: labelFontPx,
                                    height: monthLabelHeight,
                                    lineHeight: `${monthLabelHeight}px`,
                                }}
                            >
                                {monthLabels[wIdx] ?? ''}
                            </div>
                            {week.map((cell, dIdx) => {
                                if (!cell) {
                                    return (
                                        <div
                                            key={dIdx}
                                            style={{ width: cellPx, height: cellPx }}
                                            className="flex-shrink-0 opacity-0"
                                            aria-hidden="true"
                                        />
                                    );
                                }
                                const count = activityMap.get(cell.dateStr) || 0;
                                const titleSuffix = count === 0
                                    ? 'nothing logged'
                                    : `${count} ${count === 1 ? 'activity' : 'activities'} completed`;
                                return (
                                    <div
                                        key={dIdx}
                                        style={{
                                            width: cellPx,
                                            height: cellPx,
                                            borderRadius: cellRadius,
                                        }}
                                        className={`flex-shrink-0 ${getColorClass(count)} ${
                                            cell.isToday
                                                ? 'ring-2 ring-brand-punch/45 ring-offset-1 ring-offset-white'
                                                : ''
                                        } transition-colors duration-150 hover:ring-2 hover:ring-brand-punch/60 cursor-default`}
                                        title={`${format(cell.date, 'EEE, MMM d, yyyy')} · ${titleSuffix}`}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            <div
                className="mt-4 flex items-center text-ink-muted justify-end gap-2"
                style={{ fontSize: labelFontPx }}
            >
                <span>Less</span>
                <div className="flex" style={{ gap: gapPx }}>
                    <div
                        className="bg-brand-lilac"
                        style={{ width: cellPx, height: cellPx, borderRadius: cellRadius }}
                    />
                    <div
                        className="bg-brand-orchid"
                        style={{ width: cellPx, height: cellPx, borderRadius: cellRadius }}
                    />
                    <div
                        className="bg-brand-punch/55"
                        style={{ width: cellPx, height: cellPx, borderRadius: cellRadius }}
                    />
                    <div
                        className="bg-brand-punch"
                        style={{ width: cellPx, height: cellPx, borderRadius: cellRadius }}
                    />
                </div>
                <span>More</span>
            </div>
        </div>
    );
};

export default HeatMap;
