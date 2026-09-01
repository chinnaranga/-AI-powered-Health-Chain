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

async function verifyDatabase() {
    console.log('\n======================================================');
    console.log('   HEALTHCHAIN — NEON POSTGRESQL VERIFICATION CHECK   ');
    console.log('======================================================\n');

    if (!connectionString) {
        console.error('❌ Error: DATABASE_URL is not defined in .env');
        process.exit(1);
    }

    console.log('Connecting to Neon PostgreSQL:');
    console.log(connectionString.replace(/:[^:@]+@/, ':********@'));

    const { Pool } = pg;
    const pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();
        console.log('\n✓ Connected successfully to Neon PostgreSQL database.');

        // 1. Check Tables in Neon
        const tablesRes = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name ASC;
        `);

        console.log(`\n✓ Total Tables Found in PostgreSQL: ${tablesRes.rows.length}`);
        tablesRes.rows.forEach((r, idx) => {
            console.log(`  ${idx + 1}. ${r.table_name}`);
        });

        // 2. Insert and Verify a Test User
        console.log('\n--- Testing Real Data Storage (INSERT / SELECT) ---');
        
        const testEmail = `verify_${Date.now()}@healthchain.io`;
        const userInsert = await client.query(`
            INSERT INTO users (id, email, password_hash, name, role, status, email_verified, onboarding_complete)
            VALUES (gen_random_uuid(), $1, 'hashed_test_password', 'Verification Test User', 'patient', 'active', true, true)
            RETURNING id, email, name, role, created_at;
        `, [testEmail]);

        const createdUser = userInsert.rows[0];
        console.log(`✓ Stored User in PostgreSQL:`, createdUser);

        // 3. Insert Audit Log for that user
        const auditInsert = await client.query(`
            INSERT INTO audit_logs (id, actor_user_id, action, resource_type, resource_id, details, status)
            VALUES (gen_random_uuid(), $1::uuid, 'VERIFICATION_TEST', 'verification', $2, '{"verified": true}'::jsonb, 'SUCCESS')
            RETURNING id, actor_user_id, action, timestamp;
        `, [createdUser.id, createdUser.id]);

        console.log(`✓ Stored Audit Log in PostgreSQL:`, auditInsert.rows[0]);

        // 4. Query record counts across key tables
        console.log('\n--- Live Data Record Counts in Neon PostgreSQL ---');
        const userCount = await client.query(`SELECT count(*) FROM users;`);
        const auditCount = await client.query(`SELECT count(*) FROM audit_logs;`);
        const roleCount = await client.query(`SELECT count(*) FROM roles;`);
        const recordsCount = await client.query(`SELECT count(*) FROM medical_records;`);

        console.log(`- users table:           ${userCount.rows[0].count} records`);
        console.log(`- roles table:           ${roleCount.rows[0].count} records`);
        console.log(`- audit_logs table:      ${auditCount.rows[0].count} records`);
        console.log(`- medical_records table: ${recordsCount.rows[0].count} records`);

        console.log('\n======================================================');
        console.log('  STATUS: DATA IS SUCCESSFULLY STORING IN POSTGRESQL! ');
        console.log('======================================================\n');

        client.release();
        await pool.end();
    } catch (err) {
        console.error('❌ Verification Error:', err.message);
        await pool.end();
        process.exit(1);
    }
}

verifyDatabase();
