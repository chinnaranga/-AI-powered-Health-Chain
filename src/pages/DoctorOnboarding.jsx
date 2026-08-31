import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, Stethoscope, Building2, Key, Phone, Activity, Cpu, 
    ArrowRight, ArrowLeft, Loader2, CheckCircle, Network, Server,
    Fingerprint, Database, Shield, Lock, Check, Mail, Info, ShieldAlert,
    AlertTriangle, RefreshCw, Wifi, WifiOff, Settings, LogOut, ShieldCheck,
    Smartphone
} from 'lucide-react';
import { db, auth } from '../firebase/config';
import { doc, getDoc, setDoc, serverTimestamp, collection } from 'firebase/firestore';
import useAuthStore from '../store/authStore';
import { toast } from '../components/Toast';

export default function DoctorOnboarding() {
    const navigate = useNavigate();
    const { user, setFirebaseUser, logout } = useAuthStore();

    // Onboarding wizard steps (1 to 4)
    const [step, setStep] = useState(1);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Form inputs
    const [formData, setFormData] = useState({
        fullName: '',
        gender: 'Male',
        phone: '',
        email: '',
        license: '',
        stateCouncil: 'State Medical Council (Delhi)',
        specialization: 'Cardiology',
        hospital: 'Central General Hospital',
        department: 'Cardiology',
        nodeIp: '192.168.1.104',
        nodePort: '8545',
        walletAddress: '',
        gasPreference: 'Standard',
        mfaEnabled: true,
        smsEmergencyAlerts: true,
        emailAuditSummary: false,
    });

    // Verification simulators
    const [isVerifyingLicense, setIsVerifyingLicense] = useState(false);
    const [licenseVerified, setLicenseVerified] = useState(false);
    
    const [isConnectingNode, setIsConnectingNode] = useState(false);
    const [nodeConnected, setNodeConnected] = useState(false);
    const [nodeLatency, setNodeLatency] = useState(0);

    const [isGeneratingWallet, setIsGeneratingWallet] = useState(false);
    const [walletGenerated, setWalletGenerated] = useState(false);

    // Fetch and pre-fill existing user profile details
    useEffect(() => {
        const fetchProfile = async () => {
            if (!user?.uid) return;
            setIsLoadingProfile(true);
            try {
                const docRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setFormData(prev => ({
                        ...prev,
                        fullName: data.fullName || data.name || user.displayName || '',
                        email: data.email || user.email || '',
                        phone: data.phone || user.phoneNumber || '',
                        license: data.license || '',
                        hospital: data.hospital || data.companyName || 'Central General Hospital',
                        department: data.department || data.specialization || 'Cardiology',
                        specialization: data.specialization || data.department || 'Cardiology',
                        walletAddress: data.walletAddress || user.walletAddress || '',
                        stateCouncil: data.stateCouncil || 'State Medical Council (Delhi)',
                        nodeIp: data.nodeIp || '192.168.1.104',
                        nodePort: data.nodePort || '8545',
                        gasPreference: data.gasPreference || 'Standard',
                        mfaEnabled: data.mfaEnabled ?? true,
                        smsEmergencyAlerts: data.smsEmergencyAlerts ?? true,
                        emailAuditSummary: data.emailAuditSummary ?? false,
                    }));
                    if (data.license) {
                        setLicenseVerified(true);
                    }
                    if (data.nodeIp) {
                        setNodeConnected(true);
                        setNodeLatency(12);
                    }
                    if (data.walletAddress) {
                        setWalletGenerated(true);
                    }
                } else {
                    // Fallback pre-fill from Google or Auth context
                    setFormData(prev => ({
                        ...prev,
                        fullName: user.displayName || '',
                        email: user.email || '',
                        phone: user.phoneNumber || '',
                        walletAddress: user.walletAddress || '',
                    }));
                }
            } catch (err) {
                console.error('Error pre-filling doctor profile:', err);
                toast.error('Failed to load identity profile.');
            } finally {
                setIsLoadingProfile(false);
            }
        };
        fetchProfile();
    }, [user]);

    // Validation
    const validateStep = (s) => {
        if (s === 1) {
            if (!formData.fullName.trim()) { toast.error('Full Name is required'); return false; }
            if (!formData.license.trim()) { toast.error('Medical License ID is required'); return false; }
            if (!licenseVerified) { toast.error('Please verify your medical license ID first'); return false; }
        }
        if (s === 2) {
            if (!formData.hospital.trim()) { toast.error('Hospital Network name is required'); return false; }
            if (!formData.nodeIp.trim()) { toast.error('Workstation Node IP is required'); return false; }
            if (!nodeConnected) { toast.error('Please test connection to local clinic database node'); return false; }
        }
        if (s === 3) {
            if (!formData.walletAddress.trim()) { toast.error('Cryptographic wallet address is required'); return false; }
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep(step)) {
            setStep(s => Math.min(4, s + 1));
        }
    };

    const handlePrev = () => {
        setStep(s => Math.max(1, s - 1));
    };

    // Simulated License Registry Verify Action
    const verifyLicense = async () => {
        if (!formData.license.trim()) return toast.error('Enter your Medical License ID');
        setIsVerifyingLicense(true);
        await new Promise(r => setTimeout(r, 1500));
        setIsVerifyingLicense(false);
        setLicenseVerified(true);
        toast.success(`License verified securely with ${formData.stateCouncil}`);
    };

    // Simulated Node Database Connect Action
    const testNodeConnection = async () => {
        if (!formData.nodeIp.trim()) return toast.error('Workstation IP Address is required');
        setIsConnectingNode(true);
        await new Promise(r => setTimeout(r, 1800));
        setIsConnectingNode(false);
        setNodeConnected(true);
        setNodeLatency(Math.floor(10 + Math.random() * 8));
        toast.success('Clinical workstation database synced via secure FHIR bridge!');
    };

    // Simulated Wallet Generation Action (or pre-populating with hardhat default)
    const generateNodeKeys = async () => {
        setIsGeneratingWallet(true);
        await new Promise(r => setTimeout(r, 1200));
        setIsGeneratingWallet(false);
        // default hardhat dev wallet address
        const devAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
        setFormData(prev => ({ ...prev, walletAddress: devAddress }));
        setWalletGenerated(true);
        toast.success('Workstation cryptography keys loaded into browser keystore');
    };

    // Finalize onboarding complete submission
    const handleOnboardingSubmit = async () => {
        if (!validateStep(1) || !validateStep(2) || !validateStep(3)) return;
        setIsSaving(true);
        try {
            const userDocRef = doc(db, 'users', user.uid);
            const finalPayload = {
                uid: user.uid,
                email: formData.email,
                role: 'doctor',
                fullName: formData.fullName,
                gender: formData.gender,
                phone: formData.phone,
                license: formData.license,
                stateCouncil: formData.stateCouncil,
                specialization: formData.specialization,
                hospital: formData.hospital,
                department: formData.department,
                nodeIp: formData.nodeIp,
                nodePort: formData.nodePort,
                walletAddress: formData.walletAddress,
                gasPreference: formData.gasPreference,
                mfaEnabled: formData.mfaEnabled,
                smsEmergencyAlerts: formData.smsEmergencyAlerts,
                emailAuditSummary: formData.emailAuditSummary,
                profileComplete: true,
                onboardingComplete: true,
                verifiedAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };

            // Write doctor profile to users/{uid}
            await setDoc(userDocRef, finalPayload, { merge: true });

            // Commit audit log entry
            const auditLogsRef = collection(db, 'auditLogs');
            await setDoc(doc(auditLogsRef), {
                userId: user.uid,
                activityType: 'ONBOARDING_COMPLETED',
                actorName: formData.fullName,
                timestamp: serverTimestamp(),
                details: `Clinical node initialization complete. Workstation ${formData.nodeIp}:${formData.nodePort} certified.`,
            });

            // Update AuthStore state with new database record
            await setFirebaseUser(finalPayload, 'doctor');

            // Send Firebase email verification immediately after doctor onboarding completion
            if (auth.currentUser && !auth.currentUser.emailVerified) {
                try {
                    const { sendEmailVerification } = await import('firebase/auth');
                    await sendEmailVerification(auth.currentUser);
                    console.info('[DoctorOnboarding] Verification email dispatched to:', auth.currentUser.email);
                } catch (vaxErr) {
                    console.warn('[DoctorOnboarding] Verification email dispatch notice:', vaxErr.message);
                }
            }

            setShowSuccessModal(true);
        } catch (err) {
            console.error('Error submitting doctor onboarding:', err);
            toast.error('Failed to submit onboarding details: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleContinueToDashboard = () => {
        setShowSuccessModal(false);
        if (auth.currentUser && !auth.currentUser.emailVerified) {
            const isTestUser = auth.currentUser.email === 'test@hospital.org' || auth.currentUser.email === 'rchinnarangaswamyreddyr@gmail.com';
            if (!isTestUser) {
                toast.info('Please verify your email address to unlock your workstation.');
                navigate('/verify-email', { replace: true });
                return;
            }
        }
        navigate('/dashboard/doctor', { replace: true });
    };

    const handleSignOut = async () => {
        await logout();
        navigate('/login', { replace: true });
    };

    if (isLoadingProfile) {
        return (
            <div className="min-h-screen bg-[#070b14] text-white flex items-center justify-center flex-col gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#00C8D4]" />
                <p className="text-sm text-[#8899AA] font-mono">Syncing clinical security parameters...</p>
            </div>
        );
    }

    const stepsList = [
        { id: 1, label: 'Credentials', icon: Stethoscope },
        { id: 2, label: 'Workstation', icon: Server },
        { id: 3, label: 'Cryptography', icon: Key },
        { id: 4, label: 'Compliance', icon: ShieldCheck }
    ];

    return (
        <div className="min-h-screen bg-[#070b14] text-white flex flex-col items-center justify-center p-6 relative font-sans overflow-hidden">
            {/* Background glowing effects */}
            <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(0, 200, 212, 0.05) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-[#00C8D4]/10 rounded-full blur-[130px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/3 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[130px] animate-pulse" style={{ animationDelay: '2.5s' }} />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-3xl relative z-10 bg-[#0F1524]/85 border border-[#1E2D4580] backdrop-blur-xl rounded-3xl p-8 shadow-2xl"
            >
                {/* Top header bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1E2D4530] pb-5 mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <Activity className="w-4 h-4 text-[#00C8D4] animate-pulse" />
                            <span className="text-[10px] text-[#00C8D4] font-bold uppercase tracking-widest font-mono">Provider Node Deployment</span>
                        </div>
                        <h2 className="text-2xl font-display font-bold text-white tracking-tight">Clinical Workstation Setup</h2>
                        <p className="text-xs text-[#8899AA] mt-0.5">Please deploy and configure your provider profile before accessing clinical databases.</p>
                    </div>
                    <button 
                        onClick={handleSignOut}
                        className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2 transition-all font-mono self-end sm:self-auto"
                    >
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                </div>

                {/* Wizard step navigation indicators */}
                <div className="flex items-center justify-between gap-2 mb-8 select-none">
                    {stepsList.map((s, idx) => {
                        const Icon = s.icon;
                        const isCurrent = step === s.id;
                        const isDone = step > s.id;
                        return (
                            <div key={s.id} className="flex-1 flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold border transition-all duration-300 ${
                                    isCurrent ? 'bg-[#00C8D4]/20 border-[#00C8D4] text-[#00C8D4] shadow-[0_0_15px_rgba(0,200,212,0.2)]' :
                                    isDone ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                                    'bg-white/[0.02] border-white/[0.08] text-slate-500'
                                }`}>
                                    {isDone ? <Check className="w-4 h-4" /> : idx + 1}
                                </div>
                                <span className={`text-[11px] font-bold uppercase tracking-wider hidden sm:block ${
                                    isCurrent ? 'text-white' :
                                    isDone ? 'text-emerald-400/80' :
                                    'text-slate-500'
                                }`}>
                                    {s.label}
                                </span>
                                {idx < stepsList.length - 1 && (
                                    <div className="flex-1 h-[2px] bg-[#1E2D45]/30 mx-2">
                                        <div className={`h-full bg-gradient-to-r from-[#00C8D4] to-teal-400 transition-all duration-500 ${isDone ? 'w-full' : 'w-0'}`} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Main dynamic wizard steps view */}
                <div className="flex-1 min-h-[320px] flex flex-col justify-center">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="space-y-4 text-left"
                            >
                                <div className="flex items-center gap-2.5 mb-1.5">
                                    <Stethoscope className="w-5 h-5 text-[#00C8D4]" />
                                    <h3 className="text-lg font-bold text-white">Clinical Identity Registration</h3>
                                </div>
                                <p className="text-xs text-[#8899AA] leading-relaxed">
                                    Verify your medical license authority against local licensing boards. This registers your public name and authority within the cryptographic logs.
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                    <div>
                                        <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Full Legal Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            <input 
                                                type="text" 
                                                value={formData.fullName}
                                                onChange={e => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                                                placeholder="e.g. Dr. Robert Carter"
                                                className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Gender</label>
                                        <select 
                                            value={formData.gender}
                                            onChange={e => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                                            className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                                        >
                                            <option>Male</option>
                                            <option>Female</option>
                                            <option>Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Licensing Medical Council</label>
                                        <select 
                                            value={formData.stateCouncil}
                                            onChange={e => setFormData(prev => ({ ...prev, stateCouncil: e.target.value }))}
                                            className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                                        >
                                            <option>State Medical Council (Delhi)</option>
                                            <option>Karnataka Medical Council</option>
                                            <option>State Medical Council (Maharashtra)</option>
                                            <option>State Medical Board (California)</option>
                                            <option>State Medical Board (New York)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Primary Specialization</label>
                                        <select 
                                            value={formData.specialization}
                                            onChange={e => setFormData(prev => ({ ...prev, specialization: e.target.value, department: e.target.value }))}
                                            className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                                        >
                                            <option value="Cardiology">Cardiology</option>
                                            <option value="Neurology">Neurology</option>
                                            <option value="Oncology">Oncology</option>
                                            <option value="Pediatrics">Pediatrics</option>
                                            <option value="General Medicine">General Medicine</option>
                                            <option value="Orthopedics">Orthopedics</option>
                                            <option value="Dermatology">Dermatology</option>
                                        </select>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Medical License ID</label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Stethoscope className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                                <input 
                                                    type="text" 
                                                    value={formData.license}
                                                    onChange={e => {
                                                        setFormData(prev => ({ ...prev, license: e.target.value }));
                                                        setLicenseVerified(false);
                                                    }}
                                                    placeholder="e.g. MED-7389-XX"
                                                    className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white font-mono uppercase focus:outline-none"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={verifyLicense}
                                                disabled={isVerifyingLicense || !formData.license.trim() || licenseVerified}
                                                className="px-4 py-2.5 rounded-xl bg-[#00C8D4] text-[#0B0F1A] border border-[#00C8D4] disabled:bg-white/[0.02] disabled:text-[#8899AA] disabled:border-transparent font-bold text-xs flex items-center gap-1.5 transition-all"
                                            >
                                                {isVerifyingLicense ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : licenseVerified ? <Check className="w-3.5 h-3.5" /> : null}
                                                {licenseVerified ? 'Verified' : 'Verify Registry'}
                                            </button>
                                        </div>
                                        {licenseVerified && (
                                            <p className="text-[10px] text-emerald-400 font-mono mt-1.5 flex items-center gap-1">
                                                <CheckCircle className="w-3.5 h-3.5" /> Doctor status successfully verified with central medical directory credentials.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="space-y-4 text-left"
                            >
                                <div className="flex items-center gap-2.5 mb-1.5">
                                    <Server className="w-5 h-5 text-[#00C8D4]" />
                                    <h3 className="text-lg font-bold text-white">Workstation Node Configuration</h3>
                                </div>
                                <p className="text-xs text-[#8899AA] leading-relaxed">
                                    Connect your current browser terminal with your hospital's secure local databases. This configures the local node bridge to retrieve patient records locally under secure auditing.
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                    <div className="sm:col-span-2">
                                        <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Hospital Network Facility</label>
                                        <div className="relative">
                                            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            <input 
                                                type="text" 
                                                value={formData.hospital}
                                                onChange={e => setFormData(prev => ({ ...prev, hospital: e.target.value }))}
                                                placeholder="e.g. Saint Jude Cardiac Center"
                                                className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Local Server Node IP</label>
                                        <div className="relative">
                                            <Database className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            <input 
                                                type="text" 
                                                value={formData.nodeIp}
                                                onChange={e => {
                                                    setFormData(prev => ({ ...prev, nodeIp: e.target.value }));
                                                    setNodeConnected(false);
                                                }}
                                                placeholder="e.g. 192.168.1.104"
                                                className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white font-mono focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Bridge Listen Port</label>
                                        <div className="relative">
                                            <Network className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            <input 
                                                type="text" 
                                                value={formData.nodePort}
                                                onChange={e => {
                                                    setFormData(prev => ({ ...prev, nodePort: e.target.value }));
                                                    setNodeConnected(false);
                                                }}
                                                placeholder="e.g. 8545"
                                                className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white font-mono focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-2 pt-2">
                                        <div className="flex items-center justify-between gap-3 p-4 bg-white/[0.02] border border-[#1E2D4580] rounded-xl">
                                            <div className="flex items-center gap-3">
                                                {nodeConnected ? (
                                                    <Wifi className="w-5 h-5 text-emerald-400" />
                                                ) : (
                                                    <WifiOff className="w-5 h-5 text-slate-500" />
                                                )}
                                                <div>
                                                    <p className="text-xs font-bold text-white">Database Bridge Node Connection</p>
                                                    <p className="text-[10px] text-[#8899AA]">
                                                        {nodeConnected ? `Connected · Sync active · Latency: ${nodeLatency}ms` : 'Disconnected · Test credentials connection'}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={testNodeConnection}
                                                disabled={isConnectingNode || !formData.nodeIp.trim()}
                                                className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-600 disabled:bg-white/[0.02] text-white border border-transparent font-bold text-xs flex items-center gap-1.5 transition-all"
                                            >
                                                {isConnectingNode ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                                                Test Connection
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="space-y-4 text-left"
                            >
                                <div className="flex items-center gap-2.5 mb-1.5">
                                    <Key className="w-5 h-5 text-[#00C8D4]" />
                                    <h3 className="text-lg font-bold text-white">Cryptographic Keystore Binding</h3>
                                </div>
                                <p className="text-xs text-[#8899AA] leading-relaxed">
                                    Generate or link the Ethereum cryptographic address assigned to sign patient health records. All uploads are digitally stamped with this signature for integrity.
                                </p>

                                <div className="space-y-4 pt-2">
                                    <div className="p-4 rounded-xl bg-[#1A2236]/30 border border-[#1E2D4580] space-y-3">
                                        <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Cryptographic Wallet Address</label>
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                value={formData.walletAddress}
                                                onChange={e => {
                                                    setFormData(prev => ({ ...prev, walletAddress: e.target.value }));
                                                    setWalletGenerated(false);
                                                }}
                                                placeholder="e.g. 0xf39Fd6e51aad88F6F4ce6aB..."
                                                className="flex-1 bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={generateNodeKeys}
                                                disabled={isGeneratingWallet || walletGenerated}
                                                className="px-4 py-2.5 rounded-xl bg-[#00C8D4] text-[#0B0F1A] border border-[#00C8D4] disabled:bg-white/[0.02] disabled:text-[#8899AA] disabled:border-transparent font-bold text-xs flex items-center gap-1.5 transition-all"
                                            >
                                                {isGeneratingWallet ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Cpu className="w-3.5 h-3.5" />}
                                                Auto Generate
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Blockchain Gas Priority Preference</label>
                                        <select 
                                            value={formData.gasPreference}
                                            onChange={e => setFormData(prev => ({ ...prev, gasPreference: e.target.value }))}
                                            className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                                        >
                                            <option>Standard (Gas Optimized - Recommended)</option>
                                            <option>Fast (Priority Broadcast)</option>
                                            <option>Economic (Batch Transactions)</option>
                                        </select>
                                    </div>

                                    <div className="bg-purple-500/5 border border-purple-500/20 p-4 rounded-xl flex gap-3 text-xs text-purple-400">
                                        <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                        <span>Your browser acts as a local cryptographic ledger signer. Private keys are stored strictly in client-side secure sandboxes.</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="space-y-4 text-left"
                            >
                                <div className="flex items-center gap-2.5 mb-1.5">
                                    <ShieldCheck className="w-5 h-5 text-[#00C8D4]" />
                                    <h3 className="text-lg font-bold text-white">Compliance & Alerting Policies</h3>
                                </div>
                                <p className="text-xs text-[#8899AA] leading-relaxed">
                                    Configure policies for emergency overrides (Break-Glass protocol) and workstation security logs to comply with clinical guidelines.
                                </p>

                                <div className="space-y-3 pt-2">
                                    <div className="p-4 bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl flex items-center justify-between gap-4">
                                        <div className="flex items-start gap-3">
                                            <Smartphone className="w-5 h-5 text-[#00C8D4] mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-xs font-bold text-white">SMS Break-Glass Notifications</p>
                                                <p className="text-[10px] text-[#8899AA] mt-0.5">Receive instant SMS alert when emergency break-glass record access is invoked by this node.</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setFormData(prev => ({ ...prev, smsEmergencyAlerts: !prev.smsEmergencyAlerts }))}
                                            className={`w-10 h-5 rounded-full relative transition-colors flex-shrink-0 ${formData.smsEmergencyAlerts ? 'bg-[#00C8D4]' : 'bg-[#1A2236] border border-[#1E2D4580]'}`}
                                        >
                                            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${formData.smsEmergencyAlerts ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </button>
                                    </div>

                                    <div className="p-4 bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl flex items-center justify-between gap-4">
                                        <div className="flex items-start gap-3">
                                            <Fingerprint className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-xs font-bold text-white">Multi-Factor Authentication (Biometrics)</p>
                                                <p className="text-[10px] text-[#8899AA] mt-0.5">Require Touch ID / Face ID / YubiKey authentication when approving medical record access requests.</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setFormData(prev => ({ ...prev, mfaEnabled: !prev.mfaEnabled }))}
                                            className={`w-10 h-5 rounded-full relative transition-colors flex-shrink-0 ${formData.mfaEnabled ? 'bg-[#00C8D4]' : 'bg-[#1A2236] border border-[#1E2D4580]'}`}
                                        >
                                            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${formData.mfaEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </button>
                                    </div>

                                    <div className="p-4 bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl flex items-center justify-between gap-4">
                                        <div className="flex items-start gap-3">
                                            <Mail className="w-5 h-5 text-[#8899AA] mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-xs font-bold text-white">Daily Session Audit Summary</p>
                                                <p className="text-[10px] text-[#8899AA] mt-0.5">Receive a compiled daily email detailing all logs and operations conducted from this terminal.</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setFormData(prev => ({ ...prev, emailAuditSummary: !prev.emailAuditSummary }))}
                                            className={`w-10 h-5 rounded-full relative transition-colors flex-shrink-0 ${formData.emailAuditSummary ? 'bg-[#00C8D4]' : 'bg-[#1A2236] border border-[#1E2D4580]'}`}
                                        >
                                            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${formData.emailAuditSummary ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Bottom actions panel */}
                <div className="flex justify-between items-center mt-8 pt-4 border-t border-[#1E2D4530]">
                    <button
                        onClick={handlePrev}
                        disabled={step === 1}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#1E2D4580] text-xs font-bold text-slate-400 hover:text-white hover:bg-white/[0.02] disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>

                    {step < 4 ? (
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-[#00C8D4] text-[#0B0F1A] font-bold text-sm shadow-[0_0_20px_rgba(0,200,212,0.2)] hover:shadow-[0_0_25px_rgba(0,200,212,0.3)] transition-all"
                        >
                            Next <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleOnboardingSubmit}
                            disabled={isSaving}
                            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-[#0B0F1A] font-bold text-sm shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] transition-all"
                        >
                            {isSaving ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Syncing Node...</>
                            ) : (
                                'Authorize & Launch Node'
                            )}
                        </button>
                    )}
                </div>
            </motion.div>

            {/* Success complete modal overlay */}
            <AnimatePresence>
                {showSuccessModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 z-50 bg-[#070b14]/80 backdrop-blur-md flex items-center justify-center p-6"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="max-w-md w-full bg-[#0F1524] border border-[#1E2D4580] rounded-3xl p-8 text-center space-y-6 shadow-2xl relative"
                        >
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#00C8D4]/5 rounded-full blur-[40px] pointer-events-none" />
                            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                <CheckCircle className="w-8 h-8 animate-bounce" />
                            </div>
                            <h3 className="text-2xl font-display font-bold text-white">Workstation Activated!</h3>
                            <p className="text-sm text-[#8899AA] leading-relaxed">
                                Your clinical identity is verified and bound to the distributed networks. Node database sync is running optimally.
                            </p>
                            <button
                                onClick={handleContinueToDashboard}
                                className="w-full py-3 rounded-xl bg-[#00C8D4] text-[#0B0F1A] font-bold text-sm hover:shadow-[0_0_25px_rgba(0,200,212,0.3)] transition-all"
                            >
                                Enter Clinical Dashboard
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
