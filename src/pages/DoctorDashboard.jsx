import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, FileText, Shield, Clock, Search, CheckCircle, XCircle,
    Eye, Activity, AlertTriangle, Cpu, Zap, Brain, ArrowUpRight, 
    Stethoscope, Database, ShieldCheck, Info, X, Clock3, ActivitySquare,
    Unlock, UserPlus, Server
} from 'lucide-react';
import { useRecords } from '../hooks/useRecords';
import { PieChart, Pie, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import useAuthStore from '../store/authStore';
import { db } from '../firebase/config';
import { doc, updateDoc, serverTimestamp, collection, query, where, orderBy, limit, getDocs, onSnapshot } from 'firebase/firestore';

/* ───── Welcome Hero ───── */
function WelcomeHero({ patientsCount, recordsCount }) {
    const { t } = useTranslation();
    const hour = new Date().getHours();
    const greeting = hour < 12 ? t('auth.welcome') : t('auth.welcome');
    const { user } = useAuthStore();
    const doctorName = user?.displayName || user?.name || 'Dr. Smith';

    return (
        <div className="rounded-2xl p-6 md:p-8 relative overflow-hidden bg-[#111827] border border-[#1E2D4580]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#00C8D4]/10 to-transparent rounded-bl-full pointer-events-none" />
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Stethoscope className="w-5 h-5 text-[#00C8D4]" />
                        <span className="text-[10px] text-[#00C8D4] font-bold uppercase tracking-widest">{t('doctor.dashboardTitle')}</span>
                    </div>
                    <h1 className="text-3xl font-display font-bold text-white mb-2">{greeting}, {doctorName}</h1>
                    <p className="text-sm text-[#8899AA]">You have {patientsCount} active patients and {recordsCount} verified records under your care.</p>
                </div>
                <div className="flex gap-4">
                    <div className="px-5 py-3 rounded-xl bg-[#1A2236] border border-[#1E2D4580]">
                        <p className="text-[10px] text-[#8899AA] uppercase tracking-wider font-semibold mb-1">Active Verifications</p>
                        <p className="text-2xl font-display font-bold text-white">12</p>
                    </div>
                    <div className="px-5 py-3 rounded-xl bg-[#1A2236] border border-[#1E2D4580]">
                        <p className="text-[10px] text-[#8899AA] uppercase tracking-wider font-semibold mb-1">Network Sync</p>
                        <p className="text-2xl font-display font-bold text-emerald-400">Optimal</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ───── Persistent Alerts ───── */
function AlertBars() {
    const [alerts, setAlerts] = useState([
        { id: 1, type: 'info', icon: Server, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'Sync Status: Mainnet connected (Latency: 14ms)' },
        { id: 2, type: 'success', icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'Session Lock: Hardware encryption active on this terminal.' },
        { id: 3, type: 'purple', icon: Brain, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'AI Agent: 2 records pending summary generation.' },
    ]);

    const dismiss = (id) => setAlerts(alerts.filter(a => a.id !== id));

    return (
        <div className="space-y-2">
            <AnimatePresence>
                {alerts.map(alert => (
                    <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0, scale: 0.98 }}
                        className={`flex items-center justify-between p-3 rounded-lg border ${alert.bg} ${alert.border}`}
                    >
                        <div className="flex items-center gap-3">
                            <alert.icon className={`w-4 h-4 ${alert.color}`} />
                            <span className={`text-sm font-medium ${alert.color}`}>{alert.text}</span>
                        </div>
                        <button onClick={() => dismiss(alert.id)} className={`p-1 rounded-md hover:bg-white/10 ${alert.color} opacity-70 hover:opacity-100 transition-all`}>
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

/* ───── Priority Patient Queue ───── */
function PriorityPatientQueue({ patients }) {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const filtered = patients.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) || p.wallet.includes(search)
    );

    const RiskBadge = ({ risk }) => {
        const config = {
            Low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            High: 'bg-red-500/10 text-red-400 border-red-500/20'
        };
        return (
            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${config[risk] || config.Low}`}>
                {risk}
            </span>
        );
    };

    return (
        <div className="rounded-2xl bg-[#111827] border border-[#1E2D4580] overflow-hidden flex flex-col h-full min-h-[500px]">
            <div className="px-6 py-5 border-b border-[#1E2D4580] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#00C8D4]/10 border border-[#00C8D4]/20 flex items-center justify-center">
                        <Users className="w-5 h-5 text-[#00C8D4]" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white font-display">Priority Patient Queue</h3>
                        <p className="text-xs text-[#8899AA]">Real-time patient access monitoring</p>
                    </div>
                </div>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A5568]" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search queue..."
                        className="w-full bg-[#1A2236] border border-[#1E2D4580] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-[#4A5568] focus:outline-none focus:border-[#00C8D4]/50 focus:ring-1 focus:ring-[#00C8D4]/20 transition-all"
                    />
                </div>
            </div>
            
            <div className="flex-1 overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-[#1E2D4580] bg-[#1A2236]/50">
                            {['Patient ID', 'Name & Age', 'Risk Stratification', 'Last Update', 'Actions'].map(h => (
                                <th key={h} className="px-6 py-4 text-left text-[11px] text-[#8899AA] font-bold uppercase tracking-wider">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-12 text-center text-[#8899AA]">No patients in queue.</td>
                            </tr>
                        ) : filtered.map((p, i) => (
                            <motion.tr
                                key={p.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="border-b border-[#1E2D4580] last:border-0 hover:bg-[#1A2236] transition-all duration-200 group"
                            >
                                <td className="px-6 py-4 text-[#8899AA] font-mono text-xs">
                                    {p.wallet.substring(0, 8)}...
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[#1E2D45] flex items-center justify-center text-xs font-bold text-[#F0F4F8]">
                                            {p.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{p.name}</p>
                                            <p className="text-[11px] text-[#8899AA]">Age: {p.age || '45'} · {p.condition}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <RiskBadge risk={p.risk || 'Low'} />
                                </td>
                                <td className="px-6 py-4 text-xs text-[#8899AA]">
                                    {p.lastUpdated}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => navigate(`/dashboard/doctor/records`)}
                                            className="p-1.5 rounded-lg bg-[#00C8D4]/10 text-[#00C8D4] hover:bg-[#00C8D4]/20 tooltip-trigger" 
                                            title="View Records"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => navigate('/dashboard/doctor/access')}
                                            className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 tooltip-trigger" 
                                            title="Request OTP"
                                        >
                                            <Unlock className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => navigate('/dashboard/doctor/patient-access')}
                                            className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 tooltip-trigger" 
                                            title="Emergency Break-Glass"
                                        >
                                            <AlertTriangle className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

/* ───── Clinical Activity & Stats ───── */
function ClinicalStats({ doctorId }) {
    const [recentAccesses, setRecentAccesses] = useState([]);
    const [consentData, setConsentData] = useState([
        { name: 'Granted', value: 1, color: '#10B981' },
        { name: 'Pending', value: 0, color: '#F59E0B' },
        { name: 'Denied', value: 0, color: '#EF4444' }
    ]);
    const [integrityData, setIntegrityData] = useState([
        { subject: 'Uptime', A: 99.8, fullMark: 100 },
        { subject: 'Node Health', A: 96, fullMark: 100 },
        { subject: 'Encryption', A: 100, fullMark: 100 },
        { subject: 'Audit Sync', A: 92, fullMark: 100 },
        { subject: 'Auth Success', A: 98, fullMark: 100 },
    ]);

    useEffect(() => {
        if (!doctorId) return;

        // 1. Listen to auditLogs for this doctor
        const logsQ = query(
            collection(db, 'auditLogs'),
            where('userId', '==', doctorId),
            orderBy('timestamp', 'desc'),
            limit(5)
        );
        const unsubLogs = onSnapshot(logsQ, (snapshot) => {
            const list = snapshot.docs.map(doc => {
                const data = doc.data();
                let timeStr = 'Just now';
                if (data.timestamp) {
                    try {
                        const date = data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
                        if (date && !isNaN(date.getTime())) {
                            timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        }
                    } catch (e) {
                        console.warn('Failed parsing timestamp:', e);
                    }
                }
                
                let text = '';
                let type = 'system';
                if (data.activityType === 'RECORD_UPLOADED') {
                    text = `Uploaded record: ${data.details?.fileName || 'Document'}`;
                    type = 'view';
                } else if (data.activityType === 'OTP_VERIFIED_ACCESS_GRANTED' || data.activityType === 'ACCESS_GRANTED') {
                    text = `Access granted: Patient ID ${data.details?.patientId ? String(data.details.patientId).substring(0, 8) : 'Unknown'}`;
                    type = 'view';
                } else if (data.activityType === 'EMERGENCY_ACCESS') {
                    text = `Emergency bypass: Patient ID ${data.details?.patientId ? String(data.details.patientId).substring(0, 8) : 'Unknown'}`;
                    type = 'alert';
                } else if (data.activityType === 'ACCESS_REQUEST_CREATED') {
                    text = `Requested access: Patient ID ${data.details?.patientId ? String(data.details.patientId).substring(0, 8) : 'Unknown'}`;
                    type = 'request';
                } else {
                    text = `${(data.activityType || '').replace(/_/g, ' ')}`;
                }

                return { time: timeStr, text, type };
            });
            setRecentAccesses(list);
        }, (err) => console.warn('Error listening to doctor audit logs:', err));

        // 2. Listen to accessRequests for consent stats
        const reqsQ = query(
            collection(db, 'accessRequests'),
            where('doctorId', '==', doctorId)
        );
        const unsubReqs = onSnapshot(reqsQ, (snapshot) => {
            let approved = 0;
            let pending = 0;
            let rejected = 0;
            snapshot.forEach(doc => {
                const status = doc.data().status;
                if (status === 'approved' || status === 'granted' || status === 'OTP_VERIFIED_ACCESS_GRANTED') approved++;
                else if (status === 'pending' || status === 'Awaiting OTP' || status === 'Patient Notified') pending++;
                else if (status === 'rejected' || status === 'denied') rejected++;
            });

            if (approved === 0 && pending === 0 && rejected === 0) {
                setConsentData([
                    { name: 'Granted', value: 1, color: '#10B981' },
                    { name: 'Pending', value: 0, color: '#F59E0B' },
                    { name: 'Denied', value: 0, color: '#EF4444' }
                ]);
            } else {
                setConsentData([
                    { name: 'Granted', value: approved, color: '#10B981' },
                    { name: 'Pending', value: pending, color: '#F59E0B' },
                    { name: 'Denied', value: rejected, color: '#EF4444' }
                ]);
            }
        }, (err) => console.warn('Error listening to doctor consent requests:', err));

        // 3. Simulated small variations on health radar
        const interval = setInterval(() => {
            setIntegrityData([
                { subject: 'Uptime', A: 99.8 + (Math.random() > 0.95 ? -0.1 : 0), fullMark: 100 },
                { subject: 'Node Health', A: 95 + Math.floor(Math.random() * 3) - 1, fullMark: 100 },
                { subject: 'Encryption', A: 100, fullMark: 100 },
                { subject: 'Audit Sync', A: 90 + Math.floor(Math.random() * 5), fullMark: 100 },
                { subject: 'Auth Success', A: 98, fullMark: 100 },
            ]);
        }, 15000);

        return () => {
            unsubLogs();
            unsubReqs();
            clearInterval(interval);
        };
    }, [doctorId]);

    return (
        <div className="space-y-6">
            
            {/* Recent Accesses Timeline */}
            <div className="rounded-2xl bg-[#111827] border border-[#1E2D4580] p-6">
                <h3 className="text-sm font-semibold text-white font-display mb-5 flex items-center gap-2">
                    <Clock3 className="w-4 h-4 text-[#8899AA]" /> My Recent Accesses
                </h3>
                {recentAccesses.length === 0 ? (
                    <p className="text-xs text-[#8899AA] italic">No recent record accesses.</p>
                ) : (
                    <div className="space-y-4">
                        {recentAccesses.map((item, i) => (
                            <div key={i} className="flex gap-4 relative">
                                {i !== recentAccesses.length - 1 && (
                                    <div className="absolute left-[7px] top-[20px] bottom-[-16px] w-px bg-[#1E2D45]" />
                                )}
                                <div className={`w-3.5 h-3.5 rounded-full mt-1 z-10 flex-shrink-0 ${
                                    item.type === 'alert' ? 'bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.5)]' :
                                    item.type === 'request' ? 'bg-amber-400' :
                                    item.type === 'view' ? 'bg-[#00C8D4]' : 'bg-[#4A5568]'
                                }`} />
                                <div>
                                    <p className="text-xs text-[#8899AA] mb-0.5">{item.time}</p>
                                    <p className="text-sm text-white">{item.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Consent Distribution Donut */}
            <div className="rounded-2xl bg-[#111827] border border-[#1E2D4580] p-6">
                <h3 className="text-sm font-semibold text-white font-display mb-2 flex items-center gap-2">
                    <ActivitySquare className="w-4 h-4 text-[#8899AA]" /> Consent Distribution
                </h3>
                <div className="h-[180px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={consentData}
                                cx="50%" cy="50%"
                                innerRadius={50}
                                outerRadius={70}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {consentData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#111827', borderColor: '#1E2D4580', borderRadius: '8px' }}
                                itemStyle={{ color: '#F0F4F8' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-2">
                    {consentData.map(d => (
                        <div key={d.name} className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                            <span className="text-[10px] text-[#8899AA] uppercase tracking-wider">{d.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* System Integrity Radar */}
            <div className="rounded-2xl bg-[#111827] border border-[#1E2D4580] p-6">
                <h3 className="text-sm font-semibold text-white font-display mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#8899AA]" /> System Integrity
                </h3>
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={integrityData}>
                            <PolarGrid stroke="#1E2D45" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#8899AA', fontSize: 10 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar name="Integrity" dataKey="A" stroke="#00C8D4" fill="#00C8D4" fillOpacity={0.2} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#111827', borderColor: '#1E2D4580', borderRadius: '8px' }}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>
    );
}

export default function DoctorDashboard() {
    const { user } = useAuthStore();
    const { records } = useRecords({ fetchAll: true });
    const [patientProfiles, setPatientProfiles] = useState({});

    useEffect(() => {
        const userId = user?.uid || user?.id;
        if (!userId) return;

        // Set online to true when mounting the dashboard
        const userRef = doc(db, 'users', userId);
        updateDoc(userRef, {
            online: true,
            lastSeen: serverTimestamp()
        }).catch(err => console.warn('Could not set doctor online status:', err));

        // Periodically update lastSeen every 30 seconds
        const interval = setInterval(() => {
            updateDoc(userRef, {
                online: true,
                lastSeen: serverTimestamp()
            }).catch(() => {});
        }, 30000);

        // Fetch patient profiles
        const q = query(collection(db, 'users'), where('role', '==', 'patient'));
        const unsub = onSnapshot(q, (snapshot) => {
            const profiles = {};
            snapshot.forEach(doc => {
                profiles[doc.id] = { id: doc.id, ...doc.data() };
            });
            setPatientProfiles(profiles);
        }, (err) => console.warn('Error listening to patient profiles:', err));

        return () => {
            clearInterval(interval);
            unsub();
            updateDoc(userRef, {
                online: false,
                lastSeen: serverTimestamp()
            }).catch(() => {});
        };
    }, [user]);

    const patients = useMemo(() => {
        const pMap = {};
        records.forEach(r => {
            if (!r.patientId) return;
            const profile = patientProfiles[r.patientId] || {};
            
            if (!pMap[r.patientId]) {
                let dateVal = r.date || 'Today';
                if (r.createdAt) {
                    try {
                        const date = r.createdAt.toDate ? r.createdAt.toDate() : new Date(r.createdAt);
                        if (date && !isNaN(date.getTime())) {
                            dateVal = date.toLocaleDateString();
                        }
                    } catch (e) {
                        console.warn('Failed parsing createdAt:', e);
                    }
                }
                pMap[r.patientId] = {
                    id: r.patientId,
                    wallet: profile.wallet || r.patientId,
                    name: profile.name || `Patient ${String(r.patientId).substring(0, 4).toUpperCase()}`,
                    records: 0,
                    lastUpdated: dateVal,
                    lastUpdatedSeconds: r.createdAt?.seconds || 0,
                    status: 'active',
                    condition: profile.condition || 'General Practice',
                    risk: profile.risk || 'Low',
                    age: profile.age || 35
                };
            }
            pMap[r.patientId].records++;
            if (r.createdAt?.seconds && r.createdAt.seconds > pMap[r.patientId].lastUpdatedSeconds) {
                try {
                    const date = r.createdAt.toDate ? r.createdAt.toDate() : new Date(r.createdAt);
                    if (date && !isNaN(date.getTime())) {
                        pMap[r.patientId].lastUpdated = date.toLocaleDateString();
                    }
                } catch (e) {
                    console.warn('Failed updating lastUpdated:', e);
                }
                pMap[r.patientId].lastUpdatedSeconds = r.createdAt.seconds;
            }
        });
        return Object.values(pMap);
    }, [records, patientProfiles]);

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
            <WelcomeHero patientsCount={patients.length} recordsCount={records.length} />
            <AlertBars />
            
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                    <PriorityPatientQueue patients={patients} />
                </div>
                <div className="xl:col-span-1">
                    <ClinicalStats doctorId={user?.uid || user?.id} />
                </div>
            </div>
        </div>
    );
}
