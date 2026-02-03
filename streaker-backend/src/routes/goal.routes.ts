import { Hono } from "hono";
import { GoalController } from "../controllers/goal.controller";
import { GoalService } from "../services/goal.service";
import { BadgeService } from "../services/badge.service";
import { PrismaClient } from "@prisma/client/edge";
import { authMiddleware } from "../middleware/auth.middleware";
import { withAccelerate } from "@prisma/extension-accelerate";

export const goalRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string
        JWT_SECRET: string
    }
}>();

goalRouter.use('/*', authMiddleware);

// Helper to create controller with services
const createController = (c: any) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL
    }).$extends(withAccelerate());
    const goalService = new GoalService(prisma);
    const badgeService = new BadgeService(prisma);
    return new GoalController(goalService, badgeService);
};

// GET /api/goals/templates - Get goal templates (must be before /:id)
goalRouter.get('/templates', (c) => {
    const controller = createController(c);
    return controller.getTemplates(c);
});

// POST /api/goals/from-template - Create goal from template
goalRouter.post('/from-template', (c) => {
    const controller = createController(c);
    return controller.createFromTemplate(c);
});

// GET /api/goals - Get all goals for user
goalRouter.get('/', (c) => {
    const controller = createController(c);
    return controller.getGoals(c);
});

// POST /api/goals - Create a new goal
goalRouter.post('/', (c) => {
    const controller = createController(c);
    return controller.createGoal(c);
});

// GET /api/goals/:id - Get a specific goal
goalRouter.get('/:id', (c) => {
    const controller = createController(c);
    return controller.getGoalById(c);
});

// PUT /api/goals/:id - Update a goal
goalRouter.put('/:id', (c) => {
    const controller = createController(c);
    return controller.updateGoal(c);
});

// DELETE /api/goals/:id - Delete a goal
goalRouter.delete('/:id', (c) => {
    const controller = createController(c);
    return controller.deleteGoal(c);
});

// PATCH /api/goals/:id/progress - Update goal progress
goalRouter.patch('/:id/progress', (c) => {
    const controller = createController(c);
    return controller.updateProgress(c);
});

// GET /api/goals/:id/progress - Get goal progress history
goalRouter.get('/:id/progress', (c) => {
    const controller = createController(c);
    return controller.getProgress(c);
});
