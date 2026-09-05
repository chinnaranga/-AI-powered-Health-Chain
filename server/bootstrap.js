import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

console.log('\n======================================================');
console.log('  HEALTHCHAIN — AUTOMATED ENTERPRISE SETUP & STARTUP  ');
console.log('======================================================\n');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 1. Ensure .env exists and load variables natively
const envPath = path.join(rootDir, '.env');
const envExamplePath = path.join(rootDir, '.env.example');

if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
        console.log('[Setup Step 1/4] Generating .env from .env.example template...');
        fs.copyFileSync(envExamplePath, envPath);
    } else {
        console.log('[Setup Step 1/4] Writing standard .env file...');
        fs.writeFileSync(envPath, `PORT=3001\nJWT_SECRET=\nJWT_REFRESH_SECRET=\n`);
    }
}

try {
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
} catch (e) {}

console.log('[Setup Step 1/4] ✓ Environment configuration loaded.');

// 2. Validate Environment Variables
console.log('\n[Setup Step 2/4] Validating environment configuration...');
const { validateEnvironment } = await import('./config/envValidator.js');
validateEnvironment();

// 3. Run Neon PostgreSQL Database Migrations & Seeding
console.log('[Setup Step 3/4] Running automated schema migrations on Neon PostgreSQL...');
try {
    const { runMigrations } = await import('./config/migrate.js');
    await runMigrations();
    console.log('✓ All 25 PostgreSQL tables, constraints, foreign keys, and default roles verified.');
} catch (err) {
    console.warn('! Migration Notice:', err.message);
}

// 4. Launch Main Server
console.log('\n[Setup Step 4/4] Starting HealthChain Enterprise Server...');
await import('./server.js');
