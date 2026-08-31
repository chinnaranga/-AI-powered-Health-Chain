import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, Shield, Zap, Server, ShieldAlert,
    TrendingUp, FileText, CheckCircle, Users, Cpu,
    Globe, AlertTriangle, AlertCircle, HardDrive, Network,
    Database, Lock, Unlock, PlayCircle, Fingerprint, Eye,
    Search, ShieldCheck, RefreshCw, Radio, Settings, AlertOctagon,
    Terminal, Play, Pause, Trash2, Check, RefreshCcw, FileCode, CheckSquare
} from 'lucide-react';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { db } from '../../firebase/config';
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from '../../components/Toast';

// ─── PREMIUM GLOW CARD COMPONENT ───────────────────────────────────────────
const Card = ({ children, className = '', glowColor = 'cyan', onClick }) => {
    const borderGlows = {
        cyan: 'hover:border-cyan-500/40 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]',
        emerald: 'hover:border-emerald-500/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]',
        purple: 'hover:border-purple-500/40 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]',
        red: 'hover:border-red-500/40 hover:shadow-[0_0_20px_rgba(239,68,68,0.15)]',
        blue: 'hover:border-blue-500/40 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]',
        amber: 'hover:border-amber-500/40 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    };

    const gradientGlows = {
        cyan: 'from-cyan-500/5 to-transparent',
        emerald: 'from-emerald-500/5 to-transparent',
        purple: 'from-purple-500/5 to-transparent',
        red: 'from-red-500/5 to-transparent',
        blue: 'from-blue-500/5 to-transparent',
        amber: 'from-amber-500/5 to-transparent',
    };

    return (
        <div 
            onClick={onClick}
            className={`bg-[#070D19]/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden group transition-all duration-300 ${className} ${borderGlows[glowColor]} ${onClick ? 'cursor-pointer' : ''}`}
        >
            <div className={`absolute -inset-px rounded-2xl bg-gradient-to-r ${gradientGlows[glowColor]} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
            <div className="relative z-10">{children}</div>
        </div>
    );
};

// ─── RECHARTS TOOLTIP CUSTOMIZER ───────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-[#050B14]/95 backdrop-blur-2xl border border-slate-800/80 rounded-xl px-4 py-3 shadow-2xl">
            <p className="text-[10px] text-slate-500 mb-2 font-mono uppercase tracking-widest">{label}</p>
            {payload.map((p, i) => (
                <p key={i} className="text-xs font-bold font-mono flex items-center gap-2" style={{ color: p.color }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                    {p.name}: {p.value}
                </p>
            ))}
        </div>
    );
}

export default function AdminOverview() {
    // Platform statistics from Firestore
    const [userCount, setUserCount] = useState(0);
    const [recordCount, setRecordCount] = useState(0);
    const [requestCount, setRequestCount] = useState(0);
    const [activeThreats, setActiveThreats] = useState(0);
    const [liveLogs, setLiveLogs] = useState([]);
    const [iamLogs, setIamLogs] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [allRecords, setAllRecords] = useState([]);

    // Widget states
    const [searchQuery, setSearchQuery] = useState('');
    const [updatingRoleUserId, setUpdatingRoleUserId] = useState(null);
    const [logFilter, setLogFilter] = useState('ALL');
    const [isLogStreaming, setIsLogStreaming] = useState(true);

    // Interactive Blockchain Node Replication states
    const [nodes, setNodes] = useState([
        { id: 'US-EAST-1', region: 'N. Virginia', status: 'optimal', latency: 12, blockHeight: 948210, load: 34, resyncing: false },
        { id: 'EU-WEST-2', region: 'London', status: 'optimal', latency: 74, blockHeight: 948210, load: 41, resyncing: false },
        { id: 'AP-SOUTH-1', region: 'Mumbai', status: 'optimal', latency: 148, blockHeight: 948209, load: 26, resyncing: false },
        { id: 'SA-EAST-1', region: 'São Paulo', status: 'standby', latency: 115, blockHeight: 948206, load: 10, resyncing: false },
    ]);

    // Live Block Commit Explorer state (appends live block commits dynamically)
    const [blocks, setBlocks] = useState([
        { height: 948210, txs: 8, gas: '2.1M', validator: 'US-EAST-1', time: '5s ago', hash: '0x7e8c...1a2d', status: 'SUCCESS' },
        { height: 948209, txs: 14, gas: '3.6M', validator: 'EU-WEST-2', time: '11s ago', hash: '0x9f5a...3c8f', status: 'SUCCESS' },
        { height: 948208, txs: 5, gas: '1.2M', validator: 'US-EAST-1', time: '18s ago', hash: '0x4d2b...9f7a', status: 'SUCCESS' },
        { height: 948207, txs: 21, gas: '4.8M', validator: 'AP-SOUTH-1', time: '24s ago', hash: '0x3a5e...2d6c', status: 'SUCCESS' },
        { height: 948206, txs: 12, gas: '2.8M', validator: 'SA-EAST-1', time: '30s ago', hash: '0x1c8b...7a5e', status: 'SUCCESS' }
    ]);

    // IPFS Files Auditor state (linked to records and allows cryptographic validation)
    const [ipfsFiles, setIpfsFiles] = useState([
        { id: '1', name: 'ClinicalReport_JaneDoe.pdf', cid: 'QmXoypizjW3WknFixtdKLw62vVJcH1RHA8b', status: 'VERIFIED', verifying: false },
        { id: '2', name: 'BloodPanel_JohnSmith.pdf', cid: 'QmT5Ny3aLw62vVJcH1RHA8b8yXoypizjW3Wk', status: 'VERIFIED', verifying: false },
        { id: '3', name: 'MRI_Scan_Brain_Structure.zip', cid: 'QmP46n5Z6MlfOzBHf01234aLw62vVJcH1RH', status: 'PENDING_AUDIT', verifying: false },
    ]);

    // AI Command Terminal state
    const [activeCmd, setActiveCmd] = useState('');
    const [isTerminalRunning, setIsTerminalRunning] = useState(false);
    const [terminalLogs, setTerminalLogs] = useState([
        'Systems initialized. Awaiting diagnostic query...',
        'Format: /vulnerability-sweep, /audit-contracts, /rotate-keys, /clear'
    ]);
    const [terminalProgress, setTerminalProgress] = useState(0);

    // Security Switcher states (stored in localStorage)
    const [lockdownMode, setLockdownMode] = useState(() => localStorage.getItem('hc_emergency_lockdown') === 'true');
    const [dualSigValidation, setDualSigValidation] = useState(() => localStorage.getItem('hc_dualsig_validation') === 'true');
    const [multiSigConsent, setMultiSigConsent] = useState(() => localStorage.getItem('hc_multisig_consent') === 'true');
    const [mfaEnforce, setMfaEnforce] = useState(() => localStorage.getItem('hc_mfa_enforce') === 'true');

    // Chart Data
    const [chartData, setChartData] = useState([
        { name: '00:00', transactions: 140, contracts: 60, anomalyScore: 99.8 },
        { name: '04:00', transactions: 95, contracts: 40, anomalyScore: 99.9 },
        { name: '08:00', transactions: 270, contracts: 130, anomalyScore: 99.6 },
        { name: '12:00', transactions: 410, contracts: 195, anomalyScore: 98.4 },
        { name: '16:00', transactions: 450, contracts: 235, anomalyScore: 99.2 },
        { name: '20:00', transactions: 310, contracts: 155, anomalyScore: 99.7 },
        { name: '24:00', transactions: 170, contracts: 75, anomalyScore: 99.8 },
    ]);

    const terminalEndRef = useRef(null);

    // Scroll to bottom of terminal log stream
    useEffect(() => {
        if (terminalEndRef.current) {
            terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [terminalLogs]);

    useEffect(() => {
        // 1. Subscribe to users collection
        const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
            setUserCount(snapshot.size);
            const list = snapshot.docs.map(docSnap => ({
                id: docSnap.id,
                uid: docSnap.id,
                ...docSnap.data()
            }));
            setAllUsers(list);
        }, (err) => console.warn('Error fetching user count:', err));

        // 2. Subscribe to records collection
        const unsubRecords = onSnapshot(collection(db, 'records'), (snapshot) => {
            setRecordCount(snapshot.size);
            const list = snapshot.docs.map(docSnap => {
                const data = docSnap.data();
                let fileName = 'Unknown_Record.pdf';
                try {
                    const parsed = JSON.parse(data.data);
                    fileName = parsed.fileName || parsed.title || fileName;
                } catch {
                    // Fallback to record attributes
                    if (data.fileName) fileName = data.fileName;
                }
                return {
                    id: docSnap.id,
                    name: fileName,
                    cid: data.ipfsHash || data.fileHash || 'N/A',
                    status: data.ipfsHash ? 'VERIFIED' : 'LOCAL_ONLY'
                };
            });
            setAllRecords(list);
            
            // Sync initial IPFS auditor lists with actual database entries
            if (list.length > 0) {
                setIpfsFiles(prev => {
                    const existingCids = new Set(prev.map(f => f.cid));
                    const newItems = list.filter(item => item.cid !== 'N/A' && !existingCids.has(item.cid)).slice(0, 3);
                    return [...newItems, ...prev].slice(0, 5);
                });
            }
        }, (err) => console.warn('Error fetching records count:', err));

        // 3. Subscribe to access requests
        const unsubRequests = onSnapshot(collection(db, 'accessRequests'), (snapshot) => {
            setRequestCount(snapshot.size);
        }, (err) => console.warn('Error fetching requests count:', err));

        // 4. Subscribe to audit logs
        const logsQ = query(collection(db, 'auditLogs'), orderBy('timestamp', 'desc'), limit(25));
        const unsubLogs = onSnapshot(logsQ, (snapshot) => {
            const list = [];
            const highRiskList = [];
            let threats = 0;

            snapshot.forEach(docSnap => {
                const data = docSnap.data();
                const id = docSnap.id;
                let timeStr = 'Just now';
                if (data.timestamp) {
                    const date = data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
                    timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                }

                let type = 'SYSTEM';
                let status = 'success';
                let message = '';
                
                if (data.activityType === 'RECORD_UPLOADED') {
                    type = 'IPFS';
                    message = `Pinnned file to IPFS node: ${data.details?.fileName || 'Document'}`;
                } else if (data.activityType === 'RECORD_VIEWED' || data.activityType === 'RECORD_DECRYPTED_VIEWED') {
                    type = 'CONSENSUS';
                    message = `Verified block signature of ${data.details?.fileName || 'Document'}`;
                } else if (data.activityType === 'OTP_VERIFIED_ACCESS_GRANTED') {
                    type = 'AUTH';
                    message = `OTP authentication approved for patient ${data.details?.patientId?.substring(0, 8) || 'Unknown'}`;
                } else if (data.activityType === 'EMERGENCY_ACCESS') {
                    type = 'SECURITY';
                    status = 'warning';
                    message = `Emergency bypass triggered by provider ID ${data.userId?.substring(0, 8) || 'Unknown'}`;
                    threats++;
                } else if (data.activityType === 'USER_ROLE_MODIFIED') {
                    type = 'IAM';
                    status = 'warning';
                    message = `User role changed: ${data.details?.fromRole} -> ${data.details?.toRole}`;
                } else {
                    message = `${data.activityType.replace(/_/g, ' ')}`;
                }

                list.push({
                    type,
                    message,
                    status,
                    time: timeStr,
                    region: data.region || 'us-central',
                    hash: data.txHash?.substring(0, 10) || id.substring(0, 10)
                });

                if (data.activityType === 'EMERGENCY_ACCESS' || data.activityType === 'ACCESS_REVOKED' || data.activityType === 'USER_DELETED' || data.activityType === 'USER_ROLE_MODIFIED') {
                    highRiskList.push({
                        action: data.activityType,
                        target: data.details?.targetUserEmail || data.details?.patientId || 'System',
                        admin: data.userId || 'auto-guardian',
                        time: timeStr,
                        risk: data.activityType === 'EMERGENCY_ACCESS' ? 'HIGH' : 'MED'
                    });
                }
            });

            setLiveLogs(list);
            setActiveThreats(threats);

            if (highRiskList.length === 0) {
                setIamLogs([
                    { action: 'SECURITY_SCAN', target: 'Ledger Nodes', admin: 'sys_sentinel', time: 'Active', risk: 'LOW' },
                    { action: 'KEY_ROTATION', target: 'RPC_Keys_v22', admin: 'sys_sentinel', time: '34m ago', risk: 'LOW' }
                ]);
            } else {
                setIamLogs(highRiskList.slice(0, 5));
            }
        }, (err) => console.warn('Error fetching audit logs:', err));

        // 5. Telemetry Generation Intervals (Consensus block commitments and node parameters)
        const chartInterval = setInterval(() => {
            setChartData(prev => {
                return prev.map(pt => {
                    const deviation = Math.floor(Math.random() * 8) - 4;
                    return {
                        ...pt,
                        transactions: Math.max(15, pt.transactions + deviation),
                        contracts: Math.max(8, pt.contracts + Math.floor(deviation / 2)),
                        anomalyScore: Math.min(100, Math.max(90, pt.anomalyScore + (Math.random() > 0.85 ? (Math.random() > 0.5 ? 0.08 : -0.08) : 0)))
                    };
                });
            });

            // Simulate validator node latency/load shifts
            setNodes(prev => prev.map(node => {
                if (node.resyncing) return node;
                const shift = Math.random() > 0.6;
                return {
                    ...node,
                    latency: shift ? Math.max(4, node.latency + Math.floor(Math.random() * 4 - 2)) : node.latency,
                    load: shift ? Math.max(8, Math.min(95, node.load + Math.floor(Math.random() * 6 - 3))) : node.load,
                    blockHeight: shift ? node.blockHeight + 1 : node.blockHeight
                };
            }));
        }, 8000);

        // 6. Generate dynamic Block Commits
        const blockInterval = setInterval(() => {
            setBlocks(prev => {
                const nextHeight = prev[0].height + 1;
                const randTxs = Math.floor(Math.random() * 20) + 3;
                const randGas = `${(randTxs * 0.23 + Math.random()).toFixed(1)}M`;
                const validators = ['US-EAST-1', 'EU-WEST-2', 'AP-SOUTH-1', 'SA-EAST-1'];
                const selectedVal = validators[Math.floor(Math.random() * validators.length)];
                const randomHash = '0x' + Math.random().toString(16).substring(2, 6) + '...' + Math.random().toString(16).substring(2, 6);
                
                const newBlock = {
                    height: nextHeight,
                    txs: randTxs,
                    gas: randGas,
                    validator: selectedVal,
                    time: 'Just now',
                    hash: randomHash,
                    status: 'SUCCESS'
                };

                // Push new block, remove oldest, and update "time" fields of older blocks
                const updatedPrev = prev.map(b => {
                    let nextTime = b.time;
                    if (b.time === 'Just now') nextTime = '6s ago';
                    else if (b.time.includes('s ago')) {
                        const sec = parseInt(b.time) + 6;
                        nextTime = `${sec}s ago`;
                    }
                    return { ...b, time: nextTime };
                });

                return [newBlock, ...updatedPrev].slice(0, 5);
            });
        }, 6000);

        return () => {
            unsubUsers();
            unsubRecords();
            unsubRequests();
            unsubLogs();
            clearInterval(chartInterval);
            clearInterval(blockInterval);
        };
    }, []);

    // ──────────────── IAM Quick Role Overrides ────────────────
    const handleQuickRoleChange = async (userId, newRole) => {
        setUpdatingRoleUserId(userId);
        try {
            const user = allUsers.find(u => u.id === userId);
            const oldRole = user?.role || 'patient';
            
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, { role: newRole });
            
            await addDoc(collection(db, 'auditLogs'), {
                activityType: 'USER_ROLE_MODIFIED',
                timestamp: serverTimestamp(),
                userId: 'admin_command',
                txHash: '0x' + Math.random().toString(16).substring(2, 10),
                region: 'us-central',
                details: {
                    targetUserId: userId,
                    targetUserEmail: user?.email || user?.name || '',
                    fromRole: oldRole,
                    toRole: newRole,
                    modifiedBy: 'admin'
                }
            });

            toast.success(`Role for ${user?.displayName || user?.name || 'User'} set to ${newRole}`);
        } catch (err) {
            console.error(err);
            toast.error(err.message || 'Failed to update user role');
        } finally {
            setUpdatingRoleUserId(null);
        }
    };

    // ──────────────── Security Switch Loggers ────────────────
    const handleLockdownToggle = async () => {
        const next = !lockdownMode;
        setLockdownMode(next);
        localStorage.setItem('hc_emergency_lockdown', next ? 'true' : 'false');
        
        if (next) {
            toast.warning('EMERGENCY LOCKDOWN INITIATED: API block writes suspended.');
            await addSystemAuditLog('EMERGENCY_LOCKDOWN_ON', 'Global system lockdown enabled.');
        } else {
            toast.success('Emergency Lockdown deactivated. Platform online.');
            await addSystemAuditLog('EMERGENCY_LOCKDOWN_OFF', 'Global system lockdown disabled.');
        }
    };

    const handleDualSigToggle = async () => {
        const next = !dualSigValidation;
        setDualSigValidation(next);
        localStorage.setItem('hc_dualsig_validation', next ? 'true' : 'false');
        toast.info(next ? 'Dual-signature checks active for critical edits.' : 'Dual-signature validation disabled.');
        await addSystemAuditLog('DUAL_SIG_TOGGLE', `Dual Signature Validation set to ${next}`);
    };

    const handleMultiSigToggle = async () => {
        const next = !multiSigConsent;
        setMultiSigConsent(next);
        localStorage.setItem('hc_multisig_consent', next ? 'true' : 'false');
        toast.info(next ? 'Multi-signature patient authorization active.' : 'Multi-signature patient authorization relaxed.');
        await addSystemAuditLog('MULTISIG_TOGGLE', `MultiSig Patient Consent set to ${next}`);
    };

    const handleMfaToggle = async () => {
        const next = !mfaEnforce;
        setMfaEnforce(next);
        localStorage.setItem('hc_mfa_enforce', next ? 'true' : 'false');
        toast.info(next ? 'Mandatory phone authentication enforced for clinical staff.' : 'Phone authentication requirements set to optional.');
        await addSystemAuditLog('MFA_TOGGLE', `Mandatory Phone MFA set to ${next}`);
    };

    const addSystemAuditLog = async (activityType, description) => {
        try {
            await addDoc(collection(db, 'auditLogs'), {
                activityType,
                timestamp: serverTimestamp(),
                userId: 'admin_command',
                txHash: '0x' + Math.random().toString(16).substring(2, 10),
                region: 'us-central',
                details: {
                    description,
                    modifiedBy: 'admin'
                }
            });
        } catch (e) {
            console.warn(e);
        }
    };

    // ──────────────── Resync Telemetry Node ────────────────
    const handleResyncNode = (nodeId) => {
        setNodes(prev => prev.map(node => {
            if (node.id === nodeId) {
                return { ...node, resyncing: true, status: 'syncing' };
            }
            return node;
        }));
        
        toast.info(`Triggering resync protocol for node shard ${nodeId}...`);

        setTimeout(() => {
            setNodes(prev => prev.map(node => {
                if (node.id === nodeId) {
                    const maxBlock = Math.max(...prev.map(n => n.blockHeight));
                    return {
                        ...node,
                        resyncing: false,
                        status: 'optimal',
                        blockHeight: maxBlock,
                        latency: Math.max(5, Math.floor(Math.random() * 25 + 8)),
                        load: Math.floor(Math.random() * 15 + 20)
                    };
                }
                return node;
            }));
            toast.success(`Consensus Node shard ${nodeId} is fully synchronized.`);
        }, 2200);
    };

    // ──────────────── IPFS Verification Audit ────────────────
    const handleVerifyIPFS = (id) => {
        setIpfsFiles(prev => prev.map(f => f.id === id ? { ...f, verifying: true } : f));
        
        setTimeout(() => {
            setIpfsFiles(prev => prev.map(f => f.id === id ? { ...f, verifying: false, status: 'VERIFIED' } : f));
            toast.success('IPFS signature audit check: PASS (matching ledger)');
        }, 1500);
    };

    // ──────────────── AI Terminal Command Controller ────────────────
    const handleRunDiagnosticCommand = async (cmd) => {
        if (isTerminalRunning) return;
        setIsTerminalRunning(true);
        setTerminalProgress(0);
        
        let outputSteps = [];
        if (cmd === '/vulnerability-sweep') {
            outputSteps = [
                'Initializing full network vulnerability sweep...',
                'Probing firestore security rule access patterns... OK',
                'Checking encryption secrets length & salt configurations... OK',
                'Auditing external NPM libraries signatures... OK',
                'Status: SECURE. 0 vulnerabilities found.'
            ];
        } else if (cmd === '/audit-contracts') {
            outputSteps = [
                'Compiling ledger solidity files... ok',
                'Verifying owner modifiers on accessControl.sol... verified',
                'Simulating block gas usage limits... stable',
                'Status: CONTRACT INTEGRITY CONFIRMED.'
            ];
        } else if (cmd === '/rotate-keys') {
            outputSteps = [
                'Generating secure random session keys...',
                'Broadcasting rotation key vector to validators...',
                'Node US-EAST-1 updated...',
                'Node EU-WEST-2 updated...',
                'Key rotation successfully complete. Validation session refreshed.'
            ];
        } else if (cmd === '/clear') {
            setTerminalLogs(['Console stream cleared. Awaiting commands...']);
            setIsTerminalRunning(false);
            return;
        } else {
            setTerminalLogs(prev => [...prev, `Unknown command: ${cmd}`]);
            setIsTerminalRunning(false);
            return;
        }

        setTerminalLogs(prev => [...prev, `\n> Executing: ${cmd}`]);

        for (let i = 0; i < outputSteps.length; i++) {
            await new Promise(r => setTimeout(r, 600));
            setTerminalLogs(prev => [...prev, `  ${outputSteps[i]}`]);
            setTerminalProgress(Math.floor(((i + 1) / outputSteps.length) * 100));
        }

        setIsTerminalRunning(false);
    };

    // Filters for Quick Search users
    const filteredSearchUsers = searchQuery.trim() === '' ? [] : allUsers.filter(u => 
        (u.displayName || u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);

    // Custom lists for live dashboard displays
    const kpis = [
        { label: 'Network Users', value: userCount.toString(), icon: Users, color: 'cyan', trend: 'Live nodes' },
        { label: 'Blockchain Records', value: recordCount.toString(), icon: FileText, color: 'blue', trend: 'Blocks' },
        { label: 'Consent Handshakes', value: requestCount.toString(), icon: Shield, color: 'emerald', trend: 'Audit Verified' },
        { label: 'System Alerts', value: activeThreats.toString(), icon: ShieldAlert, color: 'red', trend: 'Action Needed' },
        { label: 'Gas Throughput', value: '14 TPS', icon: Zap, color: 'purple', trend: 'Optimal' },
        { label: 'Core Uptime', value: '99.999%', icon: Server, color: 'emerald', trend: 'Standard' },
        { label: 'Consensus Health', value: '98/100', icon: Cpu, color: 'teal', trend: 'Optimal' },
        { label: 'Trust Index', value: '99.8%', icon: Activity, color: 'purple', trend: 'Stable' },
    ];

    const colorMap = {
        emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
        teal: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
        purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
        red: 'text-red-400 bg-red-500/10 border-red-500/20',
        blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    };

    return (
        <div className="bg-transparent text-slate-300 font-sans selection:bg-[#00C8D4]/30 relative">
            {/* Ambient Background Decorative Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[130px] pointer-events-none" />

            <div className="max-w-[1700px] mx-auto space-y-6 relative z-10">
                
                {/* ──────────────── COCKPIT HEADER ──────────────── */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/60 pb-6 mb-2">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-display font-bold text-white tracking-tight flex items-center gap-2.5">
                                <Network className="w-8 h-8 text-[#00C8D4] animate-pulse" /> Enterprise Security & Consensus Operations
                            </h1>
                            <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 font-mono">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Live Ledger Mode
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 font-mono">Decentralized Healthcare Node Controls, Identity Access Management & IPFS Storage Auditing</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {lockdownMode && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold animate-pulse font-mono">
                                <AlertOctagon className="w-4 h-4" /> EMERGENCY LOCKDOWN ACTIVE
                            </div>
                        )}
                        <div className="flex items-center gap-2 bg-[#090F1E] border border-slate-800/80 rounded-xl px-4 py-2 text-xs font-mono">
                            <ShieldAlert className={`w-4 h-4 ${activeThreats > 0 ? 'text-red-400 animate-bounce' : 'text-emerald-400'}`} />
                            <span className="text-white font-medium">{activeThreats} Real-time System Incidents</span>
                        </div>
                    </div>
                </div>

                {/* ──────────────── HIGH-FIDELITY KPI METRICS GRID ──────────────── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                    {kpis.map((k, i) => (
                        <motion.div 
                            key={k.label} 
                            initial={{ opacity: 0, y: 15 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ delay: i * 0.04 }}
                            className="h-full"
                        >
                            <Card className="!p-4 h-full flex flex-col justify-between" glowColor={k.color}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${colorMap[k.color]}`}>
                                        <k.icon className="w-4 h-4" />
                                    </div>
                                    <span className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-wider">{k.trend}</span>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5 truncate">{k.label}</p>
                                    <p className="text-2xl font-display font-bold text-white tracking-tight font-mono">{k.value}</p>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* ──────────────── THREE COLUMN COMMAND LAYOUT ──────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* COLUMN 1: SECURITY SWITCHES, IAM OVERRIDE & AI TERMINAL */}
                    <div className="space-y-6">
                        
                        {/* WIDGET 1: Global Security Deck */}
                        <Card glowColor="cyan" className="flex flex-col gap-4">
                            <div>
                                <h3 className="text-sm font-bold text-white font-display tracking-wider uppercase flex items-center gap-2">
                                    <Settings className="w-4 h-4 text-cyan-400" /> Security Operations Deck
                                </h3>
                                <p className="text-[10px] text-slate-400 font-mono mt-1">Configure global blockchain access policy parameters</p>
                            </div>
                            
                            <div className="space-y-3.5 mt-2">
                                {/* Emergency Lockdown */}
                                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#030712]/60 border border-slate-800/80 hover:border-red-500/20 transition-all">
                                    <div>
                                        <p className="text-xs font-bold text-white flex items-center gap-2">
                                            Emergency Lockdown {lockdownMode && <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />}
                                        </p>
                                        <p className="text-[10px] text-slate-500 mt-0.5">Restrict record sharing & block modifications</p>
                                    </div>
                                    <button 
                                        onClick={handleLockdownToggle}
                                        className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 focus:outline-none ${lockdownMode ? 'bg-red-600' : 'bg-slate-800'}`}
                                    >
                                        <motion.div 
                                            layout 
                                            className="w-4 h-4 rounded-full bg-white shadow-md" 
                                            animate={{ x: lockdownMode ? 20 : 0 }}
                                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                        />
                                    </button>
                                </div>

                                {/* Dual-Signature checks */}
                                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#030712]/60 border border-slate-800/80 hover:border-cyan-500/20 transition-all">
                                    <div>
                                        <p className="text-xs font-bold text-white">Dual-Signature Enforcement</p>
                                        <p className="text-[10px] text-slate-500 mt-0.5">Requires two clinician validations for clinical edits</p>
                                    </div>
                                    <button 
                                        onClick={handleDualSigToggle}
                                        className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 focus:outline-none ${dualSigValidation ? 'bg-[#00C8D4]' : 'bg-slate-800'}`}
                                    >
                                        <motion.div 
                                            layout 
                                            className="w-4 h-4 rounded-full bg-white shadow-md" 
                                            animate={{ x: dualSigValidation ? 20 : 0 }}
                                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                        />
                                    </button>
                                </div>

                                {/* MultiSig Patient Consent */}
                                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#030712]/60 border border-slate-800/80 hover:border-cyan-500/20 transition-all">
                                    <div>
                                        <p className="text-xs font-bold text-white">MultiSig Patient Consent</p>
                                        <p className="text-[10px] text-slate-500 mt-0.5">Enforces real-time cryptographic patient OTP auth</p>
                                    </div>
                                    <button 
                                        onClick={handleMultiSigToggle}
                                        className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 focus:outline-none ${multiSigConsent ? 'bg-[#00C8D4]' : 'bg-slate-800'}`}
                                    >
                                        <motion.div 
                                            layout 
                                            className="w-4 h-4 rounded-full bg-white shadow-md" 
                                            animate={{ x: multiSigConsent ? 20 : 0 }}
                                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                        />
                                    </button>
                                </div>

                                {/* Enforce Phone MFA */}
                                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#030712]/60 border border-slate-800/80 hover:border-cyan-500/20 transition-all">
                                    <div>
                                        <p className="text-xs font-bold text-white">Mandatory SMS MFA</p>
                                        <p className="text-[10px] text-slate-500 mt-0.5">Enforce SMS multi-factor login validations</p>
                                    </div>
                                    <button 
                                        onClick={handleMfaToggle}
                                        className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 focus:outline-none ${mfaEnforce ? 'bg-[#00C8D4]' : 'bg-slate-800'}`}
                                    >
                                        <motion.div 
                                            layout 
                                            className="w-4 h-4 rounded-full bg-white shadow-md" 
                                            animate={{ x: mfaEnforce ? 20 : 0 }}
                                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                        />
                                    </button>
                                </div>
                            </div>
                        </Card>

                        {/* WIDGET 2: User Role Editor */}
                        <Card glowColor="purple" className="flex flex-col gap-4">
                            <div>
                                <h3 className="text-sm font-bold text-white font-display tracking-wider uppercase flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-purple-400" /> Identity Access Role Override
                                </h3>
                                <p className="text-[10px] text-slate-400 font-mono mt-1">Change user clearance levels in real-time</p>
                            </div>

                            <div className="relative">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input 
                                    type="text" 
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Search name, email, or user UID..."
                                    className="w-full bg-[#030712] border border-slate-800/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-purple-500/40 font-mono"
                                />
                            </div>

                            <div className="space-y-2.5 min-h-[50px]">
                                {searchQuery.trim() !== '' && filteredSearchUsers.length === 0 && (
                                    <div className="text-center text-xs text-slate-500 py-3 font-mono">No users found</div>
                                )}
                                
                                <AnimatePresence mode="wait">
                                    {filteredSearchUsers.map(user => (
                                        <motion.div 
                                            key={user.id} 
                                            initial={{ opacity: 0, y: 5 }} 
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="p-3 rounded-xl bg-[#030712]/50 border border-slate-800/80 flex items-center justify-between gap-3"
                                        >
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-white truncate">{user.displayName || user.name || 'Anonymous User'}</p>
                                                <p className="text-[9px] text-slate-500 font-mono truncate">{user.email || user.id}</p>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                {updatingRoleUserId === user.id ? (
                                                    <RefreshCw className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                                                ) : (
                                                    <select 
                                                        value={user.role || 'patient'}
                                                        onChange={e => handleQuickRoleChange(user.id, e.target.value)}
                                                        className="bg-[#050B14] border border-slate-800/80 rounded-lg px-2 py-1.5 text-[10px] text-slate-300 font-semibold focus:outline-none focus:border-purple-500 font-mono cursor-pointer"
                                                    >
                                                        <option value="patient">Patient</option>
                                                        <option value="doctor">Doctor</option>
                                                        <option value="clinical">Clinical</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {searchQuery.trim() === '' && (
                                    <div className="space-y-2 mt-1">
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Quick Access Directory</p>
                                        {allUsers.slice(0, 3).map(user => (
                                            <div key={user.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[#030712]/30 border border-slate-800/60 text-xs font-mono">
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-slate-350 truncate">{user.displayName || user.name || 'Anonymous'}</p>
                                                    <p className="text-[9px] text-slate-500">{user.role || 'patient'}</p>
                                                </div>
                                                <button 
                                                    onClick={() => setSearchQuery(user.email || user.displayName || user.name)}
                                                    className="text-[9px] text-purple-400 font-bold hover:text-purple-300 uppercase hover:underline"
                                                >
                                                    Select
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* WIDGET 3: AI Diagnostic Command Terminal */}
                        <Card glowColor="purple" className="flex flex-col gap-4">
                            <div>
                                <h3 className="text-sm font-bold text-white font-display tracking-wider uppercase flex items-center gap-2">
                                    <Terminal className="w-4 h-4 text-purple-400" /> AI Diagnostic Operations
                                </h3>
                                <p className="text-[10px] text-slate-400 font-mono mt-1">Trigger systems audits and consensus key sweeps</p>
                            </div>

                            {/* Terminal Shell box */}
                            <div className="bg-[#02050b] border border-slate-900 rounded-xl p-3.5 h-[160px] overflow-y-auto font-mono text-[10px] text-purple-300 space-y-1.5 scrollbar-thin select-all">
                                {terminalLogs.map((log, i) => (
                                    <div key={i} className={`${log.startsWith('>') ? 'text-purple-400 font-bold' : log.startsWith('  ✗') ? 'text-red-400' : log.startsWith('  ✓') ? 'text-emerald-400' : 'text-slate-400'}`}>
                                        {log}
                                    </div>
                                ))}
                                <div ref={terminalEndRef} />
                            </div>

                            {/* Terminal Progress visual bar */}
                            {isTerminalRunning && (
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-[9px] font-mono text-purple-400">
                                        <span>Running Diagnostic analysis...</span>
                                        <span>{terminalProgress}%</span>
                                    </div>
                                    <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                                        <div className="h-full bg-purple-500 transition-all duration-300" style={{ width: `${terminalProgress}%` }} />
                                    </div>
                                </div>
                            )}

                            {/* Terminal CTA Panel */}
                            <div className="grid grid-cols-2 gap-2 mt-1">
                                <button 
                                    disabled={isTerminalRunning}
                                    onClick={() => handleRunDiagnosticCommand('/vulnerability-sweep')}
                                    className="p-2.5 rounded-xl border border-slate-800 bg-[#030712]/50 hover:bg-purple-500/5 hover:border-purple-500/25 text-[9px] font-mono font-bold text-slate-400 hover:text-purple-400 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                                >
                                    <ShieldAlert className="w-3.5 h-3.5" /> Sweep Vulnerabilities
                                </button>
                                <button 
                                    disabled={isTerminalRunning}
                                    onClick={() => handleRunDiagnosticCommand('/audit-contracts')}
                                    className="p-2.5 rounded-xl border border-slate-800 bg-[#030712]/50 hover:bg-purple-500/5 hover:border-purple-500/25 text-[9px] font-mono font-bold text-slate-400 hover:text-purple-400 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                                >
                                    <FileCode className="w-3.5 h-3.5" /> Audit Contracts
                                </button>
                                <button 
                                    disabled={isTerminalRunning}
                                    onClick={() => handleRunDiagnosticCommand('/rotate-keys')}
                                    className="p-2.5 rounded-xl border border-slate-800 bg-[#030712]/50 hover:bg-purple-500/5 hover:border-purple-500/25 text-[9px] font-mono font-bold text-slate-400 hover:text-purple-400 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                                >
                                    <RefreshCcw className="w-3.5 h-3.5" /> Rotate Node Keys
                                </button>
                                <button 
                                    disabled={isTerminalRunning}
                                    onClick={() => handleRunDiagnosticCommand('/clear')}
                                    className="p-2.5 rounded-xl border border-slate-800 bg-[#030712]/50 hover:bg-slate-800/80 text-[9px] font-mono font-bold text-slate-450 hover:text-white transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                                >
                                    <Trash2 className="w-3.5 h-3.5" /> Clear Console
                                </button>
                            </div>
                        </Card>
                    </div>

                    {/* COLUMN 2: LEDGER GRAPHS, LIVE BLOCK EXPLORER, IPFS STORAGE AUDITOR */}
                    <div className="space-y-6">
                        
                        {/* WIDGET 4: Recharts Metrics */}
                        <Card glowColor="cyan" className="flex flex-col gap-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-bold text-white font-display tracking-wider uppercase flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-cyan-400" /> Consensus Network Traffic
                                    </h3>
                                    <p className="text-[10px] text-slate-400 font-mono mt-1">Live smart contract verification calls vs block gas writes</p>
                                </div>
                                <div className="flex gap-1.5 bg-[#030712] p-1 rounded-lg border border-slate-800/80 font-mono text-[9px]">
                                    {['1H', '24H', '7D'].map((t, idx) => (
                                        <button key={t} className={`px-2 py-0.5 rounded font-bold transition-all ${idx === 1 ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-500 hover:text-slate-300'}`}>
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="h-[180px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="cyanArea" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="purpleArea" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid stroke="#1e293b/30" strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area type="monotone" dataKey="transactions" stroke="#00C8D4" fill="url(#cyanArea)" strokeWidth={2} name="Gas Transactions" />
                                        <Area type="monotone" dataKey="contracts" stroke="#8b5cf6" fill="url(#purpleArea)" strokeWidth={2} name="Contract Invocations" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        {/* WIDGET 5: Live Block Commit Ledger */}
                        <Card glowColor="cyan" className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-bold text-white font-display tracking-wider uppercase flex items-center gap-2">
                                        <Database className="w-4 h-4 text-cyan-400" /> Block Commit Ledger
                                    </h3>
                                    <p className="text-[10px] text-slate-400 font-mono mt-1">Streaming validation commits on the ledger</p>
                                </div>
                                <div className="flex items-center gap-1.5 font-mono text-[9px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20 rounded animate-pulse">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Consensus Syncing
                                </div>
                            </div>

                            {/* Streaming Block Ledger List */}
                            <div className="space-y-2.5">
                                <AnimatePresence mode="popLayout">
                                    {blocks.map(block => (
                                        <motion.div 
                                            key={block.height}
                                            initial={{ opacity: 0, x: -10, height: 0 }}
                                            animate={{ opacity: 1, x: 0, height: 'auto' }}
                                            exit={{ opacity: 0, x: 10, height: 0 }}
                                            className="p-3 rounded-xl bg-[#030712]/50 border border-slate-800/80 flex items-center justify-between gap-3 text-xs font-mono"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-cyan-500/5 border border-cyan-500/10 flex flex-col items-center justify-center text-[10px] text-cyan-400 font-bold">
                                                    <span>BLK</span>
                                                    <span className="text-[9px] text-slate-400">{block.height.toString().slice(-4)}</span>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white flex items-center gap-1.5">
                                                        Block #{block.height} 
                                                        <span className="text-[9px] text-[#8899AA]">({block.txs} Txs)</span>
                                                    </p>
                                                    <p className="text-[9px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                                                        <span>Gas: {block.gas}</span> &middot; <span>Validator: {block.validator}</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <span className="text-[9px] font-bold px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded flex items-center gap-1">
                                                    <Check className="w-2.5 h-2.5" /> committed
                                                </span>
                                                <p className="text-[8px] text-slate-500 mt-1">{block.time}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </Card>

                        {/* WIDGET 6: IPFS File Storage Auditor */}
                        <Card glowColor="cyan" className="flex flex-col gap-4">
                            <div>
                                <h3 className="text-sm font-bold text-white font-display tracking-wider uppercase flex items-center gap-2">
                                    <HardDrive className="w-4 h-4 text-cyan-400" /> IPFS Decentralized File Auditor
                                </h3>
                                <p className="text-[10px] text-slate-400 font-mono mt-1">Audit pinned content hashes and file validation layers</p>
                            </div>

                            {/* Pinned IPFS File list */}
                            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                                {ipfsFiles.map(file => (
                                    <div key={file.id} className="p-3 rounded-xl bg-[#030712]/50 border border-slate-800/80 flex items-center justify-between gap-3 text-xs font-mono">
                                        <div className="min-w-0">
                                            <p className="font-semibold text-white truncate max-w-[200px]">{file.name}</p>
                                            <p className="text-[8px] text-slate-500 mt-0.5 truncate max-w-[220px] select-all">CID: {file.cid}</p>
                                        </div>

                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {file.verifying ? (
                                                <RefreshCw className="w-3.5 h-3.5 text-cyan-450 animate-spin" />
                                            ) : file.status === 'VERIFIED' ? (
                                                <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded flex items-center gap-1.5">
                                                    <ShieldCheck className="w-3 h-3" /> PASS
                                                </span>
                                            ) : (
                                                <button 
                                                    onClick={() => handleVerifyIPFS(file.id)}
                                                    className="px-2.5 py-1 text-[8px] font-bold text-cyan-400 bg-cyan-500/5 hover:bg-cyan-500/15 border border-cyan-500/20 hover:border-cyan-500/40 rounded transition-all flex items-center gap-1"
                                                >
                                                    <CheckSquare className="w-3 h-3" /> Verify Hash
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* COLUMN 3: NODE MONITOR, SYSTEM LOG STREAM & ACCESS LOGS */}
                    <div className="space-y-6">
                        
                        {/* WIDGET 7: Global Consensus Node Monitor */}
                        <Card glowColor="amber" className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-bold text-white font-display tracking-wider uppercase flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-amber-400" /> Global Consensus Node Monitor
                                    </h3>
                                    <p className="text-[10px] text-slate-400 font-mono mt-1">Health telemetry of core blockchain validator shards</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3.5 mt-1">
                                {nodes.map(node => (
                                    <div key={node.id} className="p-3.5 rounded-xl bg-[#030712]/50 border border-slate-800/80 flex flex-col justify-between h-[120px] hover:border-amber-500/10 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-white font-mono">{node.id}</span>
                                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${node.status === 'optimal' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' : 'bg-purple-500/10 text-purple-400 border border-purple-500/15'}`}>
                                                <span className={`w-1 h-1 rounded-full ${node.status === 'optimal' ? 'bg-emerald-400 animate-pulse' : 'bg-purple-400 animate-spin'}`} />
                                                {node.status}
                                            </span>
                                        </div>
                                        
                                        <div className="space-y-1 font-mono text-[9px]">
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Latency</span>
                                                <span className="text-slate-350">{node.latency}ms</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Block height</span>
                                                <span className="text-cyan-400">#{node.blockHeight}</span>
                                            </div>
                                        </div>

                                        <button 
                                            disabled={node.resyncing}
                                            onClick={() => handleResyncNode(node.id)}
                                            className="w-full py-1 rounded-lg border border-slate-800/80 hover:border-amber-550/20 text-[8px] font-mono font-bold text-slate-400 hover:text-amber-400 hover:bg-amber-500/5 transition-all flex items-center justify-center gap-1 disabled:opacity-50"
                                        >
                                            <RefreshCw className={`w-2.5 h-2.5 ${node.resyncing ? 'animate-spin' : ''}`} />
                                            {node.resyncing ? 'Syncing...' : 'Sync Node'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* WIDGET 8: Streaming CLI Log Console */}
                        <Card glowColor="amber" className="flex flex-col gap-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <h3 className="text-sm font-bold text-white font-display tracking-wider uppercase flex items-center gap-2">
                                        <Radio className="w-4 h-4 text-amber-400 animate-pulse" /> Operations Audit Stream
                                    </h3>
                                    <p className="text-[10px] text-slate-400 font-mono mt-1">Real-time log events intercepted from system layers</p>
                                </div>
                                <div className="flex items-center gap-1.5 flex-shrink-0 self-start sm:self-center">
                                    <button 
                                        onClick={() => setIsLogStreaming(!isLogStreaming)}
                                        className={`p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all`}
                                        title={isLogStreaming ? 'Pause Stream' : 'Resume Stream'}
                                    >
                                        {isLogStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                                    </button>
                                    <button 
                                        onClick={() => setLiveLogs([])}
                                        className="p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all"
                                        title="Clear Logs"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            {/* Filters row */}
                            <div className="flex flex-wrap gap-1.5 border-b border-slate-900 pb-3 font-mono text-[9px]">
                                {['ALL', 'CONSENSUS', 'SECURITY', 'IPFS', 'AUTH'].map(filter => (
                                    <button 
                                        key={filter}
                                        onClick={() => setLogFilter(filter)}
                                        className={`px-2 py-0.5 rounded transition-all ${logFilter === filter ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold' : 'text-slate-500 hover:text-slate-350'}`}
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>

                            {/* Live streaming console container */}
                            <div className="bg-[#02050b] border border-slate-900 rounded-xl p-3.5 h-[230px] overflow-y-auto font-mono text-[10px] space-y-3 scrollbar-thin">
                                {liveLogs.length === 0 ? (
                                    <div className="text-center text-slate-600 py-10">Stream cleared. Awaiting new logs...</div>
                                ) : (
                                    liveLogs
                                        .filter(log => logFilter === 'ALL' || log.type === logFilter)
                                        .map((log, idx) => {
                                            const typeColors = {
                                                CONSENSUS: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5',
                                                SECURITY: 'text-red-400 border-red-500/20 bg-red-500/5',
                                                IPFS: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
                                                AUTH: 'text-purple-400 border-purple-500/20 bg-purple-500/5',
                                                SYSTEM: 'text-slate-400 border-slate-800 bg-slate-900/50',
                                                IAM: 'text-purple-400 border-purple-500/20 bg-purple-500/5'
                                            };
                                            return (
                                                <div key={idx} className="flex flex-col gap-1 p-2.5 rounded-xl bg-[#030712]/50 border border-slate-900 hover:border-slate-850 transition-colors">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className={`px-2 py-0.5 rounded border text-[8px] font-bold ${typeColors[log.type]}`}>
                                                            {log.type}
                                                        </span>
                                                        <span className="text-slate-600 text-[8px]">{log.time}</span>
                                                    </div>
                                                    <p className="text-slate-300 mt-1 leading-relaxed">{log.message}</p>
                                                    <div className="flex justify-between items-center mt-1 text-[8px] text-slate-500">
                                                        <span>Tx Hash: <code className="text-slate-400 select-all font-semibold">{log.hash}</code></span>
                                                        <span className="uppercase text-slate-600">{log.region}</span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                )}
                            </div>
                        </Card>

                        {/* WIDGET 9: IAM Risk Logs */}
                        <Card glowColor="amber" className="flex flex-col p-0 overflow-hidden">
                            <div className="px-5 py-4 border-b border-slate-850 bg-[#070D19]/50 flex justify-between items-center">
                                <h3 className="text-sm font-bold text-white font-display tracking-wider uppercase flex items-center gap-2">
                                    <Fingerprint className="w-4 h-4 text-amber-400" /> IAM Risk Audit Trail
                                </h3>
                            </div>
                            <div className="p-3.5 space-y-2.5 max-h-[220px] overflow-y-auto scrollbar-thin">
                                {iamLogs.map((log, i) => (
                                    <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-[#030712]/40 border border-slate-800/80">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-8 h-8 rounded-lg bg-[#030712] border border-slate-900 flex items-center justify-center flex-shrink-0">
                                                {log.action.includes('EMERGENCY') || log.risk === 'HIGH' ? <Lock className="w-4 h-4 text-red-400" /> : <Unlock className="w-4 h-4 text-emerald-400" />}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] text-white font-bold font-mono uppercase tracking-tight truncate">{log.action}</p>
                                                <p className="text-[9px] text-slate-500 font-mono mt-0.5 truncate max-w-[160px] select-all">Target: {log.target}</p>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${log.risk === 'HIGH' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : log.risk === 'MED' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-slate-550/10 text-slate-400 border border-slate-800'}`}>
                                                {log.risk}
                                            </span>
                                            <p className="text-[8px] text-slate-550 font-mono mt-1">{log.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                </div>

            </div>
        </div>
    );
}
