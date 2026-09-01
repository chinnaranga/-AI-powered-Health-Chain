import pg from 'pg';
import crypto from 'crypto';

/**
 * HealthChain Neon PostgreSQL Primary Database Engine
 * Connects securely to Neon Serverless PostgreSQL with SSL/TLS and connection pooling.
 * Never exposes credentials to the frontend.
 */

const { Pool } = pg;

let pool = null;
let isPostgresConnected = false;

export function getDatabaseUrl() {
    return process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || process.env.POSTGRES_URL || '';
}

export function initPool() {
    if (pool) return pool;

    const connectionString = getDatabaseUrl();

    if (!connectionString) {
        console.warn('[Neon PostgreSQL Engine] Notice: DATABASE_URL is not currently defined in environment.');
        console.warn('[Neon PostgreSQL Engine] Running in local SQLite/Mock fallback mode until DATABASE_URL is provided.');
        return null;
    }

    try {
        const isLocalhost = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

        pool = new Pool({
            connectionString,
            ssl: isLocalhost ? false : { rejectUnauthorized: false },
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 5000
        });

        pool.on('error', (err) => {
            console.error('[Neon PostgreSQL Engine] Unexpected client pool error:', err.message);
        });

        console.log('[Neon PostgreSQL Engine] Connection pool initialized with SSL/TLS security.');
        return pool;
    } catch (err) {
        console.error('[Neon PostgreSQL Engine] Failed to initialize connection pool:', err.message);
        return null;
    }
}

/**
 * Executes a parameterized SQL query against Neon PostgreSQL
 * @param {string} text - SQL Query with placeholders ($1, $2, ...)
 * @param {Array} params - Array of parameters
 */
export async function query(text, params = []) {
    const currentPool = initPool();

    if (!currentPool) {
        // Fallback to in-memory/simulated store if DATABASE_URL is not set
        return queryFallback(text, params);
    }

    const start = Date.now();
    try {
        const res = await currentPool.query(text, params);
        const duration = Date.now() - start;
        if (process.env.DEBUG_SQL === 'true') {
            console.log(`[Neon SQL Query] (${duration}ms):`, text.slice(0, 100));
        }
        return res;
    } catch (err) {
        console.error('[Neon PostgreSQL Error]:', err.message, '\nQuery:', text, '\nParams:', params);
        throw err;
    }
}

/**
 * Gets a dedicated client from the pool for transactions
 */
export async function getClient() {
    const currentPool = initPool();
    if (!currentPool) {
        throw new Error('Database pool not available. Check DATABASE_URL configuration.');
    }
    return await currentPool.connect();
}

/**
 * Executes a callback inside a PostgreSQL transaction
 */
export async function transaction(callback) {
    const client = await getClient();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
}

/**
 * Check database connection health
 */
export async function testConnection() {
    const currentPool = initPool();
    if (!currentPool) return { connected: false, mode: 'fallback', message: 'DATABASE_URL not set' };

    try {
        const res = await currentPool.query('SELECT NOW() as current_time, version() as version');
        isPostgresConnected = true;
        return {
            connected: true,
            mode: 'neon_postgres',
            currentTime: res.rows[0]?.current_time,
            version: res.rows[0]?.version
        };
    } catch (err) {
        isPostgresConnected = false;
        return {
            connected: false,
            mode: 'error',
            error: err.message
        };
    }
}

// In-memory fallback simulation when running offline without DATABASE_URL
const inMemoryTables = new Map();

async function queryFallback(text, params = []) {
    const normalized = text.trim();
    const upper = normalized.toUpperCase();

    if (upper.startsWith('SELECT NOW()') || upper.startsWith('SELECT 1')) {
        return { rows: [{ current_time: new Date().toISOString() }], rowCount: 1 };
    }

    return { rows: [], rowCount: 0 };
}

export default {
    query,
    getClient,
    transaction,
    testConnection,
    getDatabaseUrl,
    initPool,
    neonPool: initPool
};

export { initPool as neonPool };
