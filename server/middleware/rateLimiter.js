/**
 * High-Scale API Token Bucket & Request Throttling Middleware
 * Protects endpoints from DDoS spikes and brute force attacks under high concurrency.
 */
const requestCounts = new Map();

// Periodic cleanup every 60s
setInterval(() => {
    const now = Date.now();
    for (const [key, record] of requestCounts.entries()) {
        if (now > record.resetTime) {
            requestCounts.delete(key);
        }
    }
}, 60000);

export const createRateLimiter = ({ windowMs = 60000, maxRequests = 300, message = 'Too many requests. Please try again later.' }) => {
    return (req, res, next) => {
        const clientIdentifier = req.ip || req.headers['x-forwarded-for'] || 'anonymous';
        const now = Date.now();

        let record = requestCounts.get(clientIdentifier);
        if (!record || now > record.resetTime) {
            record = {
                count: 1,
                resetTime: now + windowMs
            };
            requestCounts.set(clientIdentifier, record);
            return next();
        }

        record.count++;
        if (record.count > maxRequests) {
            res.setHeader('Retry-After', Math.ceil((record.resetTime - now) / 1000));
            return res.status(429).json({
                success: false,
                message
            });
        }

        next();
    };
};

export const globalRateLimiter = createRateLimiter({ windowMs: 60000, maxRequests: 300 });
export const authRateLimiter = createRateLimiter({ windowMs: 60000, maxRequests: 60, message: 'Too many authentication attempts. Please wait.' });
export default globalRateLimiter;
