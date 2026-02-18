import { useEffect, useRef } from 'react';
import { useAuth } from '../utils/auth';
import { useNotificationPreference, useStreakStatus } from './useQueries';

const NOTIFICATION_COOLDOWN_KEY = 'lastNotificationDate';

/**
 * Schedules daily streak reminder notifications.
 * Fires a browser notification when:
 *  - Notifications are enabled in user preferences
 *  - Browser permission is "granted"
 *  - Current local time matches the saved reminderTime (HH:MM)
 *  - The user has NOT completed an activity today
 *  - We haven't sent a notification yet today
 */
export function useReminderScheduler() {
    const { authUser } = useAuth();
    const token = authUser?.token ?? '';

    const { data: preference } = useNotificationPreference(token);
    const { data: streakStatus } = useStreakStatus(token);

    // Track interval id for cleanup
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        // Clear any existing interval on re-run
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        if (!token || !preference || !preference.enabled) return;
        if (typeof Notification === 'undefined') return;

        const checkAndNotify = () => {
            // Check permission
            if (Notification.permission !== 'granted') return;

            // Check if we've already sent a notification today
            const lastSent = localStorage.getItem(NOTIFICATION_COOLDOWN_KEY);
            const today = new Date().toISOString().split('T')[0];
            if (lastSent === today) return;

            // Check if streak status says activity is done today
            if (streakStatus?.hasActivityToday) return;

            // Only notify if there's an active streak to protect
            if ((streakStatus?.currentStreak ?? 0) === 0) return;

            // Parse reminderTime (HH:MM) and compare with current local time
            const [remHour, remMin] = preference.reminderTime.split(':').map(Number);
            const now = new Date();
            const nowHour = now.getHours();
            const nowMin = now.getMinutes();

            if (nowHour !== remHour || nowMin !== remMin) return;

            // Fire the notification
            const streak = streakStatus?.currentStreak ?? 0;
            const title = `🔥 Don't break your ${streak}-day streak!`;
            const body = `You haven't logged an activity today. Keep the streak alive!`;

            try {
                if (navigator.serviceWorker?.controller) {
                    navigator.serviceWorker.ready.then((reg) => {
                        reg.showNotification(title, {
                            body,
                            icon: '/pwa-192x192.png',
                            badge: '/pwa-64x64.png',
                            tag: 'streak-reminder',
                            requireInteraction: false,
                        });
                    });
                } else {
                    new Notification(title, {
                        body,
                        icon: '/pwa-192x192.png',
                        tag: 'streak-reminder',
                    });
                }

                // Mark as sent for today
                localStorage.setItem(NOTIFICATION_COOLDOWN_KEY, today);
            } catch (err) {
                console.warn('Failed to show notification:', err);
            }
        };

        // Check immediately
        checkAndNotify();

        // Then check every minute
        intervalRef.current = setInterval(checkAndNotify, 60_000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [token, preference, streakStatus]);
}
