import React, { useRef, useState, useMemo, useCallback } from 'react';
import {
    X, Download, Share2, Flame, Trophy, Target,
    CheckCircle2, Award, Sparkles, TrendingUp, BarChart3
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { useAuth } from '../utils/auth';
import {
    useStreaks,
    useLongestStreak,
    useAllActivities,
    useGoals,
    useUserBadges,
} from '../hooks/useQueries';

interface DailySummaryCardProps {
    isOpen: boolean;
    onClose: () => void;
}

const DailySummaryCard: React.FC<DailySummaryCardProps> = ({ isOpen, onClose }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const { authUser } = useAuth();
    const token = authUser?.token ?? '';

    // Data hooks
    const { data: currentStreak = 0 } = useStreaks(token);
    const { data: longestStreak = 0 } = useLongestStreak(token);
    const { data: allActivitiesData } = useAllActivities(token, 1, 0);
    const { data: goals = [] } = useGoals(token, 'ACTIVE');
    const { data: userBadges = [] } = useUserBadges(token);

    // Filter today's activities
    const todayStats = useMemo(() => {
        const activities = allActivitiesData?.activities ?? [];
        const today = new Date().toISOString().split('T')[0];

        let totalItems = 0;
        let completedItems = 0;
        const categoryMap: Record<string, number> = {};

        activities.forEach((activity: any) => {
            const activityDate = (activity.date || activity.createdAt);
            if (!activityDate) return;

            const dateStr = typeof activityDate === 'string'
                ? activityDate.split('T')[0]
                : new Date(activityDate).toISOString().split('T')[0];

            if (dateStr !== today) return;

            const descriptions = activity.description || [];
            const completed = activity.completed || [];
            const categories = activity.category || [];

            descriptions.forEach((_: string, idx: number) => {
                totalItems++;
                if (completed[idx]) completedItems++;
                const cat = categories[idx] || 'General';
                categoryMap[cat] = (categoryMap[cat] || 0) + 1;
            });
        });

        return { totalItems, completedItems, categoryMap };
    }, [allActivitiesData]);

    // Goals summary
    const goalsSummary = useMemo(() => {
        const activeGoals = goals.filter(g => g.status === 'ACTIVE');
        return activeGoals.slice(0, 4).map(g => ({
            name: g.name,
            current: g.currentProgress,
            target: g.targetCount,
            percent: Math.min(100, Math.round((g.currentProgress / g.targetCount) * 100)),
        }));
    }, [goals]);

    // Dynamic motivational message
    const motivationalMessage = useMemo(() => {
        const { completedItems, totalItems } = todayStats;
        const completionRate = totalItems > 0 ? completedItems / totalItems : 0;

        if (totalItems === 0) return "Start your day strong! 💪";
        if (completionRate === 1) return "Perfect day! You crushed it! 🎉";
        if (completionRate >= 0.75) return "Almost there — keep pushing! 🔥";
        if (completionRate >= 0.5) return "Solid progress! You're on track 🚀";
        return "Every step counts. Keep going! ✨";
    }, [todayStats]);

    // Today's date formatted
    const formattedDate = useMemo(() => {
        return new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    }, []);

    const userName = authUser?.user?.name || 'Streaker';

    // Download as PNG
    const handleDownload = useCallback(async () => {
        if (!cardRef.current) return;
        setIsCapturing(true);

        try {
            const canvas = await html2canvas(cardRef.current, {
                scale: 2,
                backgroundColor: null,
                useCORS: true,
                logging: false,
            });

            const link = document.createElement('a');
            link.download = `streaker-summary-${new Date().toISOString().split('T')[0]}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error('Failed to capture card:', err);
        } finally {
            setIsCapturing(false);
        }
    }, []);

    // Share via Web Share API
    const handleShare = useCallback(async () => {
        if (!cardRef.current) return;
        setIsCapturing(true);

        try {
            const canvas = await html2canvas(cardRef.current, {
                scale: 2,
                backgroundColor: null,
                useCORS: true,
                logging: false,
            });

            const blob = await new Promise<Blob>((resolve, reject) => {
                canvas.toBlob((b) => {
                    if (b) resolve(b);
                    else reject(new Error('Failed to create blob'));
                }, 'image/png');
            });

            if (navigator.share && navigator.canShare) {
                const file = new File([blob], 'streaker-daily-summary.png', { type: 'image/png' });
                const shareData = {
                    title: 'My Daily Streak Summary',
                    text: `🔥 ${currentStreak} day streak! Check out my progress on Streaker.`,
                    files: [file],
                };

                if (navigator.canShare(shareData)) {
                    await navigator.share(shareData);
                } else {
                    // Fallback: download
                    handleDownload();
                }
            } else {
                // Fallback: download
                handleDownload();
            }
        } catch (err) {
            if ((err as Error).name !== 'AbortError') {
                console.error('Share failed:', err);
                // Fallback: download
                handleDownload();
            }
        } finally {
            setIsCapturing(false);
        }
    }, [currentStreak, handleDownload]);

    if (!isOpen) return null;

    const topCategories = Object.entries(todayStats.categoryMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3);

    const completionPercent = todayStats.totalItems > 0
        ? Math.round((todayStats.completedItems / todayStats.totalItems) * 100)
        : 0;

    return (
        <div
            className="fixed inset-0 bg-[#1f1b2d]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="relative w-full max-w-lg animate-bounce-in">
                {/* Action buttons — outside the card so they don't get captured */}
                <div className="flex items-center justify-end gap-2 mb-3">
                    <button
                        onClick={handleShare}
                        disabled={isCapturing}
                        className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm text-slate-700 rounded-xl border border-[#ebbcfc] hover:bg-[#f9eafe] transition-all text-sm font-medium disabled:opacity-50 shadow-lg"
                        title="Share"
                    >
                        <Share2 className="w-4 h-4" />
                        Share
                    </button>
                    <button
                        onClick={handleDownload}
                        disabled={isCapturing}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#ebbcfc] to-[#ff0061] text-white rounded-xl hover:from-[#cadbfc] hover:to-[#ff0061] transition-all text-sm font-medium disabled:opacity-50 shadow-lg"
                        title="Download"
                    >
                        <Download className="w-4 h-4" />
                        {isCapturing ? 'Capturing...' : 'Download'}
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-xl border border-[#ebbcfc] hover:bg-[#f9eafe] text-slate-500 transition-all shadow-lg"
                        title="Close"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* ============ THE CARD (captured as image) ============ */}
                <div
                    ref={cardRef}
                    className="summary-card-capture relative overflow-hidden rounded-2xl"
                    style={{ aspectRatio: '1 / 1' }}
                >
                    {/* Background layers */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1f1b2d] via-[#2d1f3d] to-[#1a1530]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(235,188,252,0.15),_transparent_50%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,_rgba(202,219,252,0.12),_transparent_50%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,0,97,0.06),_transparent_60%)]" />

                    {/* Decorative orbs */}
                    <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#ebbcfc]/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-[#cadbfc]/10 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#ff0061]/5 rounded-full blur-3xl" />

                    {/* Animated border glow */}
                    <div className="absolute inset-0 rounded-2xl border border-[#ebbcfc]/20" />
                    <div className="absolute inset-[1px] rounded-2xl summary-shimmer-border" />

                    {/* Card Content */}
                    <div className="relative z-10 h-full flex flex-col p-6 sm:p-8">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-5">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-[#ebbcfc]" />
                                    {userName}'s Day
                                </h2>
                                <p className="text-[#ebbcfc]/70 text-xs sm:text-sm mt-1">{formattedDate}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-[#ff0061] text-xs font-medium uppercase tracking-wider">Streak</div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <Flame className="w-6 h-6 text-[#ff0061] drop-shadow-[0_0_6px_rgba(255,0,97,0.5)]" />
                                    <span className="text-3xl font-bold text-white">{currentStreak}</span>
                                </div>
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-3 gap-3 mb-5">
                            <div className="bg-white/[0.06] backdrop-blur-sm rounded-xl p-3 border border-white/[0.08]">
                                <div className="flex items-center gap-1.5 mb-1.5">
                                    <TrendingUp className="w-3.5 h-3.5 text-[#cadbfc]" />
                                    <span className="text-[10px] sm:text-xs text-[#cadbfc]/80 uppercase tracking-wide font-medium">Best</span>
                                </div>
                                <div className="text-lg sm:text-xl font-bold text-white">{longestStreak}</div>
                                <div className="text-[10px] text-white/40">days</div>
                            </div>
                            <div className="bg-white/[0.06] backdrop-blur-sm rounded-xl p-3 border border-white/[0.08]">
                                <div className="flex items-center gap-1.5 mb-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-[#77dd77]" />
                                    <span className="text-[10px] sm:text-xs text-[#77dd77]/80 uppercase tracking-wide font-medium">Done</span>
                                </div>
                                <div className="text-lg sm:text-xl font-bold text-white">
                                    {todayStats.completedItems}<span className="text-sm text-white/40">/{todayStats.totalItems}</span>
                                </div>
                                <div className="text-[10px] text-white/40">activities</div>
                            </div>
                            <div className="bg-white/[0.06] backdrop-blur-sm rounded-xl p-3 border border-white/[0.08]">
                                <div className="flex items-center gap-1.5 mb-1.5">
                                    <Award className="w-3.5 h-3.5 text-[#ffd700]" />
                                    <span className="text-[10px] sm:text-xs text-[#ffd700]/80 uppercase tracking-wide font-medium">Badges</span>
                                </div>
                                <div className="text-lg sm:text-xl font-bold text-white">{userBadges.length}</div>
                                <div className="text-[10px] text-white/40">earned</div>
                            </div>
                        </div>

                        {/* Completion Ring + Categories */}
                        <div className="flex items-center gap-5 mb-5">
                            {/* Circular progress */}
                            <div className="flex-shrink-0 relative w-20 h-20 sm:w-24 sm:h-24">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                                    <circle
                                        cx="50" cy="50" r="42"
                                        fill="none"
                                        stroke="url(#progressGradient)"
                                        strokeWidth="8"
                                        strokeLinecap="round"
                                        strokeDasharray={`${completionPercent * 2.64} ${264 - completionPercent * 2.64}`}
                                    />
                                    <defs>
                                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#ebbcfc" />
                                            <stop offset="100%" stopColor="#ff0061" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-lg sm:text-xl font-bold text-white">{completionPercent}%</span>
                                    <span className="text-[9px] text-white/50">complete</span>
                                </div>
                            </div>

                            {/* Categories */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-2">
                                    <BarChart3 className="w-3.5 h-3.5 text-[#ebbcfc]" />
                                    <span className="text-xs text-[#ebbcfc]/80 uppercase tracking-wide font-medium">Categories</span>
                                </div>
                                {topCategories.length > 0 ? (
                                    <div className="space-y-1.5">
                                        {topCategories.map(([cat, count]) => (
                                            <div key={cat} className="flex items-center gap-2">
                                                <span className="text-xs text-white/70 w-16 truncate">{cat}</span>
                                                <div className="flex-1 h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-gradient-to-r from-[#ebbcfc] to-[#cadbfc]"
                                                        style={{
                                                            width: `${Math.min(100, (count / todayStats.totalItems) * 100)}%`
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-xs text-white/50 w-6 text-right">{count}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-white/40 italic">No activities yet today</p>
                                )}
                            </div>
                        </div>

                        {/* Goals Progress */}
                        {goalsSummary.length > 0 && (
                            <div className="mb-5">
                                <div className="flex items-center gap-1.5 mb-2.5">
                                    <Target className="w-3.5 h-3.5 text-[#ff0061]" />
                                    <span className="text-xs text-[#ff0061]/80 uppercase tracking-wide font-medium">Active Goals</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {goalsSummary.map((goal, idx) => (
                                        <div
                                            key={idx}
                                            className="bg-white/[0.05] rounded-lg px-3 py-2 border border-white/[0.06]"
                                        >
                                            <div className="text-[11px] text-white/70 truncate mb-1">{goal.name}</div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-gradient-to-r from-[#ff0061] to-[#ebbcfc] transition-all"
                                                        style={{ width: `${goal.percent}%` }}
                                                    />
                                                </div>
                                                <span className="text-[10px] text-white/50 w-8 text-right">{goal.percent}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Spacer */}
                        <div className="flex-1" />

                        {/* Motivational message */}
                        <div className="text-center mb-4">
                            <p className="text-sm sm:text-base text-white/80 font-medium italic">
                                "{motivationalMessage}"
                            </p>
                        </div>

                        {/* Footer / Branding */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-gradient-to-br from-[#ebbcfc] to-[#ff0061] rounded-lg flex items-center justify-center">
                                    <Flame className="w-3.5 h-3.5 text-white" />
                                </div>
                                <span className="text-sm font-bold text-white/60 tracking-wide">STREAKER</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Trophy className="w-3.5 h-3.5 text-[#ffd700]/60" />
                                <span className="text-[10px] text-white/40">
                                    Keep the streak alive
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DailySummaryCard;
