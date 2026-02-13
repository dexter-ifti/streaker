import { Hono } from "hono";
import { NotificationController } from "../controllers/notification.controller";
import { NotificationService } from "../services/notification.service";
import { PrismaClient } from "@prisma/client/edge";
import { authMiddleware } from "../middleware/auth.middleware";
import { withAccelerate } from "@prisma/extension-accelerate";

export const notificationRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
    };
}>();

notificationRouter.use("/*", authMiddleware);

const createController = (c: any) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());
    const notificationService = new NotificationService(prisma);
    return new NotificationController(notificationService);
};

// GET /api/notifications - Get notification preferences
notificationRouter.get("/", (c) => {
    const controller = createController(c);
    return controller.getPreference(c);
});

// PUT /api/notifications - Update notification preferences
notificationRouter.put("/", (c) => {
    const controller = createController(c);
    return controller.updatePreference(c);
});

// GET /api/notifications/streak-status - Get streak status for reminder decision
notificationRouter.get("/streak-status", (c) => {
    const controller = createController(c);
    return controller.getStreakStatus(c);
});
