import { Hono } from "hono";
import { ActivityController } from "../controllers/activity.controller";
import { ActivityService } from "../services/activity.service";
import { PrismaClient } from "@prisma/client/edge";
import { authMiddleware } from "../middleware/auth.middleware";
import { withAccelerate } from "@prisma/extension-accelerate";

export const activityRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string
        JWT_SECRET: string
    }
}>();

activityRouter.use('/*', authMiddleware);

// GET api/activity/activities - Get all activities
activityRouter.get('/activities', (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL
    }).$extends(withAccelerate());
    const activityService = new ActivityService(prisma);
    const activityController = new ActivityController(activityService);
    return activityController.getActivities(c)
});

// GET api/activity/all - Get all activities
activityRouter.get('/all', (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL
    }).$extends(withAccelerate());
    const activityService = new ActivityService(prisma);
    const activityController = new ActivityController(activityService);
    return activityController.getAllActivities(c)
})

// POST api/activity/activities - Save an activity
activityRouter.post('/activities', (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL
    }).$extends(withAccelerate());
    const activityService = new ActivityService(prisma);
    const activityController = new ActivityController(activityService);
    return activityController.saveActivity(c)
});

// GET api/activity/streak - Get the current streak
activityRouter.get('/streak', (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL
    }).$extends(withAccelerate());
    const activityService = new ActivityService(prisma);
    const activityController = new ActivityController(activityService);
    return activityController.getStreak(c)
});

// GET api/activity/longest-streak - Get the longest streak
activityRouter.get('/longest-streak', (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL
    }).$extends(withAccelerate());
    const activityService = new ActivityService(prisma);
    const activityController = new ActivityController(activityService);
    return activityController.getLongestStreak(c)
});

// PUT api/activity/activities/:id/items/index - Edit an activity
activityRouter.put('/activities/:id/items/:index', (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL
    }).$extends(withAccelerate());
    const activityService = new ActivityService(prisma);
    const activityController = new ActivityController(activityService);
    return activityController.editActivity(c);
});

// DELETE api/activity/activities/:id/items/:index - Delete an activity
activityRouter.delete('/activities/:id/items/:index', (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL
    }).$extends(withAccelerate());
    const activityService = new ActivityService(prisma);
    const activityController = new ActivityController(activityService);
    return activityController.deleteActivity(c);
})

// PATCH api/activity/activities/:id/items/:index/toggle - Toggle activity completion
activityRouter.patch('/activities/:id/items/:index/toggle', (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL
    }).$extends(withAccelerate());
    const activityService = new ActivityService(prisma);
    const activityController = new ActivityController(activityService);
    return activityController.toggleComplete(c);
})
