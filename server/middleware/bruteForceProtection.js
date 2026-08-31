/**
 * HealthChain Enterprise Brute-Force & Account Lockout Protection
 * Locks authentication attempts after 5 failed login attempts for 15 minutes.
 */

const failedAttemptsMap = new Map();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 Minutes

export function bruteForceProtection(req, res, next) {
    const identifier = req.body?.email || req.ip || 'anonymous';
    const record = failedAttemptsMap.get(identifier);

    if (record && record.count >= MAX_FAILED_ATTEMPTS) {
        const timeRemainingMs = record.lockoutExpiresAt - Date.now();
        if (timeRemainingMs > 0) {
            const minutesLeft = Math.ceil(timeRemainingMs / 60000);
            return res.status(429).json({
                success: false,
                message: `Account temporarily locked due to repeated failed login attempts. Please try again in ${minutesLeft} minutes.`
            });
        } else {
            // Lockout expired, reset counter
            failedAttemptsMap.delete(identifier);
        }
    }

    next();
}

export function recordFailedAttempt(identifier) {
    if (!identifier) return;
    const current = failedAttemptsMap.get(identifier) || { count: 0, lockoutExpiresAt: 0 };
    const newCount = current.count + 1;
    const lockoutExpiresAt = newCount >= MAX_FAILED_ATTEMPTS ? Date.now() + LOCKOUT_DURATION_MS : 0;

    failedAttemptsMap.set(identifier, {
        count: newCount,
        lockoutExpiresAt
    });
}

export function clearFailedAttempts(identifier) {
    if (identifier) {
        failedAttemptsMap.delete(identifier);
    }
}

export default {
    bruteForceProtection,
    recordFailedAttempt,
    clearFailedAttempts
};
