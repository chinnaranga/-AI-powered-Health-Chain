import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings, Shield, User, Bell, Lock, Smartphone, Eye,
    EyeOff, CheckCircle, AlertTriangle, LogOut, Save,
    Key, Clock, Monitor, Trash2, RefreshCw, ChevronRight,
    ShieldCheck, Fingerprint
} from 'lucide-react';
import { auth, db } from '../../firebase/config';
import { onAuthStateChanged, updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { toast } from '../../components/Toast';

/* ── Section wrapper ── */
function Section({ icon: Icon, title, subtitle, children }) {
    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="bg-[#111827] border border-[#1E2D4580] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#1E2D4580] flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#00C8D4]/10 border border-[#00C8D4]/20 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-[#00C8D4]" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-white font-display">{title}</h3>
                    {subtitle && <p className="text-[11px] text-[#8899AA]">{subtitle}</p>}
                </div>
            </div>
            <div className="p-6 space-y-5">{children}</div>
        </motion.div>
    );
}

/* ── Toggle ── */
function PremiumToggle({ checked, onChange }) {
    return (
        <button onClick={() => onChange(!checked)}
            className={`relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0 ${checked ? 'bg-[#00C8D4] shadow-[0_0_12px_rgba(0,200,212,0.3)]' : 'bg-[#1A2236] border border-[#1E2D4580]'}`}>
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${checked ? 'left-[calc(100%-22px)]' : 'left-0.5'}`} />
        </button>
    );
}

/* ── Input Field ── */
function InputField({ label, type = 'text', value, onChange, placeholder, hint }) {
    const [show, setShow] = useState(false);
    const isPass = type === 'password';
    return (
        <div>
            <label className="text-[11px] font-bold text-[#8899AA] uppercase tracking-wider block mb-1.5">{label}</label>
            <div className="relative">
                <input
                    type={isPass && !show ? 'password' : 'text'}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#4A5568] focus:outline-none focus:border-[#00C8D4]/50 focus:ring-1 focus:ring-[#00C8D4]/20 transition-all pr-10"
                />
                {isPass && (
                    <button type="button" onClick={() => setShow(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A5568] hover:text-[#8899AA]">
                        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                )}
            </div>
            {hint && <p className="text-[10px] text-[#4A5568] mt-1">{hint}</p>}
        </div>
    );
}

/* ── Row item ── */
function SettingRow({ label, description, children }) {
    return (
        <div className="flex items-center justify-between gap-4 py-1">
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{label}</p>
                {description && <p className="text-xs text-[#8899AA] mt-0.5">{description}</p>}
            </div>
            {children}
        </div>
    );
}

const MOCK_SESSIONS = [
    { device: 'MacBook Pro — Chrome', location: 'Mumbai, IN', time: 'Active now', current: true },
    { device: 'iPhone 15 — Safari', location: 'Mumbai, IN', time: '2 hours ago', current: false },
    { device: 'Windows PC — Edge', location: 'Pune, IN', time: '3 days ago', current: false },
];

const NAV_TABS = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'security', label: 'Security', icon: Shield },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'sessions', label: 'Sessions', icon: Monitor },
    { key: 'privacy', label: 'Privacy', icon: Lock },
];

/* ── PAGE ── */
export default function SecuritySettingsPage() {
    const [activeTab, setActiveTab] = useState('profile');
    const [firebaseUser, setFirebaseUser] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Profile state
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');

    // Security state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [twoFAEnabled, setTwoFAEnabled] = useState(false);

    // Notification prefs
    const [notifPrefs, setNotifPrefs] = useState({
        accessRequests: true,
        emergencyAlerts: true,
        recordUploads: true,
        aiSummaries: true,
        auditEvents: false,
        marketingEmails: false,
    });

    // Privacy
    const [privacyPrefs, setPrivacyPrefs] = useState({
        shareAnonymousData: false,
        allowAuditAccess: true,
        showProfileToTeam: true,
    });

    const [sessions, setSessions] = useState(MOCK_SESSIONS);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, user => {
            if (user) {
                setFirebaseUser(user);
                setDisplayName(user.displayName || '');
                setEmail(user.email || '');
            }
        });
        return () => unsub();
    }, []);

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            if (firebaseUser) await updateProfile(firebaseUser, { displayName });
            toast.success('Profile updated successfully');
        } catch { toast.error('Failed to update profile'); }
        setIsSaving(false);
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword) { toast.error('Please fill all password fields'); return; }
        if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
        if (newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return; }
        setIsSaving(true);
        try {
            const credential = EmailAuthProvider.credential(firebaseUser.email, currentPassword);
            await reauthenticateWithCredential(firebaseUser, credential);
            await updatePassword(firebaseUser, newPassword);
            setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
            toast.success('Password changed successfully');
        } catch (e) {
            toast.error(e.code === 'auth/wrong-password' ? 'Current password is incorrect' : 'Failed to change password');
        }
        setIsSaving(false);
    };

    const revokeSession = (index) => {
        setSessions(prev => prev.filter((_, i) => i !== index));
        toast.success('Session revoked');
    };

    const toggleNotif = (key) => setNotifPrefs(p => ({ ...p, [key]: !p[key] }));
    const togglePrivacy = (key) => setPrivacyPrefs(p => ({ ...p, [key]: !p[key] }));

    const initials = displayName ? displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '??';

    return (
        <div className="max-w-5xl mx-auto pb-12 space-y-5">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <Settings className="w-4 h-4 text-[#00C8D4]" />
                    <span className="text-[10px] text-[#00C8D4] font-bold uppercase tracking-widest">Account Security</span>
                </div>
                <h2 className="text-3xl font-display font-bold text-white">Security & Settings</h2>
                <p className="text-sm text-[#8899AA] mt-1">Manage your profile, security, and notification preferences.</p>
            </div>

            {/* Tab Nav */}
            <div className="flex gap-2 bg-[#111827] border border-[#1E2D4580] rounded-2xl p-1.5 overflow-x-auto">
                {NAV_TABS.map(tab => {
                    const TabIcon = tab.icon;
                    return (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                                activeTab === tab.key
                                    ? 'bg-[#00C8D4]/15 text-[#00C8D4] border border-[#00C8D4]/30'
                                    : 'text-[#8899AA] hover:text-white border border-transparent'
                            }`}>
                            <TabIcon className="w-3.5 h-3.5" />{tab.label}
                        </button>
                    );
                })}
            </div>

            <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

                    {/* PROFILE TAB */}
                    {activeTab === 'profile' && (
                        <Section icon={User} title="Profile Information" subtitle="Your public-facing identity in the platform">
                            <div className="flex items-center gap-5 mb-6 pb-5 border-b border-[#1E2D4580]">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00C8D4] to-blue-600 flex items-center justify-center text-[#0B0F1A] text-xl font-bold flex-shrink-0">
                                    {initials}
                                </div>
                                <div>
                                    <p className="text-white font-bold">{displayName || 'Your Name'}</p>
                                    <p className="text-xs text-[#8899AA]">{email}</p>
                                    <span className="text-[10px] px-2 py-0.5 rounded-lg bg-[#00C8D4]/10 text-[#00C8D4] border border-[#00C8D4]/20 font-bold uppercase tracking-wider mt-1 inline-block">
                                        {localStorage.getItem('hc_role') || 'Patient'}
                                    </span>
                                </div>
                            </div>
                            <InputField label="Display Name" value={displayName} onChange={setDisplayName} placeholder="Your full name" />
                            <InputField label="Email Address" value={email} onChange={() => {}} placeholder="email@example.com" hint="Email changes require re-verification." />
                            <button onClick={handleSaveProfile} disabled={isSaving}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#00C8D4] hover:bg-[#00E5F0] text-[#0B0F1A] font-bold text-sm transition-all shadow-[0_0_15px_rgba(0,200,212,0.2)] disabled:opacity-50">
                                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save Profile
                            </button>
                        </Section>
                    )}

                    {/* SECURITY TAB */}
                    {activeTab === 'security' && (
                        <div className="space-y-5">
                            <Section icon={Key} title="Change Password" subtitle="Use a strong, unique password">
                                <InputField label="Current Password" type="password" value={currentPassword} onChange={setCurrentPassword} placeholder="••••••••" />
                                <InputField label="New Password" type="password" value={newPassword} onChange={setNewPassword} placeholder="••••••••" hint="Minimum 8 characters." />
                                <InputField label="Confirm New Password" type="password" value={confirmPassword} onChange={setConfirmPassword} placeholder="••••••••" />
                                {newPassword && newPassword === confirmPassword && newPassword.length >= 8 && (
                                    <div className="flex items-center gap-2 text-xs text-emerald-400">
                                        <CheckCircle className="w-3.5 h-3.5" /> Passwords match
                                    </div>
                                )}
                                <button onClick={handleChangePassword} disabled={isSaving}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#00C8D4] hover:bg-[#00E5F0] text-[#0B0F1A] font-bold text-sm transition-all shadow-[0_0_15px_rgba(0,200,212,0.2)] disabled:opacity-50">
                                    {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                                    Update Password
                                </button>
                            </Section>

                            <Section icon={Fingerprint} title="Two-Factor Authentication" subtitle="Add an extra layer of protection">
                                <SettingRow label="Enable 2FA" description="Require OTP verification on every login">
                                    <PremiumToggle checked={twoFAEnabled} onChange={setTwoFAEnabled} />
                                </SettingRow>
                                {twoFAEnabled && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                        className="mt-2 p-4 rounded-xl bg-[#00C8D4]/5 border border-[#00C8D4]/20">
                                        <div className="flex items-start gap-3">
                                            <ShieldCheck className="w-5 h-5 text-[#00C8D4] flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm text-white font-semibold mb-1">2FA Active</p>
                                                <p className="text-xs text-[#8899AA]">Authenticator app linked. Your account is protected.</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </Section>
                        </div>
                    )}

                    {/* NOTIFICATIONS TAB */}
                    {activeTab === 'notifications' && (
                        <Section icon={Bell} title="Notification Preferences" subtitle="Choose what alerts you receive">
                            {Object.entries({
                                accessRequests: { label: 'Access Requests', desc: 'When a doctor requests access to your records' },
                                emergencyAlerts: { label: 'Emergency Alerts', desc: 'Critical and break-glass access notifications' },
                                recordUploads: { label: 'Record Uploads', desc: 'When a new medical record is added' },
                                aiSummaries: { label: 'AI Summaries', desc: 'When an AI clinical summary is ready' },
                                auditEvents: { label: 'Audit Events', desc: 'Blockchain and compliance log updates' },
                                marketingEmails: { label: 'Platform Updates', desc: 'News and feature announcements' },
                            }).map(([key, cfg]) => (
                                <SettingRow key={key} label={cfg.label} description={cfg.desc}>
                                    <PremiumToggle checked={notifPrefs[key]} onChange={() => toggleNotif(key)} />
                                </SettingRow>
                            ))}
                        </Section>
                    )}

                    {/* SESSIONS TAB */}
                    {activeTab === 'sessions' && (
                        <Section icon={Monitor} title="Active Sessions" subtitle="Devices currently logged into your account">
                            <div className="space-y-3">
                                {sessions.map((s, i) => (
                                    <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border ${s.current ? 'bg-[#00C8D4]/5 border-[#00C8D4]/20' : 'bg-[#0B0F1A] border-[#1E2D4580]'}`}>
                                        <div className="w-10 h-10 rounded-xl bg-[#1A2236] border border-[#1E2D4580] flex items-center justify-center flex-shrink-0">
                                            <Monitor className="w-5 h-5 text-[#8899AA]" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-semibold text-white">{s.device}</p>
                                                {s.current && <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-[#00C8D4]/10 text-[#00C8D4] border border-[#00C8D4]/20">Current</span>}
                                            </div>
                                            <p className="text-xs text-[#8899AA]">{s.location} · {s.time}</p>
                                        </div>
                                        {!s.current && (
                                            <button onClick={() => revokeSession(i)}
                                                className="p-2 rounded-lg bg-[#1A2236] border border-[#1E2D4580] hover:border-red-500/30 hover:text-red-400 text-[#8899AA] transition-colors">
                                                <LogOut className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => { setSessions(prev => prev.filter(s => s.current)); toast.success('All other sessions revoked'); }}
                                className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 font-bold transition-colors mt-2">
                                <LogOut className="w-4 h-4" /> Sign Out All Other Sessions
                            </button>
                        </Section>
                    )}

                    {/* PRIVACY TAB */}
                    {activeTab === 'privacy' && (
                        <Section icon={Lock} title="Privacy Controls" subtitle="Control how your data is used">
                            {Object.entries({
                                shareAnonymousData: { label: 'Anonymous Analytics', desc: 'Help improve the platform with anonymised usage data' },
                                allowAuditAccess: { label: 'Audit Log Access', desc: 'Allow compliance officers to review your audit trail' },
                                showProfileToTeam: { label: 'Team Profile Visibility', desc: 'Show your name and role to care team members' },
                            }).map(([key, cfg]) => (
                                <SettingRow key={key} label={cfg.label} description={cfg.desc}>
                                    <PremiumToggle checked={privacyPrefs[key]} onChange={() => togglePrivacy(key)} />
                                </SettingRow>
                            ))}
                            <div className="pt-4 border-t border-[#1E2D4580]">
                                <p className="text-[11px] text-[#4A5568]">Your data is encrypted with AES-256 and stored under HIPAA-compliant infrastructure. We never sell your health data.</p>
                            </div>
                        </Section>
                    )}

                </motion.div>
            </AnimatePresence>
        </div>
    );
}
