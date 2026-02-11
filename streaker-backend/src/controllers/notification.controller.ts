import { Context } from "hono";
import { NotificationService } from "../services/notification.service";

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

            const body = await c.req.json();
            const { enabled, reminderTime, timezone } = body;

            const updated = await this.notificationService.updatePreference(userId, {
                enabled,
                reminderTime,
                timezone,
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

            const status = await this.notificationService.getStreakStatus(userId);
            return c.json(status);
        } catch (error: any) {
            return c.json({ error: error.message }, error.status || 500);
        }
    }
}
