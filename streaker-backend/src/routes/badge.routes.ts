import { Hono } from "hono";
import { BadgeController } from "../controllers/badge.controller";
import { BadgeService } from "../services/badge.service";
import { PrismaClient } from "@prisma/client/edge";
import { authMiddleware } from "../middleware/auth.middleware";
import { withAccelerate } from "@prisma/extension-accelerate";

export const badgeRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string
        JWT_SECRET: string
    }
}>();

badgeRouter.use('/*', authMiddleware);

// Helper to create controller with services
const createController = (c: any) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL
    }).$extends(withAccelerate());
    const badgeService = new BadgeService(prisma);
    return new BadgeController(badgeService);
};

// GET /api/badges - Get user's earned badges
badgeRouter.get('/', (c) => {
    const controller = createController(c);
    return controller.getUserBadges(c);
});

// GET /api/badges/all - Get all available badges
badgeRouter.get('/all', (c) => {
    const controller = createController(c);
    return controller.getAllBadges(c);
});

// POST /api/badges/check - Check and award any earned badges
badgeRouter.post('/check', (c) => {
    const controller = createController(c);
    return controller.checkBadges(c);
});
