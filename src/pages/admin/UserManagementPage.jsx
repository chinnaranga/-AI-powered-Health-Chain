import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Search, Filter, Plus, Shield, CheckCircle,
    AlertTriangle, XCircle, MoreHorizontal, ChevronDown,
    User, Mail, Building2, Clock, Trash2, Edit, LogOut,
    RefreshCw, Eye, BadgeCheck, Stethoscope, Activity
} from 'lucide-react';
import { db } from '../../firebase/config';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from '../../components/Toast';

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
        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${status === 'active' ? 'animate-pulse' : ''}`} />
            {cfg.label}
        </span>
    );
}

function Avatar({ name }) {
    const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const colors = ['from-[#00C8D4] to-blue-600', 'from-purple-500 to-indigo-600', 'from-amber-500 to-orange-600', 'from-emerald-500 to-teal-600', 'from-red-500 to-pink-600'];
    const colorIdx = name.charCodeAt(0) % colors.length;
    return (
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${colors[colorIdx]} flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}>
            {initials}
        </div>
    );
}

/* ── User Row ── */
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
                hospital: role === 'doctor' || role === 'clinical' ? 'Apollo Hospital' : '—',
                lastActive: 'Never',
                joined: new Date().toISOString().split('T')[0]
            });
        } catch (error) {
            console.error('Error inviting user:', error);
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
                        <strong>Warning:</strong> Changing user roles will immediately override their dashboard authorization and redirect their active session to the corresponding view upon page refresh.
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

/* ── PAGE ── */
export default function UserManagementPage() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showInvite, setShowInvite] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

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

            // Add audit log entry
            await addDoc(collection(db, 'auditLogs'), {
                activityType: 'USER_ROLE_MODIFIED',
                timestamp: serverTimestamp(),
                userId: 'admin_console',
                txHash: '0x' + Math.random().toString(16).substring(2, 10),
                region: 'us-east',
                details: {
                    targetUserId: userId,
                    targetUserEmail: user?.email || '',
                    fromRole: oldRole,
                    toRole: newRole,
                    modifiedBy: 'admin_user_management'
                }
            });

            toast.success(`Successfully updated role for ${user?.name || 'User'}`);
        } catch (error) {
            console.error('Error updating user role:', error);
            toast.error(error.message || 'Failed to update user role');
        }
    };

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

    const filtered = users.filter(u => {
        const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
        const matchRole = roleFilter === 'all' || u.role === roleFilter;
        const matchStatus = statusFilter === 'all' || u.status === statusFilter;
        return matchSearch && matchRole && matchStatus;
    });

    const kpis = [
        { label: 'Total Users', value: users.length, icon: Users, color: 'text-[#00C8D4]', bg: 'bg-[#00C8D4]/10', border: 'border-[#00C8D4]/20' },
        { label: 'Doctors', value: users.filter(u => u.role === 'doctor').length, icon: Stethoscope, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
        { label: 'Active', value: users.filter(u => u.status === 'active').length, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
        { label: 'Suspended', value: users.filter(u => u.status === 'suspended').length, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    ];

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

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-cyan-400" />
                        <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Identity & Access</span>
                    </div>
                    <h1 className="text-3xl font-display font-bold text-white">User & Role Management</h1>
                    <p className="text-sm text-slate-400 mt-1">Manage all platform users, roles, and permissions.</p>
                </div>
                <button onClick={() => setShowInvite(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#0B0F1A] font-bold text-sm shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all">
                    <Plus className="w-4 h-4" /> Invite User
                </button>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((k, i) => (
                    <motion.div key={k.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                        className={`bg-[#111827] border ${k.border} rounded-2xl p-5`}>
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
                        className="w-full bg-[#111827] border border-[#1E2D4580] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/40 transition-colors" />
                </div>
                <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
                    className="bg-[#111827] border border-[#1E2D4580] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/40">
                    <option value="all">All Roles</option>
                    {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                    className="bg-[#111827] border border-[#1E2D4580] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/40">
                    <option value="all">All Statuses</option>
                    {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
            </div>

            {/* Table */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="bg-[#111827] border border-[#1E2D4580] rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-[#1E2D4580] flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider flex items-center gap-2">
                        <Activity className="w-4 h-4 text-cyan-400" /> All Users
                        <span className="px-2 py-0.5 rounded text-[10px] bg-[#1A2236] text-slate-400 font-mono">{filtered.length}</span>
                    </h3>
                    <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Live</span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#1E2D4580] bg-[#0B0F1A]/50">
                                {['User', 'Role', 'Status', 'Department', 'Last Active', ''].map(h => (
                                    <th key={h} className="px-5 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={6} className="px-5 py-16 text-center text-slate-500 text-sm">No users match your filters</td></tr>
                            ) : (
                                filtered.map(u => <UserRow key={u.id} user={u} onAction={handleAction} />)
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
}
