import neon, { query as neonQuery, getDatabaseUrl } from './neon.js';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * HealthChain Primary Database Engine
 * Primary: Neon PostgreSQL (Serverless Relational Cloud Database)
 * Fallback: Local SQLite for offline development if DATABASE_URL is not configured
 */

let sqliteDb = null;

function getSqliteFallback() {
    if (!sqliteDb) {
        const dbPath = path.resolve(__dirname, '../healthcare.db');
        sqliteDb = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.warn('[Database Engine Notice] SQLite fallback check:', err.message);
            }
        });
    }
    return sqliteDb;
}

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
    const isNeonActive = !!getDatabaseUrl();

    if (isNeonActive) {
        const pgSql = convertPlaceholders(sql);
        const res = await neonQuery(pgSql, params);
        return res.rows || [];
    }

    // Fallback mode for local development
    return new Promise((resolve, reject) => {
        getSqliteFallback().all(sql, params, (err, rows) => {
            if (err) return reject(err);
            resolve(rows || []);
        });
    });
}

/**
 * Universal async query executor returning a single row or null
 * @param {string} sql - SQL statement
 * @param {Array} params - Query parameters
 * @returns {Promise<Object|null>}
 */
export async function getDb(sql, params = []) {
    const isNeonActive = !!getDatabaseUrl();

    if (isNeonActive) {
        const pgSql = convertPlaceholders(sql);
        const res = await neonQuery(pgSql, params);
        return (res.rows && res.rows[0]) ? res.rows[0] : null;
    }

    return new Promise((resolve, reject) => {
        getSqliteFallback().get(sql, params, (err, row) => {
            if (err) return reject(err);
            resolve(row || null);
        });
    });
}

/**
 * Universal async query executor for Mutations (INSERT / UPDATE / DELETE)
 * @param {string} sql - SQL statement
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>}
 */
export async function runDb(sql, params = []) {
    const isNeonActive = !!getDatabaseUrl();

    if (isNeonActive) {
        const pgSql = convertPlaceholders(sql);
        const res = await neonQuery(pgSql, params);
        return {
            rowCount: res.rowCount,
            rows: res.rows || [],
            lastID: res.rows?.[0]?.id || null,
            changes: res.rowCount
        };
    }

    return new Promise((resolve, reject) => {
        getSqliteFallback().run(sql, params, function (err) {
            if (err) return reject(err);
            resolve({ lastID: this.lastID, changes: this.changes, rowCount: this.changes });
        });
    });
}

export default {
    queryDb,
    getDb,
    runDb,
    query: neonQuery,
    neon
};
