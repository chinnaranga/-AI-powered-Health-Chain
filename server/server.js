import express from 'express';
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

// Environment Validation
import { validateEnvironment } from './config/envValidator.js';
validateEnvironment();

// Initialize Firebase Admin SDK
import './config/firebaseAdmin.js';

// Enterprise Scaling Services
import { apmService } from './services/apmService.js';
import { globalRateLimiter } from './middleware/rateLimiter.js';

// Import Routes
import authRoutes from './routes/auth.js';
import hospitalRoutes from './routes/hospitals.js';
import recordRoutes from './routes/records.js';
import aiRoutes from './routes/ai.js';
import accessRoutes from './routes/access.js';
import logRoutes from './routes/log.js';
import smsRoutes from './routes/sms.js';
import r2FilesRoutes from './routes/r2Files.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Security & Protection Middleware
import { securityHeadersMiddleware, sanitizeInputMiddleware } from './middleware/securityMiddleware.js';
import { enforceTenantIsolation } from './middleware/tenantIsolation.js';
import { bruteForceProtection } from './middleware/bruteForceProtection.js';

// Middleware
app.use(securityHeadersMiddleware);
app.use(sanitizeInputMiddleware);
app.use(cors({
    origin: (origin, callback) => {
        // Reflect requesting origin to support credentials and cross-origin calls
        callback(null, true);
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

// Root welcome route
app.get('/', (req, res) => {
    res.json({
        service: 'HealthChain Enterprise Cloudflare Native Backend',
        status: 'online',
        database: 'Cloudflare D1 SQL Relational Database',
        fileStorage: 'Cloudflare R2 (S3-Compatible Private Buckets)',
        healthCheck: '/api/health',
        metrics: '/api/metrics'
    });
});

// API Routes
app.use('/api', authRoutes);
app.use('/api', hospitalRoutes);
app.use('/api', recordRoutes);
app.use('/api', aiRoutes);
app.use('/api', accessRoutes);
app.use('/api', logRoutes);
app.use('/api', smsRoutes);
app.use('/api', r2FilesRoutes);

// Health & Telemetry Metrics Endpoints
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        database: 'Cloudflare D1 SQL Database',
        authentication: 'Cloudflare Workers JWT Auth + KV Session Store',
        storage: 'Cloudflare R2 Enterprise Storage (Presigned SigV4)',
        aiEngine: 'Google Gemma 4 Core'
    });
});

app.get('/api/metrics', (req, res) => {
    res.json(apmService.getMetrics());
});

app.listen(PORT, () => {
    console.log(`[HealthChain Enterprise Server] High-scale engine listening on http://localhost:${PORT}`);
});
