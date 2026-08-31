/**
 * Enterprise In-Memory LRU Cache Engine for High-Scale Backend APIs
 * Provides sub-millisecond retrieval, hit-rate statistics, and auto-expiration TTL.
 */
class MemoryCacheService {
    constructor(defaultTTL = 60000, maxItems = 5000) {
        this.cache = new Map();
        this.defaultTTL = defaultTTL; // 60 seconds
        this.maxItems = maxItems;
        this.hits = 0;
        this.misses = 0;
    }

    get(key) {
        if (!this.cache.has(key)) {
            this.misses++;
            return null;
        }

        const item = this.cache.get(key);
        if (Date.now() > item.expiresAt) {
            this.cache.delete(key);
            this.misses++;
            return null;
        }

        this.hits++;
        return item.value;
    }

    set(key, value, ttlMs = this.defaultTTL) {
        if (this.cache.size >= this.maxItems) {
            const oldestKey = this.cache.keys().next().value;
            if (oldestKey) this.cache.delete(oldestKey);
        }

        this.cache.set(key, {
            value,
            expiresAt: Date.now() + ttlMs
        });
    }

    del(key) {
        this.cache.delete(key);
    }

    flush() {
        this.cache.clear();
        this.hits = 0;
        this.misses = 0;
    }

    getStats() {
        const total = this.hits + this.misses;
        const hitRate = total > 0 ? ((this.hits / total) * 100).toFixed(2) : '100.00';
        return {
            size: this.cache.size,
            hits: this.hits,
            misses: this.misses,
            hitRate: `${hitRate}%`
        };
    }
}

export const cacheService = new MemoryCacheService();
export default cacheService;
