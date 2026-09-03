import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Search, Filter, Plus, Shield, CheckCircle,
    AlertTriangle, XCircle, MoreHorizontal, ChevronDown,
    User, Mail, Building2, Clock, Trash2, Edit, LogOut,
    RefreshCw, Eye, BadgeCheck, Stethoscope, Activity,
    Check, X, FileText, Calendar, Phone, CheckCircle2,
    Sparkles, ShieldCheck, UserCheck
} from 'lucide-react';
import { db } from '../../firebase/config';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from '../../components/Toast';
import { apiClient } from '../../services/apiClient';

const ROLES = {
    admin:    { label: 'Admin',    color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/30' },
    doctor:   { label: 'Doctor',   color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
    clinical: { label: 'Clinical', color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/30' },
    patient:  { label: 'Patient',  color: 'text-[#00C8D4]',  bg: 'bg-[#00C8D4]/10',  border: 'border-[#00C8D4]/30' },
};

const STATUS = {
    active:    { label: 'Active',    color: 'text-emerald-400', dot: 'bg-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    suspended: { label: 'Suspended', color: 'text-red-400',     dot: 'bg-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20' },
    pending:   { label: 'Pending',   color: 'text-amber-400',   dot: 'bg-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20' },
    rejected:  { label: 'Rejected',  color: 'text-rose-400',    dot: 'bg-rose-400',    bg: 'bg-rose-500/10',    border: 'border-rose-500/20' },
};

function RoleBadge({ role }) {
    const cfg = ROLES[role] || ROLES.patient;
    return (
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
            {cfg.label}
        </span>
    );
}

function StatusBadge({ status }) {
    const cfg = STATUS[status] || STATUS.pending;
    return (
        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${status === 'active' || status === 'pending' ? 'animate-pulse' : ''}`} />
            {cfg.label}
        </span>
    );
}

function Avatar({ name }) {
    const initials = name ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'DR';
    const colors = ['from-[#00C8D4] to-blue-600', 'from-purple-500 to-indigo-600', 'from-amber-500 to-orange-600', 'from-emerald-500 to-teal-600', 'from-red-500 to-pink-600'];
    const colorIdx = name ? (name.charCodeAt(0) % colors.length) : 0;
    return (
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${colors[colorIdx]} flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}>
            {initials}
        </div>
    );
}

/* ── User Row for Directory ── */
function UserRow({ user, onAction }) {
    const [menuOpen, setMenuOpen] = useState(false);
    return (
        <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="border-b border-[#1E2D4580] hover:bg-[#1A2236]/30 transition-colors group">
            <td className="px-5 py-3.5">
                <div className="flex items-center gap-3">
                    <Avatar name={user.name} />
                    <div>
                        <p className="text-sm font-semibold text-white">{user.name}</p>
                        <p className="text-[11px] text-[#4A5568] font-mono">{user.email}</p>
                    </div>
                </div>
            </td>
            <td className="px-5 py-3.5"><RoleBadge role={user.role} /></td>
            <td className="px-5 py-3.5"><StatusBadge status={user.status} /></td>
            <td className="px-5 py-3.5 hidden lg:table-cell">
                <p className="text-xs text-white">{user.department}</p>
                <p className="text-[11px] text-[#4A5568]">{user.hospital}</p>
            </td>
            <td className="px-5 py-3.5 hidden xl:table-cell">
                <p className="text-xs text-[#8899AA] font-mono">{user.lastActive}</p>
            </td>
            <td className="px-5 py-3.5 text-right">
                <div className="relative inline-block">
                    <button onClick={() => setMenuOpen(v => !v)}
                        className="p-1.5 rounded-lg text-[#4A5568] hover:text-white hover:bg-[#1A2236] border border-transparent hover:border-[#1E2D4580] transition-all">
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                    <AnimatePresence>
                        {menuOpen && (
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                className="absolute right-0 top-8 z-50 w-44 bg-[#111827] border border-[#1E2D4580] rounded-xl shadow-2xl overflow-hidden">
                                {[
                                    { icon: Eye, label: 'View Profile', action: 'view' },
                                    { icon: Edit, label: 'Edit Role', action: 'edit' },
                                    { icon: user.status === 'suspended' ? CheckCircle : AlertTriangle, label: user.status === 'suspended' ? 'Reactivate' : 'Suspend', action: 'toggle', danger: user.status !== 'suspended' },
                                    { icon: Trash2, label: 'Delete User', action: 'delete', danger: true },
                                ].map(item => (
                                    <button key={item.label}
                                        onClick={() => { onAction(user.id, item.action); setMenuOpen(false); }}
                                        className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-xs font-medium transition-colors ${item.danger ? 'text-red-400 hover:bg-red-500/10' : 'text-[#CBD5E1] hover:bg-[#1A2236]'}`}>
                                        <item.icon className="w-3.5 h-3.5 flex-shrink-0" />
                                        {item.label}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </td>
        </motion.tr>
    );
}

/* ── Invite Modal ── */
function InviteModal({ onClose }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('patient');
    const [department, setDepartment] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleSend = async () => {
        if (!name || !email) return;
        setIsSending(true);
        try {
            await addDoc(collection(db, 'users'), {
                displayName: name,
                name: name,
                email: email,
                role: role,
                status: 'pending',
                department: department || '—',
                hospital: role === 'doctor' || role === 'clinical' ? 'Central General Hospital' : '—',
                lastActive: 'Never',
                joined: new Date().toISOString().split('T')[0]
            });
            toast.success(`Invite dispatched to ${email}`);
        } catch (error) {
            console.error('Error inviting user:', error);
            toast.error('Failed to dispatch user invite');
        }
        setIsSending(false);
        onClose();
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && onClose()}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="bg-[#111827] border border-[#00C8D4]/30 rounded-2xl p-8 w-full max-w-md shadow-[0_0_60px_rgba(0,200,212,0.1)]">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-[#00C8D4]/10 border border-[#00C8D4]/20 flex items-center justify-center">
                        <Plus className="w-5 h-5 text-[#00C8D4]" />
                    </div>
                    <div>
                        <h3 className="text-lg font-display font-bold text-white">Invite User</h3>
                        <p className="text-xs text-[#8899AA]">Send a secure platform invite</p>
                    </div>
                </div>
                <div className="space-y-4">
                    {[
                        { label: 'Full Name', value: name, set: setName, placeholder: 'Dr. Jane Smith', icon: User },
                        { label: 'Email Address', value: email, set: setEmail, placeholder: 'jane@hospital.com', icon: Mail },
                        { label: 'Department', value: department, set: setDepartment, placeholder: 'Cardiology', icon: Building2 },
                    ].map(f => (
                        <div key={f.label}>
                            <label className="text-[11px] font-bold text-[#8899AA] uppercase tracking-wider block mb-1.5">{f.label}</label>
                            <div className="relative">
                                <f.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A5568]" />
                                <input value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
                                    className="w-full bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#4A5568] focus:outline-none focus:border-[#00C8D4]/40 transition-colors" />
                            </div>
                        </div>
                    ))}
                    <div>
                        <label className="text-[11px] font-bold text-[#8899AA] uppercase tracking-wider block mb-1.5">Role</label>
                        <select value={role} onChange={e => setRole(e.target.value)}
                            className="w-full bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00C8D4]/40 transition-colors">
                            {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex gap-3 mt-6">
                    <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#1E2D4580] text-[#8899AA] text-sm font-bold hover:text-white transition-colors">Cancel</button>
                    <button onClick={handleSend} disabled={isSending || !name || !email}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#00C8D4] hover:bg-[#00E5F0] text-[#0B0F1A] font-bold text-sm shadow-[0_0_20px_rgba(0,200,212,0.25)] disabled:opacity-50 transition-all">
                        {isSending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                        {isSending ? 'Sending...' : 'Send Invite'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

/* ── Edit Role Modal ── */
function EditRoleModal({ user, onClose, onSave }) {
    const [role, setRole] = useState(user.role || 'patient');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        await onSave(user.id, role);
        setIsSaving(false);
        onClose();
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && onClose()}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="bg-[#111827] border border-[#00C8D4]/30 rounded-2xl p-8 w-full max-w-md shadow-[0_0_60px_rgba(0,200,212,0.1)]">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-display font-bold text-white">Modify User Role</h3>
                        <p className="text-xs text-[#8899AA]">Change platform permissions for this user</p>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-[#0B0F1A] border border-slate-800 flex items-center gap-3">
                        <Avatar name={user.name} />
                        <div>
                            <p className="text-sm font-semibold text-white">{user.name}</p>
                            <p className="text-[11px] text-slate-500 font-mono">{user.email}</p>
                        </div>
                    </div>
                    <div>
                        <label className="text-[11px] font-bold text-[#8899AA] uppercase tracking-wider block mb-1.5">Select Role</label>
                        <select value={role} onChange={e => setRole(e.target.value)}
                            className="w-full bg-[#0B0F1A] border border-[#1E2D4580] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00C8D4]/40 transition-colors">
                            <option value="patient">Patient</option>
                            <option value="doctor">Doctor</option>
                            <option value="clinical">Clinical Staff</option>
                            <option value="admin">Administrator</option>
                        </select>
                    </div>
                    <div className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10 text-[10px] text-amber-500 leading-relaxed">
                        <strong>Warning:</strong> Changing user roles will update database access permissions.
                    </div>
                </div>
                <div className="flex gap-3 mt-6">
                    <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#1E2D4580] text-[#8899AA] text-sm font-bold hover:text-white transition-colors">Cancel</button>
                    <button onClick={handleSave} disabled={isSaving}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#00C8D4] hover:bg-[#00E5F0] text-[#0B0F1A] font-bold text-sm shadow-[0_0_20px_rgba(0,200,212,0.25)] disabled:opacity-50 transition-all">
                        {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        {isSaving ? 'Updating...' : 'Save Role'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

/* ── MAIN USER & DOCTOR APPROVAL COMPONENT ── */
export default function UserManagementPage({ defaultTab = 'doctor-requests' }) {
    const [activeTab, setActiveTab] = useState(defaultTab);
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showInvite, setShowInvite] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    // Doctor Requests State
    const [doctorRequests, setDoctorRequests] = useState([]);
    const [isFetchingRequests, setIsFetchingRequests] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [doctorStatusFilter, setDoctorStatusFilter] = useState('all');
    const [doctorSearch, setDoctorSearch] = useState('');

    // Fetch Doctor Approval Requests from Neon PostgreSQL Backend
    const fetchDoctorRequests = useCallback(async () => {
        try {
            setIsFetchingRequests(true);
            const res = await apiClient.get('/admin/doctor-requests');
            if (res?.success && Array.isArray(res?.requests)) {
                setDoctorRequests(res.requests);
            }
        } catch (err) {
            console.warn('[Admin Doctor Requests Notice]:', err.message);
        } finally {
            setIsFetchingRequests(false);
        }
    }, []);

    useEffect(() => {
        fetchDoctorRequests();
    }, [fetchDoctorRequests]);

    // Handle Doctor Approval
    const handleApproveDoctor = async (requestId, doctorName) => {
        try {
            setActionLoadingId(requestId);
            const res = await apiClient.post(`/admin/doctor-requests/${requestId}/approve`);
            if (res?.success) {
                toast.success(res.message || `Dr. ${doctorName || 'Doctor'} approved successfully!`);
                // Optimistic update
                setDoctorRequests(prev => prev.map(r => 
                    (r.userId === requestId || r.doctorId === requestId)
                        ? { ...r, status: 'active', approvedAt: new Date().toISOString() }
                        : r
                ));
            } else {
                toast.error(res?.message || 'Failed to approve doctor.');
            }
        } catch (err) {
            toast.error(err.message || 'Error executing approval action.');
        } finally {
            setActionLoadingId(null);
        }
    };

    // Handle Doctor Rejection
    const handleRejectDoctor = async (requestId, doctorName) => {
        try {
            setActionLoadingId(requestId);
            const res = await apiClient.post(`/admin/doctor-requests/${requestId}/reject`, {
                reason: 'Verification declined by administrator'
            });
            if (res?.success) {
                toast.info(res.message || `Dr. ${doctorName || 'Doctor'} registration rejected.`);
                // Optimistic update
                setDoctorRequests(prev => prev.map(r => 
                    (r.userId === requestId || r.doctorId === requestId)
                        ? { ...r, status: 'rejected', rejectedAt: new Date().toISOString() }
                        : r
                ));
            } else {
                toast.error(res?.message || 'Failed to reject doctor.');
            }
        } catch (err) {
            toast.error(err.message || 'Error executing rejection action.');
        } finally {
            setActionLoadingId(null);
        }
    };

    // Realtime Firestore Users Listener
    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
            const list = snapshot.docs.map(docSnap => {
                const data = docSnap.data();
                return {
                    id: docSnap.id,
                    name: data.displayName || data.name || 'Unknown User',
                    email: data.email || '—',
                    role: data.role || 'patient',
                    status: data.status || 'active',
                    department: data.department || '—',
                    hospital: data.hospital || '—',
                    lastActive: data.lastActive || 'Never',
                    joined: data.joined || '—'
                };
            });
            setUsers(list);
        }, (err) => console.warn('Error fetching users:', err));
        return unsub;
    }, []);

    const handleSaveRole = async (userId, newRole) => {
        try {
            const user = users.find(u => u.id === userId);
            const oldRole = user?.role || 'patient';
            
            const updatePayload = { role: newRole };
            if (user?.status === 'pending') {
                updatePayload.status = 'active';
            }

            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, updatePayload);

            toast.success(`Successfully updated role for ${user?.name || 'User'}`);
        } catch (error) {
            console.error('Error updating user role:', error);
            toast.error(error.message || 'Failed to update user role');
        }
    };

    const handleAction = async (userId, action) => {
        if (action === 'toggle') {
            const user = users.find(u => u.id === userId);
            if (user) {
                const newStatus = user.status === 'suspended' ? 'active' : 'suspended';
                try {
                    await updateDoc(doc(db, 'users', userId), { status: newStatus });
                } catch (error) {
                    console.error('Error toggling user status in Firestore:', error);
                }
            }
        } else if (action === 'delete') {
            try {
                await deleteDoc(doc(db, 'users', userId));
            } catch (error) {
                console.error('Error deleting user from Firestore:', error);
            }
        } else if (action === 'edit') {
            const user = users.find(u => u.id === userId);
            if (user) {
                setEditingUser(user);
            }
        }
    };

    // Filter Doctor Requests
    const filteredDoctorRequests = doctorRequests.filter(req => {
        const query = doctorSearch.toLowerCase();
        const matchSearch = 
            (req.name || '').toLowerCase().includes(query) ||
            (req.email || '').toLowerCase().includes(query) ||
            (req.specialty || '').toLowerCase().includes(query) ||
            (req.licenseNumber || '').toLowerCase().includes(query) ||
            (req.hospitalName || '').toLowerCase().includes(query);
        const matchStatus = doctorStatusFilter === 'all' || req.status === doctorStatusFilter;
        return matchSearch && matchStatus;
    });

    // Filter Directory Users
    const filteredUsers = users.filter(u => {
        const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
        const matchRole = roleFilter === 'all' || u.role === roleFilter;
        const matchStatus = statusFilter === 'all' || u.status === statusFilter;
        return matchSearch && matchRole && matchStatus;
    });

    const pendingCount = doctorRequests.filter(r => r.status === 'pending').length;
    const approvedCount = doctorRequests.filter(r => r.status === 'active').length;
    const rejectedCount = doctorRequests.filter(r => r.status === 'rejected').length;

    return (
        <div className="space-y-6 pb-12">
            <AnimatePresence>{showInvite && <InviteModal onClose={() => setShowInvite(false)} />}</AnimatePresence>
            <AnimatePresence>
                {editingUser && (
                    <EditRoleModal 
                        user={editingUser} 
                        onClose={() => setEditingUser(null)} 
                        onSave={handleSaveRole} 
                    />
                )}
            </AnimatePresence>

            {/* Header & Tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <ShieldCheck className="w-4 h-4 text-cyan-400" />
                        <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Enterprise Administration</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
                        Identity, Approvals & Access Control
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                        Authoritative management for doctor verification requests, hospital staff, and patient roles.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            if (activeTab === 'doctor-requests') fetchDoctorRequests();
                        }}
                        className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white transition-all flex items-center gap-2 text-xs"
                        title="Refresh Data"
                    >
                        <RefreshCw className={`w-4 h-4 ${isFetchingRequests ? 'animate-spin text-cyan-400' : ''}`} />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>

                    <button
                        onClick={() => setShowInvite(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Invite Staff</span>
                    </button>
                </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex items-center gap-2 bg-[#0B1120] p-1.5 rounded-xl border border-white/[0.06] w-fit">
                <button
                    onClick={() => setActiveTab('doctor-requests')}
                    className={`flex items-center gap-2.5 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                        activeTab === 'doctor-requests'
                            ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
                    }`}
                >
                    <Stethoscope className="w-4 h-4" />
                    <span>Doctor Approval Requests</span>
                    {pendingCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-black animate-pulse font-mono">
                            {pendingCount} Pending
                        </span>
                    )}
                </button>

                <button
                    onClick={() => setActiveTab('users')}
                    className={`flex items-center gap-2.5 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                        activeTab === 'users'
                            ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
                    }`}
                >
                    <Users className="w-4 h-4" />
                    <span>Platform User Directory</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/[0.08] text-slate-300 font-mono">
                        {users.length}
                    </span>
                </button>
            </div>

            {/* ========================================================================= */}
            {/* TAB 1: DOCTOR APPROVAL REQUESTS                                          */}
            {/* ========================================================================= */}
            {activeTab === 'doctor-requests' && (
                <div className="space-y-6">
                    {/* Doctor Request KPIs */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-[#0B1120] border border-amber-500/20 rounded-2xl p-5 relative overflow-hidden">
                            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-3">
                                <Clock className="w-4 h-4 text-amber-400" />
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Awaiting Approval</p>
                            <p className="text-2xl font-display font-bold text-amber-400">{pendingCount}</p>
                            <span className="absolute -right-2 -bottom-2 w-16 h-16 bg-amber-500/[0.04] rounded-full blur-xl pointer-events-none" />
                        </div>

                        <div className="bg-[#0B1120] border border-emerald-500/20 rounded-2xl p-5 relative overflow-hidden">
                            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Approved Doctors</p>
                            <p className="text-2xl font-display font-bold text-emerald-400">{approvedCount}</p>
                            <span className="absolute -right-2 -bottom-2 w-16 h-16 bg-emerald-500/[0.04] rounded-full blur-xl pointer-events-none" />
                        </div>

                        <div className="bg-[#0B1120] border border-rose-500/20 rounded-2xl p-5 relative overflow-hidden">
                            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-3">
                                <XCircle className="w-4 h-4 text-rose-400" />
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Declined Requests</p>
                            <p className="text-2xl font-display font-bold text-rose-400">{rejectedCount}</p>
                        </div>

                        <div className="bg-[#0B1120] border border-cyan-500/20 rounded-2xl p-5 relative overflow-hidden">
                            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-3">
                                <Stethoscope className="w-4 h-4 text-cyan-400" />
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Total Doctor Nodes</p>
                            <p className="text-2xl font-display font-bold text-cyan-400">{doctorRequests.length}</p>
                        </div>
                    </div>

                    {/* Filters & Search */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                value={doctorSearch}
                                onChange={e => setDoctorSearch(e.target.value)}
                                placeholder="Search by doctor name, email, license number, specialty, or hospital..."
                                className="w-full bg-[#0B1120] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/40 transition-colors"
                            />
                        </div>
                        <select
                            value={doctorStatusFilter}
                            onChange={e => setDoctorStatusFilter(e.target.value)}
                            className="bg-[#0B1120] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500/40"
                        >
                            <option value="all">All Statuses ({doctorRequests.length})</option>
                            <option value="pending">Pending Approval ({pendingCount})</option>
                            <option value="active">Approved & Active ({approvedCount})</option>
                            <option value="rejected">Rejected ({rejectedCount})</option>
                        </select>
                    </div>

                    {/* Doctor Requests Table */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#0B1120] border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl"
                    >
                        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.01]">
                            <div className="flex items-center gap-2">
                                <Stethoscope className="w-4 h-4 text-amber-400" />
                                <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider font-display">
                                    Doctor Verification Queue
                                </h3>
                                <span className="px-2 py-0.5 rounded text-[10px] bg-white/[0.06] text-slate-300 font-mono">
                                    {filteredDoctorRequests.length}
                                </span>
                            </div>

                            <span className="text-[11px] text-slate-400 font-mono">
                                Neon PostgreSQL Authoritative Status
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/[0.06] bg-[#070C18]/60 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                                        <th className="px-5 py-3.5">Doctor Identity</th>
                                        <th className="px-5 py-3.5">Specialty & License</th>
                                        <th className="px-5 py-3.5 hidden md:table-cell">Hospital</th>
                                        <th className="px-5 py-3.5">Status</th>
                                        <th className="px-5 py-3.5 hidden lg:table-cell">Registered</th>
                                        <th className="px-5 py-3.5 text-right">Verification Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.04]">
                                    {filteredDoctorRequests.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-5 py-16 text-center text-slate-500 text-xs sm:text-sm">
                                                {isFetchingRequests ? (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                                                        <span>Loading verification requests from database...</span>
                                                    </div>
                                                ) : (
                                                    'No doctor requests found matching the current filter.'
                                                )}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredDoctorRequests.map(docReq => {
                                            const reqId = docReq.userId || docReq.doctorId;
                                            const isLoadingAction = actionLoadingId === reqId;

                                            return (
                                                <tr key={reqId} className="hover:bg-white/[0.02] transition-colors group">
                                                    {/* Doctor Identity */}
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar name={docReq.name} />
                                                            <div>
                                                                <p className="text-xs sm:text-sm font-semibold text-white group-hover:text-amber-300 transition-colors">
                                                                    {docReq.name}
                                                                </p>
                                                                <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                                                                    <Mail className="w-3 h-3 text-slate-500" />
                                                                    {docReq.email}
                                                                </p>
                                                                {docReq.phone && (
                                                                    <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                                                                        <Phone className="w-2.5 h-2.5" />
                                                                        {docReq.phone}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Specialty & License */}
                                                    <td className="px-5 py-4">
                                                        <span className="text-xs font-medium text-white block">
                                                            {docReq.specialty || 'General Medicine'}
                                                        </span>
                                                        <span className="inline-block mt-1 px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-[10px] text-slate-300 font-mono">
                                                            {docReq.licenseNumber || 'License In Review'}
                                                        </span>
                                                    </td>

                                                    {/* Hospital */}
                                                    <td className="px-5 py-4 hidden md:table-cell">
                                                        <div className="flex items-center gap-1.5 text-xs text-slate-300">
                                                            <Building2 className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                                                            <span>{docReq.hospitalName || 'Central General Hospital'}</span>
                                                        </div>
                                                    </td>

                                                    {/* Status Badge */}
                                                    <td className="px-5 py-4">
                                                        <StatusBadge status={docReq.status || 'pending'} />
                                                    </td>

                                                    {/* Registered Date */}
                                                    <td className="px-5 py-4 hidden lg:table-cell">
                                                        <span className="text-xs text-slate-400 font-mono">
                                                            {docReq.createdAt ? new Date(docReq.createdAt).toLocaleDateString() : 'Recent'}
                                                        </span>
                                                    </td>

                                                    {/* Action Buttons */}
                                                    <td className="px-5 py-4 text-right">
                                                        {docReq.status === 'pending' ? (
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    onClick={() => handleApproveDoctor(reqId, docReq.name)}
                                                                    disabled={isLoadingAction}
                                                                    className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm shadow-emerald-500/20 disabled:opacity-50"
                                                                >
                                                                    {isLoadingAction ? (
                                                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                                    ) : (
                                                                        <Check className="w-3.5 h-3.5" />
                                                                    )}
                                                                    <span>Approve</span>
                                                                </button>

                                                                <button
                                                                    onClick={() => handleRejectDoctor(reqId, docReq.name)}
                                                                    disabled={isLoadingAction}
                                                                    className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-medium text-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
                                                                >
                                                                    <X className="w-3.5 h-3.5" />
                                                                    <span>Reject</span>
                                                                </button>
                                                            </div>
                                                        ) : docReq.status === 'active' ? (
                                                            <div className="flex items-center justify-end gap-2">
                                                                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Active
                                                                </span>
                                                                <button
                                                                    onClick={() => handleRejectDoctor(reqId, docReq.name)}
                                                                    disabled={isLoadingAction}
                                                                    className="text-[10px] text-slate-500 hover:text-rose-400 p-1 transition-colors"
                                                                    title="Revoke / Reject Account"
                                                                >
                                                                    Revoke
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center justify-end gap-2">
                                                                <span className="text-[11px] text-rose-400 font-semibold flex items-center gap-1">
                                                                    <XCircle className="w-3.5 h-3.5" /> Rejected
                                                                </span>
                                                                <button
                                                                    onClick={() => handleApproveDoctor(reqId, docReq.name)}
                                                                    disabled={isLoadingAction}
                                                                    className="text-[10px] text-slate-500 hover:text-emerald-400 p-1 transition-colors"
                                                                    title="Re-Approve Account"
                                                                >
                                                                    Re-Approve
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 2: PLATFORM USER DIRECTORY (FIRESTORE & ALL ROLES)                     */}
            {/* ========================================================================= */}
            {activeTab === 'users' && (
                <div className="space-y-6">
                    {/* KPIs */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Total Users', value: users.length, icon: Users, color: 'text-[#00C8D4]', bg: 'bg-[#00C8D4]/10', border: 'border-[#00C8D4]/20' },
                            { label: 'Doctors', value: users.filter(u => u.role === 'doctor').length, icon: Stethoscope, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
                            { label: 'Active', value: users.filter(u => u.status === 'active').length, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
                            { label: 'Suspended', value: users.filter(u => u.status === 'suspended').length, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
                        ].map((k, i) => (
                            <motion.div key={k.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                                className={`bg-[#0B1120] border ${k.border} rounded-2xl p-5`}>
                                <div className={`w-9 h-9 rounded-xl ${k.bg} border ${k.border} flex items-center justify-center mb-3`}>
                                    <k.icon className={`w-4 h-4 ${k.color}`} />
                                </div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">{k.label}</p>
                                <p className={`text-2xl font-display font-bold ${k.color}`}>{k.value}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users by name or email..."
                                className="w-full bg-[#0B1120] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/40 transition-colors" />
                        </div>
                        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
                            className="bg-[#0B1120] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500/40">
                            <option value="all">All Roles</option>
                            {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                            className="bg-[#0B1120] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500/40">
                            <option value="all">All Statuses</option>
                            {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                    </div>

                    {/* Table */}
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-[#0B1120] border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl">
                        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.01]">
                            <h3 className="text-xs sm:text-sm font-bold text-white font-display uppercase tracking-wider flex items-center gap-2">
                                <Activity className="w-4 h-4 text-cyan-400" /> All Platform Users
                                <span className="px-2 py-0.5 rounded text-[10px] bg-[#1A2236] text-slate-400 font-mono">{filteredUsers.length}</span>
                            </h3>
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Live</span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/[0.06] bg-[#070C18]/60 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                                        {['User', 'Role', 'Status', 'Department', 'Last Active', ''].map(h => (
                                            <th key={h} className="px-5 py-3 text-left">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.length === 0 ? (
                                        <tr><td colSpan={6} className="px-5 py-16 text-center text-slate-500 text-sm">No users match your filters</td></tr>
                                    ) : (
                                        filteredUsers.map(u => <UserRow key={u.id} user={u} onAction={handleAction} />)
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
