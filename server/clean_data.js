import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load .env
const envPath = path.join(rootDir, '.env');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const [key, ...value] = trimmed.split('=');
            if (key && value.length > 0) {
                process.env[key.trim()] = value.join('=').trim();
            }
        }
    });
}

const connectionString = process.env.DATABASE_URL;

async function cleanData() {
    console.log('\n======================================================');
    console.log('   HEALTHCHAIN — CLEAN & RESET NEON POSTGRESQL DATA   ');
    console.log('======================================================\n');

    if (!connectionString) {
        console.error('❌ Error: DATABASE_URL is not defined in .env');
        process.exit(1);
    }

    const { Pool } = pg;
    const pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();
        console.log('✓ Connected to Neon PostgreSQL.');
        console.log('Clearing all recording, mock, and test data across tables...\n');

        // Truncate tables with CASCADE while preserving table structures and default roles
        const tablesToClear = [
            'prescription_items',
            'prescriptions',
            'lab_results',
            'lab_orders',
            'diagnoses',
            'medical_records',
            'documents',
            'appointments',
            'encounters',
            'consents',
            'terms_acceptance',
            'audit_logs',
            'notifications',
            'storage_usage',
            'doctors',
            'patients',
            'user_roles',
            'users'
        ];

        for (const table of tablesToClear) {
            try {
                await client.query(`TRUNCATE TABLE ${table} CASCADE;`);
                console.log(`✓ Cleared data in table: ${table}`);
            } catch (e) {
                console.log(`- Skipped/Empty table: ${table} (${e.message})`);
            }
        }

        // Re-seed essential baseline roles
        console.log('\nRe-seeding essential system roles...');
        await client.query(`
            INSERT INTO roles (name, description) VALUES
            ('super_admin', 'System Super Administrator'),
            ('hospital_admin', 'Hospital Administrator'),
            ('doctor', 'Medical Doctor / Physician'),
            ('clinical', 'Clinical Staff & Nurse'),
            ('laboratory', 'Lab Technician'),
            ('patient', 'Patient / Healthcare Consumer')
            ON CONFLICT (name) DO NOTHING;
        `);
        console.log('✓ Default system roles verified.');

        console.log('\n======================================================');
        console.log('  STATUS: ALL PREVIOUS DATA & RECORDINGS HAVE BEEN CLEARED! ');
        console.log('  You can now register or sign in with any fresh Google account.');
        console.log('======================================================\n');

        client.release();
        await pool.end();
    } catch (err) {
        console.error('❌ Error clearing database:', err.message);
        await pool.end();
        process.exit(1);
    }
}

cleanData();
