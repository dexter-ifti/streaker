import { PrismaClient } from "@prisma/client/edge";
import { HTTPException } from "hono/http-exception";
import {
    todayKeyInTimezone,
    startOfDayInTimezone,
    shiftDayKey,
} from "../utils/timezone.util";

export class NotificationService {
    constructor(private db: PrismaClient | any) { }

    /**
     * Get or create notification preferences for a user.
     * Defaults: enabled=true, reminderTime="20:00", timezone="UTC"
     */
    async getOrCreatePreference(userId: string) {
        try {
            const existing = await this.db.notificationPreference.findUnique({
                where: { userId },
            });

            if (existing) return existing;

            return await this.db.notificationPreference.create({
                data: {
                    userId,
                    enabled: true,
                    reminderTime: "20:00",
                    timezone: "UTC",
                },
            });
        } catch (error: any) {
            throw new HTTPException(500, {
                message: `Failed to get notification preference: ${error.message}`,
            });
        }
    }

    /**
     * Update notification preferences for a user (partial update).
     * Also silently syncs the timezone from the X-Timezone header if provided.
     */
    async updatePreference(
        userId: string,
        data: {
            enabled?: boolean;
            reminderTime?: string;
            timezone?: string;
        }
    ) {
        try {
            // Validate reminderTime format (HH:MM)
            if (data.reminderTime) {
                const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
                if (!timeRegex.test(data.reminderTime)) {
                    throw new HTTPException(400, {
                        message: "Invalid reminderTime format. Use HH:MM (24-hour).",
                    });
                }
            }

            return await this.db.notificationPreference.upsert({
                where: { userId },
                update: {
                    ...(data.enabled !== undefined && { enabled: data.enabled }),
                    ...(data.reminderTime && { reminderTime: data.reminderTime }),
                    ...(data.timezone && { timezone: data.timezone }),
                },
                create: {
                    userId,
                    enabled: data.enabled ?? true,
                    reminderTime: data.reminderTime ?? "20:00",
                    timezone: data.timezone ?? "UTC",
                },
            });
        } catch (error: any) {
            if (error instanceof HTTPException) throw error;
            throw new HTTPException(500, {
                message: `Failed to update notification preference: ${error.message}`,
            });
        }
    }

    /**
     * Get current streak status: streak count and whether the user already
     * has a completed activity today (in the user's timezone). Used by the
     * frontend to decide whether to fire a reminder notification.
     */
    async getStreakStatus(userId: string, tz: string = 'UTC') {
        try {
            const user = await this.db.user.findUnique({
                where: { id: userId },
                select: { current_streak: true },
            });

            const todayKey = todayKeyInTimezone(tz);
            const todayStart = startOfDayInTimezone(todayKey, "UTC");
            const tomorrowKey = shiftDayKey(todayKey, 1, tz);
            const tomorrowStart = startOfDayInTimezone(tomorrowKey, "UTC");

            const todayActivity = await this.db.activity.findFirst({
                where: {
                    userId,
                    date: {
                        gte: todayStart,
                        lt: tomorrowStart,
                    },
                },
                select: { completed: true },
            });

            const hasCompletedToday =
                todayActivity !== null &&
                Array.isArray(todayActivity.completed) &&
                todayActivity.completed.some((c: boolean) => c === true);

            return {
                currentStreak: user?.current_streak ?? 0,
                hasActivityToday: hasCompletedToday,
            };
        } catch (error: any) {
            throw new HTTPException(500, {
                message: `Failed to get streak status: ${error.message}`,
            });
        }
    }
}
