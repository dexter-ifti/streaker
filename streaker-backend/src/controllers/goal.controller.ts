import { Context } from "hono";
import { GoalService } from "../services/goal.service";
import { BadgeService } from "../services/badge.service";

export class GoalController {
    constructor(
        private goalService: GoalService,
        private badgeService: BadgeService
    ) { }

    async createGoal(c: Context) {
        const { id: userId } = c.get('jwtPayload');
        const body = await c.req.json();

        if (!body.name || !body.period || !body.targetCount || !body.startDate) {
            return c.json({ error: 'Missing required fields: name, period, targetCount, startDate' }, 400);
        }

        const goal = await this.goalService.createGoal(userId, {
            name: body.name,
            description: body.description,
            period: body.period,
            targetCount: body.targetCount,
            targetDays: body.targetDays,
            category: body.category,
            startDate: new Date(body.startDate),
            endDate: body.endDate ? new Date(body.endDate) : undefined,
        });

        // Check for badges after creating a goal
        await this.badgeService.checkGoalBadges(userId);

        return c.json(goal, 201);
    }

    async getGoals(c: Context) {
        const { id: userId } = c.get('jwtPayload');
        const status = c.req.query('status');

        const goals = await this.goalService.getGoals(userId, status);
        return c.json(goals);
    }

    async getGoalById(c: Context) {
        const { id: userId } = c.get('jwtPayload');
        const goalId = c.req.param('id');

        const goal = await this.goalService.getGoalById(userId, goalId);
        if (!goal) {
            return c.json({ error: 'Goal not found' }, 404);
        }

        return c.json(goal);
    }

    async updateGoal(c: Context) {
        const { id: userId } = c.get('jwtPayload');
        const goalId = c.req.param('id');
        const body = await c.req.json();

        const goal = await this.goalService.updateGoal(userId, goalId, {
            name: body.name,
            description: body.description,
            period: body.period,
            targetCount: body.targetCount,
            targetDays: body.targetDays,
            category: body.category,
            status: body.status,
            endDate: body.endDate ? new Date(body.endDate) : undefined,
        });

        if (!goal) {
            return c.json({ error: 'Goal not found' }, 404);
        }

        return c.json(goal);
    }

    async deleteGoal(c: Context) {
        const { id: userId } = c.get('jwtPayload');
        const goalId = c.req.param('id');

        const result = await this.goalService.deleteGoal(userId, goalId);
        if (!result) {
            return c.json({ error: 'Goal not found' }, 404);
        }

        return c.json({ message: 'Goal deleted successfully' });
    }

    async updateProgress(c: Context) {
        const { id: userId } = c.get('jwtPayload');
        const goalId = c.req.param('id');
        const body = await c.req.json();

        const incrementBy = body.incrementBy ?? 1;

        const goal = await this.goalService.updateGoalProgress(userId, goalId, incrementBy);
        if (!goal) {
            return c.json({ error: 'Goal not found' }, 404);
        }

        // Check for badges after updating progress
        await this.badgeService.checkGoalBadges(userId);

        return c.json(goal);
    }

    async getProgress(c: Context) {
        const { id: userId } = c.get('jwtPayload');
        const goalId = c.req.param('id');

        const progress = await this.goalService.getGoalProgress(userId, goalId);
        if (progress === null) {
            return c.json({ error: 'Goal not found' }, 404);
        }

        return c.json(progress);
    }

    async getTemplates(c: Context) {
        const category = c.req.query('category');

        const templates = await this.goalService.getGoalTemplates(category);
        return c.json(templates);
    }

    async createFromTemplate(c: Context) {
        const { id: userId } = c.get('jwtPayload');
        const body = await c.req.json();

        if (!body.templateId || !body.startDate) {
            return c.json({ error: 'Missing required fields: templateId, startDate' }, 400);
        }

        const goal = await this.goalService.createGoalFromTemplate(
            userId,
            body.templateId,
            new Date(body.startDate)
        );

        // Check for badges after creating a goal
        await this.badgeService.checkGoalBadges(userId);

        return c.json(goal, 201);
    }
}
