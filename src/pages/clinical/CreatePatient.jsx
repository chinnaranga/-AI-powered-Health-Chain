import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
    User, Calendar, Phone, Mail, MapPin, Activity, ShieldCheck, 
    AlertTriangle, Heart, UserPlus, Clipboard, CheckCircle, RefreshCw, 
    Search, Plus, X, ArrowLeft, Printer, QrCode, Shield, Check, Copy, ArrowRight, Globe
} from 'lucide-react';
import { db, auth } from '../../firebase/config';
import { collection, doc, setDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { toast } from '../../components/Toast';

export default function CreatePatient() {
    const navigate = useNavigate();
    
    // Flow / Tab states
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [step, setStep] = useState(1);
    const [showForm, setShowForm] = useState(false);
    
    // Form States
    const [formData, setFormData] = useState({
        fullName: '',
        dob: '',
        gender: 'Male',
        phone: '',
        email: '',
        address: '',
        aadhaarInput: '', // Secure input container
        aadhaarVerified: false,
        abhaId: '',
        abhaLinked: false,
        bloodGroup: 'A+',
        allergies: [],
        chronicConditions: [],
        emergencyContact: '',
        insuranceDetails: '',
        primaryHospital: '',
        assignedDoctor: '',
        notes: ''
    });

    // Tag helper inputs
    const [allergyInput, setAllergyInput] = useState('');
    const [conditionInput, setConditionInput] = useState('');

    // Verification Mocking states
    const [isVerifyingAadhaar, setIsVerifyingAadhaar] = useState(false);
    const [isLinkingAbha, setIsLinkingAbha] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Success State
    const [createdPatient, setCreatedPatient] = useState(null);

    // Initial check directory lookup
    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!searchQuery.trim()) {
            toast.warning('Please enter a name, phone, or identity ID to search.');
            return;
        }
        setIsSearching(true);
        setHasSearched(true);
        try {
            const patientsRef = collection(db, 'patients');
            const querySnap = await getDocs(patientsRef);
            
            const results = [];
            const term = searchQuery.toLowerCase().trim();
            
            querySnap.forEach(docSnap => {
                const data = docSnap.data();
                const matchName = (data.fullName || '').toLowerCase().includes(term);
                const matchPhone = (data.phone || '').includes(term);
                const matchAbha = (data.abhaId || '').toLowerCase().includes(term);
                const matchAadhaar = (data.aadhaarMasked || '').includes(term);
                const matchId = docSnap.id.toLowerCase().includes(term);
                const matchGlobalId = (data.globalPatientId || '').toLowerCase().includes(term);

                if (matchName || matchPhone || matchAbha || matchAadhaar || matchId || matchGlobalId) {
                    results.push({ id: docSnap.id, ...data, source: 'patients' });
                }
            });

            // Also search users collection where role === 'patient'
            const usersRef = collection(db, 'users');
            const usersSnap = await getDocs(query(usersRef, where('role', '==', 'patient')));
            
            usersSnap.forEach(docSnap => {
                const data = docSnap.data();
                const matchName = (data.fullName || data.displayName || '').toLowerCase().includes(term);
                const matchPhone = (data.phone || '').includes(term);
                const matchAbha = (data.abhaId || '').toLowerCase().includes(term);
                const matchAadhaar = (data.aadhaarMasked || '').includes(term);
                const matchId = docSnap.id.toLowerCase().includes(term);

                if (matchName || matchPhone || matchAbha || matchAadhaar || matchId) {
                    // Avoid duplicate entries if they are in both tables
                    if (!results.some(r => r.patientId === data.patientId || r.id === docSnap.id)) {
                        results.push({ id: docSnap.id, ...data, source: 'users' });
                    }
                }
            });
            
            setSearchResults(results);
        } catch (err) {
            console.error(err);
            toast.error('Error searching patient registry: ' + err.message);
        } finally {
            setIsSearching(false);
        }
    };

    // Auto format Aadhaar: XXXX-XXXX-XXXX
    const handleAadhaarChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 12);
        let formatted = '';
        for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 4 === 0) formatted += '-';
            formatted += value[i];
        }
        setFormData(prev => ({ ...prev, aadhaarInput: formatted, aadhaarVerified: false }));
    };

    // Auto format ABHA ID: XX-XXXX-XXXX-XXXX
    const handleAbhaChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 14);
        let formatted = '';
        for (let i = 0; i < value.length; i++) {
            if (i === 2 || i === 6 || i === 10) formatted += '-';
            formatted += value[i];
        }
        setFormData(prev => ({ ...prev, abhaId: formatted, abhaLinked: false }));
    };

    // Mock Aadhaar Verification
    const verifyAadhaar = async () => {
        const clean = formData.aadhaarInput.replace(/-/g, '');
        if (clean.length !== 12) {
            toast.error('Aadhaar must be a 12-digit number');
            return;
        }
        setIsVerifyingAadhaar(true);
        await new Promise(r => setTimeout(r, 1200));
        setIsVerifyingAadhaar(false);
        setFormData(prev => ({ ...prev, aadhaarVerified: true }));
        toast.success('Aadhaar number verified securely via UIDAI gateway.');
    };

    // Mock ABHA Linkage
    const linkAbha = async () => {
        const clean = formData.abhaId.replace(/-/g, '');
        if (clean.length !== 14) {
            toast.error('ABHA ID must be a 14-digit number');
            return;
        }
        setIsLinkingAbha(true);
        await new Promise(r => setTimeout(r, 1500));
        setIsLinkingAbha(false);
        setFormData(prev => ({ ...prev, abhaLinked: true }));
        toast.success('Ayushman Bharat Health Account successfully linked.');
    };

    // Add tags helpers
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

    // Generate unique readable patient ID
    const generateUID = () => {
        const year = new Date().getFullYear();
        const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `HC-PAT-${year}-${rand}`;
    };

    // Generate Global Patient ID — 8-character alphanumeric prefixed HCG-
    const generateGlobalPatientID = () => {
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars[Math.floor(Math.random() * chars.length)];
        }
        return `HCG-${result}`;
    };

    // Save Patient flow
    const handleSubmit = async () => {
        // Validate required fields
        if (!formData.fullName.trim()) return toast.error('Full Name is required');
        if (!formData.dob) return toast.error('Date of Birth is required');
        if (!formData.phone.trim()) return toast.error('Phone Number is required');
        if (!formData.email.trim()) return toast.error('Email is required');

        setIsSubmitting(true);
        try {
            const pId = generateUID();
            const globalId = generateGlobalPatientID();
            const patientsRef = collection(db, 'patients');

            // Duplicate Checks
            const cleanAadhaar = formData.aadhaarInput.replace(/-/g, '');
            const masked = cleanAadhaar ? `XXXX-XXXX-${cleanAadhaar.slice(-4)}` : '';
            
            const qSnap = await getDocs(patientsRef);
            let duplicateMsg = null;
            
            qSnap.forEach(docSnap => {
                const data = docSnap.data();
                if (masked && data.aadhaarMasked === masked) {
                    duplicateMsg = 'A patient with this Aadhaar number already exists in the system.';
                }
                if (formData.abhaId && data.abhaId === formData.abhaId) {
                    duplicateMsg = 'A patient with this ABHA Health ID is already registered.';
                }
                if (data.fullName === formData.fullName.trim() && data.phone === formData.phone.trim()) {
                    duplicateMsg = 'A patient with this name and phone number is already registered.';
                }
            });

            if (!duplicateMsg) {
                // Check users collection as well
                const usersRef = collection(db, 'users');
                const usersSnap = await getDocs(query(usersRef, where('role', '==', 'patient')));
                usersSnap.forEach(docSnap => {
                    const data = docSnap.data();
                    if (masked && data.aadhaarMasked === masked) {
                        duplicateMsg = 'A patient with this Aadhaar number is already registered in the system (active user).';
                    }
                    if (formData.abhaId && data.abhaId === formData.abhaId) {
                        duplicateMsg = 'A patient with this ABHA Health ID is already registered in the system (active user).';
                    }
                    if ((data.fullName || data.displayName) === formData.fullName.trim() && data.phone === formData.phone.trim()) {
                        duplicateMsg = 'A patient with this name and phone number is already registered in the system (active user).';
                    }
                });
            }

            if (duplicateMsg) {
                toast.error(duplicateMsg);
                setIsSubmitting(false);
                return;
            }

            // Prepare patient record object
            const newPatient = {
                patientId: pId,
                globalPatientId: globalId,
                fullName: formData.fullName.trim(),
                dob: formData.dob,
                gender: formData.gender,
                phone: formData.phone.trim(),
                email: formData.email.trim(),
                address: formData.address.trim(),
                aadhaarMasked: masked,
                aadhaarVerified: formData.aadhaarVerified,
                abhaId: formData.abhaId,
                abhaLinked: formData.abhaLinked,
                bloodGroup: formData.bloodGroup,
                allergies: formData.allergies,
                chronicConditions: formData.chronicConditions,
                emergencyContact: formData.emergencyContact.trim(),
                insuranceDetails: formData.insuranceDetails.trim(),
                primaryHospital: formData.primaryHospital.trim(),
                assignedDoctor: formData.assignedDoctor.trim(),
                notes: formData.notes.trim(),
                createdBy: auth.currentUser?.uid || 'clinical-staff',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            // Write to patients collection in firestore
            await setDoc(doc(db, 'patients', pId), newPatient);

            // Write audit log entry
            const auditLogsRef = collection(db, 'auditLogs');
            await setDoc(doc(auditLogsRef), {
                userId: auth.currentUser?.uid || 'clinical-staff',
                activityType: 'PATIENT_REGISTERED',
                actorName: auth.currentUser?.displayName || 'Clinical Staff',
                timestamp: serverTimestamp(),
                details: {
                    patientId: pId,
                    patientName: newPatient.fullName,
                    abhaLinked: newPatient.abhaLinked,
                    aadhaarVerified: newPatient.aadhaarVerified
                }
            });

            // Trigger backend SMS Dispatch
            try {
                const smsRes = await fetch('/api/send-sms', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        phone: newPatient.phone,
                        patientName: newPatient.fullName,
                        patientId: newPatient.patientId,
                        globalPatientId: newPatient.globalPatientId
                    })
                });
                if (smsRes.ok) {
                    toast.success('Account creation SMS sent to patient.');
                } else {
                    console.warn('SMS dispatch returned error status');
                }
            } catch (smsErr) {
                console.error('Failed to trigger SMS confirmation:', smsErr);
            }

            toast.success('Patient profile successfully generated on-chain.');
            setCreatedPatient(newPatient);
        } catch (err) {
            console.error(err);
            toast.error('Failed to register patient: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            fullName: '',
            dob: '',
            gender: 'Male',
            phone: '',
            email: '',
            address: '',
            aadhaarInput: '',
            aadhaarVerified: false,
            abhaId: '',
            abhaLinked: false,
            bloodGroup: 'A+',
            allergies: [],
            chronicConditions: [],
            emergencyContact: '',
            insuranceDetails: '',
            primaryHospital: '',
            assignedDoctor: '',
            notes: ''
        });
        setCreatedPatient(null);
        setStep(1);
        setShowForm(false);
        setHasSearched(false);
        setSearchQuery('');
        setSearchResults([]);
    };

    // Initials helper
    const getInitials = (name) => {
        if (!name) return 'PT';
        return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    };

    return (
        <div className="max-w-4xl mx-auto pb-16 space-y-6 text-left">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#1E2D4580] pb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <UserPlus className="w-4 h-4 text-[#00C8D4]" />
                        <span className="text-[10px] text-[#00C8D4] font-bold uppercase tracking-widest font-mono">Patient Registration</span>
                    </div>
                    <h2 className="text-3xl font-display font-bold text-white tracking-tight">Clinical Registration Node</h2>
                    <p className="text-sm text-[#8899AA] mt-1 font-sans">
                        Verify identity parameters, link ABDM credentials, and register patients securely on the ledger.
                    </p>
                </div>
                {showForm && (
                    <button 
                        onClick={resetForm}
                        className="px-4 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] text-[#8899AA] hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all font-mono"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to Search
                    </button>
                )}
            </div>

            <AnimatePresence mode="wait">
                {/* SUCCESS VIEW */}
                {createdPatient ? (
                    <motion.div 
                        key="success" 
                        initial={{ opacity: 0, scale: 0.95 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        exit={{ opacity: 0 }}
                        className="bg-gradient-to-br from-[#111827] to-[#0B0F1A] border border-[#1E2D4580] rounded-3xl p-8 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
                        
                        <div className="flex flex-col items-center text-center max-w-lg mx-auto space-y-6">
                            <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                            
                            <div>
                                <h3 className="text-2xl font-display font-bold text-white">Patient Record Confirmed</h3>
                                <p className="text-sm text-[#8899AA] mt-1">Profile committed successfully with verified identity credentials.</p>
                            </div>

                            {/* Patient ID Display Card */}
                            <div className="w-full bg-[#1A2236]/70 border border-[#1E2D4580] rounded-2xl p-6 space-y-4">
                                <div className="flex items-center justify-between pb-3 border-b border-[#1E2D4530]">
                                    <div className="text-left">
                                        <p className="text-[10px] text-[#8899AA] font-bold uppercase tracking-wider font-mono">Patient Name</p>
                                        <p className="text-base font-bold text-white mt-0.5">{createdPatient.fullName}</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-[#00C8D4]/10 border border-[#00C8D4]/20 flex items-center justify-center text-[#00C8D4] text-xs font-bold font-mono">
                                        {getInitials(createdPatient.fullName)}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="text-left">
                                        <p className="text-[10px] text-[#8899AA] font-bold uppercase tracking-wider font-mono">Generated Patient UID</p>
                                        <p className="text-lg font-mono font-bold text-[#00C8D4] mt-0.5">{createdPatient.patientId}</p>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            navigator.clipboard.writeText(createdPatient.patientId);
                                            toast.success('Patient ID copied!');
                                        }}
                                        className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-[#8899AA] hover:text-white transition-all"
                                        title="Copy Patient ID"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>

                                {createdPatient.globalPatientId && (
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-teal-500/5 to-[#00C8D4]/5 border border-teal-500/20">
                                        <div className="text-left">
                                            <p className="text-[10px] text-teal-400 font-bold uppercase tracking-wider font-mono flex items-center gap-1">
                                                <Globe className="w-2.5 h-2.5" /> Global Health ID
                                            </p>
                                            <p className="text-base font-mono font-bold text-teal-300 mt-0.5">{createdPatient.globalPatientId}</p>
                                            <p className="text-[9px] text-[#8899AA] mt-0.5">Universal identifier — valid across all facilities</p>
                                        </div>
                                        <button 
                                            onClick={() => {
                                                navigator.clipboard.writeText(createdPatient.globalPatientId);
                                                toast.success('Global Patient ID copied!');
                                            }}
                                            className="p-2.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 text-teal-400 hover:text-teal-300 transition-all"
                                            title="Copy Global Patient ID"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#1E2D4530] text-xs">
                                    <div className="flex items-center gap-2 p-2 rounded-xl bg-[#0B0F1A] border border-[#1E2D4580]">
                                        <ShieldCheck className={`w-4 h-4 ${createdPatient.aadhaarVerified ? 'text-emerald-400' : 'text-[#8899AA]'}`} />
                                        <div className="text-left">
                                            <p className="text-[9px] text-[#8899AA] font-bold uppercase font-mono">Aadhaar</p>
                                            <p className="font-semibold text-white font-mono">{createdPatient.aadhaarVerified ? 'Verified ✓' : 'Unverified'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 p-2 rounded-xl bg-[#0B0F1A] border border-[#1E2D4580]">
                                        <Heart className={`w-4 h-4 ${createdPatient.abhaLinked ? 'text-purple-400' : 'text-[#8899AA]'}`} />
                                        <div className="text-left">
                                            <p className="text-[9px] text-[#8899AA] font-bold uppercase font-mono">ABHA Health ID</p>
                                            <p className="font-semibold text-white font-mono">{createdPatient.abhaLinked ? 'Linked ✓' : 'Not Linked'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Printable Patient Card Modal / Preview */}
                            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                                <button 
                                    onClick={() => window.print()}
                                    className="px-5 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-[#8899AA] hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all font-mono"
                                >
                                    <Printer className="w-4 h-4" /> Print Patient Card
                                </button>
                                <button 
                                    onClick={resetForm}
                                    className="px-5 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-white hover:text-[#00C8D4] font-semibold text-xs flex items-center justify-center gap-2 transition-all font-mono"
                                >
                                    Register Another Patient
                                </button>
                                <button 
                                    onClick={() => navigate('/dashboard/clinical/records')}
                                    className="px-5 py-2.5 rounded-xl bg-[#00C8D4] text-[#0B0F1A] hover:bg-[#00E5F0] font-bold text-xs flex items-center justify-center gap-2 transition-all font-mono shadow-[0_0_15px_rgba(0,200,212,0.25)]"
                                >
                                    Open Registry Records <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* Hidden print layout component */}
                        <div className="hidden print:block fixed inset-0 bg-white text-black p-8 font-sans z-50">
                            <div className="border-2 border-black rounded-2xl p-6 max-w-sm mx-auto space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold">HealthChain Card</h2>
                                    <span className="text-xs font-mono border border-black px-1.5 py-0.5 rounded">PATIENT</span>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold">{createdPatient.fullName}</p>
                                    <p className="text-xs">DOB: {createdPatient.dob} ({createdPatient.gender})</p>
                                    <p className="text-xs">Phone: {createdPatient.phone}</p>
                                    <p className="text-xs font-mono font-bold mt-2">ID: {createdPatient.patientId}</p>
                                    {createdPatient.abhaId && <p className="text-xs font-mono">ABHA: {createdPatient.abhaId}</p>}
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-dashed border-gray-400">
                                    <span className="text-[10px] text-gray-500 font-mono">Ledger Node: clinical-staff</span>
                                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${createdPatient.patientId}`} alt="QR Code" className="w-12 h-12" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : !showForm ? (
                    /* SEARCH DUPLICATE CHECK VIEW */
                    <motion.div 
                        key="search" 
                        initial={{ opacity: 0, y: 12 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0 }}
                        className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-6 space-y-6"
                    >
                        <div className="max-w-lg space-y-2">
                            <h3 className="text-lg font-display font-bold text-white">Search Directory</h3>
                            <p className="text-xs text-[#8899AA] leading-relaxed">
                                Verify if the patient is already registered. Enter their name, phone, Aadhaar or ABHA ID to search the database records.
                            </p>
                        </div>

                        <form onSubmit={handleSearch} className="flex gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Search by Name, Phone, Aadhaar (XXXX-XXXX-1234), or ABHA ID..."
                                    className="w-full bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00C8D4]"
                                />
                            </div>
                            <button 
                                type="submit"
                                disabled={isSearching}
                                className="px-5 py-2.5 rounded-xl bg-[#00C8D4] text-[#0B0F1A] font-bold text-xs flex items-center gap-1.5 hover:bg-[#00E5F0] transition-all disabled:opacity-50"
                            >
                                {isSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                                Search Registry
                            </button>
                        </form>

                        {/* Search Results / Next Actions */}
                        {hasSearched && (
                            <div className="border-t border-[#1E2D4530] pt-6 space-y-4">
                                <h4 className="text-xs font-bold text-[#8899AA] uppercase tracking-wider font-mono">
                                    Search Results ({searchResults.length})
                                </h4>
                                
                                {searchResults.length === 0 ? (
                                    <div className="p-6 rounded-xl bg-[#00C8D4]/5 border border-[#00C8D4]/15 flex items-center justify-between gap-4">
                                        <div className="flex gap-3 items-start">
                                            <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-semibold text-white">No Duplicates Detected</p>
                                                <p className="text-xs text-[#8899AA] mt-0.5">No existing patients match your query. You can safely proceed to create a new profile.</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setShowForm(true)}
                                            className="px-4 py-2 bg-[#00C8D4] hover:bg-[#00E5F0] text-[#0B0F1A] rounded-xl text-xs font-bold flex items-center gap-1 transition-all flex-shrink-0"
                                        >
                                            <UserPlus className="w-3.5 h-3.5" /> Register Patient
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {searchResults.map(p => {
                                            const displayName = p.fullName || p.displayName || p.name || 'Unknown Patient';
                                            return (
                                                <div key={p.id} className="p-4 rounded-xl bg-[#1A2236]/30 border border-[#1E2D4580] flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-xs font-bold text-white">
                                                            {getInitials(displayName)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-white">{displayName}</p>
                                                            <p className="text-xs text-[#8899AA] font-mono mt-0.5">
                                                                ID: {p.patientId || p.uid || p.id} &middot; DOB: {p.dob || 'Not Provided'} &middot; Phone: {p.phone || 'Not Provided'}
                                                                {p.source === 'users' ? ' (Active User Account)' : ''}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-mono">
                                                        DUPLICATE DETECTED
                                                    </span>
                                                </div>
                                            );
                                        })}
                                        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 flex items-center gap-2 text-xs text-red-400 mt-2">
                                            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                            <span>Duplicate matches found. Please double-check details before proceeding. If you still need to register, click below.</span>
                                        </div>
                                        <div className="flex justify-end pt-2">
                                            <button 
                                                onClick={() => setShowForm(true)}
                                                className="px-4 py-2 border border-[#1E2D4580] hover:bg-white/[0.02] text-[#8899AA] hover:text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
                                            >
                                                Bypass and Register Anyway
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                ) : (
                    /* MULTI-STEP REGISTRATION FORM */
                    <motion.div 
                        key="form" 
                        initial={{ opacity: 0, y: 12 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0 }}
                        className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-6"
                    >
                        {/* Step Indicators */}
                        <div className="flex items-center justify-between pb-6 border-b border-[#1E2D4530] mb-6 overflow-x-auto gap-2">
                            {[
                                { s: 1, l: 'Personal details' },
                                { s: 2, l: 'Aadhaar & ABHA' },
                                { s: 3, l: 'Medical info' },
                                { s: 4, l: 'Emergency & Insurance' },
                                { s: 5, l: 'Assigned doctor' },
                                { s: 6, l: 'Review details' }
                            ].map(item => (
                                <div key={item.s} className="flex items-center gap-2 flex-shrink-0">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold border transition-all ${
                                        step === item.s 
                                            ? 'bg-[#00C8D4] text-[#0B0F1A] border-[#00C8D4]' 
                                            : step > item.s 
                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                                            : 'bg-transparent text-slate-500 border-[#1E2D4580]'
                                    }`}>
                                        {step > item.s ? '✓' : item.s}
                                    </div>
                                    <span className={`text-[10px] uppercase font-bold tracking-wider font-mono ${step === item.s ? 'text-white' : 'text-slate-500'}`}>
                                        {item.l}
                                    </span>
                                    {item.s < 6 && <div className="h-px w-6 bg-[#1E2D4530]" />}
                                </div>
                            ))}
                        </div>

                        {/* STEP 1: Personal Details */}
                        {step === 1 && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <User className="w-5 h-5 text-[#00C8D4]" />
                                    <h4 className="text-base font-display font-bold text-white">Basic Information</h4>
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
                                            placeholder="e.g. name@example.com"
                                            className="w-full bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00C8D4]"
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-[#8899AA] uppercase tracking-wider mb-1.5">Residential Address</label>
                                        <textarea
                                            value={formData.address}
                                            onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                            placeholder="e.g. 123 Healthcare Ave, Block C"
                                            rows="3"
                                            className="w-full bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00C8D4]"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: Aadhaar & ABHA Identity */}
                        {step === 2 && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <Shield className="w-5 h-5 text-[#00C8D4]" />
                                    <h4 className="text-base font-display font-bold text-white">Aadhaar & ABHA Identity</h4>
                                </div>

                                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 flex gap-3 text-xs text-amber-500 leading-relaxed">
                                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <span className="font-bold">Cryptographic Isolation Warning:</span> Clinical registry nodes restrict raw identity storage. For compliance, Aadhaar numbers are masked automatically inside the database (e.g. <code className="bg-black/20 px-1 rounded text-white">XXXX-XXXX-1234</code>) and verified cryptographically.
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {/* Aadhaar Input */}
                                    <div className="p-4 rounded-xl bg-[#1A2236]/30 border border-[#1E2D4580] space-y-3">
                                        <label className="block text-xs font-bold text-[#8899AA] uppercase tracking-wider">Aadhaar Number (12 Digits)</label>
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
                                                {isVerifyingAadhaar ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : formData.aadhaarVerified ? <Check className="w-3.5 h-3.5" /> : 'Verify'}
                                                {formData.aadhaarVerified ? 'Verified' : 'Verify UIDAI'}
                                            </button>
                                        </div>
                                        {formData.aadhaarVerified && (
                                            <p className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                                                <CheckCircle className="w-3.5 h-3.5" /> Verified securely. Database representation: XXXX-XXXX-{formData.aadhaarInput.slice(-4)}
                                            </p>
                                        )}
                                    </div>

                                    {/* ABHA Input */}
                                    <div className="p-4 rounded-xl bg-[#1A2236]/30 border border-[#1E2D4580] space-y-3">
                                        <label className="block text-xs font-bold text-[#8899AA] uppercase tracking-wider">ABHA ID / Health Account Number (14 Digits)</label>
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
                                                {isLinkingAbha ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : formData.abhaLinked ? <Check className="w-3.5 h-3.5" /> : 'Link'}
                                                {formData.abhaLinked ? 'Linked' : 'Link ABDM'}
                                            </button>
                                        </div>
                                        {formData.abhaLinked && (
                                            <p className="text-[10px] text-purple-400 font-mono flex items-center gap-1">
                                                <CheckCircle className="w-3.5 h-3.5" /> ABHA Health Locker registry linked successfully.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: Medical Information */}
                        {step === 3 && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <Activity className="w-5 h-5 text-[#00C8D4]" />
                                    <h4 className="text-base font-display font-bold text-white">Medical Specifications</h4>
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

                                    {/* Allergies tag builder */}
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
                                            {formData.allergies.length === 0 && <span className="text-xs text-slate-500 italic">No allergies added yet.</span>}
                                            {formData.allergies.map(a => (
                                                <span key={a} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-red-500/10 text-red-400 border border-red-500/20 font-medium">
                                                    {a}
                                                    <button type="button" onClick={() => removeAllergy(a)} className="text-red-400 hover:text-white">
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Chronic Conditions tag builder */}
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
                                            {formData.chronicConditions.length === 0 && <span className="text-xs text-slate-500 italic">No chronic conditions added yet.</span>}
                                            {formData.chronicConditions.map(c => (
                                                <span key={c} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                                                    {c}
                                                    <button type="button" onClick={() => removeCondition(c)} className="text-amber-400 hover:text-white">
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 4: Emergency & Insurance */}
                        {step === 4 && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <Heart className="w-5 h-5 text-[#00C8D4]" />
                                    <h4 className="text-base font-display font-bold text-white">Emergency Contacts & Insurance</h4>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-[#8899AA] uppercase tracking-wider mb-1.5">Emergency Contact (Name & Phone)</label>
                                        <input
                                            type="text"
                                            value={formData.emergencyContact}
                                            onChange={e => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                                            placeholder="e.g. Jane Doe (Wife) - 9876543211"
                                            className="w-full bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00C8D4]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-[#8899AA] uppercase tracking-wider mb-1.5">Insurance Provider & Policy details</label>
                                        <textarea
                                            value={formData.insuranceDetails}
                                            onChange={e => setFormData(prev => ({ ...prev, insuranceDetails: e.target.value }))}
                                            placeholder="e.g. Star Health Insurance Policy #SZ-82718-92"
                                            rows="3"
                                            className="w-full bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00C8D4]"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 5: Care Team */}
                        {step === 5 && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <UserPlus className="w-5 h-5 text-[#00C8D4]" />
                                    <h4 className="text-base font-display font-bold text-white">Assigned Care Team</h4>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-[#8899AA] uppercase tracking-wider mb-1.5">Initial Clinical Notes</label>
                                        <textarea
                                            value={formData.notes}
                                            onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                            placeholder="Initial clinical observations or details..."
                                            rows="4"
                                            className="w-full bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00C8D4]"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 6: Review & Submit */}
                        {step === 6 && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <Clipboard className="w-5 h-5 text-[#00C8D4]" />
                                    <h4 className="text-base font-display font-bold text-white">Review Profile Details</h4>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#1A2236]/30 border border-[#1E2D4580] rounded-2xl p-6">
                                    <div className="space-y-3">
                                        <h5 className="text-xs font-bold text-[#00C8D4] uppercase tracking-wider font-mono">Personal Details</h5>
                                        <div className="space-y-1.5 text-xs">
                                            <p className="text-slate-400">Full Name: <span className="text-white font-semibold">{formData.fullName || '—'}</span></p>
                                            <p className="text-slate-400">Date of Birth: <span className="text-white font-semibold">{formData.dob || '—'}</span></p>
                                            <p className="text-slate-400">Gender: <span className="text-white font-semibold">{formData.gender}</span></p>
                                            <p className="text-slate-400">Phone: <span className="text-white font-semibold font-mono">{formData.phone || '—'}</span></p>
                                            <p className="text-slate-400">Email: <span className="text-white font-semibold">{formData.email || '—'}</span></p>
                                            <p className="text-slate-400">Address: <span className="text-white font-semibold">{formData.address || '—'}</span></p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <h5 className="text-xs font-bold text-[#00C8D4] uppercase tracking-wider font-mono">Identity Parameters</h5>
                                        <div className="space-y-1.5 text-xs">
                                            <p className="text-slate-400">
                                                Aadhaar Representation: <span className="text-white font-semibold font-mono">
                                                    {formData.aadhaarInput ? `XXXX-XXXX-${formData.aadhaarInput.slice(-4)}` : 'Not Provided'}
                                                </span>
                                            </p>
                                            <p className="text-slate-400">
                                                Aadhaar Verified: <span className={`font-semibold ${formData.aadhaarVerified ? 'text-emerald-400' : 'text-amber-500'}`}>
                                                    {formData.aadhaarVerified ? 'Yes ✓' : 'No (Pending verification)'}
                                                </span>
                                            </p>
                                            <p className="text-slate-400">
                                                ABHA Health ID: <span className="text-white font-semibold font-mono">{formData.abhaId || 'Not Linked'}</span>
                                            </p>
                                            <p className="text-slate-400">
                                                ABHA Status: <span className={`font-semibold ${formData.abhaLinked ? 'text-purple-400' : 'text-slate-500'}`}>
                                                    {formData.abhaLinked ? 'Linked ✓' : 'Unlinked'}
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 border-t border-[#1E2D4530] pt-4 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5 text-xs">
                                            <h5 className="text-xs font-bold text-[#00C8D4] uppercase tracking-wider font-mono">Clinical Details</h5>
                                            <p className="text-slate-400">Blood Group: <span className="text-white font-semibold">{formData.bloodGroup}</span></p>
                                            <p className="text-slate-400">Allergies: <span className="text-white font-semibold">{formData.allergies.join(', ') || 'None'}</span></p>
                                            <p className="text-slate-400">Chronic Conditions: <span className="text-white font-semibold">{formData.chronicConditions.join(', ') || 'None'}</span></p>
                                        </div>
                                        <div className="space-y-1.5 text-xs">
                                            <h5 className="text-xs font-bold text-[#00C8D4] uppercase tracking-wider font-mono">Care Team Details</h5>
                                            <p className="text-slate-400">Primary Hospital: <span className="text-white font-semibold">{formData.primaryHospital || '—'}</span></p>
                                            <p className="text-slate-400">Assigned Doctor: <span className="text-white font-semibold">{formData.assignedDoctor || '—'}</span></p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Form CTA Actions */}
                        <div className="flex justify-between items-center pt-6 border-t border-[#1E2D4530] mt-6">
                            <button
                                type="button"
                                onClick={() => {
                                    if (step === 1) {
                                        resetForm();
                                    } else {
                                        setStep(s => s - 1);
                                    }
                                }}
                                className="px-4 py-2 border border-[#1E2D4580] text-[#8899AA] hover:text-white rounded-xl text-xs font-bold transition-all"
                            >
                                {step === 1 ? 'Cancel Registration' : '← Previous Section'}
                            </button>
                            
                            <button
                                type="button"
                                onClick={() => {
                                    if (step === 6) {
                                        handleSubmit();
                                    } else {
                                        setStep(s => s + 1);
                                    }
                                }}
                                disabled={isSubmitting}
                                className="px-5 py-2.5 bg-[#00C8D4] hover:bg-[#00E5F0] text-[#0B0F1A] rounded-xl text-xs font-bold flex items-center gap-1 transition-all disabled:opacity-50"
                            >
                                {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                                {step === 6 ? (isSubmitting ? 'Registering...' : 'Confirm & Write to Ledger') : 'Continue →'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
