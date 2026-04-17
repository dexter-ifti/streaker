import { Context, Next } from "hono";

const TURNSTILE_VERIFY_URL =
    "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Middleware that verifies a Cloudflare Turnstile token sent in the request body.
 *
 * Expects `turnstileToken` in the JSON body. Calls Cloudflare's siteverify
 * endpoint with the secret key from env. Rejects the request with 400/403
 * if the token is missing or invalid.
 *
 * The parsed body is stored in `c.set('body', ...)` so downstream handlers
 * don't need to re-parse it.
 */
export const turnstileMiddleware = async (c: Context, next: Next) => {
    try {
        const body = await c.req.json();

        const turnstileToken = body?.turnstileToken;
        if (!turnstileToken) {
            return c.json(
                { error: "Human verification is required." },
                400
            );
        }

        const secretKey = (c.env as any).TURNSTILE_SECRET_KEY;
        if (!secretKey) {
            // If no secret is configured, skip verification (dev mode fallback)
            console.warn(
                "TURNSTILE_SECRET_KEY not set — skipping Turnstile verification"
            );
            c.set("body", body);
            await next();
            return;
        }

        // Verify the token with Cloudflare
        const formData = new FormData();
        formData.append("secret", secretKey);
        formData.append("response", turnstileToken);

        // Optionally include client IP for stricter validation
        const clientIp =
            c.req.header("cf-connecting-ip") ||
            c.req.header("x-forwarded-for")?.split(",")[0]?.trim();
        if (clientIp) {
            formData.append("remoteip", clientIp);
        }

        const verifyResponse = await fetch(TURNSTILE_VERIFY_URL, {
            method: "POST",
            body: formData,
        });

        const outcome = (await verifyResponse.json()) as {
            success: boolean;
            "error-codes"?: string[];
        };

        if (!outcome.success) {
            console.warn("Turnstile verification failed:", outcome["error-codes"]);
            return c.json(
                {
                    error: "Human verification failed. Please try again.",
                    codes: outcome["error-codes"],
                },
                403
            );
        }

        // Store the parsed body so the route handler can use it directly
        c.set("body", body);
        await next();
    } catch (error) {
        console.error("Turnstile middleware error:", error);
        return c.json(
            { error: "Verification processing failed. Please try again." },
            500
        );
    }
};
