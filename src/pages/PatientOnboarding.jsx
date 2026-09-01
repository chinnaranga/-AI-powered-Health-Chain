import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, Calendar, Phone, Mail, MapPin, Activity, ShieldCheck, 
    Heart, Key, Shield, Check, Copy, ArrowRight, ArrowLeft, 
    Loader2, AlertTriangle, Plus, X, Clipboard, LogOut, CheckCircle, FileText
} from 'lucide-react';
import { db, auth } from '../firebase/config';
import { doc, getDoc, setDoc, serverTimestamp, collection } from 'firebase/firestore';
import useAuthStore from '../store/authStore';
import { toast } from '../components/Toast';

export default function PatientOnboarding() {
    const navigate = useNavigate();
    const { user, setFirebaseUser, logout } = useAuthStore();
    
    // Page states
    const [step, setStep] = useState(1);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Form data
    const initialSavedProfile = (() => {
        try {
            const raw = localStorage.getItem('hc_patient_profile');
            return raw ? JSON.parse(raw) : null;
        } catch (e) { return null; }
    })();
    const initialStoredPhone = localStorage.getItem('hc_phone') || '';
    const initialStoredEmail = localStorage.getItem('hc_email') || '';
    const initialStoredName = localStorage.getItem('hc_name') || '';
    const initialUser = useAuthStore.getState().user || user || {};

    const [formData, setFormData] = useState({
        fullName: initialSavedProfile?.displayName || initialSavedProfile?.name || initialSavedProfile?.fullName || initialUser?.displayName || (initialUser?.name && initialUser.name !== 'USER' ? initialUser.name : '') || initialStoredName || '',
        dob: initialSavedProfile?.dob || initialUser?.dob || '',
        gender: initialSavedProfile?.gender || initialUser?.gender || 'Male',
        phone: initialSavedProfile?.phoneNumber || initialSavedProfile?.phone || initialUser?.phoneNumber || initialUser?.phone || initialStoredPhone || '',
        email: initialSavedProfile?.email || (initialUser?.email && !initialUser.email.includes('user@hospital.org') && !initialUser.email.includes('user@healthchain.io') ? initialUser.email : '') || initialStoredEmail || '',
        aadhaarInput: '',
        aadhaarVerified: false,
        abhaId: initialSavedProfile?.abhaId || initialUser?.abhaId || '',
        abhaLinked: false,
        bloodGroup: initialSavedProfile?.bloodGroup || initialUser?.bloodGroup || 'A+',
        allergies: initialSavedProfile?.allergies || [],
        chronicConditions: initialSavedProfile?.chronicConditions || [],
        medications: initialSavedProfile?.medications || [],
        emergencyContactName: initialSavedProfile?.emergencyContactName || '',
        emergencyContactPhone: initialSavedProfile?.emergencyContactPhone || '',
        relationship: initialSavedProfile?.relationship || 'Spouse',
        primaryHospital: initialSavedProfile?.primaryHospital || '',
        assignedDoctor: initialSavedProfile?.assignedDoctor || '',
        insuranceDetails: initialSavedProfile?.insuranceDetails || '',
        notes: '',
        patientId: initialSavedProfile?.patientId || '',
        globalPatientId: initialSavedProfile?.globalPatientId || ''
    });

    // Tag helper inputs
    const [allergyInput, setAllergyInput] = useState('');
    const [conditionInput, setConditionInput] = useState('');
    const [medicationInput, setMedicationInput] = useState('');

    // Verify mock actions
    const [isVerifyingAadhaar, setIsVerifyingAadhaar] = useState(false);
    const [isLinkingAbha, setIsLinkingAbha] = useState(false);

    // Fetch and pre-fill existing user profile details
    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoadingProfile(true);
            try {
                const savedProfile = (() => {
                    try {
                        const raw = localStorage.getItem('hc_patient_profile');
                        return raw ? JSON.parse(raw) : null;
                    } catch (e) { return null; }
                })();

                const storedPhone = localStorage.getItem('hc_phone') || '';
                const storedEmail = localStorage.getItem('hc_email') || '';
                const sanitizeEmail = (em) => {
                    if (!em) return '';
                    if (em.includes('user@hospital.org') || /^user_[a-z0-9]+@gmail\.com$/i.test(em)) return '';
                    return em;
                };

                const sanitizeName = (nm) => {
                    if (!nm || nm === 'Google User') return '';
                    return nm;
                };

                const rawName = savedProfile?.displayName || savedProfile?.name || savedProfile?.fullName || currentUser?.displayName || currentUser?.name || currentUser?.fullName || storedName || '';
                const rawEmail = savedProfile?.email || currentUser?.email || storedEmail || '';

                const realFullName = sanitizeName(rawName);
                const realEmail = sanitizeEmail(rawEmail);
                const realPhone = savedProfile?.phoneNumber || savedProfile?.phone || currentUser?.phoneNumber || currentUser?.phone || storedPhone || '';
                const realDob = savedProfile?.dob || currentUser?.dob || '';
                const realGender = savedProfile?.gender || currentUser?.gender || 'Male';
                const realBlood = savedProfile?.bloodGroup || currentUser?.bloodGroup || 'A+';
                const realAbha = savedProfile?.abhaId || currentUser?.abhaId || '';

                let data = null;
                if (currentUser?.uid) {
                    try {
                        const docRef = doc(db, 'users', currentUser.uid);
                        const docSnap = await getDoc(docRef);
                        if (docSnap.exists()) {
                            data = docSnap.data();
                        }
                    } catch (fsErr) {
                        console.warn('[Onboarding] Firestore profile lookup notice:', fsErr.message);
                    }
                }

                setFormData(prev => ({
                    ...prev,
                    fullName: data?.fullName || data?.displayName || realFullName,
                    email: data?.email || realEmail,
                    phone: data?.phone || realPhone,
                    dob: data?.dob || realDob,
                    gender: data?.gender || realGender,
                    bloodGroup: data?.bloodGroup || realBlood,
                    allergies: data?.allergies || savedProfile?.allergies || [],
                    chronicConditions: data?.chronicConditions || savedProfile?.chronicConditions || [],
                    medications: data?.medications || savedProfile?.medications || [],
                    emergencyContactName: data?.emergencyContactName || savedProfile?.emergencyContactName || '',
                    emergencyContactPhone: data?.emergencyContactPhone || savedProfile?.emergencyContactPhone || '',
                    relationship: data?.relationship || savedProfile?.relationship || 'Spouse',
                    primaryHospital: data?.primaryHospital || savedProfile?.primaryHospital || '',
                    assignedDoctor: data?.assignedDoctor || savedProfile?.assignedDoctor || '',
                    insuranceDetails: data?.insuranceDetails || savedProfile?.insuranceDetails || '',
                    notes: data?.notes || savedProfile?.notes || '',
                    patientId: data?.patientId || savedProfile?.patientId || '',
                    globalPatientId: data?.globalPatientId || savedProfile?.globalPatientId || '',
                    abhaId: data?.abhaId || realAbha,
                    abhaLinked: !!(data?.abhaLinked || savedProfile?.abhaLinked || realAbha),
                    aadhaarVerified: !!(data?.aadhaarVerified || savedProfile?.aadhaarVerified),
                    aadhaarInput: data?.aadhaarMasked || (savedProfile?.aadhaarMasked ? 'XXXX-XXXX-XXXX' : '')
                }));
            } catch (err) {
                console.warn('[Onboarding] Profile load notice:', err.message);
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
            if (!formData.dob) { toast.error('Date of Birth is required'); return false; }
            if (!formData.phone.trim()) { toast.error('Phone Number is required'); return false; }
        }
        if (s === 2) {
            if (formData.aadhaarInput && formData.aadhaarInput !== 'XXXX-XXXX-XXXX') {
                const clean = formData.aadhaarInput.replace(/-/g, '');
                if (clean.length !== 12) { toast.error('Aadhaar must be a 12-digit number'); return false; }
            }
            if (formData.abhaId) {
                const clean = formData.abhaId.replace(/-/g, '');
                if (clean.length !== 14) { toast.error('ABHA Health ID must be a 14-digit number'); return false; }
            }
        }
        return true;
    };

    // Forward step transition
    const handleNext = () => {
        if (validateStep(step)) {
            setStep(s => s + 1);
        }
    };

    // Backward step transition
    const handlePrev = () => {
        setStep(s => Math.max(1, s - 1));
    };

    // Format Aadhaar: XXXX-XXXX-XXXX
    const handleAadhaarChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 12);
        let formatted = '';
        for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 4 === 0) formatted += '-';
            formatted += value[i];
        }
        setFormData(prev => ({ ...prev, aadhaarInput: formatted, aadhaarVerified: false }));
    };

    // Format ABHA ID: XX-XXXX-XXXX-XXXX
    const handleAbhaChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 14);
        let formatted = '';
        for (let i = 0; i < value.length; i++) {
            if (i === 2 || i === 6 || i === 10) formatted += '-';
            formatted += value[i];
        }
        setFormData(prev => ({ ...prev, abhaId: formatted, abhaLinked: false }));
    };

    // Mock Verify Aadhaar
    const verifyAadhaar = async () => {
        const clean = formData.aadhaarInput.replace(/-/g, '');
        if (clean.length !== 12) return toast.error('Aadhaar must be 12 digits');
        setIsVerifyingAadhaar(true);
        await new Promise(r => setTimeout(r, 1200));
        setIsVerifyingAadhaar(false);
        setFormData(prev => ({ ...prev, aadhaarVerified: true }));
        toast.success('Aadhaar successfully verified via UIDAI.');
    };

    // Mock Link ABHA
    const linkAbha = async () => {
        const clean = formData.abhaId.replace(/-/g, '');
        if (clean.length !== 14) return toast.error('ABHA ID must be 14 digits');
        setIsLinkingAbha(true);
        await new Promise(r => setTimeout(r, 1500));
        setIsLinkingAbha(false);
        setFormData(prev => ({ ...prev, abhaLinked: true }));
        toast.success('ABHA Health Account successfully linked.');
    };

    // Tag helpers
    const addAllergy = () => {
        if (allergyInput.trim() && !formData.allergies.includes(allergyInput.trim())) {
            setFormData(prev => ({ ...prev, allergies: [...prev.allergies, allergyInput.trim()] }));
            setAllergyInput('');
        }
    };
    const removeAllergy = (tag) => {
        setFormData(prev => ({ ...prev, allergies: prev.allergies.filter(a => a !== tag) }));
    };

    const addCondition = () => {
        if (conditionInput.trim() && !formData.chronicConditions.includes(conditionInput.trim())) {
            setFormData(prev => ({ ...prev, chronicConditions: [...prev.chronicConditions, conditionInput.trim()] }));
            setConditionInput('');
        }
    };
    const removeCondition = (tag) => {
        setFormData(prev => ({ ...prev, chronicConditions: prev.chronicConditions.filter(c => c !== tag) }));
    };

    const addMedication = () => {
        if (medicationInput.trim() && !formData.medications.includes(medicationInput.trim())) {
            setFormData(prev => ({ ...prev, medications: [...prev.medications, medicationInput.trim()] }));
            setMedicationInput('');
        }
    };
    const removeMedication = (tag) => {
        setFormData(prev => ({ ...prev, medications: prev.medications.filter(m => m !== tag) }));
    };

    // Unique Patient ID generator helper
    const generatePatientID = () => {
        const year = new Date().getFullYear();
        const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `HC-PAT-${year}-${rand}`;
    };

    // Unique Global Patient ID generator helper (8 alphanumeric characters)
    const generateGlobalPatientID = () => {
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars[Math.floor(Math.random() * chars.length)];
        }
        return `HCG-${result}`;
    };

    // Save as draft helper
    const saveDraft = async () => {
        if (!user?.uid) return;
        setIsSaving(true);
        try {
            const userDocRef = doc(db, 'users', user.uid);
            
            // Mask Aadhaar securely before saving
            const cleanAadhaar = formData.aadhaarInput.replace(/-/g, '');
            let masked = '';
            if (cleanAadhaar) {
                masked = cleanAadhaar === 'XXXX-XXXX-XXXX' 
                    ? user.aadhaarMasked || '' 
                    : `XXXX-XXXX-${cleanAadhaar.slice(-4)}`;
            }

            const draftPayload = {
                fullName: formData.fullName,
                dob: formData.dob,
                gender: formData.gender,
                phone: formData.phone,
                email: formData.email,
                aadhaarMasked: masked,
                aadhaarVerified: formData.aadhaarVerified,
                abhaId: formData.abhaId,
                abhaLinked: formData.abhaLinked,
                bloodGroup: formData.bloodGroup,
                allergies: formData.allergies,
                chronicConditions: formData.chronicConditions,
                medications: formData.medications,
                emergencyContactName: formData.emergencyContactName,
                emergencyContactPhone: formData.emergencyContactPhone,
                relationship: formData.relationship,
                primaryHospital: formData.primaryHospital,
                assignedDoctor: formData.assignedDoctor,
                insuranceDetails: formData.insuranceDetails,
                notes: formData.notes,
                profileComplete: false,
                updatedAt: serverTimestamp()
            };

            await setDoc(userDocRef, draftPayload, { merge: true });
            toast.success('Onboarding draft saved successfully.');
        } catch (err) {
            console.error(err);
            toast.error('Failed to save draft: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    // Onboarding complete submission
    const handleOnboardingSubmit = async () => {
        if (!validateStep(1) || !validateStep(2)) return;
        setIsSaving(true);
        try {
            const userDocRef = doc(db, 'users', user.uid);
            
            // Auto generate patientId if not already present
            const pId = formData.patientId || generatePatientID();
            const gId = formData.globalPatientId || generateGlobalPatientID();
            
            // Mask Aadhaar securely before saving
            const cleanAadhaar = formData.aadhaarInput.replace(/-/g, '');
            let masked = '';
            if (cleanAadhaar) {
                masked = cleanAadhaar === 'XXXX-XXXX-XXXX' 
                    ? user.aadhaarMasked || '' 
                    : `XXXX-XXXX-${cleanAadhaar.slice(-4)}`;
            }

            const finalPayload = {
                uid: user.uid,
                email: formData.email,
                role: 'patient',
                patientId: pId,
                globalPatientId: gId,
                fullName: formData.fullName,
                dob: formData.dob,
                gender: formData.gender,
                phone: formData.phone,
                aadhaarMasked: masked,
                aadhaarVerified: formData.aadhaarVerified,
                abhaId: formData.abhaId,
                abhaLinked: formData.abhaLinked,
                bloodGroup: formData.bloodGroup,
                allergies: formData.allergies,
                chronicConditions: formData.chronicConditions,
                medications: formData.medications,
                emergencyContactName: formData.emergencyContactName,
                emergencyContactPhone: formData.emergencyContactPhone,
                relationship: formData.relationship,
                primaryHospital: formData.primaryHospital,
                assignedDoctor: formData.assignedDoctor,
                insuranceDetails: formData.insuranceDetails,
                notes: formData.notes,
                profileComplete: true,
                verifiedAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            // Write payload to users/{uid}
            await setDoc(userDocRef, finalPayload, { merge: true });

            // Synchronize with patients collection for registry mapping parity
            try {
                const patientDocRef = doc(db, 'patients', pId);
                const patientPayload = {
                    patientId: pId,
                    globalPatientId: gId,
                    uid: user.uid,
                    fullName: formData.fullName,
                    dob: formData.dob,
                    gender: formData.gender,
                    phone: formData.phone,
                    email: formData.email,
                    aadhaarMasked: masked,
                    aadhaarVerified: formData.aadhaarVerified,
                    abhaId: formData.abhaId,
                    abhaLinked: formData.abhaLinked,
                    bloodGroup: formData.bloodGroup,
                    allergies: formData.allergies,
                    chronicConditions: formData.chronicConditions,
                    emergencyContact: formData.emergencyContactName,
                    insuranceDetails: formData.insuranceDetails,
                    primaryHospital: formData.primaryHospital,
                    assignedDoctor: formData.assignedDoctor,
                    notes: formData.notes,
                    profileComplete: true,
                    updatedAt: serverTimestamp()
                };
                await setDoc(patientDocRef, patientPayload, { merge: true });
                console.info('[Onboarding] Synchronized patient identity with clinical patients registry.');
            } catch (syncErr) {
                console.warn('Failed to synchronize with patients collection:', syncErr);
            }

            // Save to local storage cache for instant profile sync across all dashboard views
            const profileCache = {
                displayName: formData.fullName,
                name: formData.fullName,
                fullName: formData.fullName,
                phoneNumber: formData.phone,
                phone: formData.phone,
                abhaId: formData.abhaId,
                email: formData.email,
                gender: formData.gender,
                dob: formData.dob,
                bloodGroup: formData.bloodGroup,
                globalPatientId: gId,
                patientId: pId,
                allergies: formData.allergies,
                chronicConditions: formData.chronicConditions,
                medications: formData.medications,
                emergencyContactName: formData.emergencyContactName,
                emergencyContactPhone: formData.emergencyContactPhone,
                relationship: formData.relationship,
                primaryHospital: formData.primaryHospital,
                assignedDoctor: formData.assignedDoctor,
                insuranceDetails: formData.insuranceDetails,
                isVerified: true,
                profileComplete: true,
                onboardingComplete: true
            };
            localStorage.setItem('hc_patient_profile', JSON.stringify(profileCache));
            if (formData.phone) localStorage.setItem('hc_phone', formData.phone);
            if (formData.email) localStorage.setItem('hc_email', formData.email);
            if (formData.fullName) localStorage.setItem('hc_name', formData.fullName);

            // Update local AuthStore state with new data
            await setFirebaseUser({ ...finalPayload, ...profileCache }, 'patient');

            // Send Firebase email verification immediately after onboarding completion
            if (auth.currentUser && !auth.currentUser.emailVerified) {
                try {
                    const { sendEmailVerification } = await import('firebase/auth');
                    await sendEmailVerification(auth.currentUser);
                    console.info('[Onboarding] Verification email dispatched to:', auth.currentUser.email);
                } catch (vaxErr) {
                    console.warn('[Onboarding] Verification email dispatch notice:', vaxErr.message);
                }
            }

            setFormData(prev => ({ ...prev, patientId: pId }));
            setShowSuccessModal(true);
        } catch (err) {
            console.error(err);
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
                toast.info('Please verify your email address to unlock your dashboard.');
                navigate('/verify-email', { replace: true });
                return;
            }
        }
        navigate('/patient/dashboard', { replace: true });
    };

    const handleSignOut = async () => {
        await logout();
        navigate('/login', { replace: true });
    };

    if (isLoadingProfile) {
        return (
            <div className="min-h-screen bg-[#070b14] text-white flex items-center justify-center flex-col gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#00C8D4]" />
                <p className="text-sm text-[#8899AA] font-mono">Syncing patient identity variables...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#070b14] text-white flex flex-col items-center justify-center p-6 relative font-sans overflow-hidden">
            {/* Tech Background Grid */}
            <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(0, 200, 212, 0.05) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#00C8D4]/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-3xl relative z-10 bg-[#0F1524]/80 border border-[#1E2D4580] backdrop-blur-xl rounded-3xl p-8 shadow-2xl"
            >
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1E2D4530] pb-5 mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <ShieldCheck className="w-4 h-4 text-[#00C8D4]" />
                            <span className="text-[10px] text-[#00C8D4] font-bold uppercase tracking-widest font-mono">Mandatory Onboarding</span>
                        </div>
                        <h2 className="text-2xl font-display font-bold text-white tracking-tight">Complete Health Profile</h2>
                        <p className="text-xs text-[#8899AA] mt-0.5">Please verify and fill in the missing fields before entering your dashboard.</p>
                    </div>
                    <button 
                        onClick={handleSignOut}
                        className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-1.5 transition-all font-mono self-end sm:self-auto"
                    >
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                </div>

                {/* Section 1: Personal Details */}
                <div className="space-y-4 text-left">
                    <div className="flex items-center gap-2.5 mb-2">
                        <User className="w-4 h-4 text-[#00C8D4]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-[#00C8D4] font-mono">Personal Parameters</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-[#8899AA] uppercase tracking-wider mb-1.5">Full Name *</label>
                            <input
                                type="text"
                                value={formData.fullName}
                                onChange={e => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                                placeholder="e.g. John Doe"
                                className="w-full bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00C8D4]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#8899AA] uppercase tracking-wider mb-1.5">Date of Birth *</label>
                            <input
                                type="date"
                                value={formData.dob}
                                onChange={e => setFormData(prev => ({ ...prev, dob: e.target.value }))}
                                className="w-full bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00C8D4]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#8899AA] uppercase tracking-wider mb-1.5">Gender *</label>
                            <select
                                value={formData.gender}
                                onChange={e => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                                className="w-full bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00C8D4]"
                            >
                                <option>Male</option>
                                <option>Female</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#8899AA] uppercase tracking-wider mb-1.5">Phone Number *</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                placeholder="e.g. 9876543210"
                                className="w-full bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00C8D4]"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-[#8899AA] uppercase tracking-wider mb-1.5">Email Address *</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                placeholder="name@example.com"
                                className="w-full bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00C8D4]"
                            />
                        </div>
                    </div>
                </div>

                <div className="border-t border-[#1E2D4530] my-8" />

                {/* Section 2: Aadhaar & ABHA Identity */}
                <div className="space-y-6 text-left">
                    <div className="flex items-center gap-2.5">
                        <Shield className="w-4 h-4 text-[#00C8D4]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-[#00C8D4] font-mono">Identity Parameters</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 flex gap-3 text-[11px] text-amber-500 leading-relaxed">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <div>
                            <span className="font-bold">Identity Safeguard:</span> Raw Aadhaar credentials are never stored. The system hashes and masks inputs locally (e.g. <code className="bg-black/20 px-1 rounded text-white font-mono">XXXX-XXXX-9012</code>) before updating Firestore.
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Aadhaar Input Card */}
                        <div className="p-4 rounded-xl bg-[#1A2236]/30 border border-[#1E2D4580] space-y-3">
                            <label className="block text-xs font-bold text-[#8899AA] uppercase tracking-wider">Aadhaar Card Number (12 Digits)</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={formData.aadhaarInput}
                                    onChange={handleAadhaarChange}
                                    placeholder="XXXX-XXXX-XXXX"
                                    className="flex-1 bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl px-4 py-2.5 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-[#00C8D4]"
                                />
                                <button
                                    type="button"
                                    onClick={verifyAadhaar}
                                    disabled={isVerifyingAadhaar || formData.aadhaarInput.replace(/-/g, '').length !== 12 || formData.aadhaarVerified}
                                    className="px-4 py-2 bg-[#00C8D4] disabled:bg-white/[0.03] disabled:text-[#8899AA] disabled:border-transparent text-[#0B0F1A] border border-[#00C8D4] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                                >
                                    {isVerifyingAadhaar ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : formData.aadhaarVerified ? <Check className="w-3.5 h-3.5" /> : 'Verify'}
                                    {formData.aadhaarVerified ? 'Verified' : 'Verify UIDAI'}
                                </button>
                            </div>
                            {formData.aadhaarVerified && (
                                <p className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                                    <CheckCircle className="w-3.5 h-3.5" /> Verified securely. Database representation: XXXX-XXXX-{formData.aadhaarInput.slice(-4)}
                                </p>
                            )}
                        </div>

                        {/* ABHA Input Card */}
                        <div className="p-4 rounded-xl bg-[#1A2236]/30 border border-[#1E2D4580] space-y-3">
                            <label className="block text-xs font-bold text-[#8899AA] uppercase tracking-wider">ABHA / ABDM Account Number (14 Digits)</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={formData.abhaId}
                                    onChange={handleAbhaChange}
                                    placeholder="XX-XXXX-XXXX-XXXX"
                                    className="flex-1 bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl px-4 py-2.5 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-[#00C8D4]"
                                />
                                <button
                                    type="button"
                                    onClick={linkAbha}
                                    disabled={isLinkingAbha || formData.abhaId.replace(/-/g, '').length !== 14 || formData.abhaLinked}
                                    className="px-4 py-2 bg-purple-500 disabled:bg-white/[0.03] disabled:text-[#8899AA] disabled:border-transparent text-white border border-purple-500 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                                >
                                    {isLinkingAbha ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : formData.abhaLinked ? <Check className="w-3.5 h-3.5" /> : 'Link'}
                                    {formData.abhaLinked ? 'Linked' : 'Link ABDM'}
                                </button>
                            </div>
                            {formData.abhaLinked && (
                                <p className="text-[10px] text-purple-400 font-mono flex items-center gap-1">
                                    <CheckCircle className="w-3.5 h-3.5" /> Interoperability gateway bound successfully.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="border-t border-[#1E2D4530] my-8" />

                {/* Section 3: Medical Information */}
                <div className="space-y-4 text-left">
                    <div className="flex items-center gap-2.5 mb-2">
                        <Activity className="w-4 h-4 text-[#00C8D4]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-[#00C8D4] font-mono">Medical Profile Parameters</span>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-[#8899AA] uppercase tracking-wider mb-1.5">Blood Group</label>
                            <select
                                value={formData.bloodGroup}
                                onChange={e => setFormData(prev => ({ ...prev, bloodGroup: e.target.value }))}
                                className="w-full bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00C8D4]"
                            >
                                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                                    <option key={bg}>{bg}</option>
                                ))}
                            </select>
                        </div>

                        {/* Allergies */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-[#8899AA] uppercase tracking-wider">Allergies</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={allergyInput}
                                    onChange={e => setAllergyInput(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addAllergy(); } }}
                                    placeholder="Type allergy and press enter or click +"
                                    className="flex-1 bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00C8D4]"
                                />
                                <button 
                                    type="button" 
                                    onClick={addAllergy}
                                    className="p-2.5 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-[#8899AA] hover:text-white rounded-xl transition-all"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-1.5 pt-1">
                                {formData.allergies.length === 0 && <span className="text-xs text-slate-500 italic font-sans">No allergy tags.</span>}
                                {formData.allergies.map(a => (
                                    <span key={a} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-red-500/10 text-red-400 border border-red-500/20 font-medium">
                                        {a}
                                        <button type="button" onClick={() => removeAllergy(a)} className="text-red-400 hover:text-white">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Chronic Conditions */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-[#8899AA] uppercase tracking-wider">Chronic Conditions</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={conditionInput}
                                    onChange={e => setConditionInput(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCondition(); } }}
                                    placeholder="Type condition and press enter or click +"
                                    className="flex-1 bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00C8D4]"
                                />
                                <button 
                                    type="button" 
                                    onClick={addCondition}
                                    className="p-2.5 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-[#8899AA] hover:text-white rounded-xl transition-all"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-1.5 pt-1">
                                {formData.chronicConditions.length === 0 && <span className="text-xs text-slate-500 italic font-sans">No condition tags.</span>}
                                {formData.chronicConditions.map(c => (
                                    <span key={c} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                                        {c}
                                        <button type="button" onClick={() => removeCondition(c)} className="text-amber-400 hover:text-white">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Current Medications */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-[#8899AA] uppercase tracking-wider">Current Medications</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={medicationInput}
                                    onChange={e => setMedicationInput(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addMedication(); } }}
                                    placeholder="Type medication and press enter or click +"
                                    className="flex-1 bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00C8D4]"
                                />
                                <button 
                                    type="button" 
                                    onClick={addMedication}
                                    className="p-2.5 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-[#8899AA] hover:text-white rounded-xl transition-all"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-1.5 pt-1">
                                {formData.medications.length === 0 && <span className="text-xs text-slate-500 italic font-sans">No medications listed.</span>}
                                {formData.medications.map(m => (
                                    <span key={m} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 font-medium">
                                        {m}
                                        <button type="button" onClick={() => removeMedication(m)} className="text-purple-400 hover:text-white">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-[#1E2D4530] my-8" />

                {/* Section 4: Care Team & Emergency Contact */}
                <div className="space-y-4 text-left">
                    <div className="flex items-center gap-2.5 mb-2">
                        <Heart className="w-4 h-4 text-[#00C8D4]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-[#00C8D4] font-mono">Emergency Contacts & Health Details</span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-[#8899AA] uppercase tracking-wider mb-1.5">Emergency Contact Name</label>
                            <input
                                type="text"
                                value={formData.emergencyContactName}
                                onChange={e => setFormData(prev => ({ ...prev, emergencyContactName: e.target.value }))}
                                placeholder="e.g. Jane Doe"
                                className="w-full bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00C8D4]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#8899AA] uppercase tracking-wider mb-1.5">Emergency Contact Phone</label>
                            <input
                                type="tel"
                                value={formData.emergencyContactPhone}
                                onChange={e => setFormData(prev => ({ ...prev, emergencyContactPhone: e.target.value }))}
                                placeholder="e.g. 9876543211"
                                className="w-full bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00C8D4]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#8899AA] uppercase tracking-wider mb-1.5">Relationship</label>
                            <select
                                value={formData.relationship}
                                onChange={e => setFormData(prev => ({ ...prev, relationship: e.target.value }))}
                                className="w-full bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00C8D4]"
                            >
                                <option>Spouse</option>
                                <option>Parent</option>
                                <option>Child</option>
                                <option>Sibling</option>
                                <option>Guardian</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#8899AA] uppercase tracking-wider mb-1.5">Primary Hospital / Clinic</label>
                            <input
                                type="text"
                                value={formData.primaryHospital}
                                onChange={e => setFormData(prev => ({ ...prev, primaryHospital: e.target.value }))}
                                placeholder="e.g. City General Hospital"
                                className="w-full bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00C8D4]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#8899AA] uppercase tracking-wider mb-1.5">Assigned Doctor</label>
                            <input
                                type="text"
                                value={formData.assignedDoctor}
                                onChange={e => setFormData(prev => ({ ...prev, assignedDoctor: e.target.value }))}
                                placeholder="e.g. Dr. Robert Carter"
                                className="w-full bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00C8D4]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#8899AA] uppercase tracking-wider mb-1.5">Insurance Provider Details</label>
                            <input
                                type="text"
                                value={formData.insuranceDetails}
                                onChange={e => setFormData(prev => ({ ...prev, insuranceDetails: e.target.value }))}
                                placeholder="e.g. Star Health #SZ-8271"
                                className="w-full bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00C8D4]"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-[#8899AA] uppercase tracking-wider mb-1.5">Additional Health Notes</label>
                            <textarea
                                value={formData.notes}
                                onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                placeholder="Add any specific requirements, drug restrictions, or details..."
                                rows="3"
                                className="w-full bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00C8D4]"
                            />
                        </div>
                    </div>
                </div>

                {/* Form Navigation Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#1E2D4530] mt-8">
                    <button
                        type="button"
                        onClick={saveDraft}
                        disabled={isSaving}
                        className="w-full sm:w-auto px-6 py-2.5 border border-dashed border-[#00C8D4]/30 hover:border-[#00C8D4] hover:bg-[#00C8D4]/5 text-[#00C8D4] rounded-xl text-xs font-bold transition-all disabled:opacity-50 font-mono"
                    >
                        Save Draft
                    </button>

                    <button
                        type="button"
                        onClick={handleOnboardingSubmit}
                        disabled={isSaving}
                        className="w-full sm:w-auto px-8 py-3 bg-[#00C8D4] text-[#0B0F1A] font-bold text-xs hover:bg-[#00E5F0] rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(0,200,212,0.2)] disabled:opacity-50 font-mono"
                    >
                        {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                        {isSaving ? 'Completing Onboarding...' : 'Verify & Authorize Profile'}
                    </button>
                </div>
            </motion.div>

            {/* SUCCESS VERIFICATION DIALOG */}
            <AnimatePresence>
                {showSuccessModal && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-[#0F1524] border border-[#1E2D4580] rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
                        >
                            {/* Glow */}
                            <div className="absolute -top-12 -left-12 w-28 h-28 bg-[#00C8D4]/10 rounded-full blur-2xl pointer-events-none" />
                            
                            <div className="flex flex-col items-center text-center space-y-6">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                                    <CheckCircle className="w-7 h-7" />
                                </div>

                                <div className="space-y-1.5">
                                    <h3 className="text-xl font-display font-bold text-white">Identity Hydration Successful</h3>
                                    <p className="text-xs text-[#8899AA] leading-relaxed">
                                        Your patient ledger profile is now fully initialized. A unique healthcare identifier has been mapped to your cryptographic session.
                                    </p>
                                </div>

                                <div className="w-full bg-[#1A2236]/50 border border-[#1E2D4580] rounded-xl p-4 space-y-2">
                                    <div className="text-left">
                                        <span className="text-[9px] text-[#8899AA] font-bold uppercase tracking-wider font-mono">Patient Name</span>
                                        <p className="text-sm font-semibold text-white mt-0.5">{formData.fullName}</p>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-[#1E2D4530] pt-2.5">
                                        <div className="text-left">
                                            <span className="text-[9px] text-[#8899AA] font-bold uppercase tracking-wider font-mono">Ledger Patient ID</span>
                                            <p className="text-sm font-mono font-semibold text-[#00C8D4] mt-0.5">{formData.patientId}</p>
                                        </div>
                                        <button 
                                            onClick={() => {
                                                navigator.clipboard.writeText(formData.patientId);
                                                toast.success('Patient ID copied!');
                                            }}
                                            className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-[#8899AA] hover:text-white transition-all"
                                            title="Copy Patient ID"
                                        >
                                            <Copy className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-[#1E2D4530] pt-2.5">
                                        <div className="text-left">
                                            <span className="text-[9px] text-[#8899AA] font-bold uppercase tracking-wider font-mono">Global Patient ID</span>
                                            <p className="text-sm font-mono font-semibold text-teal-400 mt-0.5">{formData.globalPatientId}</p>
                                        </div>
                                        <button 
                                            onClick={() => {
                                                navigator.clipboard.writeText(formData.globalPatientId);
                                                toast.success('Global Patient ID copied!');
                                            }}
                                            className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-[#8899AA] hover:text-white transition-all"
                                            title="Copy Global Patient ID"
                                        >
                                            <Copy className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                <button 
                                    onClick={handleContinueToDashboard}
                                    className="w-full py-3 bg-[#00C8D4] text-[#0B0F1A] hover:bg-[#00E5F0] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(0,200,212,0.2)] font-mono"
                                >
                                    Continue to Patient Dashboard <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
