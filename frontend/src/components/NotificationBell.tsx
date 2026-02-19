import { useState, useRef, useEffect } from 'react';
import { Bell, BellOff, Flame, X } from 'lucide-react';
import { useAuth } from '../utils/auth';
import { useStreakStatus, useNotificationPreference } from '../hooks/useQueries';

export default function NotificationBell() {
    const { authUser } = useAuth();
    const token = authUser?.token ?? '';

    const { data: streakStatus } = useStreakStatus(token);
    const { data: preference } = useNotificationPreference(token);

    const [open, setOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    const streak = streakStatus?.currentStreak ?? 0;
    const hasActivityToday = streakStatus?.hasActivityToday ?? true;
    const notificationsEnabled = preference?.enabled ?? false;

    // Show warning dot when streak > 0 and no activity today
    const showDot = streak > 0 && !hasActivityToday;

    // Close popover on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        if (open) document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [open]);

    if (!token) return null;

    return (
        <div className="relative" ref={popoverRef}>
            {/* Bell Button */}
            <button
                onClick={() => setOpen((v) => !v)}
                aria-label="Streak reminder notifications"
                className={`relative p-2 rounded-xl transition-all duration-200 ${showDot
                    ? 'text-amber-400 hover:bg-amber-400/10'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/10'
                    }`}
            >
                {Notification.permission === 'denied' || !notificationsEnabled ? (
                    <BellOff className="w-5 h-5" />
                ) : (
                    <Bell className={`w-5 h-5 ${showDot ? 'animate-[wiggle_1s_ease-in-out_infinite]' : ''}`} />
                )}

                {/* Red dot indicator */}
                {showDot && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-gray-900 animate-pulse" />
                )}
            </button>

            {/* Popover */}
            {open && (
                <div className="absolute right-0 top-full mt-2 w-72 z-[200] animate-fade-in-up">
                    <div className="rounded-2xl bg-gray-900 border border-white/10 shadow-2xl shadow-black/50 overflow-hidden">
                        {/* Popover header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                            <span className="text-white font-semibold text-sm">Streak Reminder</span>
                            <button
                                onClick={() => setOpen(false)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-3">
                            {/* Streak badge */}
                            {streak > 0 && (
                                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                    <Flame className="w-5 h-5 text-amber-400 flex-shrink-0" />
                                    <span className="text-amber-300 font-semibold text-sm">{streak}-day streak active</span>
                                </div>
                            )}

                            {/* Status message */}
                            {!hasActivityToday && streak > 0 ? (
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    ⚠️ You haven&apos;t logged an activity today. Complete one before midnight to keep your{' '}
                                    <strong className="text-amber-400">{streak}-day streak</strong>!
                                </p>
                            ) : hasActivityToday ? (
                                <p className="text-green-400 text-sm">
                                    ✅ Great job! You&apos;ve already completed an activity today.
                                </p>
                            ) : (
                                <p className="text-gray-400 text-sm">
                                    Start your first activity to begin building a streak!
                                </p>
                            )}

                            {/* Permission status */}
                            {typeof Notification !== 'undefined' && Notification.permission === 'denied' && (
                                <p className="text-red-400 text-xs mt-2">
                                    🔕 Notifications are blocked in your browser. Enable them in site settings.
                                </p>
                            )}

                            {typeof Notification !== 'undefined' &&
                                Notification.permission === 'granted' &&
                                preference?.enabled && (
                                    <p className="text-gray-500 text-xs">
                                        📅 Reminder set for {preference.reminderTime} daily.
                                    </p>
                                )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
