import { Context, Next } from "hono";

/**
 * Simple in-memory sliding window rate limiter for Cloudflare Workers.
 *
 * NOTE: Since Workers isolates are ephemeral and share memory within a single
 * instance, this provides per-isolate rate limiting. It won't persist across
 * deploys or different edge locations, but it's effective at preventing
 * runaway abuse (rapid-fire requests hitting the same isolate).
 *
 * For production-grade distributed rate limiting, consider Cloudflare's
 * built-in Rate Limiting rules or a KV/Durable Objects backed solution.
 */

interface RateLimitEntry {
    timestamps: number[];
}

// Global store — shared across requests within the same Worker isolate
const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 60 seconds to prevent memory leaks
const CLEANUP_INTERVAL_MS = 60_000;
let lastCleanup = Date.now();

function cleanupStaleEntries(windowMs: number) {
    const now = Date.now();
    if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
    lastCleanup = now;

    const cutoff = now - windowMs;
    for (const [key, entry] of store) {
        // Remove timestamps older than the window
        entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
        if (entry.timestamps.length === 0) {
            store.delete(key);
        }
    }
}

function getClientIdentifier(c: Context): string {
    // Try CF-Connecting-IP first (Cloudflare sets this), then X-Forwarded-For, then fallback
    return (
        c.req.header("cf-connecting-ip") ||
        c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
        c.req.header("x-real-ip") ||
        "unknown"
    );
}

interface RateLimitOptions {
    /** Maximum number of requests allowed in the window. Default: 100 */
    max?: number;
    /** Time window in milliseconds. Default: 60_000 (1 minute) */
    windowMs?: number;
    /** Optional key prefix to separate rate limit buckets (e.g. "auth", "api") */
    keyPrefix?: string;
    /** Custom message returned on rate limit. */
    message?: string;
}

/**
 * Creates a rate limiting middleware for Hono.
 *
 * @example
 * // 10 requests per minute for auth routes
 * authRouter.use('/*', rateLimiter({ max: 10, windowMs: 60_000, keyPrefix: 'auth' }));
 *
 * // 100 requests per minute for general API
 * app.use('/api/*', rateLimiter({ max: 100, keyPrefix: 'api' }));
 */
export function rateLimiter(options: RateLimitOptions = {}) {
    const {
        max = 100,
        windowMs = 60_000,
        keyPrefix = "global",
        message = "Too many requests, please try again later.",
    } = options;

    return async (c: Context, next: Next) => {
        // Run lazy cleanup
        cleanupStaleEntries(windowMs);

        const clientIp = getClientIdentifier(c);
        const key = `${keyPrefix}:${clientIp}`;
        const now = Date.now();
        const windowStart = now - windowMs;

        // Get or create entry
        let entry = store.get(key);
        if (!entry) {
            entry = { timestamps: [] };
            store.set(key, entry);
        }

        // Remove timestamps outside the current window
        entry.timestamps = entry.timestamps.filter((t) => t > windowStart);

        // Check limit
        if (entry.timestamps.length >= max) {
            const oldestInWindow = entry.timestamps[0];
            const retryAfterSeconds = Math.ceil(
                (oldestInWindow + windowMs - now) / 1000
            );

            c.header("Retry-After", String(retryAfterSeconds));
            c.header("X-RateLimit-Limit", String(max));
            c.header("X-RateLimit-Remaining", "0");
            c.header(
                "X-RateLimit-Reset",
                String(Math.ceil((oldestInWindow + windowMs) / 1000))
            );

            return c.json(
                {
                    error: message,
                    retryAfter: retryAfterSeconds,
                },
                429
            );
        }

        // Record this request
        entry.timestamps.push(now);

        // Set informational headers
        const remaining = max - entry.timestamps.length;
        c.header("X-RateLimit-Limit", String(max));
        c.header("X-RateLimit-Remaining", String(remaining));

        await next();
    };
}
