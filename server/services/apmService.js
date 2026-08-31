import { cacheService } from './cacheService.js';
import { queueService } from './queueService.js';

/**
 * Enterprise APM Observability Engine
 * Tracks API response times, slow queries, error rates, and system performance without logging PHI.
 */
class APMService {
    constructor() {
        this.startTime = Date.now();
        this.totalRequests = 0;
        this.totalErrors = 0;
        this.latencies = [];
        this.slowQueries = [];
    }

    middleware() {
        return (req, res, next) => {
            const start = Date.now();
            this.totalRequests++;

            res.on('finish', () => {
                const duration = Date.now() - start;
                this.recordLatency(duration);

                if (res.statusCode >= 400) {
                    this.totalErrors++;
                }

                if (duration > 200) {
                    this.recordSlowQuery(req.method, req.originalUrl, duration);
                }
            });

            next();
        };
    }

    recordLatency(ms) {
        if (this.latencies.length >= 1000) {
            this.latencies.shift();
        }
        this.latencies.push(ms);
    }

    recordSlowQuery(method, url, durationMs) {
        if (this.slowQueries.length >= 100) {
            this.slowQueries.shift();
        }
        this.slowQueries.push({
            method,
            endpoint: url.split('?')[0],
            durationMs,
            timestamp: new Date().toISOString()
        });
    }

    getMetrics() {
        const uptime = Math.floor((Date.now() - this.startTime) / 1000);
        const avgLatency = this.latencies.length > 0 
            ? (this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length).toFixed(2)
            : '0.00';

        return {
            status: 'healthy',
            uptimeSeconds: uptime,
            totalRequests: this.totalRequests,
            totalErrors: this.totalErrors,
            avgLatencyMs: `${avgLatency}ms`,
            cacheStats: cacheService.getStats(),
            queueStats: queueService.getStats(),
            recentSlowQueries: this.slowQueries.slice(-10)
        };
    }
}

export const apmService = new APMService();
export default apmService;
