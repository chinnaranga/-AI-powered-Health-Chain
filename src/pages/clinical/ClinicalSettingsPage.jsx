import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase/config';
import useAuthStore from '../../store/authStore';
import { toast } from '../../components/Toast';
import {
    User, Shield, Bell, Cpu, Copy, CheckCircle, Lock, Fingerprint,
    Monitor, Trash2, Smartphone, Mail, Clock, Activity, Stethoscope,
    Building, Key, AlertTriangle
} from 'lucide-react';

const Toggle = ({ enabled, onToggle }) => (
    <button onClick={onToggle}
        className={`w-11 h-6 rounded-full relative transition-all duration-300 ${enabled ? 'bg-[#00C8D4]' : 'bg-[#1A2236] border border-[#1E2D4580]'}`}>
        <span className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-all duration-300 ${enabled ? 'translate-x-5 bg-white' : 'bg-[#4A5568]'}`} />
    </button>
);

function SectionCard({ icon: Icon, title, iconColor = 'text-[#00C8D4]', iconBg = 'bg-[#00C8D4]/10', iconBorder = 'border-[#00C8D4]/20', children }) {
    return (
        <div className="rounded-2xl bg-[#111827] border border-[#1E2D4580] overflow-hidden">
            <div className="p-5 border-b border-[#1E2D4580] bg-[#1A2236]/30 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg ${iconBg} border ${iconBorder} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${iconColor}`} />
                </div>
                <h3 className="text-base font-display font-bold text-white">{title}</h3>
            </div>
            <div>{children}</div>
        </div>
    );
}

function SettingRow({ icon: Icon, label, description, children }) {
    return (
        <div className="flex items-center justify-between p-4 border-b border-[#1E2D4580] last:border-0 hover:bg-[#1A2236]/30 transition-colors">
            <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-[#1A2236] border border-[#1E2D4580] flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-[#8899AA]" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-white">{label}</p>
                    <p className="text-[11px] text-[#8899AA] mt-0.5">{description}</p>
                </div>
            </div>
            {children}
        </div>
    );
}

export default function ClinicalSettingsPage() {
    const { logout } = useAuthStore();
    const [firebaseUser, setFirebaseUser] = useState(null);
    const [copied, setCopied] = useState(false);

    // Security toggles
    const [twoFA, setTwoFA] = useState(true);
    const [biometrics, setBiometrics] = useState(true);
    const [hardwareKey, setHardwareKey] = useState(false);

    // Consent workflow preferences
    const [autoReminder, setAutoReminder] = useState(true);
    const [emergencyBypass, setEmergencyBypass] = useState(false);
    const [defaultExpiry, setDefaultExpiry] = useState('1 Hour');

    // Notifications
    const [smsApproval, setSmsApproval] = useState(true);
    const [emailSummary, setEmailSummary] = useState(false);
    const [securityAlerts, setSecurityAlerts] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, u => setFirebaseUser(u));
        return () => unsub();
    }, []);

    const initials = firebaseUser?.displayName
        ? firebaseUser.displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        : 'CL';

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('Staff ID copied');
    };

    return (
        <div className="max-w-4xl mx-auto pb-12 flex flex-col h-[calc(100vh-120px)]">
            {/* Header */}
            <div className="flex items-start justify-between mb-6 flex-shrink-0">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-[#00C8D4]" />
                        <span className="text-[10px] text-[#00C8D4] font-bold uppercase tracking-widest">Identity & Configuration</span>
                    </div>
                    <h2 className="text-3xl font-display font-bold text-white">Clinical Settings</h2>
                </div>
                <button onClick={logout}
                    className="px-4 py-2 rounded-xl bg-[#1A2236] border border-[#1E2D4580] text-sm text-[#8899AA] font-semibold hover:bg-white/5 hover:text-white transition-all">
                    Sign Out
                </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-5 pr-1">
                {/* Profile Card */}
                <div className="rounded-2xl bg-[#111827] border border-[#1E2D4580] p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-[#00C8D4]/5 rounded-full blur-[80px] pointer-events-none" />
                    <div className="flex flex-col sm:flex-row sm:items-center gap-5 relative z-10">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00C8D4] to-blue-600 flex items-center justify-center text-xl font-bold text-white shadow-lg flex-shrink-0">
                            {initials}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-xl font-display font-bold text-white">{firebaseUser?.displayName || 'Clinical Staff'}</h3>
                                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase">
                                    <Activity className="w-3 h-3" /> Shift Active
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-[#8899AA]">
                                <span className="flex items-center gap-1.5"><Stethoscope className="w-3.5 h-3.5" /> Records Officer</span>
                                <span className="flex items-center gap-1.5"><Building className="w-3.5 h-3.5" /> Central Medical Center</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 min-w-[180px]">
                            <div>
                                <p className="text-[10px] text-[#8899AA] uppercase tracking-wider font-bold mb-1">Staff Email</p>
                                <p className="text-sm text-white font-medium truncate">{firebaseUser?.email || 'staff@hospital.org'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-[#8899AA] uppercase tracking-wider font-bold mb-1">Staff ID</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-mono text-[#00C8D4] truncate">{firebaseUser?.uid?.slice(0, 12) || 'STF-0042-CL'}…</p>
                                    <button onClick={() => handleCopy(firebaseUser?.uid || 'STF-0042-CL')}
                                        className="text-[#8899AA] hover:text-[#00C8D4] transition-colors">
                                        {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security Settings */}
                <SectionCard icon={Shield} title="Security & Authentication" iconColor="text-purple-400" iconBg="bg-purple-500/10" iconBorder="border-purple-500/20">
                    <SettingRow icon={Fingerprint} label="Two-Factor Authentication (TOTP)" description="Required for all sensitive record access requests.">
                        <Toggle enabled={twoFA} onToggle={() => setTwoFA(!twoFA)} />
                    </SettingRow>
                    <SettingRow icon={Lock} label="Biometric Unlock" description="Use Face ID or Touch ID to approve OTP requests.">
                        <Toggle enabled={biometrics} onToggle={() => setBiometrics(!biometrics)} />
                    </SettingRow>
                    <SettingRow icon={Cpu} label="Hardware Security Key" description="Require YubiKey for emergency access overrides.">
                        <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${hardwareKey ? 'bg-emerald-500/10 text-emerald-400' : 'bg-[#1A2236] text-[#4A5568]'}`}>
                                {hardwareKey ? 'Enabled' : 'Off'}
                            </span>
                            <Toggle enabled={hardwareKey} onToggle={() => setHardwareKey(!hardwareKey)} />
                        </div>
                    </SettingRow>
                    <SettingRow icon={Monitor} label="Active Sessions" description="Currently signed in on 1 device.">
                        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all">
                            <Trash2 className="w-3.5 h-3.5" /> Revoke All
                        </button>
                    </SettingRow>
                    <SettingRow icon={Clock} label="Session Auto-Timeout" description="Lock workspace after period of inactivity.">
                        <select defaultValue="15 minutes"
                            className="bg-[#1A2236] border border-[#1E2D4580] rounded-lg px-3 py-1.5 text-xs text-[#8899AA] focus:outline-none focus:border-[#00C8D4]/50 appearance-none">
                            {['5 minutes', '15 minutes', '30 minutes', '1 hour'].map(v => <option key={v}>{v}</option>)}
                        </select>
                    </SettingRow>
                </SectionCard>

                {/* Consent Workflow Preferences */}
                <SectionCard icon={Key} title="Consent Workflow Preferences" iconColor="text-[#00C8D4]">
                    <SettingRow icon={Bell} label="Consent Expiry Reminders" description="Auto-send reminders to patients when consent is near expiry.">
                        <Toggle enabled={autoReminder} onToggle={() => setAutoReminder(!autoReminder)} />
                    </SettingRow>
                    <SettingRow icon={AlertTriangle} label="Emergency Access Override" description="Bypass OTP wait in critical emergencies. Fully audited.">
                        <Toggle enabled={emergencyBypass} onToggle={() => setEmergencyBypass(!emergencyBypass)} />
                    </SettingRow>
                    <SettingRow icon={Clock} label="Default Access Duration" description="Default duration for new access requests.">
                        <select value={defaultExpiry} onChange={e => setDefaultExpiry(e.target.value)}
                            className="bg-[#1A2236] border border-[#1E2D4580] rounded-lg px-3 py-1.5 text-xs text-[#8899AA] focus:outline-none focus:border-[#00C8D4]/50 appearance-none">
                            {['30 Minutes', '1 Hour', '4 Hours', '24 Hours'].map(v => <option key={v}>{v}</option>)}
                        </select>
                    </SettingRow>
                </SectionCard>

                {/* Notifications */}
                <SectionCard icon={Bell} title="Notification Preferences" iconColor="text-amber-400" iconBg="bg-amber-500/10" iconBorder="border-amber-500/20">
                    <SettingRow icon={Smartphone} label="SMS on Patient Approval" description="Receive a text when a patient approves or denies your OTP request.">
                        <Toggle enabled={smsApproval} onToggle={() => setSmsApproval(!smsApproval)} />
                    </SettingRow>
                    <SettingRow icon={Mail} label="Daily Access Summary" description="Receive an email digest of all records accessed during your shift.">
                        <Toggle enabled={emailSummary} onToggle={() => setEmailSummary(!emailSummary)} />
                    </SettingRow>
                    <SettingRow icon={Shield} label="Security Alert Notifications" description="Immediate alerts for unauthorized or suspicious access attempts.">
                        <Toggle enabled={securityAlerts} onToggle={() => setSecurityAlerts(!securityAlerts)} />
                    </SettingRow>
                </SectionCard>

                {/* Save Footer */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <button className="px-5 py-2.5 rounded-xl border border-[#1E2D4580] text-[#8899AA] text-sm font-semibold hover:text-white transition-all">
                        Discard
                    </button>
                    <button onClick={() => toast.success('Settings saved successfully')}
                        className="px-6 py-2.5 rounded-xl bg-[#00C8D4] text-[#0B0F1A] text-sm font-bold hover:bg-[#00E5F0] transition-all shadow-[0_0_15px_rgba(0,200,212,0.2)]">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
