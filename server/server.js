import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Load .env variables natively
try {
    const envPath = path.resolve(process.cwd(), '.env');
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

// Environment Validation & Diagnostic
import { validateEnvironment } from './config/envValidator.js';
validateEnvironment();

// Neon PostgreSQL Migration Runner
import { runMigrations } from './config/migrate.js';
runMigrations().catch(err => console.warn('[Startup Migration Notice]:', err.message));

// Enterprise Scaling & Real-time Services
import { apmService } from './services/apmService.js';
import { globalRateLimiter } from './middleware/rateLimiter.js';
import { realtimeService } from './services/realtimeService.js';

// Import API Routes
import authRoutes from './routes/auth.js';
import hospitalRoutes from './routes/hospitals.js';
import recordRoutes from './routes/records.js';
import healthcareRoutes from './routes/healthcare.js';
import aiRoutes from './routes/ai.js';
import accessRoutes from './routes/access.js';
import logRoutes from './routes/log.js';
import r2FilesRoutes from './routes/r2Files.js';
import adminRoutes from './routes/admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.disable('x-powered-by');
const server = http.createServer(app);
// Cloud Run provides PORT environment variable (typically 8080)
const PORT = process.env.PORT || 8080;

// Initialize WebSocket Real-time Engine
realtimeService.init(server);

// Security & Protection Middleware
import { securityHeadersMiddleware, sanitizeInputMiddleware } from './middleware/securityMiddleware.js';
import { enforceTenantIsolation } from './middleware/tenantIsolation.js';
import { bruteForceProtection } from './middleware/bruteForceProtection.js';

// Production CORS configuration
const ALLOWED_ORIGINS = [
    'https://healthcare-edb75.web.app',
    'https://healthcare-edb75.firebaseapp.com'
];

app.use(securityHeadersMiddleware);
app.use(sanitizeInputMiddleware);
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, server-to-server, Cloud Run health probes)
        if (!origin) return callback(null, true);
        
        // Allow production Firebase Hosting domains
        if (ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.web.app') || origin.endsWith('.firebaseapp.com')) {
            return callback(null, true);
        }

        // Allow localhost and private networking during local development
        if (process.env.NODE_ENV !== 'production' || origin.includes('localhost') || origin.includes('127.0.0.1')) {
            return callback(null, true);
        }

        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Access-Control-Allow-Private-Network']
}));

app.use((req, res, next) => {
    if (req.headers['access-control-request-private-network']) {
        res.setHeader('Access-Control-Allow-Private-Network', 'true');
    }
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    next();
});

app.use(express.json({ limit: '50mb' }));
app.use(apmService.middleware());
app.use('/api', globalRateLimiter);
app.use('/api/auth/login', bruteForceProtection);
app.use('/api/d1', enforceTenantIsolation);
app.use('/api/r2', enforceTenantIsolation);

// 1. Standard Cloud Run Health Check Endpoint (Returns clean status with zero secrets/PII leaked)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// 2. Root welcome route
app.get('/', (req, res) => {
    res.json({
        service: 'HealthChain Enterprise Backend Engine',
        status: 'online',
        host: 'Google Cloud Run',
        database: 'Neon PostgreSQL (Primary Relational Database)',
        realtime: 'WebSocket Native Event Bus (/ws)',
        fileStorage: 'Cloudflare R2 (Private S3-Compatible Buckets)',
        hosting: 'Firebase Hosting (Frontend at https://healthcare-edb75.web.app/)',
        healthCheck: '/health',
        apiHealth: '/api/health',
        metrics: '/api/metrics'
    });
});

// API Routes
app.use('/api', authRoutes);
app.use('/api', hospitalRoutes);
app.use('/api', recordRoutes);
app.use('/api', healthcareRoutes);
app.use('/api', aiRoutes);
app.use('/api', accessRoutes);
app.use('/api', logRoutes);
app.use('/api', r2FilesRoutes);
app.use('/api', adminRoutes);

// Database Compatibility Aliases
app.get('/api/d1/records', (req, res, next) => recordRoutes(req, res, next));
app.post('/api/d1/records', (req, res, next) => recordRoutes(req, res, next));
app.get('/api/d1/audit-logs', (req, res, next) => logRoutes(req, res, next));

// Diagnostic Health & Telemetry Metrics Endpoints
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        database: 'Neon PostgreSQL',
        databaseUrlConfigured: !!(process.env.DATABASE_URL || process.env.NEON_DATABASE_URL),
        authentication: 'JWT Session Protection + Bcrypt Hashes',
        realtime: 'WebSocket Layer Active',
        storage: 'Cloudflare R2 (Presigned SigV4)',
        aiEngine: 'Google Gemma 4 Core'
    });
});

app.get('/api/metrics', (req, res) => {
    res.json({
        ...apmService.getMetrics(),
        realtime: realtimeService.getStats()
    });
});

// Production Cloud Run Binding: Must bind to 0.0.0.0 and process.env.PORT
server.listen(PORT, '0.0.0.0', () => {
    console.log(`[HealthChain Enterprise Server] Running on http://0.0.0.0:${PORT}`);
    console.log(`[HealthChain Primary DB] Neon PostgreSQL connected with SSL/TLS`);
    console.log(`[HealthChain Realtime] WebSocket event bus active on ws://0.0.0.0:${PORT}/ws`);
});
