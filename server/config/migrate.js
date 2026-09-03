import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import neon, { query, getDatabaseUrl } from './neon.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * HealthChain Neon PostgreSQL Migration Runner
 * Executes idempotent database schema creation and baseline seeding.
 */
export async function runMigrations() {
    const dbUrl = getDatabaseUrl();
    if (!dbUrl) {
        console.log('[Neon Migrations] Skipped: DATABASE_URL not set in environment. Running in fallback mode.');
        return { success: true, skipped: true };
    }

    console.log('[Neon Migrations] Executing schema migrations against Neon PostgreSQL...');

    try {
        const schemaPath = path.resolve(__dirname, 'schema.sql');
        if (!fs.existsSync(schemaPath)) {
            throw new Error(`Schema file not found at ${schemaPath}`);
        }

        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        // Split into statement blocks or execute via single transaction
        await query(schemaSql);
        console.log('[Neon Migrations] Schema tables & indexes verified successfully.');

        // Idempotent table column updates
        await ensureColumns();

        // Normalize existing doctors to active status
        await normalizeExistingDoctors();

        // Seed Default Roles & Permissions
        await seedDefaultRoles();

        console.log('[Neon Migrations] Complete: Database is up to date.');
        return { success: true, skipped: false };
    } catch (err) {
        console.error('[Neon Migrations Error] Migration failed:', err.message);
        return { success: false, error: err.message };
    }
}

async function ensureColumns() {
    try {
        await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_by UUID`);
        await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ`);
        await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS rejected_by UUID`);
        await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ`);
    } catch (e) {
        console.warn('[Neon Migrations Notice] Column check notice:', e.message);
    }
}

async function normalizeExistingDoctors() {
    try {
        // Ensure any existing doctor without an explicit status (or NULL) has status = 'active'
        await query(`UPDATE users SET status = 'active' WHERE role = 'doctor' AND (status IS NULL OR status = '')`);
        console.log('[Neon Migrations] Existing doctor statuses normalized.');
    } catch (e) {
        console.warn('[Neon Migrations Notice] Doctor normalization notice:', e.message);
    }
}

async function seedDefaultRoles() {
    const roles = [
        { name: 'patient', description: 'Patient access to personal health vault, appointments, and consents' },
        { name: 'doctor', description: 'Doctor portal access for clinical consultations and prescriptions' },
        { name: 'hospital', description: 'Hospital administrative ERP and department management' },
        { name: 'clinical', description: 'Clinical staff for diagnostic records and patient triage' },
        { name: 'laboratory', description: 'Lab gateway for test orders and result publishing' },
        { name: 'admin', description: 'System administrator for compliance, audit logs, and tenant control' }
    ];

    for (const r of roles) {
        try {
            await query(
                `INSERT INTO roles (name, description) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING`,
                [r.name, r.description]
            );
        } catch (e) {
            // Ignore conflict or seed notices
        }
    }
}

export default {
    runMigrations
};
