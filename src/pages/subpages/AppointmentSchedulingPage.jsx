import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Calendar, Clock, User, Phone, CheckCircle, RefreshCw, XCircle, Plus,
    Stethoscope, Building, Video, Users, Check, Send, Landmark, AlertTriangle, BookOpen
} from 'lucide-react';
import { db, auth } from '../../firebase/config';
import { collection, query, where, onSnapshot, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { toast } from '../../components/Toast';

export default function AppointmentSchedulingPage() {
    const [firebaseUser, setFirebaseUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [appointments, setAppointments] = useState([]);
    
    // Booking Form states
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [date, setDate] = useState('');
    const [timeSlot, setTimeSlot] = useState('09:00 AM');
    const [type, setType] = useState('Telemedicine');
    const [department, setDepartment] = useState('Cardiology');
    const [symptoms, setSymptoms] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Mock doctors and slots
    const CLINICAL_DOCTORS = [
        { id: 'doc-1', name: 'Dr. Sarah Connor', specialty: 'Cardiology', hospital: 'Metro General Hospital', availableSlots: ['09:00 AM', '10:30 AM', '02:00 PM'] },
        { id: 'doc-2', name: 'Dr. Robert Chen', specialty: 'Neurology', hospital: 'St. Jude Medical Center', availableSlots: ['11:00 AM', '03:15 PM', '04:00 PM'] },
        { id: 'doc-3', name: 'Dr. Priya Patel', specialty: 'Oncology', hospital: 'City Hope Cancer Institute', availableSlots: ['10:00 AM', '01:30 PM', '03:30 PM'] }
    ];

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setFirebaseUser(user);
                
                // Real-time Firestore query listener
                const appRef = collection(db, 'appointments');
                const q = query(appRef, where('patientId', '==', user.uid));
                
                const unsubApp = onSnapshot(q, (snapshot) => {
                    const data = [];
                    snapshot.forEach((doc) => {
                        data.push({ id: doc.id, ...doc.data() });
                    });
                    setAppointments(data);
                    setLoading(false);
                }, (error) => {
                    console.error('[AppointmentSchedulingPage] Firestore error:', error);
                    setLoading(false);
                });

                return () => unsubApp();
            } else {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    // Create Booking
    const handleBookAppointment = async (e) => {
        e.preventDefault();
        if (!firebaseUser) return;
        if (!selectedDoctor || !date || !symptoms.trim()) {
            toast.error('Please complete all scheduling parameters');
            return;
        }

        setIsSubmitting(true);
        const docObj = CLINICAL_DOCTORS.find(d => d.id === selectedDoctor);

        const newBooking = {
            patientId: firebaseUser.uid,
            doctorName: docObj.name,
            hospitalName: docObj.hospital,
            specialty: docObj.specialty,
            date,
            timeSlot,
            type,
            status: 'Confirmed',
            symptoms,
            queueNumber: `Q-${Math.floor(Math.random() * 20 + 1).toString().padStart(2, '0')}`,
            estWaitMinutes: 20
        };

        try {
            await addDoc(collection(db, 'appointments'), newBooking);
            toast.success('Clinical appointment reserved successfully');
            setShowBookingForm(false);
            setSymptoms('');
        } catch (err) {
            console.error('Failed to book appointment:', err);
            // Fallback simulated list update
            setAppointments(prev => [
                { id: `app-mock-${Date.now()}`, ...newBooking },
                ...prev
            ]);
            toast.success('Appointment booked (Simulated Local Instance)');
            setShowBookingForm(false);
            setSymptoms('');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Cancel Booking
    const handleCancelAppointment = async (appId) => {
        try {
            if (!appId.startsWith('app-mock-')) {
                const docRef = doc(db, 'appointments', appId);
                await updateDoc(docRef, { status: 'Cancelled' });
            } else {
                setAppointments(prev => prev.map(a => a.id === appId ? { ...a, status: 'Cancelled' } : a));
            }
            toast.success('Clinical appointment successfully cancelled');
        } catch (err) {
            console.error(err);
            toast.error('Failed to cancel appointment');
        }
    };

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
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#1E2D4580] pb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-[#00C8D4] animate-pulse" />
                        <span className="text-[10px] text-[#00C8D4] font-bold uppercase tracking-widest">Scheduling & Visit Center</span>
                    </div>
                    <h2 className="text-3xl font-display font-bold text-white">Appointments & Visits</h2>
                    <p className="text-sm text-[#8899AA] mt-1">Book virtual clinic slot, monitor live queue waiting progress, and track clinical visit schedules.</p>
                </div>
                <button
                    onClick={() => setShowBookingForm(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-[#00C8D4] text-[#0B0F1A] font-bold text-sm shadow-[0_0_20px_rgba(0,200,212,0.2)] hover:shadow-[0_0_30px_rgba(0,200,212,0.4)] transition-all"
                >
                    <Plus className="w-4 h-4" /> Book New Appointment
                </button>
            </div>

            {/* Upcoming Agenda Grid */}
            {appointments.filter(a => a.status !== 'Cancelled').length === 0 ? (
                <div className="bg-[#111827] border border-[#1E2D4580] border-dashed rounded-2xl p-10 text-center flex flex-col items-center justify-center min-h-[300px]">
                    <Calendar className="w-12 h-12 text-slate-600 mb-3" />
                    <h4 className="text-base font-bold text-[#8899AA]">No Scheduled Appointments</h4>
                    <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
                        No active telemedicine or in-person clinical sessions registered. Use the button above to schedule a new visit.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {appointments.filter(a => a.status !== 'Cancelled').map((a, i) => (
                        <motion.div
                            key={a.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-[#111827] border border-[#1E2D4580] rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden"
                        >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#00C8D4]/5 rounded-full blur-[35px] pointer-events-none" />

                        <div className="space-y-4">
                            <div className="flex justify-between items-start gap-3">
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#00C8D4]/10 border border-[#00C8D4]/20 flex items-center justify-center text-[#00C8D4] flex-shrink-0">
                                        {a.type === 'Telemedicine' ? <Video className="w-5 h-5" /> : <Building className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white">{a.doctorName}</h4>
                                        <p className="text-[10px] text-[#8899AA]">{a.specialty} • {a.hospitalName}</p>
                                    </div>
                                </div>
                                <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                    a.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                }`}>
                                    {a.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 border-t border-b border-[#1E2D4580] py-3 text-left">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-[#8899AA]" />
                                    <div>
                                        <span className="text-[9px] text-[#8899AA] uppercase block leading-none">Date</span>
                                        <span className="text-xs font-semibold text-white mt-0.5 block">{a.date}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-[#8899AA]" />
                                    <div>
                                        <span className="text-[9px] text-[#8899AA] uppercase block leading-none">Time Slot</span>
                                        <span className="text-xs font-semibold text-white mt-0.5 block">{a.timeSlot}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Queue estimation metrics */}
                            {a.status === 'Confirmed' && a.estWaitMinutes > 0 && (
                                <div className="flex justify-between items-center bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl p-3 text-xs">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-purple-400" />
                                        <div>
                                            <span className="text-[9px] text-[#8899AA] block">Queue Pos</span>
                                            <span className="font-bold text-white font-mono">{a.queueNumber}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[9px] text-[#8899AA] block">Est. Wait</span>
                                        <span className="font-bold text-[#00C8D4] font-mono">{a.estWaitMinutes} Mins</span>
                                    </div>
                                </div>
                            )}

                            <div>
                                <span className="text-[9px] text-[#8899AA] uppercase font-bold tracking-wider block mb-1">Stated Symptoms</span>
                                <p className="text-xs text-[#CBD5E1] leading-relaxed bg-[#0B0F1A]/40 border border-[#1E2D4580] rounded-xl p-2.5">{a.symptoms}</p>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-[#1E2D4580] flex justify-end gap-2">
                            <button
                                onClick={() => handleCancelAppointment(a.id)}
                                className="px-4 py-2 rounded-xl border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500/10 transition-all flex items-center gap-1.5"
                            >
                                <XCircle className="w-3.5 h-3.5" /> Cancel Visit
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
            )}

            {/* Booking Wizard Modal */}
            <AnimatePresence>
                {showBookingForm && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#111827] border border-[#1E2D4580] rounded-2xl max-w-md w-full p-6 space-y-6 relative overflow-hidden"
                        >
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#00C8D4]/5 rounded-full blur-[40px] pointer-events-none" />

                            <div className="flex justify-between items-center border-b border-[#1E2D4580] pb-4">
                                <h3 className="font-display font-bold text-lg text-white">Book Clinic Appointment</h3>
                                <button onClick={() => setShowBookingForm(false)} className="text-slate-500 hover:text-white transition-colors">
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleBookAppointment} className="space-y-4 text-left">
                                <div>
                                    <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-2">Select Practitioner</label>
                                    <select
                                        value={selectedDoctor}
                                        onChange={(e) => setSelectedDoctor(e.target.value)}
                                        className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                                    >
                                        <option value="">-- Choose Doctor --</option>
                                        {CLINICAL_DOCTORS.map(d => (
                                            <option key={d.id} value={d.id}>{d.name} ({d.specialty} - {d.hospital})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-2">Visit Type</label>
                                        <select
                                            value={type}
                                            onChange={(e) => setType(e.target.value)}
                                            className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                                        >
                                            <option value="Telemedicine">Telemedicine (Video)</option>
                                            <option value="In-Person">In-Person (Clinic)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-2">Preferred Slot</label>
                                        <select
                                            value={timeSlot}
                                            onChange={(e) => setTimeSlot(e.target.value)}
                                            className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                                        >
                                            <option value="09:00 AM">09:00 AM</option>
                                            <option value="10:30 AM">10:30 AM</option>
                                            <option value="11:00 AM">11:00 AM</option>
                                            <option value="01:30 PM">01:30 PM</option>
                                            <option value="02:00 PM">02:00 PM</option>
                                            <option value="03:15 PM">03:15 PM</option>
                                            <option value="04:00 PM">04:00 PM</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-2">Preferred Date</label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] text-[#8899AA] font-bold uppercase tracking-wider mb-2">Stated Symptoms & Medical Reason</label>
                                    <textarea
                                        rows={3}
                                        value={symptoms}
                                        onChange={(e) => setSymptoms(e.target.value)}
                                        placeholder="Describe active discomforts, request duration, refills queries, or routine physical evaluation requirements..."
                                        className="w-full bg-[#0B0F1A] border border-[#1E2D4580] focus:border-[#00C8D4]/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none resize-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-[#00C8D4] text-[#0B0F1A] font-bold text-sm shadow-[0_0_20px_rgba(0,200,212,0.2)] hover:shadow-[0_0_30px_rgba(0,200,212,0.4)] transition-all flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    Broadcast slot reservation query
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
