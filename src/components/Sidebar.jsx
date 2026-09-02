import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, FileText, Shield, Activity, Settings, LogOut,
    Users, BarChart3, Boxes, ChevronLeft, ChevronRight, Stethoscope,
    Brain, Cpu, CheckCircle, Zap, Eye, AlertTriangle, Bell, HelpCircle,
    GitBranch, HeartPulse, Heart, Building2, BadgeCheck, Download, ShieldCheck,
    MessageSquare, Lock, User, Calendar, Pill, UserPlus, FileArchive, Share2, Sliders, Terminal,
    CloudUpload, ChevronDown, Key
} from 'lucide-react';
import { useState, useEffect, lazy, Suspense } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { useTranslation } from 'react-i18next';
import { auth } from '../firebase/config';
import useAuthStore from '../store/authStore';
import { FEATURES } from '../config/features';

const ComingSoonModal = lazy(() => import('./ComingSoonModal'));
const UploadModal = lazy(() => import('./UploadModal'));

const patientNavItems = [
    // CORE PATIENT MODULES (Phase 1)
    { to: 'dashboard', icon: LayoutDashboard, label: 'Patient Dashboard', section: 'CORE', isAlwaysActive: true },
    { to: 'profile', icon: User, label: 'Profile & Identity', section: 'CORE', isAlwaysActive: true },
    { to: 'medical-records', icon: FileText, label: 'Medical Records', section: 'CORE', isAlwaysActive: true },
    { to: 'appointments', icon: Calendar, label: 'Appointments', section: 'CORE', isAlwaysActive: true },
    { to: 'prescriptions', icon: HeartPulse, label: 'Prescriptions', section: 'CORE', isAlwaysActive: true },
    { to: 'lab-reports', icon: Activity, label: 'Laboratory & Imaging', section: 'CORE', isAlwaysActive: true },
    { to: 'ai-assistant', icon: Brain, label: 'AI Assistant', section: 'CORE', isAlwaysActive: true },

    // PATIENT SERVICES (Phase 2)
    { to: 'messages', icon: MessageSquare, label: 'Secure Messages', section: 'SERVICES', isAlwaysActive: true },
    { to: 'referrals', icon: GitBranch, label: 'Specialist Referrals', section: 'SERVICES', isAlwaysActive: true },
    { to: 'care-plans', icon: CheckCircle, label: 'Care Plans', section: 'SERVICES', isAlwaysActive: true },
    { to: 'medication-adherence', icon: Pill, label: 'Medication Adherence', section: 'SERVICES', isAlwaysActive: true },
    { to: 'vaccinations', icon: ShieldCheck, label: 'Vaccination History', section: 'SERVICES', isAlwaysActive: true },
    { to: 'vital-signs', icon: Heart, label: 'Vital Signs', section: 'SERVICES', isAlwaysActive: true },
    { to: 'wearables', icon: Cpu, label: 'Wearables Integration', section: 'SERVICES', isAlwaysActive: true },
    { to: 'support', icon: HelpCircle, label: 'Support Center', section: 'SERVICES', isAlwaysActive: true },

    // SECURITY & COMPLIANCE
    { to: 'settings', icon: Settings, label: 'Settings & Security', section: 'SECURITY', isAlwaysActive: true },
    { to: 'access-control', icon: Shield, label: 'Access Control', section: 'SECURITY', isAlwaysActive: true },
    { to: 'emergency-access', icon: AlertTriangle, label: 'Emergency Access', section: 'SECURITY', isAlwaysActive: true },
    { to: 'blockchain-logs', icon: GitBranch, label: 'Blockchain Logs', section: 'SECURITY', isAlwaysActive: true },
];

const doctorNavItems = [
    // CORE section
    { to: '', icon: LayoutDashboard, label: 'Dashboard', section: 'CORE', end: true, isAlwaysActive: true },
    { to: '/doctor/ai', icon: Brain, label: 'AI Assistant', section: 'CORE', isAlwaysActive: true },
    { to: 'records', icon: FileText, label: 'Patient Records', section: 'CORE', isAlwaysActive: true },
    { to: 'viewer', icon: Eye, label: 'Record Viewer', section: 'CORE', isAlwaysActive: true },

    // Gated Core items
    { to: 'ai-summary', icon: Brain, label: 'AI Medical Summary', section: 'CORE', featureKey: 'aiSummary' },
    { to: 'timeline', icon: GitBranch, label: 'Smart Timeline', section: 'CORE', featureKey: 'timeline' },
    { to: 'health-analytics', icon: HeartPulse, label: 'Health Analytics', section: 'CORE', featureKey: 'healthAnalytics' },
    { to: 'hospital-sim', icon: Building2, label: 'Hospital Simulation', section: 'CORE', featureKey: 'hospitalSim' },
    { to: 'notifications', icon: Bell, label: 'Notifications', section: 'CORE', featureKey: 'notifications', hasBadge: true },
    { to: 'referrals', icon: GitBranch, label: 'Specialist Referrals', section: 'CORE', featureKey: 'referrals' },
    { to: 'prescriptions', icon: HeartPulse, label: 'e-Prescriptions', section: 'CORE', featureKey: 'prescriptions' },
    { to: 'lab-results', icon: Activity, label: 'Lab & Imaging', section: 'CORE', featureKey: 'labResults' },
    { to: 'messages', icon: MessageSquare, label: 'Secure Messages', section: 'CORE', featureKey: 'messages' },
    { to: 'appointments', icon: Calendar, label: 'Appointments', section: 'CORE', featureKey: 'appointments' },
    { to: 'medication-adherence', icon: Pill, label: 'Medication Adherence', section: 'CORE', featureKey: 'medicationAdherence' },
    { to: 'support', icon: HelpCircle, label: 'Support & Help', section: 'CORE', featureKey: 'support' },
    { to: 'providers', icon: Users, label: 'Provider Directory', section: 'CORE', featureKey: 'providers' },
    { to: 'care-plan', icon: CheckCircle, label: 'Care Plan & Follow-Up', section: 'CORE', featureKey: 'carePlan' },
    { to: 'vitals', icon: Activity, label: 'Vital Signs & Trends', section: 'CORE', featureKey: 'vitals' },
    { to: 'discharge', icon: FileText, label: 'Discharge Summary', section: 'CORE', featureKey: 'discharge' },
    { to: 'vaccinations', icon: ShieldCheck, label: 'Vaccination History', section: 'CORE', featureKey: 'vaccinations' },
    { to: 'wearables', icon: Cpu, label: 'Wearables Monitoring', section: 'CORE', featureKey: 'wearables' },
    { to: 'lifestyle', icon: HeartPulse, label: 'Goals & Lifestyle', section: 'CORE', featureKey: 'lifestyle' },
    { to: 'onboarding', icon: UserPlus, label: 'Onboarding & ID', section: 'CORE', featureKey: 'onboarding' },
    { to: 'reports-center', icon: FileArchive, label: 'Reports & Evidence', section: 'CORE', featureKey: 'reportsCenter' },
    { to: 'help-center', icon: HelpCircle, label: 'Support & Feedback', section: 'CORE', featureKey: 'helpCenter' },
    { to: 'demo', icon: Terminal, label: 'Demo Controls', section: 'CORE', featureKey: 'demo' },
    { to: 'reports', icon: Download, label: 'Reports & Export', section: 'CORE', featureKey: 'reportsExport' },
    { to: 'workspace', icon: MessageSquare, label: 'Team Workspace', section: 'CORE', featureKey: 'teamWorkspace' },

    // SECURITY section
    { to: 'access', icon: CheckCircle, label: 'Access Requests', section: 'SECURITY', isAlwaysActive: true },
    { to: 'patient-access', icon: Lock, label: 'Secure Access', section: 'SECURITY', isAlwaysActive: true },
    { to: 'logs', icon: Activity, label: 'Audit Trail', section: 'SECURITY', isAlwaysActive: true },
    { to: 'analytics', icon: BarChart3, label: 'Analytics', section: 'SECURITY', isAlwaysActive: true },
    { to: 'settings', icon: Settings, label: 'Settings', section: 'SECURITY', isAlwaysActive: true },

    // Gated Security items
    { to: 'security', icon: ShieldCheck, label: 'Security & Settings', section: 'SECURITY', featureKey: 'preferences' },
    { to: 'abha', icon: BadgeCheck, label: 'ABHA / ABDM Flow', section: 'SECURITY', featureKey: 'abha' },
    { to: 'insurance-coverage', icon: ShieldCheck, label: 'Insurance & Coverage', section: 'SECURITY', featureKey: 'insuranceCoverage' },
    { to: 'document-vault', icon: Lock, label: 'Document Vault', section: 'SECURITY', featureKey: 'documentVault' },
    { to: 'caregivers', icon: Users, label: 'Caregiver Access', section: 'SECURITY', featureKey: 'caregivers' },
    { to: 'sharing', icon: Share2, label: 'Secure Sharing', section: 'SECURITY', featureKey: 'sharing' },
    { to: 'preferences', icon: Sliders, label: 'Preferences & Security', section: 'SECURITY', featureKey: 'preferences' },
    { to: 'compliance', icon: Shield, label: 'Compliance', section: 'SECURITY', featureKey: 'compliance' }
];

const clinicalNavItems = [
    // CORE
    { to: '', icon: LayoutDashboard, label: 'Clinical Dashboard', section: 'CORE', end: true, isAlwaysActive: true },
    { to: '/clinical/ai', icon: Brain, label: 'AI Assistant', section: 'CORE', isAlwaysActive: true },
    { to: 'requests', icon: CheckCircle, label: 'Access Requests', section: 'CORE', isAlwaysActive: true },
    { to: 'create-patient', icon: UserPlus, label: 'Create Patient', section: 'CORE', isAlwaysActive: true },
    { to: 'records', icon: FileText, label: 'Patient Records', section: 'CORE', isAlwaysActive: true },
    { to: 'consent', icon: Key, label: 'Consent Sessions', section: 'CORE', isAlwaysActive: true },
    { to: 'viewer', icon: Eye, label: 'Clinical Viewer', section: 'CORE', isAlwaysActive: true },

    // OPERATIONS
    { to: 'logs', icon: Activity, label: 'Audit Trail', section: 'OPERATIONS', isAlwaysActive: true },
    { to: 'analytics', icon: BarChart3, label: 'Analytics', section: 'OPERATIONS', isAlwaysActive: true },
    { to: 'workspace', icon: Users, label: 'Team Workspace', section: 'OPERATIONS', featureKey: 'teamWorkspace' },
    { to: 'notifications', icon: Bell, label: 'Notifications', section: 'OPERATIONS', featureKey: 'notifications', hasBadge: true },

    // ACCOUNT
    { to: 'settings', icon: Settings, label: 'Settings', section: 'ACCOUNT', isAlwaysActive: true },

    // Gated/Hidden Items (these will not appear in the sidebar if feature flags are false)
    { to: 'referrals', icon: GitBranch, label: 'Referrals & Handoffs', section: 'OPERATIONS', featureKey: 'referrals' },
    { to: 'prescriptions', icon: HeartPulse, label: 'Manage Prescriptions', section: 'OPERATIONS', featureKey: 'prescriptions' },
    { to: 'lab-results', icon: Activity, label: 'Lab & Imaging Results', section: 'CORE', featureKey: 'labResults' },
    { to: 'messages', icon: MessageSquare, label: 'Secure Messages', section: 'OPERATIONS', featureKey: 'messages' },
    { to: 'appointments', icon: Calendar, label: 'Appointments', section: 'OPERATIONS', featureKey: 'appointments' },
    { to: 'reports', icon: Download, label: 'Reports & Export', section: 'OPERATIONS', featureKey: 'reportsExport' },
    { to: 'security', icon: Shield, label: 'Security & Settings', section: 'ACCOUNT', featureKey: 'preferences' },
    { to: 'compliance', icon: Shield, label: 'Compliance', section: 'OPERATIONS', featureKey: 'compliance' }
];

const navSections = {
    admin: [
        { to: '', icon: LayoutDashboard, label: 'Overview', end: true },
        { to: 'records', icon: Boxes, label: 'Network' },
        { to: 'access', icon: Shield, label: 'Contracts' },
        { to: 'logs', icon: Activity, label: 'Blockchain Logs' },
        { to: 'analytics', icon: BarChart3, label: 'Analytics' },
        { to: 'settings', icon: Settings, label: 'Settings' },
    ],
};

export default function Sidebar({ basePath = '/dashboard/patient', sidebarOpen, setSidebarOpen }) {
    const [collapsed, setCollapsed] = useState(false);
    const logout = useAuthStore(s => s.logout);
    const role = basePath.split('/').pop();
    const items = navSections[role] || [];
    const [firebaseUser, setFirebaseUser] = useState(null);

    // Feature gating and custom modals state
    const [soonOpen, setSoonOpen] = useState(false);
    const [selectedFeature, setSelectedFeature] = useState('');
    const [uploadOpen, setUploadOpen] = useState(false);
    const [futureCollapsed, setFutureCollapsed] = useState(true);

    const handleLinkClick = () => {
        if (setSidebarOpen) {
            setSidebarOpen(false);
        }
    };

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => setFirebaseUser(user));
        return () => unsub();
    }, []);

    const isDoctor = role === 'doctor' || role === 'clinical';

    const initials = firebaseUser?.displayName
        ? firebaseUser.displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        : role === 'doctor' ? 'DR' : role === 'clinical' ? 'CL' : 'HC';

    // Select correct navItems based on role
    const getNavItems = () => {
        if (role === 'patient') return patientNavItems;
        if (role === 'doctor') return doctorNavItems;
        if (role === 'clinical') return clinicalNavItems;
        return null;
    };
    const navItems = getNavItems();

    // Filters for role view
    const activeCore = navItems ? navItems.filter(item => item.section === 'CORE' && (item.isAlwaysActive || FEATURES[item.featureKey])) : [];
    const activeSecurity = navItems ? navItems.filter(item => item.section === 'SECURITY' && (item.isAlwaysActive || FEATURES[item.featureKey])) : [];
    const futureModules = navItems ? navItems.filter(item => !item.isAlwaysActive && !FEATURES[item.featureKey]) : [];

    const { t } = useTranslation();
    const triggerComingSoon = (featureName) => {
        setSelectedFeature(featureName);
        setSoonOpen(true);
    };

    const toCamelCase = (str) => str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

    const getTranslatedLabel = (item) => {
        if (item.translationKey) return t(item.translationKey);
        if (item.isAction && item.id) return t(`patient.${item.id}`);
        
        const sectionPrefix = role === 'clinical' ? 'clinical' : (role === 'doctor' ? 'doctor' : 'patient');
        
        // Remove leading slash if it is an absolute route like '/patient/ai'
        let cleanPath = item.to || '';
        if (cleanPath.startsWith('/')) {
            const parts = cleanPath.split('/').filter(Boolean);
            cleanPath = parts[parts.length - 1] || '';
        }
        
        const key = cleanPath ? toCamelCase(cleanPath) : 'dashboardTitle';
        const dictKey = `${sectionPrefix}.${key}`;
        
        const translated = t(dictKey);
        if (translated && translated !== dictKey) return translated;
        
        return item.label || t('common.overview');
    };

    const renderActiveItem = (item) => {
        const Icon = item.icon;

        if (item.isAction) {
            return (
                <button
                    key={item.label || item.id}
                    onClick={() => {
                        handleLinkClick();
                        if (item.id === 'upload') {
                            setUploadOpen(true);
                        }
                    }}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent group relative"
                >
                    <Icon className="w-[18px] h-[18px] flex-shrink-0 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                    {!collapsed && (
                        <span className="whitespace-nowrap overflow-hidden text-slate-400 group-hover:text-white transition-colors">
                            {getTranslatedLabel(item)}
                        </span>
                    )}
                </button>
            );
        }

        return (
            <NavLink
                key={item.label}
                to={item.to ? (item.to.startsWith('/') ? item.to : `${basePath}/${item.to}`) : basePath}
                end={item.end}
                onClick={handleLinkClick}
                className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative
                    ${isActive
                        ? 'bg-cyan-500/[0.08] text-cyan-400 border border-cyan-500/10'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
                    }`
                }
            >
                {({ isActive }) => (
                    <>
                        {isActive && (
                            <motion.div
                                layoutId="sidebar-active"
                                className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-cyan-400"
                                style={{ boxShadow: '0 0 8px rgba(6, 182, 212, 0.4)' }}
                            />
                        )}
                        <div className="flex items-center gap-3">
                            <Icon className={`w-[18px] h-[18px] flex-shrink-0 transition-colors duration-200 ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-white'
                                }`} />
                            {!collapsed && (
                                <span className="whitespace-nowrap overflow-hidden">
                                    {getTranslatedLabel(item)}
                                </span>
                            )}
                        </div>
                    </>
                )}
            </NavLink>
        );
    };

    return (
        <>
            <motion.aside
                animate={{ width: collapsed ? 72 : 260 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className={`h-screen border-r border-white/[0.06] flex flex-col fixed lg:sticky top-0 bottom-0 left-0 z-50 lg:z-30 overflow-hidden ${
                    isDoctor ? 'bg-navy-950' : 'bg-navy-950'
                } transition-transform duration-300 lg:transform-none ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}
            >
                {/* Header */}
                <div className="h-16 px-4 flex items-center justify-between border-b border-white/[0.06] flex-shrink-0">
                    <AnimatePresence mode="wait">
                        {!collapsed && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center gap-2.5"
                            >
                                <img src="/logo.svg" alt="HealthChain Logo" className="w-8 h-8 rounded-lg object-contain" />
                                <div>
                                    <p className="text-sm font-bold text-white leading-none font-display">HealthChain</p>
                                    <p className={`text-[10px] font-semibold uppercase tracking-wider mt-0.5 ${isDoctor ? 'text-cyan-400' : 'text-slate-500'}`}>{role === 'clinical' ? 'Clinical' : role}</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-500 hover:text-white transition-all duration-200 flex-shrink-0"
                    >
                        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    </button>
                </div>

                {/* Doctor Profile Card */}
                {isDoctor && !collapsed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mx-3 mt-4 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                    >
                        <div className="flex items-center gap-3">
                            {firebaseUser?.photoURL ? (
                                <img src={firebaseUser.photoURL} alt="Profile" className="w-9 h-9 rounded-xl object-cover ring-1 ring-white/10" />
                            ) : (
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                                    {initials}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-white truncate">
                                    {firebaseUser?.displayName || (role === 'clinical' ? 'Clinical Staff' : 'Doctor')}
                                </p>
                                <p className="text-[10px] text-slate-500">{role === 'clinical' ? 'Clinical Portal' : 'General Medicine'}</p>
                            </div>
                            <div className="flex-shrink-0">
                                <span className="glow-dot-emerald" />
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Navigation items list */}
                <nav className="flex-1 px-3 py-6 space-y-4 overflow-y-auto">
                    {navItems ? (
                        <>
                            {/* DYNAMIC SECTIONS */}
                            {['CORE', 'SECURITY', 'OPERATIONS', 'ACCOUNT'].map(sectionName => {
                                const sectionItems = navItems.filter(item => 
                                    item.section === sectionName && 
                                    (item.isAlwaysActive || FEATURES[item.featureKey])
                                );
                                if (sectionItems.length === 0) return null;
                                
                                return (
                                    <div key={sectionName} className="space-y-1.5 pt-2 first:pt-0">
                                        {!collapsed && (
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3.5 mb-2 font-display">
                                                {sectionName === 'SECURITY' ? 'Security' : sectionName === 'OPERATIONS' ? 'Operations' : sectionName === 'CORE' ? 'Core' : 'Account'}
                                            </p>
                                        )}
                                        <div className="space-y-0.5">
                                            {sectionItems.map(renderActiveItem)}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* FUTURE MODULES SECTION (patient/doctor only) */}
                            {role !== 'clinical' && futureModules.length > 0 && (
                                <div className="border-t border-white/[0.04] pt-4">
                                    <button
                                        onClick={() => setFutureCollapsed(!futureCollapsed)}
                                        className="w-full flex items-center justify-between text-left px-3.5 mb-2 text-slate-500 hover:text-slate-300 transition-colors"
                                    >
                                        {!collapsed ? (
                                            <>
                                                <span className="text-[10px] font-bold uppercase tracking-widest font-display">
                                                    Future Modules
                                                </span>
                                                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${futureCollapsed ? '' : 'rotate-180'}`} />
                                            </>
                                        ) : (
                                            <div className="mx-auto border-t border-white/[0.08] w-6 pt-2" />
                                        )}
                                    </button>
                                    <AnimatePresence initial={false}>
                                        {(!futureCollapsed || collapsed) && (
                                            <motion.div
                                                initial={collapsed ? false : { height: 0, opacity: 0 }}
                                                animate={collapsed ? false : { height: 'auto', opacity: 1 }}
                                                exit={collapsed ? false : { height: 0, opacity: 0 }}
                                                transition={{ duration: 0.25, ease: 'easeInOut' }}
                                                className="space-y-0.5 overflow-hidden"
                                            >
                                                {futureModules.map((item) => {
                                                    const Icon = item.icon;
                                                    return (
                                                        <button
                                                            key={item.label}
                                                            onClick={() => {
                                                                handleLinkClick();
                                                                triggerComingSoon(item.label);
                                                            }}
                                                            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-500/50 hover:text-slate-300 hover:bg-white/[0.02] border border-transparent hover:border-white/[0.04] transition-all group relative"
                                                        >
                                                            <div className="flex items-center gap-3 min-w-0">
                                                                <Icon className="w-[18px] h-[18px] flex-shrink-0 text-slate-500/40 group-hover:text-cyan-400/70 transition-colors" />
                                                                {!collapsed && (
                                                                    <span className="truncate text-slate-400/80 group-hover:text-white transition-colors">
                                                                        {item.label}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {!collapsed && (
                                                                <span className="flex-shrink-0 text-[8px] font-extrabold px-1.5 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-slate-400 group-hover:border-cyan-500/25 group-hover:text-cyan-400 transition-all uppercase tracking-wider scale-90">
                                                                    Soon
                                                                </span>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}
                        </>
                    ) : (
                        // Standard non-patient rendering logic
                        items.map((item, index) => {
                            if (item.isDivider) {
                                return <div key={`div-${index}`} className="my-4 h-px bg-white/[0.06] mx-2" />;
                            }

                            if (item.isAction) {
                                return (
                                    <button
                                        key={item.id || item.label}
                                        onClick={handleLinkClick}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative border border-transparent ${item.textClass} ${item.hoverBg}`}
                                    >
                                        <item.icon className={`w-[18px] h-[18px] flex-shrink-0 ${item.iconClass}`} />
                                        <AnimatePresence mode="wait">
                                            {!collapsed && (
                                                <motion.span
                                                    initial={{ opacity: 0, width: 0 }}
                                                    animate={{ opacity: 1, width: 'auto' }}
                                                    exit={{ opacity: 0, width: 0 }}
                                                    className="whitespace-nowrap overflow-hidden"
                                                >
                                                    {item.label}
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </button>
                                );
                            }

                            return (
                                <NavLink
                                    key={item.label}
                                    to={item.to ? `${basePath}/${item.to}` : basePath}
                                    end={item.end}
                                    onClick={handleLinkClick}
                                    className={({ isActive }) =>
                                        `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative
                                        ${isActive
                                            ? isDoctor
                                                ? 'bg-cyan-500/[0.08] text-cyan-400 border border-cyan-500/10'
                                                : 'bg-cyan-500/[0.08] text-cyan-400'
                                            : 'text-slate-500 hover:text-white hover:bg-white/[0.04] border border-transparent'
                                        }`
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            {isActive && (
                                                <motion.div
                                                    layoutId="sidebar-active"
                                                    className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full ${isDoctor ? 'bg-cyan-400' : 'bg-cyan-500'}`}
                                                    style={isDoctor ? { boxShadow: '0 0 8px rgba(6, 182, 212, 0.4)' } : {}}
                                                />
                                            )}
                                            <div className="flex items-center gap-3">
                                                <item.icon className={`w-[18px] h-[18px] flex-shrink-0 transition-colors duration-200 ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-white'}`} />
                                                <AnimatePresence mode="wait">
                                                    {!collapsed && (
                                                        <motion.span
                                                            initial={{ opacity: 0, width: 0 }}
                                                            animate={{ opacity: 1, width: 'auto' }}
                                                            exit={{ opacity: 0, width: 0 }}
                                                            className="whitespace-nowrap overflow-hidden"
                                                        >
                                                            {item.label}
                                                        </motion.span>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                            {!collapsed && item.hasBadge && (
                                                <span className="bg-cyan-500/10 text-cyan-400 text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-cyan-500/20">3</span>
                                            )}
                                        </>
                                    )}
                                </NavLink>
                            );
                        })
                    )}
                </nav>

                {/* Footer */}
                <div className="px-3 py-4 border-t border-white/[0.06] flex-shrink-0">
                    <button
                        onClick={() => {
                            logout();
                            window.location.href = '/login';
                        }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-red-400 hover:bg-red-500/[0.06] transition-all duration-200 w-full"
                    >
                        <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
                        <AnimatePresence mode="wait">
                            {!collapsed && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="whitespace-nowrap"
                                >
                                    Sign Out
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </button>
                </div>
            </motion.aside>

            {/* Premium Gated Modals */}
            <Suspense fallback={null}>
                <ComingSoonModal
                    isOpen={soonOpen}
                    onClose={() => setSoonOpen(false)}
                    featureName={selectedFeature}
                />

                <UploadModal
                    isOpen={uploadOpen}
                    onClose={() => setUploadOpen(false)}
                />
            </Suspense>
        </>
    );
}
