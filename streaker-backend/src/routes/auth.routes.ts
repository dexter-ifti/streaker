import { Hono } from "hono";
import { AuthController } from "../controllers/auth.controller";
import { AuthService } from '../services/auth.service';
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

export const authRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string
        JWT_SECRET: string
    }
}>();
// Endpoint structure
// POST /auth/register - Register a new user
// POST /auth/login - Login a user

authRouter.post('/register', (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL
    }).$extends(withAccelerate())
    const authService = new AuthService(prisma);
    const authController = new AuthController(authService);
    return authController.registerUser(c)
});

authRouter.post('/login', (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL
    }).$extends(withAccelerate())
    const authService = new AuthService(prisma);
    const authController = new AuthController(authService);
    return authController.loginUser(c)
});