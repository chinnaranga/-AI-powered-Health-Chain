/**
 * HealthChain Enterprise Security & Privacy Middleware
 * Applies strict HTTP security headers, payload sanitization, and XSS protection.
 */

export function securityHeadersMiddleware(req, res, next) {
    // Handle Chrome Private Network Access (PNA) preflight for local dev server
    if (req.headers['access-control-request-private-network']) {
        res.setHeader('Access-Control-Allow-Private-Network', 'true');
    }

    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Prevent clickjacking via frame embedding
    res.setHeader('X-Frame-Options', 'DENY');

    // Enable browser XSS filtering
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Strict Transport Security (HSTS)
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Content Security Policy (CSP)
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' https://challenges.cloudflare.com; style-src 'self'; img-src 'self' data: https:; connect-src 'self' https:; frame-ancestors 'none';"
    );

    next();
}

/**
 * Input Payload Sanitizer Middleware
 * Prevents prototype pollution and strips malicious XSS tags
 */
export function sanitizeInputMiddleware(req, res, next) {
    if (req.body && typeof req.body === 'object') {
        sanitizeObject(req.body);
    }
    if (req.query && typeof req.query === 'object') {
        sanitizeObject(req.query);
    }
    next();
}

function sanitizeObject(obj) {
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            // Prevent Prototype Pollution
            if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
                delete obj[key];
                continue;
            }

            if (typeof obj[key] === 'string') {
                // Strip raw HTML script tags
                obj[key] = obj[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                sanitizeObject(obj[key]);
            }
        }
    }
}

export default {
    securityHeadersMiddleware,
    sanitizeInputMiddleware
};
