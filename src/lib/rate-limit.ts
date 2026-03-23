// Simple in-memory rate limiter for Server Actions
// Note: In a multi-instance production environment, use Redis (e.g., Upstash) for shared state.

const cache = new Map<string, { count: number; resetTime: number }>();

export interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
}

export function rateLimit(
    identifier: string,
    limit: number = 10,
    windowMs: number = 60 * 1000 // 1 minute
): RateLimitResult {
    const now = Date.now();
    const record = cache.get(identifier);

    if (!record || now > record.resetTime) {
        // New window
        const newRecord = {
            count: 1,
            resetTime: now + windowMs,
        };
        cache.set(identifier, newRecord);
        return {
            success: true,
            limit,
            remaining: limit - 1,
            reset: newRecord.resetTime,
        };
    }

    if (record.count >= limit) {
        // Limit exceeded
        return {
            success: false,
            limit,
            remaining: 0,
            reset: record.resetTime,
        };
    }

    // Increment count
    record.count += 1;
    return {
        success: true,
        limit,
        remaining: limit - record.count,
        reset: record.resetTime,
    };
}

// Cleanup expired entries periodically to prevent memory leaks
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now();
        for (const [key, record] of cache.entries()) {
            if (now > record.resetTime) {
                cache.delete(key);
            }
        }
    }, 5 * 60 * 1000); // Every 5 minutes
}
