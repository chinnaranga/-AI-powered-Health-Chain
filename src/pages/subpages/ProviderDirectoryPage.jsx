import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, Search, Filter, Stethoscope, Star, CheckCircle, MapPin, 
    Calendar, Phone, Mail, ChevronRight, LockOpen, Sparkles
} from 'lucide-react';
import { db, auth } from '../../firebase/config';
import { collection, query, onSnapshot, addDoc, getDocs, limit } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function ProviderDirectoryPage() {
    const [user, setUser] = useState(null);
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('All');
    
    // Success toast log
    const [linkedDocId, setLinkedDocId] = useState(null);

    useEffect(() => {
        const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubAuth();
    }, []);

    useEffect(() => {
        const providerRef = collection(db, 'providers');
        
        const unsub = onSnapshot(providerRef, (snapshot) => {
            const data = [];
            snapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() });
            });
            setProviders(data);
            setLoading(false);
        }, (error) => {
            console.error('[ProviderDirectoryPage] Firestore error:', error);
            setLoading(false);
        });

        return () => unsub();
    }, []);

    // Create benchmark specialists if collection is empty
    const handleInitializeProviders = async () => {
        try {
            const doctors = [
                { name: "Dr. Liam Patel", specialty: "Cardiology", hospital: "Saint Jude Cardiac Center", rating: 4.9, isVerified: true, availability: ["Mon", "Wed", "Fri"] },
                { name: "Dr. Sofia Chen", specialty: "Neurology", hospital: "Apex Specialist Clinics", rating: 4.8, isVerified: true, availability: ["Tue", "Thu"] },
                { name: "Dr. Marcus Vance", specialty: "General Medicine", hospital: "Metro General Hospital", rating: 4.7, isVerified: true, availability: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
                { name: "Dr. Elena Rostova", specialty: "Pediatrics", hospital: "Childrens Wellness Trust", rating: 4.9, isVerified: true, availability: ["Mon", "Thu"] }
            ];

            for (const docObj of doctors) {
                await addDoc(collection(db, 'providers'), docObj);
            }
        } catch (err) {
            console.error('Error seeding providers:', err);
        }
    };

    const handleRequestAccessSync = async (provider) => {
        if (!user) return;
        
        try {
            // Write access control request dynamically into on-chain simulation
            await addDoc(collection(db, 'accessRequests'), {
                patientId: user.uid,
                patientName: user.displayName || 'Anonymous Patient',
                doctorId: provider.id,
                doctorName: provider.name,
                hospital: provider.hospital,
                specialty: provider.specialty,
                status: 'Pending',
                purpose: 'Care Coordination & Records Synchronization',
                createdAt: new Date().toISOString()
            });

            setLinkedDocId(provider.id);
            setTimeout(() => setLinkedDocId(null), 3000);
        } catch (err) {
            console.error('Error logging access request:', err);
        }
    };

    const specialtiesList = ['All', 'Cardiology', 'Neurology', 'General Medicine', 'Pediatrics'];

    const filteredProviders = providers.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             p.hospital.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSpecialty = selectedSpecialty === 'All' || p.specialty === selectedSpecialty;
        return matchesSearch && matchesSpecialty;
    });

    return (
        <div className="min-h-screen bg-[#0B0F1A] text-white p-6 md:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 bg-[#00C8D4]/10 border border-[#00C8D4]/20 rounded-full px-3 py-1 w-fit mb-3">
                        <Users className="w-4 h-4 text-[#00C8D4] animate-pulse" />
                        <span className="text-[10px] text-[#00C8D4] font-bold uppercase tracking-widest">Medical Network</span>
                    </div>
                    <h2 className="text-3xl font-display font-bold text-white">Verified Provider Directory</h2>
                    <p className="text-sm text-[#8899AA] mt-1">Search authorized clinicians, verify clinical ratings, and synchronize secure healthcare files.</p>
                </div>
                {providers.length === 0 && !loading && (
                    <button
                        onClick={handleInitializeProviders}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-[#00C8D4] text-[#0B0F1A] font-bold text-sm shadow-[0_0_20px_rgba(0,200,212,0.2)]"
                    >
                        Sync Verified Clinicians Directory
                    </button>
                )}
            </div>

            {loading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="w-10 h-10 rounded-full border-4 border-teal-500/10 border-t-teal-400 animate-spin" />
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Filter & Search Bar */}
                    <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5 flex flex-col md:flex-row gap-4 items-center justify-between">
                        {/* Search input */}
                        <div className="relative w-full md:max-w-md">
                            <Search className="w-4.5 h-4.5 text-slate-400 absolute left-4.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by physician name, clinic or hospital..."
                                className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl pl-12 pr-5 py-2.5 text-sm text-white focus:outline-none placeholder-slate-500"
                            />
                        </div>

                        {/* Specialty Chips */}
                        <div className="flex flex-wrap gap-2 w-full md:w-auto">
                            {specialtiesList.map(spec => (
                                <button
                                    key={spec}
                                    onClick={() => setSelectedSpecialty(spec)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                                        selectedSpecialty === spec
                                            ? 'bg-gradient-to-br from-teal-500/20 to-blue-600/20 border-[#00C8D4] text-[#00C8D4]'
                                            : 'bg-[#0B0F1A] border-[#1E2D4580] text-slate-400 hover:text-white'
                                    }`}
                                >
                                    {spec}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Providers Grid */}
                    {filteredProviders.length === 0 ? (
                        <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-10 text-center text-slate-500">
                            No medical specialists found matching current filter query parameters.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
                            {filteredProviders.map((prov, idx) => {
                                const isLinked = linkedDocId === prov.id;
                                return (
                                    <motion.div
                                        key={prov.id}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between"
                                    >
                                        <div className="space-y-4">
                                            {/* Header */}
                                            <div className="flex justify-between items-start">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/20 flex items-center justify-center text-[#00C8D4]">
                                                    <Stethoscope className="w-5.5 h-5.5" />
                                                </div>
                                                
                                                <div className="flex items-center gap-1 bg-[#0B0F1A] border border-[#1E2D4580] px-2.5 py-0.5 rounded-lg text-[10px] font-bold text-amber-400 font-mono">
                                                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                                                    <span>{prov.rating}</span>
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <h4 className="text-sm font-bold text-white leading-tight">{prov.name}</h4>
                                                    {prov.isVerified && (
                                                        <CheckCircle className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-[#00C8D4] font-bold uppercase tracking-wider">{prov.specialty}</span>
                                            </div>

                                            <div className="space-y-2 pt-2 text-xs text-slate-400">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                                                    <span className="truncate">{prov.hospital}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                                    <span>Days: {prov.availability?.join(', ')}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 pt-4 border-t border-[#1E2D4580]">
                                            <button
                                                onClick={() => handleRequestAccessSync(prov)}
                                                className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all border ${
                                                    isLinked
                                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                                        : 'bg-[#0B0F1A] border-[#1E2D4580] hover:border-[#00C8D4]/60 text-white'
                                                }`}
                                            >
                                                {isLinked ? (
                                                    <>
                                                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Request Synchronized!
                                                    </>
                                                ) : (
                                                    <>
                                                        <LockOpen className="w-3.5 h-3.5 text-[#00C8D4]" /> Request Medical Link
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
