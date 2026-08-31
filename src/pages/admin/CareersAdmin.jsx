import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Briefcase, Plus, Edit, Eye, Trash2, Copy, ToggleLeft, ToggleRight,
    Search, Filter, Users, ChevronRight, FileText, CheckCircle2, XCircle,
    Clock, Calendar, DollarSign, MapPin, Award, Shield, AlertTriangle,
    Download, ExternalLink, User, Mail, Phone, Globe, X, ArrowLeft
} from 'lucide-react';
import { db, auth } from '../../firebase/config';
import { 
    collection, doc, getDocs, setDoc, updateDoc, deleteDoc, 
    onSnapshot, query, orderBy, serverTimestamp, where, addDoc
} from 'firebase/firestore';
import { setDocSafe, updateDocSafe } from '../../firebase/firestoreUtils';
import { uploadFile } from '../../firebase/storage';
import { toast } from '../../components/Toast';

export default function CareersAdmin() {
    // Tabs state: 'jobs' or 'applications'
    const [activeTab, setActiveTab] = useState('jobs');

    // Firestore data states
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loadingJobs, setLoadingJobs] = useState(true);
    const [loadingApps, setLoadingApps] = useState(true);

    // Filters and search states (Jobs)
    const [jobSearch, setJobSearch] = useState('');
    const [jobStatusFilter, setJobStatusFilter] = useState('All');
    const [jobDeptFilter, setJobDeptFilter] = useState('All');

    // Filters and search states (Applications)
    const [appSearch, setAppSearch] = useState('');
    const [appStatusFilter, setAppStatusFilter] = useState('All');
    const [appJobFilter, setAppJobFilter] = useState('All');

    // Form Modal states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingJob, setEditingJob] = useState(null);
    const [form, setForm] = useState({
        title: '',
        department: 'Engineering',
        location: 'Remote',
        employmentType: 'Full-time',
        workMode: 'Remote',
        experienceLevel: 'Entry / Intern',
        shortDescription: '',
        fullDescription: '',
        skills: [],
        responsibilities: [],
        benefits: [],
        salaryRange: '',
        deadline: '',
        featured: false,
        openToInterns: false,
        status: 'draft',
    });

    // Temp inputs for arrays in the form
    const [skillInput, setSkillInput] = useState('');
    const [respInput, setRespInput] = useState('');
    const [benefitInput, setBenefitInput] = useState('');

    // Details Drawer states
    const [selectedApp, setSelectedApp] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Interview schedule modal state
    const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
    const [interviewForm, setInterviewForm] = useState({
        date: '',
        time: '',
        meetingLink: '',
        notes: ''
    });

    // Send offer modal state
    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
    const [offerForm, setOfferForm] = useState({
        file: null,
        uploading: false,
        progress: 0,
        offerLetterUrl: '',
        offerLetterName: ''
    });
    const offerFileInputRef = useRef(null);

    // Preview Modal state
    const [previewJob, setPreviewJob] = useState(null);
    
    // Delete Confirmation state
    const [deleteConfirmJob, setDeleteConfirmJob] = useState(null);

    // Load Jobs and Applications in Real-time from Firestore
    useEffect(() => {
        const jobsQuery = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
        const unsubscribeJobs = onSnapshot(jobsQuery, (snapshot) => {
            const list = [];
            snapshot.forEach((doc) => {
                list.push({ id: doc.id, ...doc.data() });
            });
            setJobs(list);
            setLoadingJobs(false);
        }, (err) => {
            console.error('Real-time jobs fetch error:', err);
            setLoadingJobs(false);
        });

        const appsQuery = query(collection(db, 'careers_applications'), orderBy('submittedAt', 'desc'));
        const unsubscribeApps = onSnapshot(appsQuery, (snapshot) => {
            const list = [];
            snapshot.forEach((doc) => {
                list.push({ id: doc.id, ...doc.data() });
            });
            setApplications(list);
            setLoadingApps(false);
            
            // Keep the selectedApp state synchronized with real-time updates from the database
            setSelectedApp(prev => {
                if (!prev) return null;
                const matched = list.find(a => a.id === prev.id);
                return matched ? matched : prev;
            });
        }, (err) => {
            console.error('Real-time applications fetch error:', err);
            setLoadingApps(false);
        });

        return () => {
            unsubscribeJobs();
            unsubscribeApps();
        };
    }, []);

    // Get statistics for the dashboard panels
    const stats = {
        totalJobs: jobs.length,
        publishedJobs: jobs.filter(j => j.status === 'published').length,
        draftJobs: jobs.filter(j => j.status === 'draft').length,
        pausedJobs: jobs.filter(j => j.status === 'paused' || j.status === 'closed').length,
        totalApps: applications.length,
        newApps: applications.filter(a => a.status === 'new' || a.status === 'pending_review').length,
        shortlistedApps: applications.filter(a => a.status === 'shortlisted').length,
        rejectedApps: applications.filter(a => a.status === 'rejected').length
    };

    // Filtered Jobs List
    const filteredJobs = jobs.filter(j => {
        const matchesSearch = j.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
                              j.department.toLowerCase().includes(jobSearch.toLowerCase()) ||
                              j.location.toLowerCase().includes(jobSearch.toLowerCase());
        const matchesStatus = jobStatusFilter === 'All' || j.status === jobStatusFilter;
        const matchesDept = jobDeptFilter === 'All' || j.department === jobDeptFilter;
        return matchesSearch && matchesStatus && matchesDept;
    });

    // Filtered Applications List
    const filteredApps = applications.filter(a => {
        const matchesSearch = a.fullName.toLowerCase().includes(appSearch.toLowerCase()) ||
                              a.email.toLowerCase().includes(appSearch.toLowerCase()) ||
                              a.appliedRole.toLowerCase().includes(appSearch.toLowerCase());
        const matchesStatus = appStatusFilter === 'All' || 
                             (appStatusFilter === 'new' && (a.status === 'new' || a.status === 'pending_review')) ||
                             a.status === appStatusFilter;
        const matchesJob = appJobFilter === 'All' || a.appliedRole === appJobFilter;
        return matchesSearch && matchesStatus && matchesJob;
    });

    // Array manipulation helpers for the form
    const addSkill = (e) => {
        e.preventDefault();
        if (skillInput.trim() && !form.skills.includes(skillInput.trim())) {
            setForm({ ...form, skills: [...form.skills, skillInput.trim()] });
            setSkillInput('');
        }
    };

    const removeSkill = (index) => {
        setForm({ ...form, skills: form.skills.filter((_, i) => i !== index) });
    };

    const addResp = (e) => {
        e.preventDefault();
        if (respInput.trim() && !form.responsibilities.includes(respInput.trim())) {
            setForm({ ...form, responsibilities: [...form.responsibilities, respInput.trim()] });
            setRespInput('');
        }
    };

    const removeResp = (index) => {
        setForm({ ...form, responsibilities: form.responsibilities.filter((_, i) => i !== index) });
    };

    const addBenefit = (e) => {
        e.preventDefault();
        if (benefitInput.trim() && !form.benefits.includes(benefitInput.trim())) {
            setForm({ ...form, benefits: [...form.benefits, benefitInput.trim()] });
            setBenefitInput('');
        }
    };

    const removeBenefit = (index) => {
        setForm({ ...form, benefits: form.benefits.filter((_, i) => i !== index) });
    };

    // Open Form for creating new job
    const handleCreateOpen = () => {
        setEditingJob(null);
        setForm({
            title: '',
            department: 'Engineering',
            location: 'Remote',
            employmentType: 'Full-time',
            workMode: 'Remote',
            experienceLevel: 'Entry / Intern',
            shortDescription: '',
            fullDescription: '',
            skills: [],
            responsibilities: [],
            benefits: [],
            salaryRange: '',
            deadline: '',
            featured: false,
            openToInterns: false,
            status: 'draft',
        });
        setIsFormOpen(true);
    };

    // Open Form for editing job
    const handleEditOpen = (job) => {
        setEditingJob(job);
        setForm({
            title: job.title || '',
            department: job.department || 'Engineering',
            location: job.location || 'Remote',
            employmentType: job.employmentType || 'Full-time',
            workMode: job.workMode || 'Remote',
            experienceLevel: job.experienceLevel || 'Entry / Intern',
            shortDescription: job.shortDescription || '',
            fullDescription: job.fullDescription || '',
            skills: job.skills || [],
            responsibilities: job.responsibilities || [],
            benefits: job.benefits || [],
            salaryRange: job.salaryRange || '',
            deadline: job.deadline || '',
            featured: job.featured || false,
            openToInterns: job.openToInterns || false,
            status: job.status || 'draft',
        });
        setIsFormOpen(true);
    };

    // Submit Job Form to Firestore
    const handleJobSubmit = async (e) => {
        e.preventDefault();

        if (!form.title.trim() || !form.shortDescription.trim() || !form.fullDescription.trim()) {
            toast.warning('Title, Short Description, and Full Description are required.');
            return;
        }

        try {
            const jobData = {
                ...form,
                updatedAt: serverTimestamp(),
            };

            if (editingJob) {
                // Update existing job
                const jobRef = doc(db, 'jobs', editingJob.id);
                await updateDocSafe(jobRef, jobData, 'Updating job posting');
                toast.success('Job posting updated successfully.');
            } else {
                // Create new job
                const jobRef = doc(collection(db, 'jobs'));
                jobData.createdAt = serverTimestamp();
                jobData.createdBy = auth.currentUser?.email || 'admin';
                await setDocSafe(jobRef, jobData, {}, 'Creating job posting');
                toast.success('New job posting created successfully.');
            }

            setIsFormOpen(false);
        } catch (error) {
            console.error('Job submit error:', error);
        }
    };

    // Toggle job status directly from table
    const handleToggleStatus = async (job, newStatus) => {
        try {
            const jobRef = doc(db, 'jobs', job.id);
            await updateDocSafe(jobRef, { status: newStatus, updatedAt: serverTimestamp() }, 'Updating status');
            toast.success(`Job status set to ${newStatus}.`);
        } catch (error) {
            console.error('Toggle status error:', error);
        }
    };

    // Duplicate Job
    const handleDuplicateJob = async (job) => {
        try {
            const duplicateData = {
                ...job,
                title: `${job.title} (Copy)`,
                status: 'draft',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                createdBy: auth.currentUser?.email || 'admin',
            };
            delete duplicateData.id;

            const jobRef = doc(collection(db, 'jobs'));
            await setDocSafe(jobRef, duplicateData, {}, 'Duplicating job posting');
            toast.success('Job duplicated as draft.');
        } catch (error) {
            console.error('Duplicate job error:', error);
        }
    };

    // Delete Job Listing
    const handleDeleteJob = async () => {
        if (!deleteConfirmJob) return;

        try {
            const jobRef = doc(db, 'jobs', deleteConfirmJob.id);
            await deleteDoc(jobRef);
            toast.success('Job listing deleted safely.');
            setDeleteConfirmJob(null);
        } catch (error) {
            console.error('Delete job error:', error);
            toast.error('Failed to delete job listing.');
        }
    };

    // Update Application Status (from drawer)
    const handleUpdateAppStatus = async (appId, newStatus, extraFields = {}) => {
        try {
            const appRef = doc(db, 'careers_applications', appId);
            const updatePayload = { status: newStatus, ...extraFields };
            await updateDocSafe(appRef, updatePayload, 'Updating application status');
            setSelectedApp(prev => prev ? { ...prev, ...updatePayload } : null);
            toast.success(`Applicant status updated to ${newStatus}.`);

            // Log to audit log
            try {
                const chars = '0123456789abcdef';
                let txHash = '0x';
                for (let i = 0; i < 64; i++) {
                    txHash += chars[Math.floor(Math.random() * 16)];
                }
                await addDoc(collection(db, 'auditLogs'), {
                    timestamp: serverTimestamp(),
                    activityType: `CAREERS_APP_STATUS_${newStatus.toUpperCase()}`,
                    userId: auth.currentUser?.uid || 'admin-staff',
                    txHash,
                    details: {
                        applicationId: appId,
                        candidateName: selectedApp ? selectedApp.fullName : 'Applicant',
                        role: selectedApp ? (selectedApp.jobTitle || selectedApp.appliedRole) : 'Unknown Role',
                        action: `Admin updated status for candidate ${selectedApp ? selectedApp.fullName : 'Applicant'} to ${newStatus}.`
                    }
                });
            } catch (auditErr) {
                console.warn('Failed to write audit log:', auditErr);
            }
        } catch (error) {
            console.error('Update application status error:', error);
        }
    };

    // Export applications list as CSV file
    const handleExportCSV = () => {
        if (filteredApps.length === 0) {
            toast.warning('No applications to export.');
            return;
        }

        const headers = ['Applicant Name', 'Email', 'Phone', 'Applied Role', 'Experience', 'Status', 'Applied Date', 'Portfolio Link', 'Cover Note'];
        const rows = filteredApps.map(a => {
            const dateStr = a.submittedAt ? new Date(a.submittedAt.seconds * 1000).toLocaleDateString() : '';
            return [
                `"${a.fullName.replace(/"/g, '""')}"`,
                `"${a.email}"`,
                `"${a.phone}"`,
                `"${a.appliedRole}"`,
                `"${a.experience}"`,
                `"${a.status}"`,
                `"${dateStr}"`,
                `"${a.portfolioUrl || ''}"`,
                `"${(a.coverMessage || '').replace(/"/g, '""')}"`
            ];
        });

        const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `healthchain_applicants_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Applications exported to CSV successfully.');
    };

    return (
        <div className="space-y-6 text-slate-200">
            {/* Header Title */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-display font-black text-white">Careers Portal Dashboard</h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Publish open clinic node roles, manage job descriptions, and evaluate candidate applications.
                    </p>
                </div>
                
                {activeTab === 'jobs' && (
                    <button
                        onClick={handleCreateOpen}
                        className="px-5 py-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-600 hover:shadow-red-500/10 hover:shadow-lg text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-all duration-300"
                    >
                        <Plus className="w-4 h-4" /> Post New Job
                    </button>
                )}
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="backdrop-blur-xl bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0">
                        <Briefcase className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Active Listings</p>
                        <p className="text-lg font-bold text-white mt-1">{stats.publishedJobs} <span className="text-xs font-normal text-slate-500">/ {stats.totalJobs}</span></p>
                    </div>
                </div>

                <div className="backdrop-blur-xl bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Draft Listings</p>
                        <p className="text-lg font-bold text-white mt-1">{stats.draftJobs}</p>
                    </div>
                </div>

                <div className="backdrop-blur-xl bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                        <Users className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Applicants</p>
                        <p className="text-lg font-bold text-white mt-1">{stats.totalApps}</p>
                    </div>
                </div>

                <div className="backdrop-blur-xl bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5 text-emerald-400 animate-pulse" />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">New Resumes</p>
                        <p className="text-lg font-bold text-white mt-1">{stats.newApps}</p>
                    </div>
                </div>
            </div>

            {/* Tabs Selector */}
            <div className="flex border-b border-white/[0.06]">
                <button
                    onClick={() => setActiveTab('jobs')}
                    className={`px-6 py-3.5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                        activeTab === 'jobs'
                            ? 'border-red-500 text-red-400'
                            : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                >
                    Roles Listings ({jobs.length})
                </button>
                <button
                    onClick={() => setActiveTab('applications')}
                    className={`px-6 py-3.5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                        activeTab === 'applications'
                            ? 'border-red-500 text-red-400'
                            : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                >
                    Applicants Tracker ({applications.length})
                </button>
            </div>

            {/* TAB CONTENT 1: JOB LISTINGS */}
            {activeTab === 'jobs' && (
                <div className="space-y-4">
                    {/* Filters Bar */}
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white/[0.01] border border-white/[0.06] rounded-2xl p-4">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                value={jobSearch}
                                onChange={(e) => setJobSearch(e.target.value)}
                                placeholder="Search by role title, department..."
                                className="w-full bg-white/[0.02] border border-white/[0.08] focus:border-red-500/40 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none transition-all"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                            <select
                                value={jobStatusFilter}
                                onChange={(e) => setJobStatusFilter(e.target.value)}
                                className="bg-white/[0.02] border border-white/[0.08] focus:border-red-500/40 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none cursor-pointer"
                            >
                                <option value="All" className="bg-navy-950">All Statuses</option>
                                <option value="published" className="bg-navy-950">Published</option>
                                <option value="draft" className="bg-navy-950">Draft</option>
                                <option value="paused" className="bg-navy-950">Paused</option>
                                <option value="closed" className="bg-navy-950">Closed</option>
                            </select>

                            <select
                                value={jobDeptFilter}
                                onChange={(e) => setJobDeptFilter(e.target.value)}
                                className="bg-white/[0.02] border border-white/[0.08] focus:border-red-500/40 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none cursor-pointer"
                            >
                                <option value="All" className="bg-navy-950">All Departments</option>
                                <option value="Engineering" className="bg-navy-950">Engineering</option>
                                <option value="Product & Design" className="bg-navy-950">Product & Design</option>
                                <option value="Operations" className="bg-navy-950">Operations</option>
                            </select>
                        </div>
                    </div>

                    {/* Jobs Table */}
                    <div className="overflow-x-auto bg-white/[0.01] border border-white/[0.06] rounded-2xl">
                        {loadingJobs ? (
                            <div className="py-20 text-center text-xs text-slate-500">Retrieving open roles data from ledger...</div>
                        ) : filteredJobs.length === 0 ? (
                            <div className="py-16 text-center text-xs text-slate-500">No open roles found matching search filters.</div>
                        ) : (
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-white/[0.06] text-slate-500 font-bold uppercase tracking-wider">
                                        <th className="px-6 py-4">Role Title</th>
                                        <th className="px-6 py-4">Department</th>
                                        <th className="px-6 py-4">Location</th>
                                        <th className="px-6 py-4">Type</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-center">Applications</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.04] text-slate-300">
                                    {filteredJobs.map((job) => {
                                        const jobApps = applications.filter(a => a.appliedRole === job.title);
                                        const statusColors = {
                                            published: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                                            draft: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
                                            paused: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
                                            closed: 'bg-red-500/10 text-red-400 border-red-500/20'
                                        };

                                        return (
                                            <tr key={job.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                                                    {job.featured && (
                                                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 shrink-0" title="Featured Job" />
                                                    )}
                                                    {job.title}
                                                </td>
                                                <td className="px-6 py-4">{job.department}</td>
                                                <td className="px-6 py-4">
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3 text-slate-500" /> {job.location}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">{job.employmentType} ({job.workMode})</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-0.5 rounded-full font-semibold border ${statusColors[job.status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                                                        {job.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center font-semibold text-white">
                                                    {jobApps.length}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {/* Status Controls Toggle */}
                                                        {job.status === 'published' ? (
                                                            <button
                                                                onClick={() => handleToggleStatus(job, 'paused')}
                                                                title="Pause job posting"
                                                                className="p-2 rounded-lg hover:bg-white/[0.04] text-amber-400 transition-colors"
                                                            >
                                                                <ToggleRight className="w-4 h-4" />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleToggleStatus(job, 'published')}
                                                                disabled={job.status === 'closed'}
                                                                title={job.status === 'closed' ? 'Closed job listings cannot be toggled directly' : 'Publish job posting'}
                                                                className="p-2 rounded-lg hover:bg-white/[0.04] text-emerald-400 transition-colors disabled:opacity-30"
                                                            >
                                                                <ToggleLeft className="w-4 h-4" />
                                                            </button>
                                                        )}

                                                        <button
                                                            onClick={() => setPreviewJob(job)}
                                                            title="Preview Listing"
                                                            className="p-2 rounded-lg hover:bg-white/[0.04] text-cyan-400 transition-colors"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>

                                                        <button
                                                            onClick={() => handleEditOpen(job)}
                                                            title="Edit Listing"
                                                            className="p-2 rounded-lg hover:bg-white/[0.04] text-slate-400 hover:text-white transition-colors"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>

                                                        <button
                                                            onClick={() => handleDuplicateJob(job)}
                                                            title="Duplicate Listing"
                                                            className="p-2 rounded-lg hover:bg-white/[0.04] text-purple-400 transition-colors"
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                        </button>

                                                        <button
                                                            onClick={() => setDeleteConfirmJob(job)}
                                                            title="Delete Listing"
                                                            className="p-2 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {/* TAB CONTENT 2: APPLICATIONS MONITOR */}
            {activeTab === 'applications' && (
                <div className="space-y-4">
                    {/* Filters Bar */}
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white/[0.01] border border-white/[0.06] rounded-2xl p-4">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                value={appSearch}
                                onChange={(e) => setAppSearch(e.target.value)}
                                placeholder="Search applicants by name, email, or role..."
                                className="w-full bg-white/[0.02] border border-white/[0.08] focus:border-red-500/40 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none transition-all"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                            <select
                                value={appStatusFilter}
                                onChange={(e) => setAppStatusFilter(e.target.value)}
                                className="bg-white/[0.02] border border-white/[0.08] focus:border-red-500/40 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none cursor-pointer"
                            >
                                <option value="All">All Statuses</option>
                                <option value="new">New / Pending</option>
                                <option value="reviewing">Reviewing</option>
                                <option value="shortlisted">Shortlisted</option>
                                <option value="rejected">Rejected</option>
                            </select>

                            <select
                                value={appJobFilter}
                                onChange={(e) => setAppJobFilter(e.target.value)}
                                className="bg-white/[0.02] border border-white/[0.08] focus:border-red-500/40 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none cursor-pointer"
                            >
                                <option value="All">All Applied Roles</option>
                                {jobs.map(j => (
                                    <option key={j.id} value={j.title}>{j.title}</option>
                                ))}
                            </select>

                            <button
                                onClick={handleExportCSV}
                                className="px-4 py-2.5 rounded-xl border border-white/10 hover:border-cyan-500/30 bg-white/[0.02] hover:bg-white/[0.05] text-cyan-400 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all duration-300"
                            >
                                <Download className="w-4 h-4" /> Export CSV
                            </button>
                        </div>
                    </div>

                    {/* Applications Table */}
                    <div className="overflow-x-auto bg-white/[0.01] border border-white/[0.06] rounded-2xl">
                        {loadingApps ? (
                            <div className="py-20 text-center text-xs text-slate-500">Retrieving applicant listings from ledger...</div>
                        ) : filteredApps.length === 0 ? (
                            <div className="py-16 text-center text-xs text-slate-500">No applications found matching filters.</div>
                        ) : (
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-white/[0.06] text-slate-500 font-bold uppercase tracking-wider">
                                        <th className="px-6 py-4">Applicant Name</th>
                                        <th className="px-6 py-4">Applied Role</th>
                                        <th className="px-6 py-4">Email</th>
                                        <th className="px-6 py-4 text-center">Experience</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Submission Date</th>
                                        <th className="px-6 py-4 text-right">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.04] text-slate-300">
                                    {filteredApps.map((app) => {
                                        const statusColors = {
                                            new: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
                                            pending_review: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
                                            reviewing: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
                                            shortlisted: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-neon-sm',
                                            rejected: 'bg-red-500/10 text-red-400 border-red-500/20'
                                        };

                                        const dateVal = app.submittedAt 
                                            ? new Date(app.submittedAt.seconds * 1000).toLocaleDateString(undefined, {
                                                month: 'short', day: 'numeric', year: 'numeric'
                                              }) 
                                            : 'N/A';

                                        return (
                                            <tr key={app.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-4 font-bold text-white">{app.fullName}</td>
                                                <td className="px-6 py-4">{app.appliedRole}</td>
                                                <td className="px-6 py-4 text-slate-400">{app.email}</td>
                                                <td className="px-6 py-4 text-center">{app.experience}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-0.5 rounded-full font-semibold border ${statusColors[app.status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                                                        {app.status === 'pending_review' ? 'new' : app.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-400">{dateVal}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedApp(app);
                                                            setIsDrawerOpen(true);
                                                            // If application status is new, automatically transition to reviewing
                                                            if (app.status === 'new' || app.status === 'pending_review') {
                                                                handleUpdateAppStatus(app.id, 'reviewing');
                                                            }
                                                        }}
                                                        className="px-3.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 hover:border-cyan-500/30 hover:bg-white/[0.06] text-cyan-400 transition-all font-semibold flex items-center justify-center gap-1.5 ml-auto cursor-pointer"
                                                    >
                                                        Review <ChevronRight className="w-3.5 h-3.5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {/* ── CREATE / EDIT JOB SLIDE-OVER FORM MODAL ── */}
            <AnimatePresence>
                {isFormOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-end overflow-hidden bg-[#080d1a]/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'tween', duration: 0.35 }}
                            className="w-full max-w-3xl h-full bg-[#0B0F1A] border-l border-white/[0.08] flex flex-col justify-between shadow-2xl relative"
                        >
                            {/* Form Header */}
                            <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between flex-shrink-0">
                                <div>
                                    <h2 className="text-lg font-bold text-white font-display">
                                        {editingJob ? 'Modify Job Posting Schema' : 'Post New Node Vacancy'}
                                    </h2>
                                    <p className="text-[10px] text-slate-500 mt-0.5">
                                        Define constraints, details, and required cryptography skills.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsFormOpen(false)}
                                    className="p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Form Fields Body */}
                            <form onSubmit={handleJobSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                                
                                {/* Row 1: Title and Department */}
                                <div className="grid md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Role Title *</label>
                                        <input
                                            type="text"
                                            value={form.title}
                                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                                            placeholder="Frontend Engineer"
                                            className="w-full bg-white/[0.02] border border-white/[0.08] focus:border-red-500/40 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Department</label>
                                        <select
                                            value={form.department}
                                            onChange={(e) => setForm({ ...form, department: e.target.value })}
                                            className="w-full bg-white/[0.02] border border-white/[0.08] focus:border-red-500/40 rounded-xl px-4 py-3 text-xs text-white focus:outline-none transition-all cursor-pointer"
                                        >
                                            <option value="Engineering" className="bg-navy-900">Engineering</option>
                                            <option value="Product & Design" className="bg-navy-900">Product & Design</option>
                                            <option value="Operations" className="bg-navy-900">Operations</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Row 2: Location and Employment Type */}
                                <div className="grid md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Location / Hub</label>
                                        <input
                                            type="text"
                                            value={form.location}
                                            onChange={(e) => setForm({ ...form, location: e.target.value })}
                                            placeholder="Remote or Hybrid (Bangalore)"
                                            className="w-full bg-white/[0.02] border border-white/[0.08] focus:border-red-500/40 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Employment Type</label>
                                        <select
                                            value={form.employmentType}
                                            onChange={(e) => setForm({ ...form, employmentType: e.target.value })}
                                            className="w-full bg-white/[0.02] border border-white/[0.08] focus:border-red-500/40 rounded-xl px-4 py-3 text-xs text-white focus:outline-none transition-all cursor-pointer"
                                        >
                                            <option value="Full-time" className="bg-navy-900">Full-time</option>
                                            <option value="Part-time" className="bg-navy-900">Part-time</option>
                                            <option value="Contract" className="bg-navy-900">Contract</option>
                                            <option value="Internship" className="bg-navy-900">Internship</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Row 3: Work Mode and Experience */}
                                <div className="grid md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Work Mode</label>
                                        <select
                                            value={form.workMode}
                                            onChange={(e) => setForm({ ...form, workMode: e.target.value })}
                                            className="w-full bg-white/[0.02] border border-white/[0.08] focus:border-red-500/40 rounded-xl px-4 py-3 text-xs text-white focus:outline-none transition-all cursor-pointer"
                                        >
                                            <option value="Remote" className="bg-navy-900">Remote</option>
                                            <option value="Hybrid" className="bg-navy-900">Hybrid</option>
                                            <option value="Onsite" className="bg-navy-900">Onsite</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Experience level</label>
                                        <select
                                            value={form.experienceLevel}
                                            onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}
                                            className="w-full bg-white/[0.02] border border-white/[0.08] focus:border-red-500/40 rounded-xl px-4 py-3 text-xs text-white focus:outline-none transition-all cursor-pointer"
                                        >
                                            <option value="Entry / Intern" className="bg-navy-900">Entry / Intern (0-1 years)</option>
                                            <option value="Associate" className="bg-navy-900">Associate (1-3 years)</option>
                                            <option value="Mid-Level" className="bg-navy-900">Mid-Level (3-5 years)</option>
                                            <option value="Senior / Lead" className="bg-navy-900">Senior / Lead (5+ years)</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Row 4: Salary & Deadline */}
                                <div className="grid md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Compensation Range / Stipend</label>
                                        <input
                                            type="text"
                                            value={form.salaryRange}
                                            onChange={(e) => setForm({ ...form, salaryRange: e.target.value })}
                                            placeholder="e.g. $120k - $150k or Stipend Available"
                                            className="w-full bg-white/[0.02] border border-white/[0.08] focus:border-red-500/40 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Application Deadline</label>
                                        <input
                                            type="date"
                                            value={form.deadline}
                                            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                                            className="w-full bg-white/[0.02] border border-white/[0.08] focus:border-red-500/40 rounded-xl px-4 py-3 text-xs text-white focus:outline-none transition-all cursor-pointer"
                                        />
                                    </div>
                                </div>

                                {/* Toggle Switches */}
                                <div className="flex flex-wrap gap-6 py-2 border-y border-white/5">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.featured}
                                            onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                                            className="rounded border-white/10 bg-white/5 text-red-500 focus:ring-0 w-4 h-4 cursor-pointer"
                                        />
                                        <span className="text-xs text-slate-300">Featured Job Listing</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.openToInterns}
                                            onChange={(e) => setForm({ ...form, openToInterns: e.target.checked })}
                                            className="rounded border-white/10 bg-white/5 text-red-500 focus:ring-0 w-4 h-4 cursor-pointer"
                                        />
                                        <span className="text-xs text-slate-300">Open to Interns / Grad Applicants</span>
                                    </label>
                                </div>

                                {/* Short Description */}
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Short summary * (appears on card)</label>
                                    <textarea
                                        rows={2}
                                        value={form.shortDescription}
                                        onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                                        placeholder="Short 2-line summary describing the candidate's epic workload..."
                                        className="w-full bg-white/[0.02] border border-white/[0.08] focus:border-red-500/40 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-650 focus:outline-none transition-all resize-none"
                                    />
                                </div>

                                {/* Full Description */}
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Full Description * (detailed overview)</label>
                                    <textarea
                                        rows={6}
                                        value={form.fullDescription}
                                        onChange={(e) => setForm({ ...form, fullDescription: e.target.value })}
                                        placeholder="Complete job description details including tech infrastructure and mission objectives..."
                                        className="w-full bg-white/[0.02] border border-white/[0.08] focus:border-red-500/40 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-650 focus:outline-none transition-all resize-none"
                                    />
                                </div>

                                {/* Array 1: Required Skills */}
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Required Skills</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={skillInput}
                                            onChange={(e) => setSkillInput(e.target.value)}
                                            placeholder="Add skill (e.g. Solidity)"
                                            className="flex-1 bg-white/[0.02] border border-white/[0.08] focus:border-red-500/40 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={addSkill}
                                            className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-cyan-500/30 text-xs font-semibold text-cyan-400 cursor-pointer"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {form.skills.map((skill, idx) => (
                                            <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/5 text-slate-300 text-xs font-mono">
                                                {skill}
                                                <button type="button" onClick={() => removeSkill(idx)} className="text-slate-500 hover:text-red-400">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Array 2: Responsibilities */}
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Core Responsibilities</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={respInput}
                                            onChange={(e) => setRespInput(e.target.value)}
                                            placeholder="Add responsibility"
                                            className="flex-1 bg-white/[0.02] border border-white/[0.08] focus:border-red-500/40 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={addResp}
                                            className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-cyan-500/30 text-xs font-semibold text-cyan-400 cursor-pointer"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    <ul className="space-y-1.5 pt-1">
                                        {form.responsibilities.map((resp, idx) => (
                                            <li key={idx} className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/5 text-slate-300 text-xs">
                                                <span>{resp}</span>
                                                <button type="button" onClick={() => removeResp(idx)} className="text-slate-500 hover:text-red-400 shrink-0">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Array 3: Benefits */}
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Job Benefits</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={benefitInput}
                                            onChange={(e) => setBenefitInput(e.target.value)}
                                            placeholder="Add benefit (e.g. Health Insurance)"
                                            className="flex-1 bg-white/[0.02] border border-white/[0.08] focus:border-red-500/40 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={addBenefit}
                                            className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-cyan-500/30 text-xs font-semibold text-cyan-400 cursor-pointer"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {form.benefits.map((benefit, idx) => (
                                            <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/5 text-slate-300 text-xs">
                                                {benefit}
                                                <button type="button" onClick={() => removeBenefit(idx)} className="text-slate-500 hover:text-red-400">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Status Selector */}
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Publish Status</label>
                                    <select
                                        value={form.status}
                                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                                        className="w-full bg-white/[0.02] border border-white/[0.08] focus:border-red-500/40 rounded-xl px-4 py-3 text-xs text-white focus:outline-none cursor-pointer"
                                    >
                                        <option value="draft" className="bg-navy-900">Draft (Invisible)</option>
                                        <option value="published" className="bg-navy-900">Published (Active)</option>
                                        <option value="paused" className="bg-navy-900">Paused (Inactive)</option>
                                        <option value="closed" className="bg-navy-900">Closed (Filled)</option>
                                    </select>
                                </div>
                            </form>

                            {/* Form Footer actions */}
                            <div className="px-6 py-4 border-t border-white/[0.08] flex items-center justify-end gap-3 flex-shrink-0 bg-white/[0.01]">
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="px-5 py-3 rounded-xl border border-white/10 text-slate-400 text-xs font-semibold hover:bg-white/[0.04] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={async () => {
                                        // Save as draft directly
                                        setForm(f => ({ ...f, status: 'draft' }));
                                        const event = { preventDefault: () => {} };
                                        setTimeout(() => handleJobSubmit(event), 50);
                                    }}
                                    className="px-5 py-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-cyan-500/30 text-xs font-semibold text-cyan-400 transition-colors"
                                >
                                    Save Draft
                                </button>
                                <button
                                    onClick={handleJobSubmit}
                                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-600 hover:shadow-red-500/10 hover:shadow-lg text-white text-xs font-bold transition-all"
                                >
                                    {editingJob ? 'Save Changes' : 'Post Listing'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── CANDIDATE DETAILS RIGHT DRAWER ── */}
            <AnimatePresence>
                {isDrawerOpen && selectedApp && (
                    <div className="fixed inset-0 z-50 flex items-center justify-end overflow-hidden bg-[#080d1a]/85 backdrop-blur-sm">
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'tween', duration: 0.3 }}
                            className="w-full max-w-md h-full bg-[#0B0F1A] border-l border-white/[0.08] flex flex-col justify-between shadow-2xl relative text-xs"
                        >
                            {/* Drawer Header */}
                            <div className="px-6 py-5 border-b border-white/[0.08] flex items-center justify-between flex-shrink-0 bg-white/[0.01]">
                                <div>
                                    <h2 className="text-base font-bold text-white font-display">Evaluate Application</h2>
                                    <p className="text-[10px] text-slate-500 mt-0.5">Submitted via Careers Web Form</p>
                                </div>
                                <button
                                    onClick={() => setIsDrawerOpen(false)}
                                    className="p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Drawer Content */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-300">
                                
                                {/* Info Box */}
                                <div className="backdrop-blur-xl bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
                                            {selectedApp.fullName.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-white leading-none">{selectedApp.fullName}</h3>
                                            <p className="text-[10px] text-red-400 mt-1">{selectedApp.appliedRole}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/5 text-[11px]">
                                        <div>
                                            <p className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Experience Level</p>
                                            <p className="text-white mt-0.5 font-medium">{selectedApp.experience}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Applied On</p>
                                            <p className="text-white mt-0.5 font-medium">
                                                {selectedApp.submittedAt ? new Date(selectedApp.submittedAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Details */}
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Contact Information</h4>
                                    
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.01] border border-white/5">
                                            <Mail className="w-4 h-4 text-slate-500" />
                                            <span className="text-white">{selectedApp.email}</span>
                                        </div>
                                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.01] border border-white/5">
                                            <Phone className="w-4 h-4 text-slate-500" />
                                            <span className="text-white">{selectedApp.phone}</span>
                                        </div>
                                        {selectedApp.portfolioUrl && (
                                            <a 
                                                href={selectedApp.portfolioUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.01] border border-white/5 hover:border-cyan-500/30 hover:bg-white/[0.04] transition-all text-cyan-400"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Globe className="w-4 h-4 text-slate-500" />
                                                    <span>Portfolio / Social Profile</span>
                                                </div>
                                                <ExternalLink className="w-3.5 h-3.5 text-cyan-400/80" />
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* Resume Attachment & Live Preview */}
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Resume Document</h4>
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-5 h-5 text-cyan-400" />
                                            <div>
                                                <p className="text-white font-medium max-w-[180px] truncate">{selectedApp.resumeName || 'Attachment'}</p>
                                                <p className="text-[10px] text-slate-500 mt-0.5">
                                                    {selectedApp.resumeSize ? `${(selectedApp.resumeSize / (1024 * 1024)).toFixed(2)} MB` : 'Validated document'}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (selectedApp.resumeUrl) {
                                                    window.open(selectedApp.resumeUrl, '_blank');
                                                } else {
                                                    toast.warning('No resume URL found for this application.');
                                                }
                                            }}
                                            className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-cyan-500/20 text-cyan-400 text-[10px] font-bold transition-all cursor-pointer"
                                        >
                                            Download
                                        </button>
                                    </div>
                                    
                                    {/* Embedded Document Preview */}
                                    {selectedApp.resumeUrl ? (
                                        <div className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-black/20">
                                            {selectedApp.resumeType && selectedApp.resumeType.includes('image') ? (
                                                <img 
                                                    src={selectedApp.resumeUrl} 
                                                    alt="Resume Preview" 
                                                    className="w-full h-auto max-h-72 object-contain mx-auto"
                                                />
                                            ) : (
                                                <iframe 
                                                    src={`${selectedApp.resumeUrl}#toolbar=0&navpanes=0`}
                                                    className="w-full h-80 border-0 bg-white"
                                                    title="Resume Preview"
                                                />
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-[10px] text-slate-500 italic mt-2">No resume document uploaded.</p>
                                    )}
                                </div>

                                {/* Cover message */}
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cover Note</h4>
                                    <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 text-slate-400 leading-relaxed max-h-48 overflow-y-auto">
                                        {selectedApp.coverMessage || 'No cover message or introduction provided by the applicant.'}
                                    </div>
                                </div>
                            </div>

                            {/* Drawer Footer Actions */}
                            <div className="px-6 py-5 border-t border-white/[0.08] bg-white/[0.01] flex-shrink-0 space-y-3">
                                <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">
                                    <span>Current Status:</span>
                                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono text-[10px] font-bold">
                                        {selectedApp.status}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2.5">
                                    {/* Mark Reviewing */}
                                    <button
                                        onClick={() => handleUpdateAppStatus(selectedApp.id, 'reviewing')}
                                        disabled={selectedApp.status === 'reviewing' || selectedApp.status === 'shortlisted' || selectedApp.status === 'interviewScheduled' || selectedApp.status === 'offered'}
                                        className="py-2.5 rounded-xl border border-cyan-500/20 hover:border-cyan-500/40 bg-cyan-500/[0.02] hover:bg-cyan-500/[0.06] text-cyan-400 font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none text-[10px]"
                                    >
                                        <Eye className="w-3.5 h-3.5" /> Mark Reviewing
                                    </button>

                                    {/* Shortlist / Revoke Shortlist */}
                                    {selectedApp.status === 'shortlisted' ? (
                                        <button
                                            onClick={() => handleUpdateAppStatus(selectedApp.id, 'reviewing')}
                                            className="py-2.5 rounded-xl border border-amber-500/30 hover:border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer text-[10px]"
                                        >
                                            <ArrowLeft className="w-3.5 h-3.5" /> Revoke Shortlist
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleUpdateAppStatus(selectedApp.id, 'shortlisted')}
                                            disabled={selectedApp.status === 'interviewScheduled' || selectedApp.status === 'offered' || selectedApp.status === 'rejected'}
                                            className="py-2.5 rounded-xl border border-emerald-500/20 hover:border-emerald-500/40 bg-emerald-500/[0.02] hover:bg-emerald-500/[0.06] text-emerald-400 font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none text-[10px]"
                                        >
                                            <CheckCircle2 className="w-3.5 h-3.5" /> Shortlist
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-2.5">
                                    {/* Schedule Interview / Revoke Interview */}
                                    {selectedApp.status === 'interviewScheduled' ? (
                                        <button
                                            onClick={() => handleUpdateAppStatus(selectedApp.id, 'shortlisted')}
                                            className="py-2.5 rounded-xl border border-amber-500/30 hover:border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer text-[10px]"
                                        >
                                            <ArrowLeft className="w-3.5 h-3.5" /> Revoke Interview
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setInterviewForm({
                                                    date: selectedApp.interviewDetails?.date || '',
                                                    time: selectedApp.interviewDetails?.time || '',
                                                    meetingLink: selectedApp.interviewDetails?.meetingLink || '',
                                                    notes: selectedApp.interviewDetails?.notes || ''
                                                });
                                                setIsInterviewModalOpen(true);
                                            }}
                                            disabled={selectedApp.status === 'rejected' || selectedApp.status === 'offered' || selectedApp.status === 'new' || selectedApp.status === 'pending_review' || selectedApp.status === 'reviewing'}
                                            className="py-2.5 rounded-xl border border-purple-500/20 hover:border-purple-500/40 bg-purple-500/[0.02] hover:bg-purple-500/[0.06] text-purple-400 font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none text-[10px]"
                                        >
                                            <Calendar className="w-3.5 h-3.5" /> Schedule Interview
                                        </button>
                                    )}

                                    {/* Send Offer / Revoke Offer */}
                                    {selectedApp.status === 'offered' ? (
                                        <button
                                            onClick={() => handleUpdateAppStatus(selectedApp.id, 'shortlisted')}
                                            className="py-2.5 rounded-xl border border-amber-500/30 hover:border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer text-[10px]"
                                        >
                                            <ArrowLeft className="w-3.5 h-3.5" /> Revoke Offer
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setOfferForm({
                                                    file: null,
                                                    uploading: false,
                                                    progress: 0,
                                                    offerLetterUrl: selectedApp.offerDetails?.offerLetterUrl || '',
                                                    offerLetterName: selectedApp.offerDetails?.offerLetterName || ''
                                                });
                                                setIsOfferModalOpen(true);
                                            }}
                                            disabled={selectedApp.status === 'rejected' || selectedApp.status === 'new' || selectedApp.status === 'pending_review' || selectedApp.status === 'reviewing'}
                                            className="py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold flex items-center justify-center gap-1.5 hover:shadow-emerald-500/10 hover:shadow-lg transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none text-[10px]"
                                        >
                                            <Award className="w-3.5 h-3.5" /> Send Offer
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1">
                                    {/* Reject / Revoke Rejection */}
                                    {selectedApp.status === 'rejected' ? (
                                        <button
                                            onClick={() => handleUpdateAppStatus(selectedApp.id, 'reviewing')}
                                            className="py-2.5 rounded-xl border border-amber-500/30 hover:border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer text-[10px]"
                                        >
                                            <ArrowLeft className="w-3.5 h-3.5" /> Revoke Rejection
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleUpdateAppStatus(selectedApp.id, 'rejected')}
                                            disabled={selectedApp.status === 'offered'}
                                            className="py-2.5 rounded-xl border border-red-500/20 hover:border-red-500/40 bg-red-500/[0.02] hover:bg-red-500/[0.06] text-red-400 font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none text-[10px]"
                                        >
                                            <XCircle className="w-3.5 h-3.5" /> Reject Applicant
                                        </button>
                                    )}
                                </div>

                                <button
                                    onClick={() => setIsDrawerOpen(false)}
                                    className="w-full py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all font-semibold cursor-pointer text-center"
                                >
                                    Close Assessment
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── JOB PREVIEW MODAL ── */}
            <AnimatePresence>
                {previewJob && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 bg-[#080d1a]/85 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-3xl bg-[#0B0F1A] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl relative"
                        >
                            {/* Modal Header */}
                            <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.01]">
                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <Eye className="w-4 h-4 text-cyan-400" /> Public View Preview
                                </h3>
                                <button
                                    onClick={() => setPreviewJob(null)}
                                    className="p-1 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Job card contents mockup */}
                            <div className="p-6 md:p-8 space-y-6 max-h-[70vh] overflow-y-auto text-slate-300">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2.5 mb-3">
                                        <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                            {previewJob.department}
                                        </span>
                                        {previewJob.workMode === 'Remote' ? (
                                            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                Remote
                                            </span>
                                        ) : (
                                            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                {previewJob.workMode}
                                            </span>
                                        )}
                                        {previewJob.openToInterns && (
                                            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                                Open to Interns
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="text-2xl font-bold text-white font-display">{previewJob.title}</h2>
                                    
                                    <div className="flex flex-wrap gap-4 text-xs text-slate-500 mt-2">
                                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {previewJob.location}</span>
                                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {previewJob.employmentType}</span>
                                        <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> {previewJob.salaryRange || 'Competitive stipend'}</span>
                                    </div>
                                </div>

                                <div className="space-y-1 bg-white/[0.01] border border-white/5 rounded-2xl p-5">
                                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Short Summary</h4>
                                    <p className="text-xs text-slate-400 leading-relaxed">{previewJob.shortDescription}</p>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Role Overview</h4>
                                    <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-line">{previewJob.fullDescription}</p>
                                </div>

                                {/* Skills */}
                                {previewJob.skills && previewJob.skills.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Core Requirements</h4>
                                        <div className="flex flex-wrap gap-1.5">
                                            {previewJob.skills.map((skill, idx) => (
                                                <span key={idx} className="text-xs px-2.5 py-1 rounded-lg bg-white/[0.03] text-slate-300 border border-white/5 font-mono">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Responsibilities */}
                                {previewJob.responsibilities && previewJob.responsibilities.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Responsibilities</h4>
                                        <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-400">
                                            {previewJob.responsibilities.map((resp, idx) => (
                                                <li key={idx}>{resp}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Benefits */}
                                {previewJob.benefits && previewJob.benefits.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Job Perks & Benefits</h4>
                                        <div className="flex flex-wrap gap-1.5">
                                            {previewJob.benefits.map((benefit, idx) => (
                                                <span key={idx} className="text-xs px-2.5 py-1 rounded-lg bg-white/[0.03] text-cyan-400/80 border border-cyan-500/10">
                                                    {benefit}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Modal actions */}
                            <div className="px-6 py-4 border-t border-white/[0.08] flex items-center justify-end bg-white/[0.01]">
                                <button
                                    onClick={() => setPreviewJob(null)}
                                    className="px-5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-slate-300 transition-colors"
                                >
                                    Close Preview
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── DELETE CONFIRMATION MODAL ── */}
            <AnimatePresence>
                {deleteConfirmJob && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080d1a]/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md bg-[#0B0F1A] border border-white/[0.08] rounded-3xl p-6 shadow-2xl space-y-6"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                                    <AlertTriangle className="w-5 h-5 text-red-400" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-sm font-bold text-white font-display">Delete Job Listing?</h3>
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        Are you sure you want to permanently delete the vacancy for <strong className="text-white">{deleteConfirmJob.title}</strong>? All public cards will be removed. This action is irreversible.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3">
                                <button
                                    onClick={() => setDeleteConfirmJob(null)}
                                    className="px-4 py-2.5 rounded-xl border border-white/10 text-slate-400 text-xs font-semibold hover:bg-white/[0.04] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteJob}
                                    className="px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-all shadow-lg shadow-red-500/10 cursor-pointer"
                                >
                                    Permanently Delete
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── INTERVIEW SCHEDULING MODAL ── */}
            <AnimatePresence>
                {isInterviewModalOpen && selectedApp && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080d1a]/85 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md bg-[#0B0F1A] border border-white/[0.08] rounded-3xl p-6 shadow-2xl space-y-6 text-left"
                        >
                            <div>
                                <h3 className="text-sm font-bold text-white font-display">Schedule Interview</h3>
                                <p className="text-[10px] text-slate-500 mt-0.5">Applicant: {selectedApp.fullName}</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Interview Date *</label>
                                    <input 
                                        type="date"
                                        value={interviewForm.date}
                                        onChange={(e) => setInterviewForm({ ...interviewForm, date: e.target.value })}
                                        className="w-full bg-[#111827] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/40 cursor-pointer"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Interview Time *</label>
                                    <input 
                                        type="time"
                                        value={interviewForm.time}
                                        onChange={(e) => setInterviewForm({ ...interviewForm, time: e.target.value })}
                                        className="w-full bg-[#111827] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/40 cursor-pointer"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Meeting Link *</label>
                                    <input 
                                        type="url"
                                        placeholder="e.g. https://meet.google.com/abc-defg-hij"
                                        value={interviewForm.meetingLink}
                                        onChange={(e) => setInterviewForm({ ...interviewForm, meetingLink: e.target.value })}
                                        className="w-full bg-[#111827] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/40"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Additional Notes</label>
                                    <textarea 
                                        rows={3}
                                        placeholder="e.g. Please bring a copy of your portfolio."
                                        value={interviewForm.notes}
                                        onChange={(e) => setInterviewForm({ ...interviewForm, notes: e.target.value })}
                                        className="w-full bg-[#111827] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/40 resize-none"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    onClick={() => setIsInterviewModalOpen(false)}
                                    className="px-4 py-2.5 rounded-xl border border-white/10 text-slate-400 text-xs font-semibold hover:bg-white/[0.04] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={async () => {
                                        if (!interviewForm.date || !interviewForm.time || !interviewForm.meetingLink) {
                                            toast.warning('Please fill in all required fields.');
                                            return;
                                        }
                                        await handleUpdateAppStatus(selectedApp.id, 'interviewScheduled', {
                                            interviewDetails: interviewForm
                                        });
                                        setIsInterviewModalOpen(false);
                                    }}
                                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-500/10 cursor-pointer"
                                >
                                    Schedule & Send Invite
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── SEND OFFER MODAL ── */}
            <AnimatePresence>
                {isOfferModalOpen && selectedApp && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080d1a]/85 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md bg-[#0B0F1A] border border-white/[0.08] rounded-3xl p-6 shadow-2xl space-y-6 text-left"
                        >
                            <div>
                                <h3 className="text-sm font-bold text-white font-display">Send Offer Letter</h3>
                                <p className="text-[10px] text-slate-500 mt-0.5">Applicant: {selectedApp.fullName}</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Offer Letter PDF *</label>
                                    
                                    <div className="flex flex-col gap-3">
                                        <input 
                                            type="file"
                                            ref={offerFileInputRef}
                                            accept="application/pdf"
                                            onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (!file) return;
                                                
                                                if (file.type !== 'application/pdf') {
                                                    toast.error('Only PDF documents are allowed.');
                                                    if (offerFileInputRef.current) offerFileInputRef.current.value = '';
                                                    return;
                                                }

                                                setOfferForm(prev => ({ 
                                                    ...prev, 
                                                    file, 
                                                    uploading: true, 
                                                    progress: 0 
                                                }));

                                                try {
                                                    const path = `careers_offers/${Date.now()}_${file.name}`;
                                                    const downloadUrl = await uploadFile(file, path, (progress) => {
                                                        setOfferForm(prev => ({ ...prev, progress }));
                                                    });
                                                    setOfferForm(prev => ({ 
                                                        ...prev, 
                                                        offerLetterUrl: downloadUrl,
                                                        offerLetterName: file.name,
                                                        uploading: false 
                                                    }));
                                                    toast.success('Offer letter uploaded successfully.');
                                                } catch (err) {
                                                    console.error('Offer upload error:', err);
                                                    toast.error('Failed to upload offer letter.');
                                                    setOfferForm(prev => ({ ...prev, file: null, uploading: false }));
                                                    if (offerFileInputRef.current) offerFileInputRef.current.value = '';
                                                }
                                            }}
                                            className="hidden"
                                        />
                                        
                                        <div 
                                            onClick={() => !offerForm.uploading && offerFileInputRef.current?.click()}
                                            className={`border border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                                                offerForm.file ? 'border-emerald-500/40 bg-emerald-500/[0.02]' : 'border-white/10 hover:border-cyan-500/30 hover:bg-white/[0.02]'
                                            }`}
                                        >
                                            <Upload className={`w-6 h-6 ${offerForm.file ? 'text-emerald-400' : 'text-slate-500'}`} />
                                            <div className="text-center">
                                                <p className="text-white font-medium text-xs">
                                                    {offerForm.file ? offerForm.file.name : 'Choose Offer PDF File'}
                                                </p>
                                                <p className="text-[10px] text-slate-500 mt-0.5">
                                                    {offerForm.file ? `${(offerForm.file.size / (1024 * 1024)).toFixed(2)} MB` : 'Max size: 10MB'}
                                                </p>
                                            </div>
                                        </div>

                                        {offerForm.uploading && (
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                                                    <span>Uploading to storage...</span>
                                                    <span>{offerForm.progress}%</span>
                                                </div>
                                                <div className="w-full bg-[#111827] rounded-full h-1 overflow-hidden">
                                                    <div className="bg-cyan-500 h-full transition-all" style={{ width: `${offerForm.progress}%` }} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    onClick={() => setIsOfferModalOpen(false)}
                                    className="px-4 py-2.5 rounded-xl border border-white/10 text-slate-400 text-xs font-semibold hover:bg-white/[0.04] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={async () => {
                                        if (!offerForm.offerLetterUrl) {
                                            toast.warning('Please upload the offer letter PDF.');
                                            return;
                                        }
                                        await handleUpdateAppStatus(selectedApp.id, 'offered', {
                                            offerDetails: {
                                                offerLetterUrl: offerForm.offerLetterUrl,
                                                offerLetterName: offerForm.offerLetterName
                                            }
                                        });
                                        setIsOfferModalOpen(false);
                                    }}
                                    disabled={offerForm.uploading || !offerForm.offerLetterUrl}
                                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-500/10 cursor-pointer disabled:opacity-35 disabled:pointer-events-none"
                                >
                                    Send Offer Email
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
