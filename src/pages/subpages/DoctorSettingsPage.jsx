import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase/config';
import useAuthStore from '../../store/authStore';
import { toast } from '../../components/Toast';
import { motion } from 'framer-motion';
import {
    User, Shield, Bell, Key, Copy, CheckCircle,
    Lock, Fingerprint, Activity, Monitor, AlertTriangle,
    Stethoscope, Building, Cpu, Smartphone, Mail, Trash2, ShieldAlert
} from 'lucide-react';

const Toggle = ({ enabled, onToggle }) => (
    <button 
        onClick={onToggle} 
        className={`w-10 h-5 rounded-full relative transition-colors ${enabled ? 'bg-[#00C8D4]' : 'bg-[#1A2236] border border-[#1E2D4580]'}`}
    >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0 bg-[#8899AA]'}`} />
    </button>
);

function SettingRow({ icon: Icon, label, description, children }) {
    return (
        <div className="flex items-center justify-between p-4 border-b border-[#1E2D4580] last:border-0 hover:bg-[#1A2236]/30 transition-colors">
            <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-[#1A2236] border border-[#1E2D4580] flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-[#8899AA]" />
                </div>
                <div>
                    <span className="text-sm font-semibold text-white">{label}</span>
                    <p className="text-[11px] text-[#8899AA] mt-0.5">{description}</p>
                </div>
            </div>
            {children}
        </div>
    );
}

export default function DoctorSettingsPage() {
    const { logout } = useAuthStore();
    const [firebaseUser, setFirebaseUser] = useState(null);
    const [copied, setCopied] = useState(false);
    
    // Toggles
    const [hardwareKey, setHardwareKey] = useState(true);
    const [smsEmergency, setSmsEmergency] = useState(true);
    const [emailSummary, setEmailSummary] = useState(false);
    const [biometrics, setBiometrics] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => setFirebaseUser(user));
        return () => unsub();
    }, []);

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('NPI Number copied');
    };

    const initials = firebaseUser?.displayName
        ? firebaseUser.displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        : 'DR';

    return (
        <div className="max-w-5xl mx-auto pb-12 animate-fade-in flex flex-col h-[calc(100vh-120px)] relative">
            <div className="mb-6 flex-shrink-0 flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <User className="w-5 h-5 text-[#00C8D4]" />
                        <span className="text-[10px] text-[#00C8D4] font-bold uppercase tracking-widest">Identity & Access</span>
                    </div>
                    <h2 className="text-3xl font-display font-bold text-white">Provider Settings</h2>
                </div>
                <button 
                    onClick={logout}
                    className="px-4 py-2 rounded-xl bg-[#1A2236] border border-[#1E2D4580] text-sm text-[#8899AA] font-semibold hover:bg-white/5 hover:text-white transition-all flex items-center gap-2"
                >
                    Sign Out
                </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                
                {/* Profile Card */}
                <div className="rounded-2xl bg-[#111827] border border-[#1E2D4580] overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />
                    <div className="p-6 flex flex-col md:flex-row md:items-center gap-6 relative z-10">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00C8D4] to-blue-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg flex-shrink-0">
                            {initials}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-2xl font-display font-bold text-white">{firebaseUser?.displayName || 'Dr. Sarah Jenkins'}</h3>
                                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] uppercase font-bold tracking-wider">
                                    <Activity className="w-3 h-3" /> Shift Active
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-[#8899AA] mt-2">
                                <span className="flex items-center gap-1.5"><Stethoscope className="w-4 h-4" /> Chief of Cardiology</span>
                                <span className="flex items-center gap-1.5"><Building className="w-4 h-4" /> Central Medical Center</span>
                            </div>
                        </div>
                        <div className="p-4 rounded-xl bg-[#1A2236]/50 border border-[#1E2D4580] min-w-[200px]">
                            <p className="text-[10px] text-[#8899AA] uppercase tracking-wider font-bold mb-1">NPI Number</p>
                            <div className="flex items-center justify-between">
                                <span className="font-mono text-white tracking-wider">1234567890</span>
                                <button onClick={() => handleCopy('1234567890')} className="text-[#8899AA] hover:text-[#00C8D4] transition-colors">
                                    {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security Panel */}
                <div className="rounded-2xl bg-[#111827] border border-[#1E2D4580] overflow-hidden">
                    <div className="p-5 border-b border-[#1E2D4580] bg-[#1A2236]/30 flex items-center gap-3">
                        <Shield className="w-5 h-5 text-purple-400" />
                        <h3 className="text-lg font-display font-bold text-white">Security & Access</h3>
                    </div>
                    <div>
                        <SettingRow 
                            icon={Cpu} 
                            label="YubiKey / Hardware Token" 
                            description="Require physical security key for sensitive clinical operations."
                        >
                            <div className="flex items-center gap-3">
                                {hardwareKey ? (
                                    <span className="text-[10px] font-bold text-emerald-400 uppercase bg-emerald-500/10 px-2 py-1 rounded">Connected</span>
                                ) : (
                                    <span className="text-[10px] font-bold text-amber-400 uppercase bg-amber-500/10 px-2 py-1 rounded">Disconnected</span>
                                )}
                                <Toggle enabled={hardwareKey} onToggle={() => setHardwareKey(!hardwareKey)} />
                            </div>
                        </SettingRow>
                        <SettingRow 
                            icon={Fingerprint} 
                            label="Biometric Verification" 
                            description="Use Face ID / Touch ID for OTP approvals."
                        >
                            <Toggle enabled={biometrics} onToggle={() => setBiometrics(!biometrics)} />
                        </SettingRow>
                        <SettingRow 
                            icon={Monitor} 
                            label="Active Sessions" 
                            description="You are currently signed in on 3 devices."
                        >
                            <button className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-bold transition-all flex items-center gap-2">
                                <Trash2 className="w-3.5 h-3.5" /> Revoke All Active Sessions
                            </button>
                        </SettingRow>
                    </div>
                </div>

                {/* Notification Preferences */}
                <div className="rounded-2xl bg-[#111827] border border-[#1E2D4580] overflow-hidden">
                    <div className="p-5 border-b border-[#1E2D4580] bg-[#1A2236]/30 flex items-center gap-3">
                        <Bell className="w-5 h-5 text-amber-400" />
                        <h3 className="text-lg font-display font-bold text-white">Notification Preferences</h3>
                    </div>
                    <div>
                        <SettingRow 
                            icon={Smartphone} 
                            label="SMS on Emergency Override" 
                            description="Receive an immediate text message when a Break-Glass protocol is invoked."
                        >
                            <Toggle enabled={smsEmergency} onToggle={() => setSmsEmergency(!smsEmergency)} />
                        </SettingRow>
                        <SettingRow 
                            icon={Mail} 
                            label="Daily Audit Summary" 
                            description="Receive a daily email summarizing all records accessed during your shift."
                        >
                            <Toggle enabled={emailSummary} onToggle={() => setEmailSummary(!emailSummary)} />
                        </SettingRow>
                    </div>
                </div>

            </div>
        </div>
    );
}
