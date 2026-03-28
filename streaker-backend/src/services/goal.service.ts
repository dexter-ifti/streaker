import { PrismaClient } from "@prisma/client/edge";
import { HTTPException } from "hono/http-exception";
import {
    dayKeyInTimezone,
    todayKeyInTimezone,
    startOfDayInTimezone,
    mondayOfWeekFromKey,
    sundayOfWeekFromKey,
    firstOfMonthFromKey,
    lastOfMonthFromKey,
} from "../utils/timezone.util";

export class GoalService {
    constructor(private db: PrismaClient | any) { }

    async createGoal(userId: string, data: {
        name: string;
        description?: string;
        period: 'DAILY' | 'WEEKLY' | 'MONTHLY';
        targetCount: number;
        targetDays?: number;
        category?: string;
        startDate: Date;
        endDate?: Date;
    }, tz: string = 'UTC') {
        try {
            const startDayKey = dayKeyInTimezone(data.startDate, tz);
            const startDate = startOfDayInTimezone(startDayKey, "UTC");

            let endDate: Date | null = null;
            if (data.endDate) {
                const endDayKey = dayKeyInTimezone(data.endDate, tz);
                endDate = startOfDayInTimezone(endDayKey, "UTC");
            } else if (data.targetDays) {
                endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + data.targetDays);
            }

            const goal = await this.db.goal.create({
                data: {
                    name: data.name,
                    description: data.description,
                    period: data.period,
                    targetCount: data.targetCount,
                    targetDays: data.targetDays,
                    category: data.category,
                    startDate,
                    endDate,
                    userId,
                    status: 'ACTIVE',
                    currentProgress: 0,
                },
            });

            return goal;
        } catch (error: any) {
            throw new HTTPException(500, { message: `Failed to create goal: ${error.message}` });
        }
    }

    async getGoals(userId: string, status?: string) {
        try {
            const where: any = { userId };
            if (status) {
                where.status = status;
            }

            const goals = await this.db.goal.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                include: {
                    template: true,
                },
            });

            return goals;
        } catch (error: any) {
            throw new HTTPException(500, { message: `Failed to get goals: ${error.message}` });
        }
    }

    async getGoalById(userId: string, goalId: string) {
        try {
            const goal = await this.db.goal.findFirst({
                where: {
                    id: goalId,
                    userId,
                },
                include: {
                    template: true,
                    progressLogs: {
                        orderBy: { periodStart: 'desc' },
                    },
                },
            });

            return goal;
        } catch (error: any) {
            throw new HTTPException(500, { message: `Failed to get goal: ${error.message}` });
        }
    }

    async updateGoal(userId: string, goalId: string, data: {
        name?: string;
        description?: string;
        period?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
        targetCount?: number;
        targetDays?: number;
        category?: string;
        status?: 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'PAUSED';
        endDate?: Date;
    }, tz: string = 'UTC') {
        try {
            const existingGoal = await this.db.goal.findFirst({
                where: { id: goalId, userId },
            });

            if (!existingGoal) {
                return null;
            }

            const updateData: any = {};
            if (data.name !== undefined) updateData.name = data.name;
            if (data.description !== undefined) updateData.description = data.description;
            if (data.period !== undefined) updateData.period = data.period;
            if (data.targetCount !== undefined) updateData.targetCount = data.targetCount;
            if (data.targetDays !== undefined) updateData.targetDays = data.targetDays;
            if (data.category !== undefined) updateData.category = data.category;
            if (data.status !== undefined) updateData.status = data.status;
            if (data.endDate !== undefined) {
                const endDayKey = dayKeyInTimezone(data.endDate, tz);
                updateData.endDate = startOfDayInTimezone(endDayKey, "UTC");
            }

            const goal = await this.db.goal.update({
                where: { id: goalId },
                data: updateData,
            });

            return goal;
        } catch (error: any) {
            throw new HTTPException(500, { message: `Failed to update goal: ${error.message}` });
        }
    }

    async deleteGoal(userId: string, goalId: string) {
        try {
            const existingGoal = await this.db.goal.findFirst({
                where: { id: goalId, userId },
            });

            if (!existingGoal) {
                return null;
            }

            await this.db.goal.delete({
                where: { id: goalId },
            });

            return { success: true };
        } catch (error: any) {
            throw new HTTPException(500, { message: `Failed to delete goal: ${error.message}` });
        }
    }

    async updateGoalProgress(userId: string, goalId: string, incrementBy: number = 1, tz: string = 'UTC') {
        try {
            const goal = await this.db.goal.findFirst({
                where: { id: goalId, userId },
            });

            if (!goal) {
                return null;
            }

            const newProgress = goal.currentProgress + incrementBy;
            const isCompleted = newProgress >= goal.targetCount;

            const updatedGoal = await this.db.goal.update({
                where: { id: goalId },
                data: {
                    currentProgress: newProgress,
                    status: isCompleted ? 'COMPLETED' : goal.status,
                },
            });

            // Create or update progress log for current period
            const nowKey = todayKeyInTimezone(tz);
            const periodStart = this.getPeriodStartDate(nowKey, goal.period);
            const periodEnd = this.getPeriodEndDate(nowKey, goal.period);

            await this.db.goalProgress.upsert({
                where: {
                    goalId_periodStart: {
                        goalId,
                        periodStart,
                    },
                },
                update: {
                    achievedCount: { increment: incrementBy },
                    isCompleted: isCompleted,
                },
                create: {
                    goalId,
                    periodStart,
                    periodEnd,
                    targetCount: goal.targetCount,
                    achievedCount: incrementBy,
                    isCompleted: isCompleted,
                },
            });

            return updatedGoal;
        } catch (error: any) {
            throw new HTTPException(500, { message: `Failed to update goal progress: ${error.message}` });
        }
    }

    async getGoalProgress(userId: string, goalId: string) {
        try {
            const goal = await this.db.goal.findFirst({
                where: { id: goalId, userId },
            });

            if (!goal) {
                return null;
            }

            const progressLogs = await this.db.goalProgress.findMany({
                where: { goalId },
                orderBy: { periodStart: 'desc' },
            });

            return progressLogs;
        } catch (error: any) {
            throw new HTTPException(500, { message: `Failed to get goal progress: ${error.message}` });
        }
    }

    async getGoalTemplates(category?: string) {
        try {
            const where: any = { isActive: true };
            if (category) {
                where.category = category;
            }

            const templates = await this.db.goalTemplate.findMany({
                where,
                orderBy: { name: 'asc' },
            });

            return templates;
        } catch (error: any) {
            throw new HTTPException(500, { message: `Failed to get goal templates: ${error.message}` });
        }
    }

    async createGoalFromTemplate(userId: string, templateId: string, startDate: Date, tz: string = 'UTC') {
        try {
            const template = await this.db.goalTemplate.findUnique({
                where: { id: templateId },
            });

            if (!template) {
                throw new HTTPException(404, { message: 'Template not found' });
            }

            const startDayKey = dayKeyInTimezone(startDate, tz);
            const start = startOfDayInTimezone(startDayKey, "UTC");

            const endDate = new Date(start);
            endDate.setDate(endDate.getDate() + template.targetDays);

            const goal = await this.db.goal.create({
                data: {
                    name: template.name,
                    description: template.description,
                    period: template.period,
                    targetCount: template.targetCount,
                    targetDays: template.targetDays,
                    category: template.category,
                    startDate: start,
                    endDate,
                    userId,
                    templateId,
                    status: 'ACTIVE',
                    currentProgress: 0,
                },
            });

            return goal;
        } catch (error: any) {
            if (error instanceof HTTPException) throw error;
            throw new HTTPException(500, { message: `Failed to create goal from template: ${error.message}` });
        }
    }

    async checkAndUpdateGoalStatus(goalId: string, tz: string = 'UTC') {
        try {
            const goal = await this.db.goal.findUnique({
                where: { id: goalId },
            });

            if (!goal || goal.status !== 'ACTIVE') {
                return goal;
            }

            const nowKey = todayKeyInTimezone(tz);
            const now = startOfDayInTimezone(nowKey, "UTC");

            let newStatus = goal.status;

            // Check if goal is completed
            if (goal.currentProgress >= goal.targetCount) {
                newStatus = 'COMPLETED';
            }
            // Check if goal has failed (past end date without completion)
            else if (goal.endDate && now > new Date(goal.endDate)) {
                newStatus = 'FAILED';
            }

            if (newStatus !== goal.status) {
                return await this.db.goal.update({
                    where: { id: goalId },
                    data: { status: newStatus },
                });
            }

            return goal;
        } catch (error: any) {
            throw new HTTPException(500, { message: `Failed to check goal status: ${error.message}` });
        }
    }

    /**
     * Get the start-of-period Date for a given day key and period type.
     * Returns a Date at midnight UTC of the period start day.
     */
    private getPeriodStartDate(dateStr: string, period: string): Date {
        let dayKey = dateStr;

        if (period === 'WEEKLY') {
            dayKey = mondayOfWeekFromKey(dateStr);
        } else if (period === 'MONTHLY') {
            dayKey = firstOfMonthFromKey(dateStr);
        }

        return startOfDayInTimezone(dayKey, "UTC");
    }

    /**
     * Get the end-of-period Date for a given day key and period type.
     * Returns a Date at midnight UTC of the period end day.
     */
    private getPeriodEndDate(dateStr: string, period: string): Date {
        let dayKey = dateStr;

        if (period === 'DAILY') {
            // End is same as start for daily
        } else if (period === 'WEEKLY') {
            dayKey = sundayOfWeekFromKey(dateStr);
        } else if (period === 'MONTHLY') {
            dayKey = lastOfMonthFromKey(dateStr);
        }

        return startOfDayInTimezone(dayKey, "UTC");
    }
}
