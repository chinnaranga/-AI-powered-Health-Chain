import neon, { query as neonQuery, getDatabaseUrl } from './neon.js';

/**
 * Helper to convert '?' placeholder queries to PostgreSQL '$1, $2, ...' syntax
 */
function convertPlaceholders(sql) {
    let index = 1;
    return sql.replace(/\?/g, () => `$${index++}`);
}

/**
 * Universal async query executor returning an Array of rows
 * @param {string} sql - SQL statement
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>}
 */
export async function queryDb(sql, params = []) {
    if (!getDatabaseUrl()) {
        throw new Error('DATABASE_URL is required');
    }

    const pgSql = convertPlaceholders(sql);
    const res = await neonQuery(pgSql, params);
    return res.rows || [];
}

/**
 * Universal async query executor returning a single row or null
 * @param {string} sql - SQL statement
 * @param {Array} params - Query parameters
 * @returns {Promise<Object|null>}
 */
export async function getDb(sql, params = []) {
    if (!getDatabaseUrl()) {
        throw new Error('DATABASE_URL is required');
    }

    const pgSql = convertPlaceholders(sql);
    const res = await neonQuery(pgSql, params);
    return (res.rows && res.rows[0]) ? res.rows[0] : null;
}

/**
 * Universal async query executor for Mutations (INSERT / UPDATE / DELETE)
 * @param {string} sql - SQL statement
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>}
 */
export async function runDb(sql, params = []) {
    if (!getDatabaseUrl()) {
        throw new Error('DATABASE_URL is required');
    }

    const pgSql = convertPlaceholders(sql);
    const res = await neonQuery(pgSql, params);
    return {
        rowCount: res.rowCount,
        rows: res.rows || [],
        lastID: res.rows?.[0]?.id || null,
        changes: res.rowCount
    };
}

export default {
    queryDb,
    getDb,
    runDb,
    query: neonQuery,
    neon
};
