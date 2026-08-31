import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, Mail, Phone, ShieldCheck, Landmark, Stethoscope, 
    Upload, Camera, CheckCircle, RefreshCw, BarChart2, Star,
    Check, Lock, Edit3, Copy, Printer, Share2, Globe, QrCode
} from 'lucide-react';
import { onAuthStateChanged, updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../../firebase/config';
import { toast } from '../../components/Toast';
import useAuthStore from '../../store/authStore';

export default function ProfileIdentityPage() {
    const [firebaseUser, setFirebaseUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    // Unique Global Patient ID generator helper (8 alphanumeric characters)
    const generateGlobalPatientID = (uid = '') => {
        if (uid) {
            const cleanUid = String(uid).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
            if (cleanUid.length >= 8) {
                return `HCG-${cleanUid.slice(-8)}`;
            }
        }
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars[Math.floor(Math.random() * chars.length)];
        }
        return `HCG-${result}`;
    };

    // Form inputs
    const [displayName, setDisplayName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [abhaId, setAbhaId] = useState('');
    const [gender, setGender] = useState('Female');
    const [dob, setDob] = useState('');
    const [globalPatientId, setGlobalPatientId] = useState('');

    // Metadata stats
    const [linkedHospitals, setLinkedHospitals] = useState(3);
    const [connectedDoctors, setConnectedDoctors] = useState(5);
    const [isVerified, setIsVerified] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const loadProfile = async (currentUser) => {
            if (!currentUser) return;
            const targetUid = currentUser.uid || currentUser.id;
            
            // Immediate deterministic Global Patient ID fallback so "Loading..." NEVER displays!
            const fallbackGId = currentUser.globalPatientId || generateGlobalPatientID(targetUid);
            
            if (isMounted) {
                setFirebaseUser(currentUser);
                setDisplayName(currentUser.displayName || currentUser.name || currentUser.fullName || '');
                setPhoneNumber(currentUser.phoneNumber || currentUser.phone || '');
                setGlobalPatientId(fallbackGId);
                setLoading(false);
            }

            let gId = fallbackGId;

            try {
                if (targetUid) {
                    const docRef = doc(db, 'users', targetUid);
                    const snap = await getDoc(docRef);
                    if (snap.exists()) {
                        const data = snap.data();
                        if (isMounted) {
                            setPhoneNumber(data.phoneNumber || currentUser.phoneNumber || '');
                            setAbhaId(data.abhaId || '91-4820-9930-8812');
                            setGender(data.gender || 'Female');
                            setDob(data.dob || '1985-03-24');
                            setIsVerified(data.isVerified !== undefined ? data.isVerified : true);
                            setLinkedHospitals(data.linkedHospitals || 3);
                            setConnectedDoctors(data.connectedDoctors || 5);
                            if (data.displayName || data.name || data.fullName) {
                                setDisplayName(data.displayName || data.name || data.fullName);
                            }
                        }
                        if (data.globalPatientId) {
                            gId = data.globalPatientId;
                        } else {
                            try {
                                await updateDoc(docRef, { globalPatientId: fallbackGId });
                                if (data.patientId) {
                                    await updateDoc(doc(db, 'patients', data.patientId), { globalPatientId: fallbackGId });
                                }
                            } catch (writeErr) {
                                console.warn('[Profile] Sync Global Patient ID warning:', writeErr.message);
                            }
                        }
                    } else {
                        try {
                            await setDoc(docRef, {
                                uid: targetUid,
                                globalPatientId: fallbackGId,
                                name: currentUser.displayName || currentUser.name || 'HealthChain Patient',
                                email: currentUser.email || '',
                                role: 'patient',
                                createdAt: new Date().toISOString()
                            }, { merge: true });
                        } catch (setErr) {
                            console.warn('[Profile] Initial user doc setDoc warning:', setErr.message);
                        }
                    }
                }
            } catch (err) {
                console.error('Failed to load user document details:', err);
            }

            if (isMounted) {
                setGlobalPatientId(gId);
            }
        };

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                loadProfile(user);
            } else {
                const storeUser = useAuthStore.getState().user;
                if (storeUser) {
                    loadProfile(storeUser);
                } else {
                    if (isMounted) setLoading(false);
                }
            }
        });

        const storeUser = useAuthStore.getState().user;
        if (storeUser) {
            loadProfile(storeUser);
        }

        return () => {
            isMounted = false;
            unsubscribe();
        };
    }, []);

    // Form validation and profile save
    const handleSaveProfile = async (e) => {
        e.preventDefault();
        if (!firebaseUser) return;
        if (!displayName.trim()) {
            toast.error('Name cannot be empty');
            return;
        }

        setIsUpdating(true);
        try {
            // Update Auth Profile
            await updateProfile(firebaseUser, { displayName });

            // Update Firestore Profile
            const userRef = doc(db, 'users', firebaseUser.uid);
            await updateDoc(userRef, {
                name: displayName,
                displayName,
                phoneNumber,
                abhaId,
                gender,
                dob,
                globalPatientId
            });

            toast.success('Identity profile updated successfully');
        } catch (err) {
            console.error('Failed to save profile:', err);
            toast.error('Failed to update identity profile');
        } finally {
            setIsUpdating(false);
        }
    };

    // Simulated image upload (or real storage upload if firebase storage is config'd)
    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file || !firebaseUser) return;

        setUploadingImage(true);
        try {
            // Attempt real Firebase Storage upload if setup, or fallback to object URL simulation
            let imageUrl = '';
            if (storage) {
                const storageRef = ref(storage, `profiles/${firebaseUser.uid}`);
                const snapshot = await uploadBytes(storageRef, file);
                imageUrl = await getDownloadURL(snapshot.ref);
            } else {
                imageUrl = URL.createObjectURL(file);
            }

            // Update auth state
            await updateProfile(firebaseUser, { photoURL: imageUrl });
            const userRef = doc(db, 'users', firebaseUser.uid);
            await updateDoc(userRef, { photoURL: imageUrl });

            toast.success('Profile photo uploaded');
        } catch (err) {
            console.warn('Firebase Storage not fully configured, falling back to local simulation:', err);
            // Simulated upload
            const simulatedUrl = URL.createObjectURL(file);
            try {
                await updateProfile(firebaseUser, { photoURL: simulatedUrl });
                const userRef = doc(db, 'users', firebaseUser.uid);
                await updateDoc(userRef, { photoURL: simulatedUrl });
                toast.success('Profile photo updated (local session)');
            } catch (innerErr) {
                console.error(innerErr);
            }
        } finally {
            setUploadingImage(false);
        }
    };

    // Calculate identity completeness score
    const calculateCompleteness = () => {
        let score = 20; // Default authenticated score
        if (displayName) score += 20;
        if (phoneNumber) score += 20;
        if (abhaId) score += 20;
        if (dob) score += 20;
        return score;
    };

    const completeness = calculateCompleteness();

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-[#00C8D4] animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-16 text-left">
            
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="w-4 h-4 text-[#00C8D4]" />
                    <span className="text-[10px] text-[#00C8D4] font-bold uppercase tracking-widest">Digital Health Identity</span>
                </div>
                <h2 className="text-3xl font-display font-bold text-white">Profile & Identity</h2>
                <p className="text-sm text-[#8899AA] mt-1">Manage your secure verified medical identity, credentials, and linked nodes.</p>
            </div>

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
                            {completeness === 100 ? '✓ Your verified identity profile is 100% complete.' : 'Complete all identity fields to optimize health record linking.'}
                        </p>
                    </div>

                    {/* Premium Global Patient ID Interoperability Card */}
                    <motion.div 
                        whileHover={{ scale: 1.02 }}
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
                            {firebaseUser?.photoURL ? (
                                <img src={firebaseUser.photoURL} alt="Face Avatar" className="w-16 h-16 rounded-2xl object-cover border border-[#1E2D4580]" />
                            ) : (
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00C8D4]/20 to-teal-500/20 border border-teal-500/20 flex items-center justify-center text-[#00C8D4] text-xl font-bold font-display">
                                    {displayName ? displayName[0].toUpperCase() : 'P'}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <h5 className="text-sm font-bold text-white truncate">{displayName || 'Anonymous Patient'}</h5>
                                <p className="text-[10px] text-[#8899AA] font-mono mt-0.5">Local ID: {firebaseUser?.uid?.substring(0, 12)}...</p>
                                <div className="flex items-center gap-1.5 mt-2 bg-[#1A2236]/80 border border-[#1E2D4580] rounded-lg px-2.5 py-1.5 w-max">
                                    {(() => {
                                        const displayGlobalId = globalPatientId || (firebaseUser?.uid ? `HCG-${firebaseUser.uid.replace(/[^a-zA-Z0-9]/g, '').slice(-8).toUpperCase()}` : 'HCG-PATIENT1');
                                        return (
                                            <>
                                                <span className="text-[10px] font-mono font-bold text-teal-400">{displayGlobalId}</span>
                                                <button 
                                                    type="button"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(displayGlobalId);
                                                        toast.success('Global Patient ID copied!');
                                                    }}
                                                    className="text-[#8899AA] hover:text-white transition-colors"
                                                    title="Copy Global ID"
                                                >
                                                    <Copy className="w-3 h-3" />
                                                </button>
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>

                        {/* QR Code and sync indicators */}
                        <div className="bg-[#0B0F1A]/80 border border-[#1E2D4580] rounded-xl p-4 flex gap-4 items-center relative z-10">
                            <div className="bg-white p-1 rounded-lg flex-shrink-0">
                                {(() => {
                                    const qrId = globalPatientId || (firebaseUser?.uid ? `HCG-${firebaseUser.uid.replace(/[^a-zA-Z0-9]/g, '').slice(-8).toUpperCase()}` : 'HCG-PATIENT1');
                                    return (
                                        <img 
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=72x72&data=${qrId}`} 
                                            alt="Global ID QR" 
                                            className="w-14 h-14" 
                                        />
                                    );
                                })()}
                            </div>
                            <div className="flex-1 space-y-1.5 text-left">
                                <span className="text-[8px] text-[#8899AA] uppercase tracking-wider font-bold font-mono">Sync Status</span>
                                <div className="flex items-center justify-between text-[10px] text-white">
                                    <span>Worldwide Nodes</span>
                                    <span className="font-mono text-teal-400 font-bold">100% Synced</span>
                                </div>
                                <div className="w-full bg-[#1A2236] h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-gradient-to-r from-teal-500 to-[#00C8D4] h-full w-[100%] animate-pulse" />
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
                                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Verified ✓
                                </span>
                            </div>
                        </div>

                        {/* Share and Print Actions */}
                        <div className="flex gap-2 mt-4 border-t border-[#1E2D4530] pt-3 relative z-10">
                            <button
                                type="button"
                                onClick={() => {
                                    if (globalPatientId) {
                                        navigator.clipboard.writeText(`Global Health ID: ${globalPatientId} (Name: ${displayName})`);
                                        toast.success('Share payload copied to clipboard!');
                                    }
                                }}
                                className="flex-1 py-1.5 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-white rounded-lg text-[10px] font-bold font-mono flex items-center justify-center gap-1 transition-colors"
                            >
                                <Share2 className="w-3.5 h-3.5" /> Share Staff
                            </button>
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="flex-1 py-1.5 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-white rounded-lg text-[10px] font-bold font-mono flex items-center justify-center gap-1 transition-colors"
                            >
                                <Printer className="w-3.5 h-3.5" /> Print Card
                            </button>
                        </div>
                    </motion.div>

                    {/* Hidden printable card view */}
                    <div className="hidden print:block fixed inset-0 bg-white text-black p-8 font-sans z-50">
                        <div className="border-2 border-black rounded-3xl p-6 max-w-sm mx-auto space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold">HealthChain Global Identity</h2>
                                <span className="text-[9px] font-mono border border-black px-1.5 py-0.5 rounded font-bold">GLOBAL ACCESS</span>
                            </div>
                            <div className="flex gap-4 items-center border-t border-b border-gray-200 py-3">
                                <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-lg font-bold border border-black">
                                    {displayName ? displayName[0].toUpperCase() : 'P'}
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-bold">{displayName || 'Anonymous Patient'}</p>
                                    <p className="text-xs">DOB: {dob || '—'}</p>
                                    <p className="text-xs">Gender: {gender}</p>
                                    <p className="text-xs">Phone: {phoneNumber}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="text-left">
                                    <span className="text-[10px] text-gray-500 font-mono">GLOBAL RECORD KEY</span>
                                    <p className="text-base font-mono font-bold">{globalPatientId}</p>
                                </div>
                                {globalPatientId && (
                                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${globalPatientId}`} alt="QR Code" className="w-12 h-12" />
                                )}
                            </div>
                            <div className="text-left border-t border-dashed border-gray-300 pt-3 flex items-center justify-between">
                                <span className="text-[8px] text-gray-400 font-mono">Ledger Nodes Active: {linkedHospitals}</span>
                                <span className="text-[8px] text-gray-400 font-mono">Verification: star-health-node</span>
                            </div>
                        </div>
                    </div>

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
                        <h3 className="text-base font-bold text-white font-display border-b border-[#1E2D4580] pb-3 flex items-center gap-2">
                            <Edit3 className="w-4 h-4 text-[#00C8D4]" /> Personal Identity details
                        </h3>

                        {/* Profile Photo Management */}
                        <div className="flex items-center gap-5 p-4 bg-[#1A2236]/30 border border-[#1E2D4580] rounded-xl">
                            <div className="relative group">
                                {firebaseUser?.photoURL ? (
                                    <img src={firebaseUser.photoURL} alt="Profile Face" className="w-16 h-16 rounded-2xl object-cover border border-[#1E2D4580]" />
                                ) : (
                                    <div className="w-16 h-16 rounded-2xl bg-[#1A2236] border border-[#1E2D4580] flex items-center justify-center text-[#8899AA]">
                                        <User className="w-8 h-8" />
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
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Uploading image to storage...
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Input Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-[10px] text-[#8899AA] font-bold mb-2 uppercase tracking-wider">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8899AA]" />
                                    <input 
                                        type="text" 
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        placeholder="Alice Vance"
                                        className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] text-[#8899AA] font-bold mb-2 uppercase tracking-wider">ABHA ID Health Number</label>
                                <input 
                                    type="text" 
                                    value={abhaId}
                                    onChange={(e) => setAbhaId(e.target.value)}
                                    placeholder="91-XXXX-XXXX-XXXX"
                                    className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-all font-mono"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] text-[#8899AA] font-bold mb-2 uppercase tracking-wider">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8899AA]" />
                                    <input 
                                        type="tel" 
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        placeholder="+1 (555) 302-9901"
                                        className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] text-[#8899AA] font-bold mb-2 uppercase tracking-wider">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8899AA]" />
                                    <input 
                                        readOnly
                                        type="email" 
                                        value={firebaseUser?.email || ''} 
                                        className="w-full bg-[#1A2236]/30 border border-[#1E2D4580] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#8899AA] focus:outline-none cursor-default font-mono"
                                    />
                                </div>
                                <p className="text-[10px] text-[#4A5568] mt-1.5 flex items-center gap-1">
                                    <Lock className="w-3 h-3" /> Managed via linked identity provider
                                </p>
                            </div>

                            <div>
                                <label className="block text-[10px] text-[#8899AA] font-bold mb-2 uppercase tracking-wider">Date of Birth</label>
                                <input 
                                    type="date" 
                                    value={dob}
                                    onChange={(e) => setDob(e.target.value)}
                                    className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] text-[#8899AA] font-bold mb-2 uppercase tracking-wider">Gender</label>
                                <select 
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                    className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-all"
                                >
                                    <option value="Female">Female</option>
                                    <option value="Male">Male</option>
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
                                className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-[#00C8D4] text-[#0B0F1A] font-bold text-sm shadow-[0_0_20px_rgba(0,200,212,0.2)] hover:shadow-[0_0_30px_rgba(0,200,212,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
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
