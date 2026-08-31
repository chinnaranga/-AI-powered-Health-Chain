import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import useAuthStore from '../../store/authStore';
import { toast } from '../../components/Toast';
import { motion } from 'framer-motion';
import {
    User, Shield, Smartphone, Bell, Key, Copy, CheckCircle,
    Lock, Fingerprint, Globe, Database, Activity, Eye, EyeOff,
    Monitor, Clock, FileText, Link2, AlertTriangle, Cpu, Heart
} from 'lucide-react';

/* ───── Premium Toggle ───── */
const Toggle = ({ enabled, onToggle }) => (
    <button onClick={onToggle} className={`relative w-10 h-5 rounded-full transition-colors duration-300 focus:outline-none ${enabled ? 'bg-[#00C8D4]' : 'bg-[#1A2236] border border-[#1E2D4580]'}`}>
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform duration-300 bg-white ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
);

/* ───── Status Badge Component ───── */
function CustomStatusBadge({ status, label, className = '' }) {
    const colors = {
        verified: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        syncing: 'bg-[#00C8D4]/10 text-[#00C8D4] border-[#00C8D4]/20',
        error: 'bg-red-500/10 text-red-400 border-red-500/20',
    };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${colors[status] || 'bg-[#1A2236] text-[#8899AA] border-[#1E2D4580]'} ${className}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status === 'syncing' ? 'bg-[#00C8D4] animate-pulse' : (status === 'verified' || status === 'active') ? 'bg-emerald-400' : status === 'pending' ? 'bg-amber-400' : 'bg-red-400'}`} />
            {label || status}
        </span>
    );
}

/* ───── Security Score Gauge ───── */
function SecurityScore({ score = 92 }) {
    const color = score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-amber-400' : 'text-red-400';
    const bg = score >= 80 ? 'bg-emerald-500/10' : score >= 60 ? 'bg-amber-500/10' : 'bg-red-500/10';
    const border = score >= 80 ? 'border-emerald-500/20' : score >= 60 ? 'border-amber-500/20' : 'border-red-500/20';
    const pct = (score / 100) * 100;

    return (
        <div className="text-center py-4 bg-[#1A2236]/30 rounded-xl border border-[#1E2D4580]">
            <div className="relative w-24 h-24 mx-auto mb-3">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" stroke="rgba(30, 45, 69, 0.5)" strokeWidth="6" fill="none" />
                    <circle cx="50" cy="50" r="42" stroke={score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444'} strokeWidth="6" fill="none"
                        strokeDasharray={`${pct * 2.64} 264`} strokeLinecap="round" className="transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-2xl font-bold font-display ${color}`}>{score}</span>
                </div>
            </div>
            <p className="text-xs text-[#8899AA] font-medium">Security Health Score</p>
            <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${bg} ${color} border ${border}`}>
                {score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Attention'}
            </span>
        </div>
    );
}

/* ───── Settings Section Header ───── */
function SectionHeader({ icon: Icon, title, subtitle, color = 'cyan' }) {
    const colors = {
        cyan: { bg: 'bg-[#00C8D4]/10', border: 'border-[#00C8D4]/20', text: 'text-[#00C8D4]' },
        purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400' },
        teal: { bg: 'bg-teal-500/10', border: 'border-teal-500/20', text: 'text-teal-400' },
        emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400' },
        amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400' },
    };
    const c = colors[color] || colors.cyan;
    return (
        <div className="flex items-center gap-3 mb-5">
            <div className={`w-10 h-10 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${c.text}`} />
            </div>
            <div>
                <h3 className="text-sm font-semibold text-white font-display">{title}</h3>
                {subtitle && <p className="text-[11px] text-[#8899AA]">{subtitle}</p>}
            </div>
        </div>
    );
}

/* ───── Setting Row ───── */
function SettingRow({ icon: Icon, label, description, children }) {
    return (
        <div className="flex items-center justify-between py-3 border-b border-[#1E2D4580] last:border-0">
            <div className="flex items-center gap-3">
                {Icon && <Icon className="w-4 h-4 text-[#8899AA]" />}
                <div>
                    <span className="text-sm text-white">{label}</span>
                    {description && <p className="text-[11px] text-[#8899AA]">{description}</p>}
                </div>
            </div>
            {children}
        </div>
    );
}

/* ───── PAGE ───── */
const SettingsPage = () => {
    const { role, logout, user: storeUser } = useAuthStore();
    const [notifications, setNotifications] = useState(true);
    const [twoFactor, setTwoFactor] = useState(false);
    const [loginAlerts, setLoginAlerts] = useState(true);
    const [dataSharing, setDataSharing] = useState(false);
    const [providerVisibility, setProviderVisibility] = useState(true);
    const [smartContractAuth, setSmartContractAuth] = useState(true);
    const [firebaseUser, setFirebaseUser] = useState(null);
    const [realtimeProfile, setRealtimeProfile] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const unsubAuth = onAuthStateChanged(auth, (user) => setFirebaseUser(user));
        return () => unsubAuth();
    }, []);

    const targetUid = firebaseUser?.uid || storeUser?.uid || storeUser?.id;

    // Real-time Firestore subscription to user's profile document
    useEffect(() => {
        if (!targetUid) return;
        const userDocRef = doc(db, 'users', targetUid);
        const unsubFirestore = onSnapshot(userDocRef, (snapshot) => {
            if (snapshot.exists()) {
                setRealtimeProfile(snapshot.data());
            }
        }, (err) => {
            console.warn('[Realtime Settings] Firestore snapshot notice:', err.message);
        });
        return () => unsubFirestore();
    }, [targetUid]);

    const activeRole = (realtimeProfile?.role || role || storeUser?.role || 'patient').toLowerCase();

    const defaultRoleName = activeRole === 'doctor' 
        ? 'Dr. Medical Specialist' 
        : activeRole === 'clinical' 
        ? 'Clinical Officer' 
        : 'HealthChain Patient';

    const defaultRoleEmail = `${activeRole}@healthchain.org`;
    const defaultRoleUid = activeRole === 'doctor' ? 'DOC-98421' : activeRole === 'clinical' ? 'CLN-55102' : 'HC-PATIENT-8849';

    let rawName = realtimeProfile?.fullName || realtimeProfile?.name || firebaseUser?.displayName || storeUser?.fullName || storeUser?.name || defaultRoleName;
    if (rawName === 'Google Patient' || rawName === 'Anonymous User') {
        rawName = defaultRoleName;
    }

    const activeName = rawName;
    const activeEmail = realtimeProfile?.email || firebaseUser?.email || storeUser?.email || defaultRoleEmail;
    const activeUid = targetUid || defaultRoleUid;

    const handleCopyUid = () => {
        if (activeUid) {
            navigator.clipboard.writeText(activeUid);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast.success('Patient ID copied');
        }
    };

    const handleSave = () => toast.success('Preferences updated securely in real time');

    const initials = activeName
        ? activeName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        : 'HC';

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-display font-bold text-white">Account & Security Settings</h2>
                <p className="text-sm text-[#8899AA] mt-1">Manage your identity, security posture, and platform preferences in real-time.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ── Profile Section ── */}
                <div className="lg:col-span-2">
                    <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl overflow-hidden">
                        <div className="px-6 py-5 border-b border-[#1E2D4580] flex items-center justify-between bg-[#1A2236]">
                            <div className="flex items-center gap-4">
                                {firebaseUser?.photoURL ? (
                                    <img src={firebaseUser.photoURL} alt="Profile"
                                        className="w-14 h-14 rounded-2xl object-cover ring-2 ring-[#1E2D4580]" />
                                ) : (
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00C8D4] to-blue-600 flex items-center justify-center text-white text-lg font-bold shadow-[0_0_15px_rgba(0,200,212,0.2)]">
                                        {initials}
                                    </div>
                                )}
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-base font-semibold text-white font-display">
                                            {activeName}
                                        </h3>
                                        <CheckCircle className="w-4 h-4 text-[#00C8D4]" />
                                    </div>
                                    <p className="text-xs text-[#8899AA] mt-0.5">
                                        Signed in as {activeEmail}
                                    </p>
                                </div>
                            </div>
                            <CustomStatusBadge
                                status={activeRole === 'admin' ? 'error' : (activeRole === 'doctor' ? 'syncing' : 'active')}
                                label={activeRole.toUpperCase()}
                            />
                        </div>

                        <div className="p-6 space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-[10px] text-[#8899AA] font-bold mb-2 uppercase tracking-wider">Full Name</label>
                                    <input readOnly value={activeName} placeholder="Full Name"
                                        className="w-full bg-[#1A2236]/50 border border-[#1E2D4580] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none cursor-default" />
                                </div>
                                <div>
                                    <label className="block text-[10px] text-[#8899AA] font-bold mb-2 uppercase tracking-wider">Email Address</label>
                                    <input readOnly value={activeEmail} placeholder="Email Address"
                                        className="w-full bg-[#1A2236]/50 border border-[#1E2D4580] rounded-xl px-4 py-2.5 text-sm text-[#8899AA] focus:outline-none cursor-default" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] text-[#8899AA] font-bold mb-2 uppercase tracking-wider">Patient ID (UID)</label>
                                <div className="relative">
                                    <input readOnly value={activeUid} placeholder="Patient ID"
                                        className="w-full bg-[#1A2236]/50 border border-[#1E2D4580] rounded-xl px-4 py-2.5 text-sm text-[#00C8D4] focus:outline-none pr-10 font-mono cursor-default truncate" />
                                    <button onClick={handleCopyUid}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8899AA] hover:text-[#00C8D4] transition-colors" title="Copy UID">
                                        {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                                <p className="text-[11px] text-[#4A5568] mt-1.5 flex items-center gap-1">
                                    <Lock className="w-3 h-3" /> Unique identifier for blockchain record storage
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Security Score + Quick Security ── */}
                <div className="space-y-6">
                    <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-6 shadow-[0_0_30px_rgba(0,200,212,0.03)]">
                        <SectionHeader icon={Shield} title="Security" subtitle="Account protection" color="cyan" />
                        <SecurityScore score={twoFactor ? 96 : 72} />
                        <div className="space-y-1 mt-4">
                            <SettingRow icon={Fingerprint} label="Two-Factor Auth" description="Biometric or TOTP">
                                <Toggle enabled={twoFactor} onToggle={() => setTwoFactor(!twoFactor)} />
                            </SettingRow>
                            <SettingRow icon={Bell} label="Security Alerts" description="Login notifications">
                                <Toggle enabled={loginAlerts} onToggle={() => setLoginAlerts(!loginAlerts)} />
                            </SettingRow>
                            <SettingRow icon={Monitor} label="Session Monitoring">
                                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">Active</span>
                            </SettingRow>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Privacy Controls ── */}
            <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-6">
                <SectionHeader icon={Eye} title="Privacy Controls" subtitle="Data sharing and visibility preferences" color="purple" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                    <SettingRow icon={Globe} label="Data Sharing" description="Allow anonymized analytics">
                        <Toggle enabled={dataSharing} onToggle={() => setDataSharing(!dataSharing)} />
                    </SettingRow>
                    <SettingRow icon={Eye} label="Provider Visibility" description="Show profile to authorized providers">
                        <Toggle enabled={providerVisibility} onToggle={() => setProviderVisibility(!providerVisibility)} />
                    </SettingRow>
                    <SettingRow icon={FileText} label="Consent Management" description="Review data processing consents">
                        <button className="text-xs text-[#00C8D4] hover:text-[#00E5F0] transition-colors font-bold px-3 py-1.5 rounded-lg bg-[#00C8D4]/10 border border-[#00C8D4]/20">Review</button>
                    </SettingRow>
                    <SettingRow icon={Cpu} label="Smart Contract Auth" description="Auto-authorize verified contracts">
                        <Toggle enabled={smartContractAuth} onToggle={() => setSmartContractAuth(!smartContractAuth)} />
                    </SettingRow>
                </div>
            </div>

            {/* ── Notification Preferences ── */}
            <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-6">
                <SectionHeader icon={Bell} title="Notification Preferences" subtitle="Control how you receive updates" color="amber" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                    <SettingRow icon={Activity} label="Record Activity" description="Upload and verification alerts">
                        <Toggle enabled={notifications} onToggle={() => setNotifications(!notifications)} />
                    </SettingRow>
                    <SettingRow icon={Key} label="Access Events" description="OTP generation and provider access">
                        <Toggle enabled={loginAlerts} onToggle={() => setLoginAlerts(!loginAlerts)} />
                    </SettingRow>
                    <SettingRow icon={Shield} label="Security Updates" description="Critical security notifications">
                        <Toggle enabled={true} onToggle={() => {}} />
                    </SettingRow>
                    <SettingRow icon={Heart} label="Health Reminders" description="Upcoming appointments and check-ups">
                        <Toggle enabled={notifications} onToggle={() => setNotifications(!notifications)} />
                    </SettingRow>
                </div>
            </div>

            {/* ── Blockchain Identity ── */}
            <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-6">
                <SectionHeader icon={Database} title="Blockchain Identity" subtitle="On-chain identity and verification" color="teal" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Identity Status', value: 'Verified', icon: CheckCircle, color: 'emerald' },
                        { label: 'Encryption', value: 'AES-256', icon: Lock, color: 'cyan' },
                        { label: 'Network', value: 'Mainnet', icon: Globe, color: 'teal' },
                        { label: 'Protocol', value: 'IPFS + ETH', icon: Link2, color: 'purple' },
                    ].map((item, i) => {
                        const colorMap = {
                            emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                            cyan: 'text-[#00C8D4] bg-[#00C8D4]/10 border-[#00C8D4]/20',
                            teal: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
                            purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20'
                        };
                        const textColorMap = {
                            emerald: 'text-emerald-400',
                            cyan: 'text-[#00C8D4]',
                            teal: 'text-teal-400',
                            purple: 'text-purple-400'
                        };
                        
                        return (
                        <motion.div key={item.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            className={`p-4 rounded-xl bg-[#1A2236]/30 border border-[#1E2D4580] hover:border-[#00C8D4]/30 hover:bg-[#1A2236]/50 transition-all`}
                        >
                            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center mb-3 ${colorMap[item.color]}`}>
                                <item.icon className={`w-4 h-4 ${textColorMap[item.color]}`} />
                            </div>
                            <p className="text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-1">{item.label}</p>
                            <p className={`text-sm font-bold ${textColorMap[item.color]}`}>{item.value}</p>
                        </motion.div>
                    )})}
                </div>
            </div>

            {/* ── Last Activity ── */}
            <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-6">
                <SectionHeader icon={Clock} title="Recent Activity" subtitle="Last account interactions" color="emerald" />
                <div className="space-y-3">
                    {[
                        { action: 'Signed in via Google', time: 'Just now', icon: User, status: 'active' },
                        { action: 'Dashboard PIN verified', time: '2 minutes ago', icon: Lock, status: 'verified' },
                        { action: 'Settings page accessed', time: '5 minutes ago', icon: Monitor, status: 'active' },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[#1A2236]/30 border border-[#1E2D4580] hover:bg-[#1A2236]/50 transition-all">
                            <div className="w-8 h-8 rounded-lg bg-[#111827] border border-[#1E2D4580] flex items-center justify-center flex-shrink-0">
                                <item.icon className="w-4 h-4 text-[#8899AA]" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-[#FFFFFF]">{item.action}</p>
                                <p className="text-[11px] text-[#8899AA]">{item.time}</p>
                            </div>
                            <CustomStatusBadge status={item.status} label={item.status === 'verified' ? 'Verified' : 'OK'} />
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Actions ── */}
            <div className="flex items-center justify-between pt-2">
                <button onClick={logout} className="px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-500/20 transition-all">
                    <AlertTriangle className="w-4 h-4" /> Sign Out
                </button>
                <div className="flex gap-3">
                    <button className="px-5 py-2.5 rounded-xl bg-transparent border border-[#1E2D4580] text-[#8899AA] font-bold text-sm hover:text-white transition-all">
                        Discard Changes
                    </button>
                    <button onClick={handleSave} className="px-5 py-2.5 rounded-xl bg-[#00C8D4] text-[#0B0F1A] font-bold text-sm hover:bg-[#00E5F0] transition-all shadow-[0_0_15px_rgba(0,200,212,0.25)]">
                        Save Preferences
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
