import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * HealthChain Cloudflare D1 / Relational Database Engine
 * Connects to SQLite/D1 database store for zero-latency patient records,
 * appointments, prescriptions, audit trails, and role management.
 */

const dbPath = path.resolve(__dirname, '../healthcare.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.warn('[Cloudflare D1 Engine notice] Database connection initial check:', err.message);
    } else {
        console.log('[Cloudflare D1 Engine] Connected to Cloudflare D1 local database store at', dbPath);
    }
});

// Utility helper for async SQL queries
export function queryDb(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

export function runDb(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) return reject(err);
            resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
}

export function getDb(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
}

export default {
    queryDb,
    runDb,
    getDb,
    db
};
