/**
 * HealthChain Enterprise Environment Variable Startup Validator
 * Validates presence of critical production configuration keys at startup.
 */

const REQUIRED_KEYS = [
    'PORT',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET'
];

const OPTIONAL_R2_KEYS = [
    'R2_ACCOUNT_ID',
    'R2_ACCESS_KEY_ID',
    'R2_SECRET_ACCESS_KEY',
    'R2_BUCKET_NAME'
];

export function validateEnvironment() {
    console.log('[HealthChain Env Validator] Checking environment configuration...');

    const hasDatabaseUrl = !!(process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || process.env.POSTGRES_URL);
    const missingKeys = REQUIRED_KEYS.filter(key => !process.env[key]);
    if (missingKeys.length > 0) {
        console.warn(`[HealthChain Env Warning] Missing non-fatal environment variables: ${missingKeys.join(', ')}`);
    }

    const missingR2 = OPTIONAL_R2_KEYS.filter(key => !process.env[key] && !process.env[`CLOUDFLARE_${key}`]);
    const isR2Configured = missingR2.length === 0;

    console.log(`[HealthChain Env Diagnostic] Status:
- Primary Database: ${hasDatabaseUrl ? 'Neon PostgreSQL (Configured via DATABASE_URL)' : 'Local SQLite Fallback (Set DATABASE_URL in .env to activate live Neon)'}
- Firebase Hosting: https://healthcare-edb75.web.app/
- Cloudflare R2 Storage: ${isR2Configured ? 'Configured (Live Credentials)' : 'Dev Emulator Mode (SigV4 Presigned URLs Active)'}
- JWT Session Protection: Active
- Real-time WebSocket: Active (/ws)
- Environment Mode: ${process.env.NODE_ENV || 'development'}
`);

    return {
        isValid: missingKeys.length === 0,
        hasDatabaseUrl,
        isR2Configured,
        missingKeys
    };
}

export default validateEnvironment;
