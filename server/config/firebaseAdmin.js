import db, { queryDb, runDb, getDb } from './db.js';

/**
 * Cloudflare D1 Provider Compatibility Adapter
 * Replaces Firebase Admin SDK with Cloudflare D1 SQLite relational queries.
 */

export const adminDb = {
    collection: (tableName) => ({
        doc: (id) => ({
            get: async () => {
                const row = await getDb(`SELECT * FROM ${tableName} WHERE id = ? OR uid = ? OR fileId = ? LIMIT 1`, [id, id, id]);
                return {
                    exists: !!row,
                    data: () => row ? JSON.parse(row.data || JSON.stringify(row)) : null
                };
            },
            set: async (data, options = {}) => {
                const payload = JSON.stringify(data);
                await runDb(
                    `INSERT INTO ${tableName} (id, data, updatedAt) VALUES (?, ?, CURRENT_TIMESTAMP)
                     ON CONFLICT(id) DO UPDATE SET data = excluded.data, updatedAt = CURRENT_TIMESTAMP`,
                    [id, payload]
                );
                return { id };
            },
            update: async (data) => {
                const existingSnap = await getDb(`SELECT data FROM ${tableName} WHERE id = ? LIMIT 1`, [id]);
                const currentData = existingSnap ? JSON.parse(existingSnap.data || '{}') : {};
                const merged = { ...currentData, ...data, updatedAt: new Date().toISOString() };
                await runDb(`UPDATE ${tableName} SET data = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`, [JSON.stringify(merged), id]);
                return { id };
            },
            delete: async () => {
                await runDb(`DELETE FROM ${tableName} WHERE id = ?`, [id]);
                return true;
            }
        }),
        where: (field, op, val) => ({
            get: async () => {
                const rows = await queryDb(`SELECT * FROM ${tableName} WHERE json_extract(data, '$.' || ?) = ? OR ${field} = ?`, [field, val, val]);
                return {
                    empty: rows.length === 0,
                    docs: rows.map(r => {
                        const parsed = JSON.parse(r.data || JSON.stringify(r));
                        return {
                            id: r.id || parsed.id,
                            data: () => parsed
                        };
                    })
                };
            },
            limit: (n) => ({
                get: async () => {
                    const rows = await queryDb(`SELECT * FROM ${tableName} LIMIT ?`, [n]);
                    return {
                        empty: rows.length === 0,
                        docs: rows.map(r => {
                            const parsed = JSON.parse(r.data || JSON.stringify(r));
                            return {
                                id: r.id || parsed.id,
                                data: () => parsed
                            };
                        })
                    };
                }
            })
        }),
        get: async () => {
            const rows = await queryDb(`SELECT * FROM ${tableName}`);
            return {
                empty: rows.length === 0,
                docs: rows.map(r => {
                    const parsed = JSON.parse(r.data || JSON.stringify(r));
                    return {
                        id: r.id || parsed.id,
                        data: () => parsed
                    };
                })
            };
        },
        limit: (n) => ({
            get: async () => {
                const rows = await queryDb(`SELECT * FROM ${tableName} LIMIT ?`, [n]);
                return {
                    empty: rows.length === 0,
                    docs: rows.map(r => {
                        const parsed = JSON.parse(r.data || JSON.stringify(r));
                        return {
                            id: r.id || parsed.id,
                            data: () => parsed
                        };
                    })
                };
            }
        })
    })
};

export const adminAuth = {};
export const adminStorage = {};
export default adminDb;
