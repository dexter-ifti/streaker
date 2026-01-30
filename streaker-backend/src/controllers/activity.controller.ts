import { Context } from "hono";
import { ActivityService } from "../services/activity.service";
import { createActivitySchema } from "@ifti_taha/streaker-common";

export class ActivityController {
    constructor(private activityService: ActivityService) { }

    // method to save activity
    async saveActivity(c: Context) {
        const { id: userId } = c.get('jwtPayload');
        const body = await c.req.json();

        // Validate request body
        const { success } = createActivitySchema.safeParse(body);
        if (!success) {
            return c.json({ error: 'Invalid request body' }, 400);
        }
        
        // Create Date object and reset time to midnight UTC
        const activityDate = new Date(body.date);
        activityDate.setUTCHours(0, 0, 0, 0);
        
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        const activity = await this.activityService.saveActivity(activityDate, body.description, userId);
        return c.json(activity, 201);
    }

    // method to get activities
    async getActivities(c: Context) {
        const { id: userId } = c.get('jwtPayload');
        const days = parseInt(c.req.query('days') || '20');
        const activities = await this.activityService.getActivities(userId, days);
        return c.json(activities);
    }

    // method to get all activities
    async getAllActivities(c: Context) {
        const { id: userId } = c.get('jwtPayload');
        const page = parseInt(c.req.query('page') || '1');
        const limit = parseInt(c.req.query('limit') || '5');
        const activities = await this.activityService.getAllActivities(userId, page, limit);
        return c.json(activities);
    }

    // method to get current streak
    async getStreak(c: Context) {
        const { id: userId } = c.get('jwtPayload');
        const streak = await this.activityService.getCurrentStreak(userId);
        return c.json({ streak });
    }

    // method to get longest streak
    async getLongestStreak(c: Context) {
        const { id: userId } = c.get('jwtPayload');
        const streak = await this.activityService.getLongestStreak(userId);
        return c.json({ streak });
    }

    async editActivity(c: Context) {
        const { id : userId } = c.get('jwtPayload');
        const body = await c.req.json();
        const itemIndex = parseInt(c.req.param('index'));
        const activity = await this.activityService.editActivity(userId, c.req.param('id'), body.description, itemIndex);
        if (!activity) {
            return c.json({ error: 'Activity not found' }, 404);
        }
        return c.json(activity, 200); 
    }

    async deleteActivity(c : Context){
        const { id : userId } = c.get('jwtPayload');
        const itemIndex = parseInt(c.req.param('index'));
        const activity = await this.activityService.deleteActivity(userId, c.req.param('id'), itemIndex);
        if (!activity) {
            return c.json({ error: 'Activity not found' }, 404);
        }
        return c.json({ message: 'Activity deleted successfully' }, 200);
    }

    async toggleComplete(c: Context) {
        const { id: userId } = c.get('jwtPayload');
        const activityId = c.req.param('id');
        const itemIndex = parseInt(c.req.param('index'));

        const activity = await this.activityService.toggleComplete(userId, activityId, itemIndex);
        if (!activity) {
            return c.json({ error: 'Activity not found' }, 404);
        }
        return c.json(activity, 200);
    }
}