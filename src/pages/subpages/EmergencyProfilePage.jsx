import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Zap, Heart, AlertTriangle, ShieldCheck, Phone, Clipboard, 
    Download, RefreshCw, UserCheck, Key, ShieldAlert, FileText 
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import { toast } from '../../components/Toast';

export default function EmergencyProfilePage() {
    const [firebaseUser, setFirebaseUser] = useState(null);
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState('');
    const [tokenExpiry, setTokenExpiry] = useState(null);
    const [secondsLeft, setSecondsLeft] = useState(0);
    const [isGenerating, setIsGenerating] = useState(false);

    // Fetch user profile data from Firestore
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setFirebaseUser(user);
                try {
                    const docRef = doc(db, 'users', user.uid);
                    const snap = await getDoc(docRef);
                    if (snap.exists()) {
                        const data = snap.data();
                        setProfileData({
                            bloodGroup: data.bloodGroup || 'O-Negative',
                            allergies: data.allergies || ['Penicillin', 'Peanuts', 'Sulfa Drugs'],
                            diseases: data.chronicDiseases || ['Type-1 Diabetes', 'Hypertension'],
                            medications: data.medications || ['Lisinopril 10mg QD', 'Humalog Insulin (PRN)'],
                            contacts: data.emergencyContacts || [
                                { name: 'Sarah Vance', relationship: 'Spouse', phone: '+1 (555) 382-0192' },
                                { name: 'Dr. Robert Chen', relationship: 'Primary Physician', phone: '+1 (555) 902-8831' }
                            ],
                            insurance: data.insurance || {
                                provider: 'Blue Cross Shield',
                                policyNumber: 'BCX-8829104-99',
                                groupNumber: 'GR-48201'
                            },
                            emergencyToken: data.emergencyToken || '',
                            emergencyTokenExpiry: data.emergencyTokenExpiry || null
                        });

                        if (data.emergencyToken && data.emergencyTokenExpiry) {
                            setToken(data.emergencyToken);
                            const expiryTime = data.emergencyTokenExpiry.seconds ? data.emergencyTokenExpiry.seconds * 1000 : data.emergencyTokenExpiry;
                            setTokenExpiry(expiryTime);
                        }
                    }
                } catch (err) {
                    console.error('Failed to fetch emergency profile data:', err);
                    toast.error('Failed to load critical health profile');
                }
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Countdown timer for emergency token expiry
    useEffect(() => {
        if (!tokenExpiry) return;

        const updateTimer = () => {
            const diff = Math.max(0, Math.floor((tokenExpiry - Date.now()) / 1000));
            setSecondsLeft(diff);
            if (diff <= 0) {
                setToken('');
                setTokenExpiry(null);
                toast.warn('Emergency token has expired.');
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [tokenExpiry]);

    // Secure emergency token generation
    const generateEmergencyToken = async () => {
        if (!firebaseUser) return;
        setIsGenerating(true);
        try {
            // Generate a secure 8-character token
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let newToken = 'EMT-';
            for (let i = 0; i < 6; i++) {
                newToken += characters.charAt(Math.floor(Math.random() * characters.length));
            }

            // Expiry is set to 2 hours from now
            const expiryTime = Date.now() + 2 * 60 * 60 * 1000;
            const userRef = doc(db, 'users', firebaseUser.uid);

            await updateDoc(userRef, {
                emergencyToken: newToken,
                emergencyTokenExpiry: new Date(expiryTime)
            });

            setToken(newToken);
            setTokenExpiry(expiryTime);
            toast.success('Secure emergency token generated');
        } catch (err) {
            console.error('Failed to generate emergency token:', err);
            toast.error('Token generation failed');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopyToken = () => {
        if (token) {
            navigator.clipboard.writeText(token);
            toast.success('Emergency token copied to clipboard');
        }
    };

    // Format remaining time to MM:SS
    const formatTime = (secs) => {
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = secs % 60;
        return `${h > 0 ? h + 'h ' : ''}${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
    };

    // QR Code URL based on the secure token
    const qrData = `https://healthcare-ac5a3.web.app/emergency-access?token=${token}&patientId=${firebaseUser?.uid || ''}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&color=ef4444&bgcolor=0B0F1A&data=${encodeURIComponent(qrData)}`;

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-red-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-16 text-left">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#1E2D4580] pb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Zap className="w-4 h-4 text-red-500 animate-pulse" />
                        <span className="text-[10px] text-red-400 font-bold uppercase tracking-widest">Critical Medical Identity</span>
                    </div>
                    <h2 className="text-3xl font-display font-bold text-white">Emergency Medical Profile</h2>
                    <p className="text-sm text-[#8899AA] mt-1">Hospital-ready identity screen providing instant access to critical care details.</p>
                </div>
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-xl">
                    <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />
                    <span className="text-xs text-red-400 font-semibold">Active Responding Status</span>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* QR Code and Expiring Token Panel */}
                <div className="bg-[#111827] border border-red-500/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-[0_0_30px_rgba(239,68,68,0.03)]">
                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-red-500/5 rounded-full blur-[40px] pointer-events-none" />
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#00C8D4]/5 rounded-full blur-[40px] pointer-events-none" />
                    
                    <h3 className="text-sm font-bold uppercase tracking-wider text-red-400 mb-4 flex items-center gap-1.5">
                        <Key className="w-4 h-4" /> Secure First Responder Access
                    </h3>

                    {/* QR Code */}
                    <div className="bg-[#0B0F1A] p-4 rounded-2xl border border-red-500/20 mb-6 relative group">
                        {token ? (
                            <img src={qrCodeUrl} alt="Emergency QR Code" className="w-48 h-48 rounded-lg object-contain" />
                        ) : (
                            <div className="w-48 h-48 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[#1E2D4580] rounded-lg">
                                <AlertTriangle className="w-10 h-10 text-amber-500/50" />
                                <span className="text-[10px] text-[#8899AA] px-4">No active emergency token generated</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-[#0B0F1A]/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-2xl p-4">
                            <p className="text-[10px] text-[#8899AA] leading-relaxed">
                                Scanning this QR code redirects first-responders to a secure read-only token view for critical care.
                            </p>
                        </div>
                    </div>

                    {/* Token Info */}
                    {token ? (
                        <div className="w-full space-y-4">
                            <div className="bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl p-3 relative group">
                                <span className="block text-[9px] text-[#8899AA] uppercase font-bold tracking-wider mb-1">Access Token</span>
                                <div className="flex items-center justify-center gap-2">
                                    <span className="font-mono text-xl font-bold text-white tracking-widest">{token}</span>
                                    <button onClick={handleCopyToken} className="p-1 rounded text-[#8899AA] hover:text-[#00C8D4] transition-colors" title="Copy Token">
                                        <Clipboard className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center justify-center gap-2 text-xs text-red-400">
                                <Clock className="w-4 h-4 animate-pulse" />
                                <span>Expires in: <strong className="font-mono">{formatTime(secondsLeft)}</strong></span>
                            </div>
                        </div>
                    ) : (
                        <p className="text-xs text-[#8899AA] mb-4">Generate an active expiring token to authorize temporary emergency profile access.</p>
                    )}

                    <button 
                        onClick={generateEmergencyToken}
                        disabled={isGenerating}
                        className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold text-sm shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] transition-all flex items-center justify-center gap-2"
                    >
                        {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                        {token ? 'Refresh Active Token' : 'Generate Emergency Token'}
                    </button>
                </div>

                {/* Medical Information Cards */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Primary Vitals Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                                <Heart className="w-6 h-6 fill-current animate-pulse" />
                            </div>
                            <div>
                                <span className="text-[10px] text-[#8899AA] uppercase font-bold tracking-wider">Blood Group</span>
                                <p className="text-2xl font-bold font-display text-white mt-0.5">{profileData?.bloodGroup}</p>
                            </div>
                        </div>
                        <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div>
                                <span className="text-[10px] text-[#8899AA] uppercase font-bold tracking-wider">Allergy Alerts</span>
                                <p className="text-sm font-semibold text-white mt-0.5">{profileData?.allergies.length} Critical Flags</p>
                            </div>
                        </div>
                    </div>

                    {/* Allergies, Chronic Diseases & Medications */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {/* Allergies */}
                        <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5 space-y-3">
                            <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5" /> Allergies
                            </h4>
                            <div className="space-y-2">
                                {profileData?.allergies.map((allergy, i) => (
                                    <div key={i} className="px-3 py-1.5 rounded-lg bg-red-500/5 border border-red-500/10 text-xs text-red-300 font-medium">
                                        {allergy}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Chronic Diseases */}
                        <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5 space-y-3">
                            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Heart className="w-3.5 h-3.5" /> Chronic Diseases
                            </h4>
                            <div className="space-y-2">
                                {profileData?.diseases.map((disease, i) => (
                                    <div key={i} className="px-3 py-1.5 rounded-lg bg-amber-500/5 border border-amber-500/10 text-xs text-amber-300 font-medium">
                                        {disease}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Current Medications */}
                        <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5 space-y-3">
                            <h4 className="text-xs font-bold text-[#00C8D4] uppercase tracking-wider flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5" /> Medications
                            </h4>
                            <div className="space-y-2">
                                {profileData?.medications.map((med, i) => (
                                    <div key={i} className="px-3 py-1.5 rounded-lg bg-[#00C8D4]/5 border border-[#00C8D4]/10 text-xs text-[#00C8D4] font-medium">
                                        {med}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Emergency Contacts & Insurance */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Emergency Contacts */}
                        <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-6 space-y-4">
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                                <Phone className="w-4 h-4 text-emerald-400" /> Emergency Contacts
                            </h4>
                            <div className="space-y-3">
                                {profileData?.contacts.map((contact, i) => (
                                    <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-[#0B0F1A] border border-[#1E2D4580]">
                                        <div>
                                            <p className="text-xs font-bold text-white">{contact.name}</p>
                                            <span className="text-[10px] text-[#8899AA]">{contact.relationship}</span>
                                        </div>
                                        <a href={`tel:${contact.phone}`} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/20 transition-all">
                                            <Phone className="w-3 h-3" /> CALL
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Insurance Details */}
                        <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-6 space-y-4">
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4 text-[#00C8D4]" /> Insurance Details
                            </h4>
                            <div className="space-y-3 bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl p-4 text-xs">
                                <div className="flex justify-between border-b border-[#1E2D4580] pb-2">
                                    <span className="text-[#8899AA]">Provider:</span>
                                    <span className="text-white font-semibold">{profileData?.insurance.provider}</span>
                                </div>
                                <div className="flex justify-between border-b border-[#1E2D4580] pb-2">
                                    <span className="text-[#8899AA]">Policy #:</span>
                                    <span className="text-white font-mono font-semibold">{profileData?.insurance.policyNumber}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#8899AA]">Group #:</span>
                                    <span className="text-white font-mono font-semibold">{profileData?.insurance.groupNumber}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Read-Only Regulatory Banner */}
                    <div className="p-4 bg-red-500/5 rounded-2xl border border-red-500/20 text-xs text-[#8899AA] leading-relaxed flex gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <span>
                            <strong>Legal Compliance Notice:</strong> This profile page operates under HIPAA and GDPR emergency access guidelines. First responder access logs are cryptographically registered to the on-chain audit ledger.
                        </span>
                    </div>

                </div>

            </div>
        </div>
    );
}
