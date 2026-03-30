import { Context } from "hono";
import { NotificationService } from "../services/notification.service";
import { getTimezone } from "../utils/timezone.util";

export class NotificationController {
    constructor(private notificationService: NotificationService) { }

    async getPreference(c: Context) {
        try {
            const payload = c.get('jwtPayload');
            const userId = payload.id;

            const preference = await this.notificationService.getOrCreatePreference(userId);
            return c.json(preference);
        } catch (error: any) {
            return c.json({ error: error.message }, error.status || 500);
        }
    }

    async updatePreference(c: Context) {
        try {
            const payload = c.get('jwtPayload');
            const userId = payload.id;
            const headerTz = getTimezone(c);

            const body = await c.req.json();
            const { enabled, reminderTime, timezone } = body;

            // Use the explicitly provided timezone, or fall back to header timezone
            const updated = await this.notificationService.updatePreference(userId, {
                enabled,
                reminderTime,
                timezone: timezone || headerTz,
            });

            return c.json(updated);
        } catch (error: any) {
            return c.json({ error: error.message }, error.status || 500);
        }
    }

    async getStreakStatus(c: Context) {
        try {
            const payload = c.get('jwtPayload');
            const userId = payload.id;
            const tz = getTimezone(c);

            const status = await this.notificationService.getStreakStatus(userId, tz);
            return c.json(status);
        } catch (error: any) {
            return c.json({ error: error.message }, error.status || 500);
        }
    }
}
