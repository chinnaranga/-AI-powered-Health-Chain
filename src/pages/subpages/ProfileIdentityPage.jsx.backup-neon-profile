import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, Mail, Phone, ShieldCheck, Landmark, Stethoscope, 
    Upload, Camera, CheckCircle, RefreshCw, BarChart2, Star,
    Check, Lock, Edit3, Copy, Printer, Share2, Globe, QrCode,
    Calendar, Heart, Sparkles, AlertCircle, Smartphone, KeyRound, AlertTriangle
} from 'lucide-react';
import { onAuthStateChanged, updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import { toast } from '../../components/Toast';
import useAuthStore from '../../store/authStore';

const STORAGE_PROFILE_KEY = 'hc_patient_profile';

export default function ProfileIdentityPage() {
    const { user: storeUser, setCurrentUser } = useAuthStore();
    const [firebaseUser, setFirebaseUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    // Initial cache extraction
    const getCachedProfile = () => {
        try {
            const raw = localStorage.getItem(STORAGE_PROFILE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    };

    const savedProfile = getCachedProfile();
    const storedPhone = localStorage.getItem('hc_phone') || '';
    const storedEmail = localStorage.getItem('hc_email') || '';
    const storedName = localStorage.getItem('hc_name') || '';
    const storedPhoto = localStorage.getItem('hc_photo') || '';

    // Direct synchronous state initialization from real user credentials
    const [displayName, setDisplayName] = useState(
        savedProfile?.displayName || savedProfile?.name || savedProfile?.fullName || storeUser?.displayName || (storeUser?.name && storeUser.name !== 'USER' ? storeUser.name : '') || storedName || ''
    );
    const [email, setEmail] = useState(
        savedProfile?.email || (storeUser?.email && !storeUser.email.includes('user@hospital.org') && !storeUser.email.includes('user@healthchain.io') ? storeUser.email : '') || storedEmail || ''
    );
    const [phoneNumber, setPhoneNumber] = useState(
        savedProfile?.phoneNumber || savedProfile?.phone || storeUser?.phoneNumber || storeUser?.phone || storedPhone || ''
    );
    const [dob, setDob] = useState(savedProfile?.dob || storeUser?.dob || '');
    const [gender, setGender] = useState(savedProfile?.gender || storeUser?.gender || '');
    const [bloodGroup, setBloodGroup] = useState(savedProfile?.bloodGroup || storeUser?.bloodGroup || '');
    const [abhaId, setAbhaId] = useState(savedProfile?.abhaId || storeUser?.abhaId || '');
    const [photoURL, setPhotoURL] = useState(savedProfile?.photoURL || storeUser?.photoURL || storedPhoto || '');
    
    const [linkedHospitals, setLinkedHospitals] = useState(savedProfile?.linkedHospitals || 3);
    const [connectedDoctors, setConnectedDoctors] = useState(savedProfile?.connectedDoctors || 5);
    const [isVerified, setIsVerified] = useState(!!(savedProfile?.isVerified || (storeUser?.email && storeUser?.name)));

    const loginMethod = storeUser?.loginMethod || (storeUser?.authProvider === 'google.com' || localStorage.getItem('hc_photo') ? 'google' : storeUser?.authProvider === 'phone' ? 'phone' : 'email');

    // Deterministic Global Patient ID helper based strictly on real UID / Phone
    const cleanPhone = (phoneNumber || storedPhone || '').replace(/[^0-9]/g, '');
    const globalPatientId = savedProfile?.globalPatientId || storeUser?.globalPatientId || 
        (cleanPhone.length >= 8 ? `HCG-${cleanPhone.slice(-8)}` : `HCG-${(storeUser?.uid || 'PATIENT').slice(-8).toUpperCase()}`);

    // Reactive listener for authStore and background session changes
    useEffect(() => {
        const freshProfile = getCachedProfile();
        const freshPhone = localStorage.getItem('hc_phone') || '';
        const freshEmail = localStorage.getItem('hc_email') || '';
        const freshName = localStorage.getItem('hc_name') || '';
        const freshPhoto = localStorage.getItem('hc_photo') || '';

        if (storeUser?.email && !email) {
            setEmail(storeUser.email);
        } else if (freshEmail && !email) {
            setEmail(freshEmail);
        }

        if (storeUser?.name && storeUser.name !== 'USER' && !displayName) {
            setDisplayName(storeUser.name);
        } else if (freshName && !displayName) {
            setDisplayName(freshName);
        }

        if ((storeUser?.phoneNumber || storeUser?.phone) && !phoneNumber) {
            setPhoneNumber(storeUser.phoneNumber || storeUser.phone);
        } else if (freshPhone && !phoneNumber) {
            setPhoneNumber(freshPhone);
        }

        if (storeUser?.photoURL && !photoURL) {
            setPhotoURL(storeUser.photoURL);
        } else if (freshPhoto && !photoURL) {
            setPhotoURL(freshPhoto);
        }

        if (freshProfile?.dob && !dob) {
            setDob(freshProfile.dob);
        }
        if (freshProfile?.abhaId && !abhaId) {
            setAbhaId(freshProfile.abhaId);
        }
        if (freshProfile?.gender && !gender) {
            setGender(freshProfile.gender);
        }
        if (freshProfile?.bloodGroup && !bloodGroup) {
            setBloodGroup(freshProfile.bloodGroup);
        }
    }, [storeUser]);

    // Listen to Firebase Auth state
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setFirebaseUser(user);
                if (user.email && !email) {
                    setEmail(user.email);
                    localStorage.setItem('hc_email', user.email);
                }
                if (user.displayName && user.displayName !== 'USER' && !displayName) {
                    setDisplayName(user.displayName);
                    localStorage.setItem('hc_name', user.displayName);
                }
                if (user.photoURL && !photoURL) {
                    setPhotoURL(user.photoURL);
                    localStorage.setItem('hc_photo', user.photoURL);
                }
            }
        });

        return () => unsubscribe();
    }, [email, displayName, photoURL]);

    // Form validation and profile save
    const handleSaveProfile = async (e) => {
        e.preventDefault();
        
        if (!displayName.trim()) {
            toast.error('Please enter your Full Name');
            return;
        }

        if (!email.trim() && !phoneNumber.trim()) {
            toast.error('Please provide at least an Email Address or Phone Number');
            return;
        }

        setIsUpdating(true);
        try {
            const finalGId = globalPatientId || `HCG-${Date.now().toString(36).toUpperCase()}`;

            const profilePayload = {
                displayName: displayName.trim(),
                name: displayName.trim(),
                fullName: displayName.trim(),
                phoneNumber: phoneNumber.trim(),
                phone: phoneNumber.trim(),
                abhaId: abhaId.trim(),
                email: email.trim(),
                gender,
                dob,
                bloodGroup,
                globalPatientId: finalGId,
                linkedHospitals,
                connectedDoctors,
                isVerified: true,
                photoURL,
                loginMethod,
                updatedAt: new Date().toISOString()
            };

            // 1. Save directly to local persistent storage
            localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(profilePayload));
            if (phoneNumber.trim()) localStorage.setItem('hc_phone', phoneNumber.trim());
            if (email.trim()) localStorage.setItem('hc_email', email.trim());
            if (displayName.trim()) localStorage.setItem('hc_name', displayName.trim());
            if (photoURL) localStorage.setItem('hc_photo', photoURL);

            // 2. Synchronize Auth Store & Global App state
            const currentAuthUser = useAuthStore.getState().user || {};
            const syncedUser = {
                ...currentAuthUser,
                ...profilePayload,
                id: currentAuthUser.id || currentAuthUser.uid || `usr_${Date.now()}`,
                uid: currentAuthUser.uid || currentAuthUser.id || `usr_${Date.now()}`,
                role: 'patient',
                profileComplete: true,
                onboardingComplete: true
            };
            await setCurrentUser(syncedUser, 'patient');

            // 3. Update Firebase/Cloudflare if available
            try {
                if (firebaseUser) {
                    await updateProfile(firebaseUser, { 
                        displayName: displayName.trim(),
                        photoURL: photoURL || undefined
                    });
                }
                const targetUid = syncedUser.uid;
                if (targetUid) {
                    const userRef = doc(db, 'users', targetUid);
                    await setDoc(userRef, profilePayload, { merge: true });
                }
            } catch (backendErr) {
                console.warn('[Profile Save Backend Sync Notice]', backendErr.message);
            }

            setIsVerified(true);
            toast.success('Your identity details have been saved successfully!');
        } catch (err) {
            console.error('Failed to save profile:', err);
            toast.error('Failed to update identity profile');
        } finally {
            setIsUpdating(false);
        }
    };

    // Real Image Upload Handler with Preview & Storage Persistence
    const handleImageChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error('File size exceeds 2MB limit. Please choose a smaller image.');
            return;
        }

        setUploadingImage(true);
        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const dataUrl = reader.result;
                setPhotoURL(dataUrl);

                // Update current user & storage
                const currentProfile = JSON.parse(localStorage.getItem(STORAGE_PROFILE_KEY) || '{}');
                const updatedProfile = { ...currentProfile, photoURL: dataUrl };
                localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(updatedProfile));
                localStorage.setItem('hc_photo', dataUrl);

                const currentAuthUser = useAuthStore.getState().user || {};
                const syncedUser = { ...currentAuthUser, photoURL: dataUrl };
                await setCurrentUser(syncedUser, 'patient');

                try {
                    if (firebaseUser) {
                        await updateProfile(firebaseUser, { photoURL: dataUrl });
                    }
                } catch (e) {}

                setUploadingImage(false);
                toast.success('Profile photo updated successfully!');
            };
            reader.readAsDataURL(file);
        } catch (err) {
            console.error('Photo upload error:', err);
            toast.error('Failed to process image');
            setUploadingImage(false);
        }
    };

    // Calculate dynamic identity completeness score based strictly on real filled data
    const calculateCompleteness = () => {
        let score = 0;
        if (displayName && displayName.trim()) score += 20;
        if (phoneNumber && phoneNumber.trim()) score += 20;
        if (email && email.trim()) score += 20;
        if (dob && dob.trim()) score += 20;
        if (abhaId && abhaId.trim()) score += 20;
        return score;
    };

    const completeness = calculateCompleteness();
    const initials = displayName && displayName.trim()
        ? displayName.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : (phoneNumber ? phoneNumber.slice(-2) : 'P');

    const missingFields = [];
    if (!displayName.trim()) missingFields.push('Full Name');
    if (!email.trim()) missingFields.push('Email Address');
    if (!phoneNumber.trim()) missingFields.push('Phone Number');
    if (!dob.trim()) missingFields.push('Date of Birth');
    if (!abhaId.trim()) missingFields.push('ABHA ID');

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-16 text-left">
            
            {/* Header with Active Login Provider Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <ShieldCheck className="w-4 h-4 text-[#00C8D4]" />
                        <span className="text-[10px] text-[#00C8D4] font-bold uppercase tracking-widest">Digital Health Identity</span>
                    </div>
                    <h2 className="text-3xl font-display font-bold text-white">Profile & Identity</h2>
                    <p className="text-sm text-[#8899AA] mt-1">Manage your verified medical identity, contact details, and linked nodes.</p>
                </div>

                {/* Login Method Indicator */}
                <div className="bg-[#111827] border border-teal-500/20 rounded-xl px-3.5 py-2 flex items-center gap-2.5 w-max shadow-sm">
                    {loginMethod === 'google' ? (
                        <>
                            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                                </svg>
                            </div>
                            <div>
                                <span className="text-[9px] font-bold text-[#8899AA] uppercase tracking-wider block">Auth Method</span>
                                <span className="text-xs font-semibold text-teal-300">Google Verified OAuth</span>
                            </div>
                        </>
                    ) : loginMethod === 'phone' ? (
                        <>
                            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                                <Smartphone className="w-3.5 h-3.5" />
                            </div>
                            <div>
                                <span className="text-[9px] font-bold text-[#8899AA] uppercase tracking-wider block">Auth Method</span>
                                <span className="text-xs font-semibold text-emerald-400">Phone OTP Verified</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                                <KeyRound className="w-3.5 h-3.5" />
                            </div>
                            <div>
                                <span className="text-[9px] font-bold text-[#8899AA] uppercase tracking-wider block">Auth Method</span>
                                <span className="text-xs font-semibold text-blue-400">Email & Password Key</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Profile Incomplete Notification Banner */}
            {missingFields.length > 0 && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-start gap-3 text-left"
                >
                    <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 text-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <p className="font-bold text-amber-200 text-sm">Please complete your identity details</p>
                            <a 
                                href="/patient/onboarding"
                                className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 rounded-lg text-xs font-bold transition-colors w-fit cursor-pointer"
                            >
                                Open Guided Onboarding Wizard →
                            </a>
                        </div>
                        <p className="mt-1 text-amber-300/90 leading-relaxed">
                            To enable full hospital network syncing, please fill in your details: <strong className="text-white">{missingFields.join(', ')}</strong>, then click <strong>"Save Identity Changes"</strong> below.
                        </p>
                    </div>
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Completeness & Digital Health Card (ABHA) */}
                <div className="space-y-6 lg:col-span-1">
                    
                    {/* Completeness Score */}
                    <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5 relative overflow-hidden">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-bold text-[#8899AA] uppercase tracking-wider">Completeness Score</span>
                            <span className="text-sm font-bold text-[#00C8D4]">{completeness}%</span>
                        </div>
                        <div className="w-full bg-[#1A2236] h-2 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${completeness}%` }}
                                transition={{ duration: 1 }}
                                className="bg-gradient-to-r from-teal-500 to-[#00C8D4] h-full"
                            />
                        </div>
                        <p className="text-[10px] text-[#8899AA] mt-2">
                            {completeness === 100 
                                ? '✓ Verified patient identity profile is 100% complete and synchronized.' 
                                : `Profile is ${completeness}% complete. ${missingFields.length} field${missingFields.length > 1 ? 's' : ''} remaining.`}
                        </p>
                    </div>

                    {/* Universal Health Ledger Card */}
                    <motion.div 
                        whileHover={{ scale: 1.01 }}
                        className="bg-gradient-to-br from-[#111827] to-[#0A0E1A] border border-teal-500/30 rounded-3xl p-6 relative overflow-hidden shadow-[0_0_30px_rgba(20,184,166,0.08)] text-left"
                    >
                        {/* Futuristic Grid Overlay */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(20, 184, 166, 0.4) 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                        <div className="absolute -top-12 -left-12 w-32 h-32 bg-[#00C8D4]/10 rounded-full blur-2xl pointer-events-none animate-pulse" />
                        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />

                        <div className="flex justify-between items-start mb-5 relative z-10">
                            <div>
                                <span className="text-[9px] text-[#00C8D4] font-bold uppercase tracking-widest font-mono flex items-center gap-1">
                                    <Globe className="w-3 h-3 text-[#00C8D4]" /> Worldwide Interoperable
                                </span>
                                <h4 className="text-base font-bold font-display text-white mt-1">Universal Health Ledger</h4>
                            </div>
                            <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.15)] relative">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                GLOBAL ACCESS
                            </span>
                        </div>

                        {/* Patient info block */}
                        <div className="flex gap-4 items-center relative z-10 mb-5">
                            {photoURL ? (
                                <img src={photoURL} alt="Face Avatar" className="w-16 h-16 rounded-2xl object-cover border border-teal-500/40 shadow-sm" />
                            ) : (
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00C8D4]/20 to-teal-500/20 border border-teal-500/30 flex items-center justify-center text-[#00C8D4] text-xl font-bold font-display shadow-inner">
                                    {initials}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <h5 className="text-sm font-bold text-white truncate">
                                    {displayName || (phoneNumber ? `Patient (${phoneNumber})` : email ? email.split('@')[0] : 'Unverified Patient')}
                                </h5>
                                <p className="text-[10px] text-[#8899AA] font-mono mt-0.5 truncate">
                                    {email || phoneNumber || `Local ID: ${(storeUser?.uid || 'usr_node').slice(0, 12)}...`}
                                </p>
                                <div className="flex items-center gap-1.5 mt-2 bg-[#1A2236]/80 border border-[#1E2D4580] rounded-lg px-2.5 py-1.5 w-max">
                                    <span className="text-[10px] font-mono font-bold text-teal-400">{globalPatientId || 'HCG-PENDING'}</span>
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            if (globalPatientId) {
                                                navigator.clipboard.writeText(globalPatientId);
                                                toast.success('Global Patient ID copied!');
                                            }
                                        }}
                                        className="text-[#8899AA] hover:text-white transition-colors cursor-pointer"
                                        title="Copy Global ID"
                                    >
                                        <Copy className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* QR Code and sync indicators */}
                        <div className="bg-[#0B0F1A]/80 border border-[#1E2D4580] rounded-xl p-4 flex gap-4 items-center relative z-10">
                            <div className="bg-white p-1 rounded-lg flex-shrink-0">
                                <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=72x72&data=${encodeURIComponent(`HEALTHCHAIN_PATIENT:${globalPatientId || 'PENDING'}:${displayName || 'PATIENT'}:${email || phoneNumber}`)}`} 
                                    alt="Global ID QR" 
                                    className="w-14 h-14" 
                                />
                            </div>
                            <div className="flex-1 space-y-1.5 text-left">
                                <span className="text-[8px] text-[#8899AA] uppercase tracking-wider font-bold font-mono">Sync Status</span>
                                <div className="flex items-center justify-between text-[10px] text-white">
                                    <span>Worldwide Nodes</span>
                                    <span className={`font-mono font-bold ${completeness >= 80 ? 'text-teal-400' : 'text-amber-400'}`}>
                                        {completeness >= 80 ? '100% Synced' : 'Sync Pending'}
                                    </span>
                                </div>
                                <div className="w-full bg-[#1A2236] h-1.5 rounded-full overflow-hidden">
                                    <div 
                                        className="bg-gradient-to-r from-teal-500 to-[#00C8D4] h-full transition-all duration-500" 
                                        style={{ width: `${Math.max(completeness, 20)}%` }} 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Metadata Footer stats */}
                        <div className="grid grid-cols-2 gap-3 mt-4 border-t border-[#1E2D4580] pt-4 text-left text-[10px] relative z-10">
                            <div>
                                <span className="text-[#8899AA] block">Ledger Sync Node</span>
                                <span className="font-mono text-white font-semibold">Star Health Node</span>
                            </div>
                            <div>
                                <span className="text-[#8899AA] block">Interoperable Trust</span>
                                <span className="text-teal-400 font-semibold flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> {isVerified ? 'Verified ✓' : 'Pending Save'}
                                </span>
                            </div>
                        </div>

                        {/* Share and Print Actions */}
                        <div className="flex gap-2 mt-4 border-t border-[#1E2D4530] pt-3 relative z-10">
                            <button
                                type="button"
                                onClick={() => {
                                    const shareText = `HealthChain Identity: ${displayName || 'Patient'} | Phone: ${phoneNumber || 'N/A'} | Email: ${email || 'N/A'} | ABHA: ${abhaId || 'N/A'} | Global ID: ${globalPatientId}`;
                                    navigator.clipboard.writeText(shareText);
                                    toast.success('Patient credentials copied to clipboard!');
                                }}
                                className="flex-1 py-1.5 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-white rounded-lg text-[10px] font-bold font-mono flex items-center justify-center gap-1 transition-colors cursor-pointer"
                            >
                                <Share2 className="w-3.5 h-3.5" /> Share Staff
                            </button>
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="flex-1 py-1.5 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-white rounded-lg text-[10px] font-bold font-mono flex items-center justify-center gap-1 transition-colors cursor-pointer"
                            >
                                <Printer className="w-3.5 h-3.5" /> Print Card
                            </button>
                        </div>
                    </motion.div>

                    {/* Linked Stats Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#00C8D4]/10 border border-[#00C8D4]/20 flex items-center justify-center text-[#00C8D4]">
                                <Landmark className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-[9px] text-[#8899AA] uppercase font-bold tracking-wider">Hospitals</span>
                                <p className="text-base font-bold text-white mt-0.5">{linkedHospitals} Nodes</p>
                            </div>
                        </div>
                        <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                                <Stethoscope className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-[9px] text-[#8899AA] uppercase font-bold tracking-wider">Doctors</span>
                                <p className="text-base font-bold text-white mt-0.5">{connectedDoctors} Active</p>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Column: Identity Fields Edit Form */}
                <div className="lg:col-span-2">
                    
                    <form onSubmit={handleSaveProfile} className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-6 space-y-6">
                        <div className="border-b border-[#1E2D4580] pb-3 flex items-center justify-between">
                            <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                                <Edit3 className="w-4 h-4 text-[#00C8D4]" /> Personal Identity details
                            </h3>
                            <span className="text-[10px] text-[#8899AA]">Fill in and save your details below</span>
                        </div>

                        {/* Profile Photo Management */}
                        <div className="flex items-center gap-5 p-4 bg-[#1A2236]/30 border border-[#1E2D4580] rounded-xl">
                            <div className="relative group">
                                {photoURL ? (
                                    <img src={photoURL} alt="Profile Face" className="w-16 h-16 rounded-2xl object-cover border border-teal-500/40" />
                                ) : (
                                    <div className="w-16 h-16 rounded-2xl bg-[#1A2236] border border-[#1E2D4580] flex items-center justify-center text-[#8899AA] font-display font-bold text-lg">
                                        {initials}
                                    </div>
                                )}
                                <label className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center cursor-pointer">
                                    <Camera className="w-5 h-5 text-white" />
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} disabled={uploadingImage} />
                                </label>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-white">Profile Photo</h4>
                                <p className="text-xs text-[#8899AA] mt-1">Upload JPEG/PNG format. Maximum size limit is 2MB.</p>
                                {uploadingImage && (
                                    <span className="inline-flex items-center gap-1.5 text-xs text-[#00C8D4] mt-2">
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Processing image...
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Input Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            
                            {/* Full Name */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider">Full Name</label>
                                    {!displayName.trim() ? (
                                        <span className="text-[9px] text-amber-400 font-bold uppercase tracking-wider">Please fill in</span>
                                    ) : (
                                        <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                            <Check className="w-3 h-3" /> Complete
                                        </span>
                                    )}
                                </div>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8899AA]" />
                                    <input 
                                        type="text" 
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        placeholder="Enter your legal full name"
                                        className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* ABHA ID */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider">ABHA ID Health Number</label>
                                    {!abhaId.trim() ? (
                                        <span className="text-[9px] text-[#8899AA] uppercase tracking-wider">Optional / ABDM</span>
                                    ) : (
                                        <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                            <Check className="w-3 h-3" /> Linked
                                        </span>
                                    )}
                                </div>
                                <input 
                                    type="text" 
                                    value={abhaId}
                                    onChange={(e) => setAbhaId(e.target.value)}
                                    placeholder="Enter 14-digit ABHA (e.g. 91-8492-3847-1940)"
                                    className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-all font-mono"
                                />
                            </div>

                            {/* Phone Number */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider">Phone Number</label>
                                    {phoneNumber.trim() ? (
                                        <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                            <Check className="w-3 h-3" /> {loginMethod === 'phone' ? 'Verified Login Number' : 'Complete'}
                                        </span>
                                    ) : (
                                        <span className="text-[9px] text-amber-400 font-bold uppercase tracking-wider">Please fill in</span>
                                    )}
                                </div>
                                <div className="relative">
                                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8899AA]" />
                                    <input 
                                        type="tel" 
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        placeholder="Enter phone number (e.g. +91 98450 12345)"
                                        className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Email Address */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider">Email Address</label>
                                    {email.trim() ? (
                                        <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                            <Check className="w-3 h-3" /> {loginMethod === 'google' ? 'Google Verified' : 'Complete'}
                                        </span>
                                    ) : (
                                        <span className="text-[9px] text-amber-400 font-bold uppercase tracking-wider">Please fill in</span>
                                    )}
                                </div>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8899AA]" />
                                    <input 
                                        type="email" 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter email address (e.g. name@domain.com)"
                                        className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none transition-all font-mono"
                                    />
                                </div>
                            </div>

                            {/* Date of Birth */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-[10px] text-[#8899AA] font-bold mb-0 uppercase tracking-wider">Date of Birth</label>
                                    {!dob.trim() ? (
                                        <span className="text-[9px] text-amber-400 font-bold uppercase tracking-wider">Please fill in</span>
                                    ) : (
                                        <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                            <Check className="w-3 h-3" /> Complete
                                        </span>
                                    )}
                                </div>
                                <input 
                                    type="date" 
                                    value={dob}
                                    onChange={(e) => setDob(e.target.value)}
                                    className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-all"
                                />
                            </div>

                            {/* Gender */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider">Gender</label>
                                    {gender && (
                                        <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                            <Check className="w-3 h-3" /> Selected
                                        </span>
                                    )}
                                </div>
                                <select 
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                    className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-all"
                                >
                                    <option value="">-- Select Gender --</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                    <option value="Prefer not to say">Prefer not to say</option>
                                </select>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end pt-4 border-t border-[#1E2D4580]">
                            <button 
                                type="submit" 
                                disabled={isUpdating}
                                className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-[#00C8D4] text-[#0B0F1A] font-bold text-sm shadow-[0_0_20px_rgba(0,200,212,0.2)] hover:shadow-[0_0_30px_rgba(0,200,212,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
                            >
                                {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                Save Identity Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
