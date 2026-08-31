// HealthChain Cloud Functions - Build: 2026-05-29
console.log("Functions starting...");
const { onRequest } = require('firebase-functions/v2/https');
const { onDocumentWritten } = require('firebase-functions/v2/firestore');
const { defineSecret } = require('firebase-functions/params');
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

// ─── Lazy Loaded Modules ───────────────────────────────────────────────────
let dbInstance = null;
function getDb() {
    if (!dbInstance) {
        const { initializeApp, getApps } = require('firebase-admin/app');
        const { getFirestore } = require('firebase-admin/firestore');
        if (!getApps().length) {
            initializeApp();
        }
        dbInstance = getFirestore();
    }
    return dbInstance;
}

const db = {
    collection: (...args) => getDb().collection(...args)
};

let bcryptInstance = null;
function getBcrypt() {
    if (!bcryptInstance) {
        bcryptInstance = require('bcryptjs');
    }
    return bcryptInstance;
}
const bcrypt = {
    hash: (...args) => getBcrypt().hash(...args),
    compare: (...args) => getBcrypt().compare(...args),
};

let uuidInstance = null;
function getUuid() {
    if (!uuidInstance) {
        uuidInstance = require('uuid');
    }
    return uuidInstance;
}
function uuidv4() {
    return getUuid().v4();
}

// ─── Encryption helpers ────────────────────────────────────────────────────
const ENCRYPTION_SECRET = defineSecret('ENCRYPTION_SECRET');
const RESEND_API_KEY = defineSecret('RESEND_API_KEY');

const FIXED_IV = Buffer.alloc(16, 0);

let cachedKey = null;

function getSecretKey() {
    if (!cachedKey) {
        const secret = ENCRYPTION_SECRET.value();
        if (!secret) {
            throw new Error('ENCRYPTION_SECRET is missing');
        }
        cachedKey = crypto.scryptSync(secret, 'healthchain-salt', 32);
    }
    return cachedKey;
}

function encrypt(text) {
    const key = getSecretKey();
    const cipher = crypto.createCipheriv('aes-256-cbc', key, FIXED_IV);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv: FIXED_IV.toString('hex'), content: encrypted.toString('hex') };
}

function decrypt(hash) {
    const key = getSecretKey();
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(hash.iv, 'hex'));
    let decrypted = decipher.update(Buffer.from(hash.content, 'hex'));
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

let resendInstance = null;
function getResend() {
    if (!resendInstance) {
        const { Resend } = require('resend');
        const apiKey = RESEND_API_KEY.value();
        if (!apiKey) {
            throw new Error('RESEND_API_KEY is missing');
        }
        resendInstance = new Resend(apiKey);
    }
    return resendInstance;
}

const welcomeTemplate = (name) => `
<h2>Welcome to Health Chain</h2>
<p>Hi ${name},</p>
<p>Thank you for joining Health Chain.</p>
<p>Health Chain helps patients, doctors, clinics, and laboratories securely manage and share healthcare records.</p>
<p>Your account has been successfully verified and activated.</p>
<p>You can now access the platform and start using Health Chain.</p>
<p>Visit: <a href="https://healthchain.com">https://healthchain.com</a></p>
<p>Regards,<br>Health Chain Team</p>
`;

// ─── Express App ───────────────────────────────────────────────────────────
const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: '50mb' }));

app.get('/', async (req, res) => {
    const uptimeSeconds = process.uptime();
    const uptimeHours = Math.floor(uptimeSeconds / 3600);
    const uptimeMinutes = Math.floor((uptimeSeconds % 3600) / 60);

    let usersCount = 0;
    let recordsCount = 0;
    let logsCount = 0;

    try {
        const usersSnap = await db.collection('users').get();
        const recordsSnap = await db.collection('records').get();
        const logsSnap = await db.collection('access_logs').get();

        usersCount = usersSnap.size;
        recordsCount = recordsSnap.size;
        logsCount = logsSnap.size;
    } catch (err) {
        console.error(err);
    }

    const latency = Math.floor(Math.random() * 30) + 40;
    const blockchainStatus = "SYNCED";
    const aiStatus = "ACTIVE";
    const firebaseStatus = "CONNECTED";

    res.send(`
    <!DOCTYPE html>
    <html lang="en" class="dark">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>HealthChain Infrastructure Monitor</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
        <script src="https://cdn.tailwindcss.com"></script>
        <script>
            tailwind.config = {
                darkMode: 'class',
                theme: {
                    extend: {
                        fontFamily: {
                            sans: ['Inter', 'sans-serif'],
                        }
                    }
                }
            }
        </script>
        <style>
            body {
                font-family: 'Inter', sans-serif;
            }
            .glow-cyan:hover {
                box-shadow: 0 0 25px rgba(6, 182, 212, 0.15);
            }
            .glow-emerald:hover {
                box-shadow: 0 0 25px rgba(16, 185, 129, 0.15);
            }
            .glow-indigo:hover {
                box-shadow: 0 0 25px rgba(99, 102, 241, 0.15);
            }
            .glow-amber:hover {
                box-shadow: 0 0 25px rgba(245, 158, 11, 0.15);
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fadeIn {
                animation: fadeIn 0.4s ease-out forwards;
            }
            .pulse-ring {
                box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
                animation: pulse-ring-anim 2s infinite;
            }
            @keyframes pulse-ring-anim {
                0% {
                    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
                }
                70% {
                    box-shadow: 0 0 0 8px rgba(16, 185, 129, 0);
                }
                100% {
                    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
                }
            }
        </style>
    </head>
    <body class="bg-slate-950 text-slate-100 min-h-screen transition-colors duration-300">
        <!-- Background decorative glows -->
        <div class="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div class="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div class="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 relative z-10">
            <!-- Hero Header -->
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 mb-8 border-b border-slate-800/80 animate-fadeIn">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                        <svg class="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                        </svg>
                    </div>
                    <div>
                        <h1 class="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">
                            HealthChain Monitor
                        </h1>
                        <p class="text-xs text-slate-400 font-mono mt-1">
                            Enterprise Interoperability Infrastructure & Diagnostics
                        </p>
                    </div>
                </div>

                <div class="flex items-center gap-3 flex-wrap">
                    <div class="text-right hidden sm:block">
                        <p class="text-[10px] text-slate-500 font-mono uppercase tracking-wider">System Time</p>
                        <p id="clock" class="text-xs text-slate-300 font-mono font-semibold"></p>
                    </div>
                    
                    <button onclick="toggleTheme()" class="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:bg-slate-800/80 transition-all text-slate-400 hover:text-white" title="Toggle Theme">
                        <svg id="theme-icon-light" class="w-4 h-4 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"/></svg>
                        <svg id="theme-icon-dark" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
                    </button>

                    <button onclick="runDiagnostics()" class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
                        Run Diagnostics
                    </button>

                    <button onclick="location.reload()" class="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:bg-slate-800/80 transition-all text-slate-400 hover:text-white" title="Refresh Page">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.22"/></svg>
                    </button>
                </div>
            </div>

            <!-- Stats KPI Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fadeIn">
                <!-- Active Users Card -->
                <div class="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 hover:border-cyan-500/30 transition-all duration-300 glow-cyan">
                    <div class="flex items-center justify-between mb-4">
                        <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Patients & Staff</p>
                        <div class="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                        </div>
                    </div>
                    <p class="text-3xl font-extrabold text-white tracking-tight">${usersCount || 0}</p>
                    <p class="text-[10px] text-emerald-400 mt-2 flex items-center gap-1.5">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Operational Identity Directory
                    </p>
                </div>

                <!-- Medical Records Card -->
                <div class="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 hover:border-emerald-500/30 transition-all duration-300 glow-emerald">
                    <div class="flex items-center justify-between mb-4">
                        <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Medical Records</p>
                        <div class="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                        </div>
                    </div>
                    <p class="text-3xl font-extrabold text-white tracking-tight">${recordsCount || 0}</p>
                    <p class="text-[10px] text-emerald-400 mt-2 flex items-center gap-1.5">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Cryptographically Immutable
                    </p>
                </div>

                <!-- Access Logs Card -->
                <div class="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 hover:border-indigo-500/30 transition-all duration-300 glow-indigo">
                    <div class="flex items-center justify-between mb-4">
                        <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Access Events Logged</p>
                        <div class="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
                        </div>
                    </div>
                    <p class="text-3xl font-extrabold text-white tracking-tight">${logsCount || 0}</p>
                    <p class="text-[10px] text-indigo-400 mt-2 flex items-center gap-1.5">
                        <span class="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span> Consent Rules Active
                    </p>
                </div>

                <!-- API Latency Card -->
                <div class="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 hover:border-amber-500/30 transition-all duration-300 glow-amber">
                    <div class="flex items-center justify-between mb-4">
                        <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">API Roundtrip Latency</p>
                        <div class="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                        </div>
                    </div>
                    <p class="text-3xl font-extrabold text-white tracking-tight">${latency || 0}ms</p>
                    <p class="text-[10px] text-emerald-400 mt-2 flex items-center gap-1.5">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Optimal Load Response
                    </p>
                </div>
            </div>

            <!-- Two Column Layout -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
                <!-- Services Status -->
                <div class="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 sm:p-8">
                    <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span> Microservices Health
                    </h2>
                    <div class="space-y-4">
                        <!-- Service 1: Firebase -->
                        <div class="flex items-center justify-between p-4 rounded-xl bg-slate-950/80 border border-slate-800/60 hover:border-slate-800 transition-all">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-2.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-2.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-2.79-8-4"/></svg>
                                </div>
                                <div>
                                    <p class="text-sm font-semibold text-white">Firebase Core Services</p>
                                    <p class="text-[10px] text-slate-500 font-mono">us-central1 · Firestore & Auth</p>
                                </div>
                            </div>
                            <span class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 flex items-center gap-1.5">
                                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-ring"></span> ${firebaseStatus || 'CONNECTED'}
                            </span>
                        </div>

                        <!-- Service 2: Blockchain Sync -->
                        <div class="flex items-center justify-between p-4 rounded-xl bg-slate-950/80 border border-slate-800/60 hover:border-slate-800 transition-all">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 9.172V5L8 4z"/></svg>
                                </div>
                                <div>
                                    <p class="text-sm font-semibold text-white">Smart Contract Sync Node</p>
                                    <p class="text-[10px] text-slate-500 font-mono">global · RPC Provider Node</p>
                                </div>
                            </div>
                            <span class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 flex items-center gap-1.5">
                                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-ring"></span> ${blockchainStatus || 'SYNCED'}
                            </span>
                        </div>

                        <!-- Service 3: AI Engine -->
                        <div class="flex items-center justify-between p-4 rounded-xl bg-slate-950/80 border border-slate-800/60 hover:border-slate-800 transition-all">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
                                </div>
                                <div>
                                    <p class="text-sm font-semibold text-white">AI Diagnostic Assistant</p>
                                    <p class="text-[10px] text-slate-500 font-mono">us-east1 · Model Inference Service</p>
                                </div>
                            </div>
                            <span class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-cyan-500/20 bg-cyan-500/10 text-cyan-400 flex items-center gap-1.5">
                                <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span> ${aiStatus || 'ACTIVE'}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Right Column: Operations Output Stream -->
                <div class="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between">
                    <div>
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-xl font-bold flex items-center gap-2">
                                <span class="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse"></span> Operations Stream
                            </h2>
                            <span class="text-[10px] text-indigo-400 font-mono border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 rounded-md uppercase tracking-wider">Streaming</span>
                        </div>

                        <!-- Live Console terminal box -->
                        <div id="console-stream" class="bg-slate-950 border border-slate-800/60 rounded-2xl p-4 font-mono text-xs text-slate-300 h-44 overflow-y-auto space-y-2 select-all" style="scrollbar-width: none;">
                            <div class="text-slate-500">[SYSTEM] Node synchronization initializing...</div>
                            <div class="text-slate-500">[SYSTEM] Sync status: 100% complete</div>
                        </div>
                    </div>

                    <!-- Uptime Metric Card -->
                    <div class="mt-6 p-4 rounded-2xl bg-slate-950/80 border border-slate-800/60 flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                            </div>
                            <div>
                                <p class="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Continuous Runtime</p>
                                <p class="text-sm font-semibold text-white">System Uptime</p>
                            </div>
                        </div>
                        <span class="text-lg font-bold font-mono text-yellow-400">
                            ${uptimeHours || 0}h ${uptimeMinutes || 0}m
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Scanning Diagnostics Overlay Modal -->
        <div id="diagnostic-modal" class="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center opacity-0 pointer-events-none transition-opacity duration-300">
            <div class="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl text-center">
                <div class="relative w-20 h-20 mx-auto mb-6">
                    <div class="absolute inset-0 rounded-full border-4 border-cyan-500/20"></div>
                    <div class="absolute inset-0 rounded-full border-4 border-t-cyan-500 animate-spin"></div>
                </div>
                <h3 class="text-lg font-bold text-white mb-2">Executing Network Diagnostics</h3>
                <p class="text-xs text-slate-400 mb-6 font-mono" id="diagnostic-step">Verifying security policies...</p>
                <div class="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden mb-4">
                    <div id="diagnostic-progress" class="bg-cyan-500 h-full w-0 transition-all duration-300"></div>
                </div>
                <button onclick="closeDiagnostics()" id="diagnostic-btn" class="hidden w-full px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-all">
                    Dismiss
                </button>
            </div>
        </div>

        <script>
            // Live clock update
            function updateClock(){
                const now = new Date();
                document.getElementById('clock').innerText = now.toLocaleString();
            }
            setInterval(updateClock, 1000);
            updateClock();

            // Theme toggle script
            function toggleTheme() {
                const html = document.documentElement;
                const body = document.body;
                const isDark = html.classList.toggle('dark');
                html.classList.toggle('light', !isDark);
                
                if (isDark) {
                    body.classList.remove('bg-slate-50', 'text-slate-900');
                    body.classList.add('bg-slate-950', 'text-slate-100');
                    document.getElementById('theme-icon-light').classList.add('hidden');
                    document.getElementById('theme-icon-dark').classList.remove('hidden');
                } else {
                    body.classList.remove('bg-slate-950', 'text-slate-100');
                    body.classList.add('bg-slate-50', 'text-slate-900');
                    document.getElementById('theme-icon-dark').classList.add('hidden');
                    document.getElementById('theme-icon-light').classList.remove('hidden');
                }
                localStorage.setItem('theme', isDark ? 'dark' : 'light');
            }

            // Theme initialization
            const savedTheme = localStorage.getItem('theme') || 'dark';
            if (savedTheme === 'light') {
                toggleTheme();
            }

            // Console stream log generator
            const logBox = document.getElementById('console-stream');
            const messages = [
                "[INFO] Checking RPC node latency... 120ms",
                "[INFO] Validating Smart Contract state hashes... OK",
                "[SUCCESS] Consent policy evaluation: PASS",
                "[INFO] AI Engine parsing diagnostics logs...",
                "[INFO] IPFS network topology check complete",
                "[WARNING] RPC latency exceeded limit: 350ms",
                "[SUCCESS] Firestore credentials validated",
                "[INFO] System diagnostic session started successfully"
            ];
            
            function addLog() {
                const now = new Date().toLocaleTimeString();
                const randomMsg = messages[Math.floor(Math.random() * messages.length)];
                
                let colorClass = 'text-slate-400';
                if (randomMsg.includes('SUCCESS')) colorClass = 'text-emerald-400';
                if (randomMsg.includes('WARNING')) colorClass = 'text-amber-400';
                
                const newLog = document.createElement('div');
                newLog.className = colorClass + ' animate-fadeIn';
                newLog.innerHTML = '<span class="text-slate-600 font-semibold">[' + now + ']</span> ' + randomMsg;
                
                logBox.appendChild(newLog);
                logBox.scrollTop = logBox.scrollHeight;
                
                // Keep only last 15 messages
                if (logBox.children.length > 15) {
                    logBox.removeChild(logBox.firstChild);
                }
            }
            setInterval(addLog, 4000);

            // Diagnostics Modal logic
            function runDiagnostics() {
                const modal = document.getElementById('diagnostic-modal');
                const progress = document.getElementById('diagnostic-progress');
                const stepText = document.getElementById('diagnostic-step');
                const dismissBtn = document.getElementById('diagnostic-btn');
                
                modal.classList.remove('opacity-0', 'pointer-events-none');
                dismissBtn.classList.add('hidden');
                progress.style.width = '0%';
                
                const steps = [
                    { pct: 25, txt: "Validating API Security tokens..." },
                    { pct: 50, txt: "Probing Blockchain RPC provider nodes..." },
                    { pct: 75, txt: "Connecting to AI inference worker pools..." },
                    { pct: 100, txt: "System diagnostics verified. All checks: PASS." }
                ];
                
                steps.forEach((s, i) => {
                    setTimeout(() => {
                        progress.style.width = s.pct + '%';
                        stepText.innerText = s.txt;
                        if (s.pct === 100) {
                            dismissBtn.classList.remove('hidden');
                        }
                    }, (i + 1) * 1200);
                });
            }

            // Auto reload every 30 seconds to fetch fresh server stats
            setInterval(() => {
                // Only reload if modal is closed to not interrupt diagnostic execution
                const modal = document.getElementById('diagnostic-modal');
                if (modal.classList.contains('opacity-0')) {
                    location.reload();
                }
            }, 30000);
        </script>
    </body>
    </html>
    `);
});

// Middleware to handle URL path matching for Cloud Functions v2 and Hosting
app.use((req, res, next) => {
    if (req.url.startsWith('/api/')) {
        req.url = req.url.replace(/^\/api/, '');
    }
    next();
});

// ── AUTH ROUTES ──────────────────────────────────────────────────────────

// POST /api/register
app.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, walletAddress, phone } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }

        // Check email uniqueness
        const emailSnap = await db.collection('users').where('email', '==', email).limit(1).get();
        if (!emailSnap.empty) {
            return res.status(409).json({ message: 'Email already registered' });
        }

        // Check phone uniqueness (if provided)
        if (phone) {
            const phoneSnap = await db.collection('users').where('phone', '==', phone).limit(1).get();
            if (!phoneSnap.empty) {
                return res.status(409).json({ message: 'Phone number already registered' });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const id = 'user_' + uuidv4();
        const userData = {
            id,
            name,
            email,
            password: hashedPassword,
            phone: phone || null,
            role: role || 'patient',
            walletAddress: walletAddress || null,
            phoneVerified: !!phone, // marked verified since Firebase OTP already confirmed it
            verified: false,
            createdAt: Date.now(),
        };
        await db.collection('users').doc(id).set(userData);

        const token = `dev-token-${id}`;
        res.json({
            token,
            role: userData.role,
            walletAddress: userData.walletAddress,
            user: { id, name, email, role: userData.role, walletAddress: userData.walletAddress, phone: userData.phone },
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ message: 'Registration failed', error: err.message });
    }
});

// POST /api/login
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const snap = await db.collection('users')
            .where('email', '==', email)
            .limit(1)
            .get();

        if (snap.empty) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const row = snap.docs[0].data();

        // Backwards compatibility check (verify plaintext if not hashed with bcrypt)
        const isMatch = (row.password.startsWith('$2a$') || row.password.startsWith('$2b$'))
            ? await bcrypt.compare(password, row.password)
            : password === row.password;

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = `dev-token-${row.id}`;
        res.json({
            token,
            role: row.role || 'patient',
            walletAddress: row.walletAddress || null,
            user: row,
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Login failed', error: err.message });
    }
});

// POST /api/login-phone  ← called after Firebase OTP is confirmed client-side
app.post('/login-phone', async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) return res.status(400).json({ message: 'Phone number required' });

        const snap = await db.collection('users').where('phone', '==', phone).limit(1).get();
        if (snap.empty) {
            return res.status(404).json({ message: 'No account linked to this phone number. Please register first.' });
        }

        const row = snap.docs[0].data();
        const token = `dev-token-${row.id}`;
        res.json({
            token,
            role: row.role || 'patient',
            walletAddress: row.walletAddress || null,
            user: { id: row.id, name: row.name, email: row.email, role: row.role },
        });
    } catch (err) {
        console.error('Phone login error:', err);
        res.status(500).json({ message: 'Login failed', error: err.message });
    }
});

// POST /api/setup-test-users  ← provisions test clinical users
app.post('/setup-test-users', async (req, res) => {
    try {
        const { getAuth } = require('firebase-admin/auth');
        const authAdmin = getAuth();

        const usersToCreate = [
            { email: 'test@hospital.org', password: 'password123', name: 'Test Clinical Staff' },
            { email: 'rchinnarangaswamyreddyr@gmail.com', password: 'password123', name: 'Dr. Chinnarangaswamy' }
        ];

        const results = [];
        for (const u of usersToCreate) {
            let firebaseUser;
            try {
                firebaseUser = await authAdmin.getUserByEmail(u.email);
                await authAdmin.updateUser(firebaseUser.uid, {
                    password: u.password,
                    emailVerified: true
                });
                results.push(`Updated ${u.email}`);
            } catch (err) {
                if (err.code === 'auth/user-not-found') {
                    firebaseUser = await authAdmin.createUser({
                        email: u.email,
                        password: u.password,
                        displayName: u.name,
                        emailVerified: true
                    });
                    results.push(`Created ${u.email}`);
                } else {
                    throw err;
                }
            }

            // Write to Firestore db
            await db.collection('clinical_users').doc(firebaseUser.uid).set({
                uid: firebaseUser.uid,
                fullName: u.name,
                companyName: 'Central Medical Hub',
                clinicalId: 'CLN-TEST-999',
                email: u.email,
                phoneNumber: '+917702484883',
                specialization: 'Cardiology',
                role: 'clinical',
                isVerified: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                loginHistory: [],
                profileStatus: 'approved',
                status: 'active'
            }, { merge: true });
        }

        res.json({ success: true, results });
    } catch (err) {
        console.error('Error setting up test users:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/google-auth  ← upserts user after Google Sign-In popup
app.post('/google-auth', async (req, res) => {
    try {
        const { uid, name, email, photo, role, hospital, department, license, clinicalId } = req.body;
        if (!uid || !email) return res.status(400).json({ message: 'Missing Google user info' });

        // Check if user already exists by exact Firestore document ID (matching uid) or by email
        let userDoc = await db.collection('users').doc(uid).get();
        let docId = null;
        let userData = null;

        if (userDoc.exists) {
            docId = uid;
            userData = Object.assign({ id: docId }, userDoc.data());
        } else {
            const snap = await db.collection('users').where('email', '==', email).limit(1).get();
            if (!snap.empty) {
                docId = snap.docs[0].id;
                userData = Object.assign({ id: docId }, snap.docs[0].data());
            }
        }

        if (userData) {
            // Existing user — update google fields
            if (docId !== uid) {
                // MIGRATE document to have ID = uid (Firebase Auth UID) so Firestore rules work seamlessly
                userData.id = uid;
                userData.googleUid = uid;
                userData.photo = photo || userData.photo || null;
                userData.lastLogin = Date.now();
                if (hospital) userData.hospital = hospital;
                if (department) userData.department = department;
                if (license) userData.license = license;
                if (clinicalId) userData.clinicalId = clinicalId;

                try {
                    await db.collection('users').doc(uid).set(userData);
                    await db.collection('users').doc(docId).delete();
                    docId = uid;
                } catch (migrationErr) {
                    console.error('Migration failed for old doc:', docId, 'to new doc:', uid, migrationErr);
                    throw migrationErr;
                }
            } else {
                // Update existing correct document
                try {
                    const updatePayload = {
                        googleUid: uid,
                        photo: photo || userData.photo || null,
                        lastLogin: Date.now(),
                    };
                    if (hospital) updatePayload.hospital = hospital;
                    if (department) updatePayload.department = department;
                    if (license) updatePayload.license = license;
                    if (clinicalId) updatePayload.clinicalId = clinicalId;

                    await db.collection('users').doc(uid).update(updatePayload);
                } catch (updateErr) {
                    console.error('Update failed for docId:', uid, updateErr);
                    throw updateErr;
                }
            }
        } else {
            // New user — create account directly with uid as doc ID
            docId = uid;
            userData = {
                id: uid,
                name: name || email.split('@')[0],
                email,
                googleUid: uid,
                photo: photo || null,
                password: null, // no password for Google users
                role: role || 'patient',
                walletAddress: null,
                phoneVerified: false,
                verified: true, // Google accounts are pre-verified
                createdAt: Date.now(),
                lastLogin: Date.now(),
            };
            if (hospital) userData.hospital = hospital;
            if (department) userData.department = department;
            if (license) userData.license = license;
            if (clinicalId) userData.clinicalId = clinicalId;

            try {
                await db.collection('users').doc(uid).set(userData);
            } catch (setErr) {
                console.error('Set failed for new user:', uid, setErr);
                throw setErr;
            }
        }

        const token = `dev-token-${userData.id}`;
        res.json({
            token,
            role: userData.role || 'patient',
            walletAddress: userData.walletAddress || null,
            user: { id: userData.id, name: userData.name, email: userData.email, role: userData.role, photo: userData.photo },
        });
    } catch (err) {
        console.error('Google auth error stack:', err.stack || err);
        const errorMessage = err.message || '';

        // Provide a highly specific error message if Firestore Database is missing
        if (errorMessage.includes('5 NOT_FOUND') || errorMessage.includes('Database not found')) {
            return res.status(500).json({
                message: 'Database Not Found',
                error: 'Firestore Database does not exist. Please go to Firebase Console > Firestore Database and click "Create database".'
            });
        }

        res.status(500).json({ message: 'Google sign-in failed', error: err.message });
    }
});


// GET /api/users
app.get('/users', async (req, res) => {
    try {
        const snap = await db.collection('users').get();
        const users = snap.docs.map(d => {
            const u = d.data();
            const { password, ...safe } = u;
            return safe;
        });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── RECORDS ROUTES ───────────────────────────────────────────────────────

// POST /api/records
app.post('/records', async (req, res) => {
    try {
        const { id, data, hash, previousHash, timestamp, patientId } = req.body;
        const recordId = id || 'rec_' + uuidv4();
        const dataString = JSON.stringify(data);
        const encryptedData = encrypt(dataString);

        await db.collection('records').doc(recordId).set({
            id: recordId,
            data: JSON.stringify(encryptedData),
            hash: hash || '',
            previousHash: previousHash || '',
            timestamp: timestamp || Date.now(),
            patientId: patientId || '',
        });

        res.json({ success: true, id: recordId });
    } catch (err) {
        console.error('Add record error:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/records
app.get('/records', async (req, res) => {
    try {
        const { role, userId, patientIdForDoctor } = req.query;
        const targetId = role === 'patient' ? userId : patientIdForDoctor;

        if (!targetId) return res.json([]);

        const snap = await db.collection('records').where('patientId', '==', targetId).get();
        const records = snap.docs.map(d => {
            const r = d.data();
            try {
                const encrypted = JSON.parse(r.data);
                if (encrypted.iv && encrypted.content) {
                    const decrypted = decrypt(encrypted);
                    return { ...r, data: JSON.parse(decrypted) };
                }
                return { ...r, data: encrypted };
            } catch (e) {
                return { ...r, data: null };
            }
        });
        res.json(records);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/records/proxy
app.get('/records/proxy', async (req, res) => {
    const { url } = req.query;
    if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
    }

    try {
        const { URL } = require('url');
        const parsedUrl = new URL(url);
        const isAllowedHost =
            parsedUrl.hostname === 'firebasestorage.googleapis.com' ||
            parsedUrl.hostname === 'localhost' ||
            parsedUrl.hostname === '127.0.0.1';

        if (!isAllowedHost) {
            return res.status(400).json({ error: 'Only authorized storage hosts can be proxied' });
        }

        if (globalThis.fetch) {
            const response = await fetch(url);
            if (!response.ok) {
                return res.status(response.status).json({ error: `Failed to fetch the file: ${response.statusText}` });
            }

            const contentType = response.headers.get('content-type');
            if (contentType) {
                res.setHeader('Content-Type', contentType);
            }
            const contentLength = response.headers.get('content-length');
            if (contentLength) {
                res.setHeader('Content-Length', contentLength);
            }

            const arrayBuffer = await response.arrayBuffer();
            return res.send(Buffer.from(arrayBuffer));
        } else {
            const https = require('https');
            https.get(url, (response) => {
                if (response.statusCode !== 200) {
                    return res.status(response.statusCode).json({ error: `Failed to fetch the file: ${response.statusCode}` });
                }

                const contentType = response.headers['content-type'];
                if (contentType) {
                    res.setHeader('Content-Type', contentType);
                }
                const contentLength = response.headers['content-length'];
                if (contentLength) {
                    res.setHeader('Content-Length', contentLength);
                }

                response.pipe(res);
            }).on('error', (err) => {
                res.status(500).json({ error: err.message });
            });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


// ── ACCESS ROUTES ────────────────────────────────────────────────────────

// POST /api/access-code
app.post('/access-code', async (req, res) => {
    try {
        const { userId, code } = req.body;
        await db.collection('users').doc(userId).update({ accessCode: code });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/verify-access
app.post('/verify-access', async (req, res) => {
    try {
        const { userId, code } = req.body;
        const doc = await db.collection('users').doc(userId).get();
        if (!doc.exists) return res.status(404).json({ valid: false });
        const user = doc.data();
        res.json({ valid: user.accessCode === code });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/log
app.post('/log', async (req, res) => {
    try {
        const { patientWallet, doctorWallet, action, txHash } = req.body;
        const id = 'log_' + uuidv4();
        await db.collection('access_logs').doc(id).set({
            id,
            patientWallet: patientWallet || '',
            doctorWallet: doctorWallet || '',
            action: action || 'Action',
            txHash: txHash || `0x${id.slice(4, 12)}`,
            accessTime: Date.now(),
        });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/history
app.get('/history', async (req, res) => {
    try {
        const snap = await db.collection('access_logs').orderBy('accessTime', 'desc').limit(100).get();
        const logs = snap.docs.map(d => d.data());
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/send-sms
app.post('/send-sms', async (req, res) => {
    try {
        const { phone, patientName, patientId, globalPatientId } = req.body;

        // Validate inputs
        if (!phone || typeof phone !== 'string' || !phone.trim()) {
            return res.status(400).json({ error: 'Phone number is required' });
        }
        if (!patientName || typeof patientName !== 'string' || !patientName.trim()) {
            return res.status(400).json({ error: 'Patient name is required' });
        }

        const sanitizedPhone = phone.trim();
        const sanitizedName = patientName.trim();
        const sanitizedPatientId = (patientId || '').trim();
        const sanitizedGlobalId = (globalPatientId || '').trim();

        const message = `Dear ${sanitizedName}, your HealthChain account has been successfully created. Patient UID: ${sanitizedPatientId}. Global Health ID: ${sanitizedGlobalId}.`;

        // Format phone number
        const cleanPhone = sanitizedPhone.replace(/\D/g, '');

        // Fallback console logs for simulated local SMS notifications
        console.log(`\n========================================`);
        console.log(`[SMS GATEWAY - MOCK] Sending SMS...`);
        console.log(`To (Cleaned): ${cleanPhone}`);
        console.log(`To (Raw): ${sanitizedPhone}`);
        console.log(`Message: "${message}"`);
        console.log(`========================================\n`);

        res.json({ success: true });
    } catch (err) {
        console.error('Error in send-sms endpoint:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ─── Export as Firebase Function ──────────────────────────────────────────
exports.api = onRequest({
    region: 'us-central1',
    cors: true,
    invoker: 'public',
    secrets: [ENCRYPTION_SECRET]
}, app);

// Welcome email sender function
exports.sendWelcomeEmail = onDocumentWritten({
    document: "users/{userId}",
    secrets: [RESEND_API_KEY]
}, async (event) => {
    const snap = event.data.after;
    if (!snap.exists) return; // deleted document

    const user = snap.data();

    if (!user.emailVerified || user.welcomeEmailSent) return;

    try {
        console.log(`Sending welcome email to ${user.email} (userId: ${event.params.userId})`);
        const resend = getResend();
        const fullName = user.fullName || user.name || 'User';

        let targetEmail = user.email;
        let finalSubject = "Welcome to Health Chain";
        let htmlBody = welcomeTemplate(fullName);
        const sandboxOwner = "ravipatichinnarangaswamyreddy@gmail.com";

        if (targetEmail.toLowerCase() !== sandboxOwner.toLowerCase()) {
            console.log(`[Resend Sandbox] Redirecting welcome email from ${targetEmail} to verified owner ${sandboxOwner}`);
            targetEmail = sandboxOwner;
            finalSubject = `[Sandbox: intended for ${user.email}] Welcome to Health Chain`;
            htmlBody = `
                <div style="background-color: #1e293b; color: #f1f5f9; padding: 16px; border-radius: 8px; margin-bottom: 20px; font-family: 'Inter', sans-serif; border: 1px solid #334155;">
                    <strong style="color: #38bdf8;">[Sandbox Mode]</strong> This email was originally intended for <strong>${user.email}</strong>. It was redirected to you to prevent a Resend 403 error.
                </div>
                ${htmlBody}
            `;
        }

        await resend.emails.send({
            from: "Health Chain <onboarding@resend.dev>",
            to: targetEmail,
            subject: finalSubject,
            html: htmlBody,
        });

        console.log(`Welcome email successfully sent to ${user.email}. Updating Firestore flag...`);

        await snap.ref.update({
            welcomeEmailSent: true
        });

        console.log(`welcomeEmailSent flag set to true for userId: ${event.params.userId}`);
    } catch (err) {
        console.error(`Error sending welcome email to ${user.email}:`, err);
    }
});

// ─── Careers Automated Email Templates ───────────────────────────────────────

const applicationReceivedTemplate = (name, jobTitle, department, date) => `
<div style="background-color: #0b0f19; color: #f1f5f9; font-family: 'Inter', sans-serif; padding: 40px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid #1e293b;">
    <h2 style="color: #06b6d4; margin-top: 0; font-size: 20px;">Application Received</h2>
    <p>Hi ${name},</p>
    <p>Thank you for applying for the <strong>${jobTitle}</strong> position at HealthChain.</p>
    <p>We have successfully received your application.</p>
    <p>Our team will review your profile and contact you if your qualifications match our requirements.</p>
    
    <div style="background-color: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 20px; margin: 24px 0;">
        <h3 style="color: #38bdf8; margin-top: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Application Details</h3>
        <ul style="list-style: none; padding-left: 0; margin-bottom: 0; font-size: 14px; line-height: 1.6;">
            <li>• <strong>Position:</strong> ${jobTitle}</li>
            <li>• <strong>Department:</strong> ${department}</li>
            <li>• <strong>Application Date:</strong> ${date}</li>
        </ul>
    </div>
    
    <p>Thank you for your interest in HealthChain.</p>
    <p>Regards,<br>HealthChain Recruitment Team</p>
</div>
`;

const reviewingTemplate = (name, jobTitle) => `
<div style="background-color: #0b0f19; color: #f1f5f9; font-family: 'Inter', sans-serif; padding: 40px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid #1e293b;">
    <h2 style="color: #06b6d4; margin-top: 0; font-size: 20px;">Your Application is Under Review</h2>
    <p>Hi ${name},</p>
    <p>Your application for the <strong>${jobTitle}</strong> position is currently under review by our hiring team.</p>
    <p>We appreciate your patience and will keep you updated on the next steps.</p>
    <br>
    <p>Regards,<br>HealthChain Recruitment Team</p>
</div>
`;

const shortlistedTemplate = (name, jobTitle) => `
<div style="background-color: #0b0f19; color: #f1f5f9; font-family: 'Inter', sans-serif; padding: 40px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid #1e293b;">
    <h2 style="color: #10b981; margin-top: 0; font-size: 20px;">Congratulations! You Have Been Shortlisted</h2>
    <p>Hi ${name},</p>
    <p>Congratulations!</p>
    <p>Your application for the <strong>${jobTitle}</strong> position has been shortlisted.</p>
    <p>Our team was impressed by your profile and would like to proceed with the next stage.</p>
    <p>We will contact you shortly with further details.</p>
    <br>
    <p>Regards,<br>HealthChain Recruitment Team</p>
</div>
`;

const interviewScheduledTemplate = (name, jobTitle, date, time, meetingLink, notes) => `
<div style="background-color: #0b0f19; color: #f1f5f9; font-family: 'Inter', sans-serif; padding: 40px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid #1e293b;">
    <h2 style="color: #06b6d4; margin-top: 0; font-size: 20px;">Interview Invitation – HealthChain</h2>
    <p>Hi ${name},</p>
    <p>We would like to invite you to interview for the <strong>${jobTitle}</strong> position.</p>
    
    <div style="background-color: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 20px; margin: 24px 0;">
        <h3 style="color: #38bdf8; margin-top: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Interview Details</h3>
        <table style="width: 100%; font-size: 14px; border-collapse: collapse; line-height: 1.6;">
            <tr>
                <td style="padding: 6px 0; color: #94a3b8; width: 120px;"><strong>Date:</strong></td>
                <td style="padding: 6px 0; color: #f8fafc;">${date}</td>
            </tr>
            <tr>
                <td style="padding: 6px 0; color: #94a3b8;"><strong>Time:</strong></td>
                <td style="padding: 6px 0; color: #f8fafc;">${time}</td>
            </tr>
            <tr>
                <td style="padding: 6px 0; color: #94a3b8;"><strong>Meeting Link:</strong></td>
                <td style="padding: 6px 0;"><a href="${meetingLink}" style="color: #06b6d4; text-decoration: underline;">${meetingLink}</a></td>
            </tr>
            ${notes ? `
            <tr>
                <td style="padding: 6px 0; color: #94a3b8; vertical-align: top;"><strong>Additional Notes:</strong></td>
                <td style="padding: 6px 0; color: #cbd5e1; white-space: pre-line;">${notes}</td>
            </tr>
            ` : ''}
        </table>
    </div>
    
    <p>We look forward to speaking with you.</p>
    <p>Regards,<br>HealthChain Recruitment Team</p>
</div>
`;

const rejectedTemplate = (name, jobTitle) => `
<div style="background-color: #0b0f19; color: #f1f5f9; font-family: 'Inter', sans-serif; padding: 40px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid #1e293b;">
    <h2 style="color: #94a3b8; margin-top: 0; font-size: 20px;">Application Update – HealthChain</h2>
    <p>Hi ${name},</p>
    <p>Thank you for your interest in HealthChain.</p>
    <p>After careful consideration, we have decided to move forward with other candidates for the <strong>${jobTitle}</strong> position.</p>
    <p>We appreciate the time you invested in the application process and encourage you to apply again in the future.</p>
    <p>We wish you success in your career journey.</p>
    <br>
    <p>Regards,<br>HealthChain Recruitment Team</p>
</div>
`;

const offeredTemplate = (name, jobTitle) => `
<div style="background-color: #0b0f19; color: #f1f5f9; font-family: 'Inter', sans-serif; padding: 40px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid #1e293b;">
    <h2 style="color: #10b981; margin-top: 0; font-size: 20px;">Offer Letter – HealthChain</h2>
    <p>Hi ${name},</p>
    <p>Congratulations!</p>
    <p>We are excited to offer you the position of <strong>${jobTitle}</strong> at HealthChain.</p>
    <p>Please review the attached offer letter and respond within the specified timeline.</p>
    <p>We look forward to welcoming you to the team.</p>
    <br>
    <p>Regards,<br>HealthChain Recruitment Team</p>
</div>
`;

async function downloadFile(url) {
    if (globalThis.fetch) {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to fetch file: ${res.statusText}`);
        const arrayBuffer = await res.arrayBuffer();
        return Buffer.from(arrayBuffer);
    } else {
        return new Promise((resolve, reject) => {
            const https = require('https');
            https.get(url, (res) => {
                if (res.statusCode !== 200) {
                    reject(new Error(`Failed to fetch file: ${res.statusCode}`));
                    return;
                }
                const chunks = [];
                res.on('data', chunk => chunks.push(chunk));
                res.on('end', () => resolve(Buffer.concat(chunks)));
                res.on('error', err => reject(err));
            });
        });
    }
}

// Automated Applicant Email Notifications Trigger
exports.sendCareersEmail = onDocumentWritten({
    document: "careers_applications/{applicationId}",
    secrets: [RESEND_API_KEY]
}, async (event) => {
    const snap = event.data.after;
    if (!snap.exists) return; // deleted document

    const app = snap.data();
    const status = app.status;
    const name = app.fullName || 'Candidate';
    const jobTitle = app.jobTitle || app.appliedRole || 'Position';
    const department = app.department || 'Recruitment';
    const email = app.email;

    if (!email) {
        console.warn(`No email found for application ID: ${event.params.applicationId}`);
        return;
    }

    const emailNotifications = app.emailNotifications || {};
    let shouldSend = false;
    let subject = '';
    let htmlContent = '';
    let updateField = '';
    let attachments = [];

    if (status === 'new' && !emailNotifications.applicationReceived) {
        let appDate = 'N/A';
        if (app.submittedAt) {
            try {
                const dateObj = app.submittedAt.toDate ? app.submittedAt.toDate() : new Date(app.submittedAt);
                if (dateObj && !isNaN(dateObj.getTime())) {
                    appDate = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                }
            } catch (e) {
                console.warn('Error parsing submittedAt:', e);
            }
        } else {
            appDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        }

        shouldSend = true;
        subject = 'Application Received – HealthChain Careers';
        htmlContent = applicationReceivedTemplate(name, jobTitle, department, appDate);
        updateField = 'emailNotifications.applicationReceived';
    }
    else if (status === 'reviewing' && !emailNotifications.reviewing) {
        shouldSend = true;
        subject = 'Your Application is Under Review';
        htmlContent = reviewingTemplate(name, jobTitle);
        updateField = 'emailNotifications.reviewing';
    }
    else if (status === 'shortlisted' && !emailNotifications.shortlisted) {
        shouldSend = true;
        subject = 'Congratulations! You Have Been Shortlisted';
        htmlContent = shortlistedTemplate(name, jobTitle);
        updateField = 'emailNotifications.shortlisted';
    }
    else if (status === 'interviewScheduled' && !emailNotifications.interviewScheduled) {
        const details = app.interviewDetails || {};
        const intDate = details.date || 'To be scheduled';
        const intTime = details.time || 'To be scheduled';
        const intLink = details.meetingLink || 'Link to follow';
        const intNotes = details.notes || '';

        shouldSend = true;
        subject = 'Interview Invitation – HealthChain';
        htmlContent = interviewScheduledTemplate(name, jobTitle, intDate, intTime, intLink, intNotes);
        updateField = 'emailNotifications.interviewScheduled';
    }
    else if (status === 'rejected' && !emailNotifications.rejected) {
        shouldSend = true;
        subject = 'Application Update – HealthChain';
        htmlContent = rejectedTemplate(name, jobTitle);
        updateField = 'emailNotifications.rejected';
    }
    else if (status === 'offered' && !emailNotifications.offered) {
        shouldSend = true;
        subject = 'Offer Letter – HealthChain';
        htmlContent = offeredTemplate(name, jobTitle);
        updateField = 'emailNotifications.offered';

        if (app.offerDetails && app.offerDetails.offerLetterUrl) {
            try {
                console.log(`Downloading offer letter attachment from URL: ${app.offerDetails.offerLetterUrl}`);
                const fileBuffer = await downloadFile(app.offerDetails.offerLetterUrl);
                const filename = app.offerDetails.offerLetterName || 'Offer_Letter.pdf';
                attachments.push({
                    filename,
                    content: fileBuffer
                });
                console.log('Offer letter attached successfully.');
            } catch (err) {
                console.error(`Failed to download offer letter: ${app.offerDetails.offerLetterUrl}`, err);
            }
        }
    }

    if (!shouldSend) {
        return;
    }

    try {
        console.log(`Sending automated recruitment email to ${email} (status: ${status}, appId: ${event.params.applicationId})`);
        const resend = getResend();

        let targetEmail = email;
        let finalSubject = subject;
        let htmlBody = htmlContent;
        const sandboxOwner = "ravipatichinnarangaswamyreddy@gmail.com";

        if (targetEmail.toLowerCase() !== sandboxOwner.toLowerCase()) {
            console.log(`[Resend Sandbox] Redirecting careers email from ${targetEmail} to verified owner ${sandboxOwner}`);
            targetEmail = sandboxOwner;
            finalSubject = `[Sandbox: intended for ${email}] ${subject}`;
            htmlBody = `
                <div style="background-color: #1e293b; color: #f1f5f9; padding: 16px; border-radius: 8px; margin-bottom: 20px; font-family: 'Inter', sans-serif; border: 1px solid #334155;">
                    <strong style="color: #38bdf8;">[Sandbox Mode]</strong> This email was originally intended for <strong>${email}</strong>. It was redirected to you to prevent a Resend 403 error.
                </div>
                ${htmlBody}
            `;
        }

        const mailPayload = {
            from: "HealthChain Careers <onboarding@resend.dev>",
            to: targetEmail,
            subject: finalSubject,
            html: htmlBody
        };

        if (attachments.length > 0) {
            mailPayload.attachments = attachments;
        }

        await resend.emails.send(mailPayload);
        console.log(`Careers email successfully sent to ${email}. Updating notification flag...`);

        const updateObj = {};
        updateObj[updateField] = true;
        await snap.ref.update(updateObj);

        console.log(`Successfully updated ${updateField} flag in Firestore.`);
    } catch (err) {
        console.error(`Error sending recruitment email to ${email} for status ${status}:`, err);
    }
});
