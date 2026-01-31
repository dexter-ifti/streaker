import { Context, Next } from "hono";
import { jwt } from "hono/jwt";

export const authMiddleware = async (c : Context, next : Next) => {
    return jwt({
        secret : c.env.JWT_SECRET,
        alg : "HS256"
    })(c, next);
}