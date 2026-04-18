import { Hono } from "hono";
import { AuthController } from "../controllers/auth.controller";
import { AuthService } from '../services/auth.service';
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { turnstileMiddleware } from "../middleware/turnstile.middleware";

export const authRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string
        JWT_SECRET: string
        TURNSTILE_SECRET_KEY: string
    }
}>();
// Endpoint structure
// POST /auth/register - Register a new user (Turnstile protected)
// POST /auth/login - Login a user (Turnstile protected)

authRouter.post('/register', turnstileMiddleware, (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL
    }).$extends(withAccelerate())
    const authService = new AuthService(prisma);
    const authController = new AuthController(authService);
    return authController.registerUser(c)
});

authRouter.post('/login', turnstileMiddleware, (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL
    }).$extends(withAccelerate())
    const authService = new AuthService(prisma);
    const authController = new AuthController(authService);
    return authController.loginUser(c)
});