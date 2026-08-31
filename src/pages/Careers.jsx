import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Briefcase, MapPin, Clock, Search, Bookmark, Check, 
    ChevronDown, ChevronUp, Upload, User, Mail, Phone, 
    FileText, ArrowRight, CheckCircle2, AlertCircle, Sparkles, 
    Star, Users, DollarSign, Award, Shield, Globe, Terminal, 
    Workflow, Trash2, Activity
} from 'lucide-react';
import { db } from '../firebase/config';
import { doc, collection, serverTimestamp, query, where, onSnapshot } from 'firebase/firestore';
import { setDocSafe } from '../firebase/firestoreUtils';
import { uploadFile } from '../firebase/storage';
import { toast } from '../components/Toast';
import ParticleBackground from '../components/homepage/ParticleBackground';
import Footer from '../components/homepage/Footer';

// Seeded Open Roles data
const OPEN_ROLES = [
    {
        id: 'frontend-dev',
        title: 'Frontend Developer',
        department: 'Engineering',
        location: 'Remote',
        type: 'Full-time',
        description: 'Build premium, responsive user interfaces for health-data vaults and patient dashboards using React, Tailwind CSS, and Framer Motion.',
        skills: ['React', 'Tailwind CSS', 'Framer Motion', 'Vite', 'TypeScript'],
        remote: true,
        intern: false,
        salary: 'Competitive Salary + Equity',
    },
    {
        id: 'backend-dev',
        title: 'Backend Developer',
        department: 'Engineering',
        location: 'Hybrid (Bangalore)',
        type: 'Full-time',
        description: 'Design secure, scalable REST/GraphQL APIs, manage Firestore integrations, and implement HIPAA-compliant medical records pipelines.',
        skills: ['Node.js', 'Express', 'Firebase/Firestore', 'NoSQL', 'Security APIs'],
        remote: false,
        intern: false,
        salary: 'Competitive Salary + Equity',
    },
    {
        id: 'uiux-designer',
        title: 'UI/UX Designer',
        department: 'Product & Design',
        location: 'Remote',
        type: 'Full-time',
        description: 'Shape the visual identity, user journeys, and dashboard experiences of our decentralization and clinical staff portals.',
        skills: ['Figma', 'UI Design', 'Design Systems', 'Prototyping', 'User Research'],
        remote: true,
        intern: false,
        salary: 'Competitive Salary + Equity',
    },
    {
        id: 'product-intern',
        title: 'Product Management Intern',
        department: 'Product & Design',
        location: 'Hybrid (Bangalore)',
        type: 'Internship',
        description: 'Work closely with engineering, design, and operations teams to define requirements, map health records compliance, and build user stories.',
        skills: ['Agile', 'Jira', 'Product Specs', 'Data Analytics', 'Healthcare Tech'],
        remote: false,
        intern: true,
        salary: 'Competitive Stipend',
    },
    {
        id: 'health-ops',
        title: 'Healthcare Operations Associate',
        department: 'Operations',
        location: 'Remote',
        type: 'Full-time',
        description: 'Manage clinic/hospital onboarding pipelines, facilitate integration sessions, and ensure data privacy compliance across partner clinics.',
        skills: ['Operations', 'Client Relations', 'HIPAA Regulations', 'Healthcare Standards'],
        remote: true,
        intern: false,
        salary: 'Competitive Salary',
    },
    {
        id: 'fullstack-dev',
        title: 'Full Stack Developer',
        department: 'Engineering',
        location: 'Remote',
        type: 'Full-time',
        description: 'Own feature deployments end-to-end, integrating React clients with Hardhat smart contracts, IPFS storage, and Express backends.',
        skills: ['React', 'Node.js', 'Solidity/Ethers', 'IPFS', 'Hardhat'],
        remote: true,
        intern: false,
        salary: 'Competitive Salary + Equity',
    },
    {
        id: 'qa-engineer',
        title: 'QA Engineer',
        department: 'Engineering',
        location: 'Hybrid (Bangalore)',
        type: 'Full-time',
        description: 'Establish automated end-to-end testing scripts for personal health records, clinical authentication workflows, and access logs auditing.',
        skills: ['Cypress', 'Jest', 'API Testing', 'Automation', 'Regression Testing'],
        remote: false,
        intern: false,
        salary: 'Competitive Salary',
    },
    {
        id: 'devops-cloud',
        title: 'DevOps / Cloud Security Engineer',
        department: 'Engineering',
        location: 'Remote',
        type: 'Full-time',
        description: 'Harden cloud infrastructure on GCP/Firebase, run continuous security scanning, set up CI/CD, and oversee blockchain node deployments.',
        skills: ['GCP', 'Firebase CLI', 'CI/CD', 'Security Scans', 'Hardhat Nodes'],
        remote: true,
        intern: false,
        salary: 'Competitive Salary + Equity',
    }
];

// Why Join Us section items
const WHY_JOIN_US = [
    {
        icon: Shield,
        title: 'Mission-Driven Product',
        description: 'We are restructuring health data ownership, securing medical archives on an immutable decentralized blockchain ledger.'
    },
    {
        icon: Activity,
        title: 'Real Healthcare Impact',
        description: 'Directly solve clinical fragmentation. Give patients custody of their own charts and expedite life-saving emergency medical details.'
    },
    {
        icon: Sparkles,
        title: 'High Growth Startup Environment',
        description: 'Join an agile, fast-executing core squad. Make high-impact decisions daily and capture ownership of full feature sets.'
    },
    {
        icon: Award,
        title: 'Autonomy and Ownership',
        description: 'We value leadership, clear code, and proactive product scoping. You specify, build, and deploy your own modules.'
    },
    {
        icon: Globe,
        title: 'Remote / Hybrid Flexibility',
        description: 'Work from our Bangalore hub or coordinate synchronously from home. We operate on results, not desk hours.'
    },
    {
        icon: Terminal,
        title: 'Cutting Edge Technology Stack',
        description: 'Build with React, Framer Motion, Tailwind, ethers.js, Hardhat smart contracts, IPFS nodes, and robust Firestore architectures.'
    }
];

// Culture elements
const CULTURE_ELEMENTS = [
    {
        number: '01',
        title: 'Agile & Compact Core Team',
        desc: 'We minimize bureaucratic hurdles and meeting overhead. We run standups fast and ship features directly to production.'
    },
    {
        number: '02',
        title: 'Absolute Ownership & Accountability',
        desc: 'No micro-management. Every developer owns their epic, writes their validation scripts, and is responsible for security audits.'
    },
    {
        number: '03',
        title: 'Data Privacy Obsessed',
        desc: 'Working with patient records requires clinical-grade precautions. Encryption, sanitization, and security reviews guide every design.'
    },
    {
        number: '04',
        title: 'Continuous Growth & Support',
        desc: 'Get stipends for developer conferences, courses, and node development hardware. We scale together.'
    }
];

// Hiring process steps
const HIRING_PROCESS = [
    {
        step: 1,
        title: 'Secure Online Application',
        desc: 'Submit your resume and links. We review all applications within 48 business hours.'
    },
    {
        step: 2,
        title: 'Sync & Mission Intro Call',
        desc: 'A 20-minute discussion regarding our core product, architecture, and your technical timeline.'
    },
    {
        step: 3,
        title: 'Practical Scoping Task',
        desc: 'A short, relevant take-home task (or system design walkthrough) modeled around medical APIs or UI layouts.'
    },
    {
        step: 4,
        title: 'Deep-dive Panel Review',
        desc: 'A final chat with our engineers and PMs focusing on tech proficiency, architecture patterns, and team fit.'
    },
    {
        step: 5,
        title: 'The HealthChain Offer',
        desc: 'Receive competitive compensation details, equity projections, benefits packages, and an onboarding schedule.'
    }
];

// Benefits elements
const BENEFITS = [
    { icon: DollarSign, title: 'Top-tier Stipends & Equity', desc: 'Ownership stakes for full-time hires and top-of-market hourly stipends for interns.' },
    { icon: Globe, title: 'Flexible Work Setup', desc: 'Full office gear setup reimbursement, including high-speed internet stipends.' },
    { icon: Clock, title: 'Unlimited Work/Life Balance', desc: 'Flexible holiday allowance. Take time off when needed to stay sharp.' },
    { icon: Star, title: 'Health & Wellness', desc: 'Premium comprehensive medical insurance for you and your direct dependents.' }
];

// FAQ items
const FAQs = [
    {
        q: 'Is this position remote or hybrid?',
        a: 'We support both! Depending on the role, we offer full-time remote options or hybrid workspaces out of our hub in Bangalore. Check the badge on each role card for specifics.'
    },
    {
        q: 'What technologies does HealthChain use?',
        a: 'Our frontend is built on React 18, Vite, Framer Motion, and Tailwind CSS. The blockchain/ledger features integrate Ethereum smart contracts, Hardhat, ethers.js, and IPFS nodes. The database layer uses Firebase Firestore and Cloud Storage.'
    },
    {
        q: 'Are stipends and relocation benefits provided for interns?',
        a: 'Yes! All internships are fully paid with premium stipends. If a hybrid internship requires moving closer to our Bangalore office, we assist with initial relocation and housing logs support.'
    },
    {
        q: 'What kind of background checks are conducted?',
        a: 'Since we develop HIPAA-compliant software integrating electronic medical files, standard background verifications may be requested prior to final enrollment to preserve patient-data compliance.'
    },
    {
        q: 'What characteristics do you look for in candidates?',
        a: 'We seek proactive builders who value code cleaniness, respect user security, and have a passion for creating high-performance tools. Writing tests and taking ownership of your files are core expectations.'
    }
];

export default function Careers() {
    const rolesSectionRef = useRef(null);
    const formSectionRef = useRef(null);

    // Filters and search states
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDept, setSelectedDept] = useState('All');
    const [selectedLoc, setSelectedLoc] = useState('All');
    const [showSavedOnly, setShowSavedOnly] = useState(false);

    // Saved Roles state (Persisted in localStorage)
    const [savedRoles, setSavedRoles] = useState(() => {
        try {
            const saved = localStorage.getItem('hc_saved_roles');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('hc_saved_roles', JSON.stringify(savedRoles));
    }, [savedRoles]);

    const toggleSaveRole = (roleId) => {
        if (savedRoles.includes(roleId)) {
            setSavedRoles(savedRoles.filter(id => id !== roleId));
            toast.info('Role removed from saved list.');
        } else {
            setSavedRoles([...savedRoles, roleId]);
            toast.success('Role bookmarked successfully!');
        }
    };

    // Accordion FAQ states
    const [openFaq, setOpenFaq] = useState(null);

    // Application Form States
    const [selectedRole, setSelectedRole] = useState('');
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        experience: '0-1 years',
        portfolioUrl: '',
        coverMessage: '',
    });
    const [formErrors, setFormErrors] = useState({});

    // File Upload states
    const [resumeFile, setResumeFile] = useState(null);
    const [resumeUrl, setResumeUrl] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    // Submission states
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // Fetch roles dynamically from Firestore jobs collection
    const [dbRoles, setDbRoles] = useState([]);
    const [loadingRoles, setLoadingRoles] = useState(true);

    useEffect(() => {
        const jobsQuery = query(
            collection(db, 'jobs'),
            where('status', '==', 'published')
        );
        const unsubscribe = onSnapshot(jobsQuery, (snapshot) => {
            const list = [];
            snapshot.forEach((doc) => {
                list.push({ id: doc.id, ...doc.data() });
            });
            // Adapt database workMode format to match structure expected by UI:
            // if workMode is 'Remote', set remote=true
            const adapted = list.map(item => ({
                ...item,
                remote: item.workMode === 'Remote',
                intern: item.openToInterns,
                salary: item.salaryRange || 'Competitive stipend',
                description: item.shortDescription
            }));
            setDbRoles(adapted);
            setLoadingRoles(false);
        }, (err) => {
            console.error('Fetch public roles error:', err);
            setLoadingRoles(false);
        });

        return () => unsubscribe();
    }, []);

    // Fallback to static OPEN_ROLES if database contains no listings
    const activeRolesList = dbRoles.length > 0 ? dbRoles : OPEN_ROLES;

    // Filter logic
    const filteredRoles = activeRolesList.filter(role => {
        const matchesSearch = role.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              role.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              role.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesDept = selectedDept === 'All' || role.department === selectedDept;
        const matchesLoc = selectedLoc === 'All' || 
                           (selectedLoc === 'Remote' && role.remote) || 
                           (selectedLoc === 'Hybrid' && !role.remote);
        
        const matchesSaved = !showSavedOnly || savedRoles.includes(role.id);

        return matchesSearch && matchesDept && matchesLoc && matchesSaved;
    });

    // Departments for filter
    const departments = ['All', 'Engineering', 'Product & Design', 'Operations'];

    // Scroll helpers
    const scrollToSection = (ref) => {
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // Handle apply button click on job cards
    const handleApplyClick = (roleTitle) => {
        setSelectedRole(roleTitle);
        scrollToSection(formSectionRef);
    };

    // File selection & validation
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Secure file validation
        // 1. Extension Allow-list
        const allowedExtensions = /(\.pdf|\.docx|\.png|\.jpg|\.jpeg)$/i;
        if (!allowedExtensions.exec(file.name)) {
            toast.error('Invalid file format. Only PDF, DOCX, PNG, and JPG files are allowed.');
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        // 2. Size validation (Max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            toast.error('File size exceeds the 5MB limit. Please compress your file.');
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        // Clear errors for file
        setFormErrors(prev => ({ ...prev, resume: '' }));
        
        // Real secure upload to Firebase Storage
        setResumeFile(file);
        setIsUploading(true);
        setUploadProgress(0);
        
        const path = `careers_resumes/${Date.now()}_${file.name}`;
        uploadFile(file, path, (progress) => {
            setUploadProgress(progress);
        }).then((downloadUrl) => {
            setResumeUrl(downloadUrl);
            setIsUploading(false);
            toast.success('Resume uploaded and verified successfully.');
        }).catch((err) => {
            console.error('File upload error:', err);
            toast.error('Failed to upload resume. Please try again.');
            setResumeFile(null);
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        });
    };

    // Form field validators
    const validateForm = () => {
        const errors = {};
        
        // Sanitize names - ensure it's not empty and length is sensible
        if (!form.name.trim()) {
            errors.name = 'Full name is required.';
        } else if (form.name.trim().length < 2) {
            errors.name = 'Name must be at least 2 characters.';
        }

        // Strict Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!form.email.trim()) {
            errors.email = 'Email address is required.';
        } else if (!emailRegex.test(form.email)) {
            errors.email = 'Enter a valid email address.';
        }

        // Phone number validation (simple length check)
        const phoneDigits = form.phone.replace(/\D/g, '');
        if (!form.phone.trim()) {
            errors.phone = 'Phone number is required.';
        } else if (phoneDigits.length < 8) {
            errors.phone = 'Enter a valid phone number.';
        }

        // Selected role verification
        if (!selectedRole) {
            errors.role = 'Please select a role to apply for.';
        }

        // Portfolio/LinkedIn URL check if provided
        if (form.portfolioUrl.trim()) {
            try {
                // Ensure protocol is present
                let urlString = form.portfolioUrl.trim();
                if (!/^https?:\/\//i.test(urlString)) {
                    urlString = 'https://' + urlString;
                }
                new URL(urlString);
            } catch (_) {
                errors.portfolioUrl = 'Please provide a valid URL.';
            }
        }

        // Resume file required check
        if (!resumeFile) {
            errors.resume = 'Please upload your resume.';
        } else if (isUploading) {
            errors.resume = 'Please wait for the upload to complete.';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Form Submit Handler
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.warning('Please fix the validation errors before submitting.');
            return;
        }

        setIsSubmitting(true);

        try {
            const selectedRoleObj = activeRolesList.find(r => r.title === selectedRole);
            // Setup payloads securely, stripping dangerous tags or formatting
            const payload = {
                fullName: form.name.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                experience: form.experience,
                appliedRole: selectedRole,
                jobId: selectedRoleObj ? selectedRoleObj.id : '',
                jobTitle: selectedRoleObj ? selectedRoleObj.title : selectedRole,
                department: selectedRoleObj ? selectedRoleObj.department : '',
                portfolioUrl: form.portfolioUrl.trim(),
                coverMessage: form.coverMessage.trim(),
                resumeName: resumeFile.name,
                resumeSize: resumeFile.size,
                resumeType: resumeFile.type,
                resumeUrl: resumeUrl || '',
                submittedAt: serverTimestamp(),
                createdAt: serverTimestamp(),
                status: 'new',
                emailNotifications: {
                    applicationReceived: false,
                    reviewing: false,
                    shortlisted: false,
                    interviewScheduled: false,
                    rejected: false,
                    offered: false
                }
            };

            // Write to Careers Applications securely via setDocSafe
            const applicationRef = doc(collection(db, 'careers_applications'));
            await setDocSafe(applicationRef, payload, {}, 'Submitting application');

            setSubmitSuccess(true);
            toast.success('Your application has been received! Our team will contact you shortly.');

            // Clear inputs
            setForm({
                name: '',
                email: '',
                phone: '',
                experience: '0-1 years',
                portfolioUrl: '',
                coverMessage: '',
            });
            setResumeFile(null);
            setResumeUrl('');
            setUploadProgress(0);
            if (fileInputRef.current) fileInputRef.current.value = '';

        } catch (error) {
            console.error('Submit application error:', error);
            // Error handling toast is already raised by handleFirebaseError within firestoreUtils
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-navy-950 text-slate-100 font-sans">
            <ParticleBackground />

            {/* Glowing Ambient Accents */}
            <div className="absolute top-1/4 left-0 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-teal-400/5 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative z-10 pt-24 pb-16">
                
                {/* ── 1. HERO SECTION ── */}
                <section className="max-w-5xl mx-auto px-6 text-center mb-20 lg:mb-28">
                    <motion.div
                        initial={{ opacity: 0, y: 35 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                            <span className="text-xs text-cyan-400 font-semibold uppercase tracking-wider">Careers at HealthChain</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black text-white leading-tight mb-6">
                            Build the Future of
                            <br />
                            <span className="bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-500 bg-clip-text text-transparent">
                                Healthcare Interoperability
                            </span>
                        </h1>
                        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-8">
                            HealthChain is a secure electronic vault built on Web3 ledgers and AI analytics. We empower patients with true data sovereignty. Join us to build clinic integration tunnels and personal record encryptions.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={() => scrollToSection(rolesSectionRef)}
                                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold hover:shadow-cyan-500/10 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 group"
                            >
                                View Open Roles 
                                <ArrowRight className="w-4.5 h-4.5 transition-transform group-hover:translate-x-1" />
                            </button>
                            <button
                                onClick={() => scrollToSection(formSectionRef)}
                                className="w-full sm:w-auto px-8 py-4 rounded-xl border border-white/10 hover:border-cyan-500/30 bg-white/[0.02] hover:bg-white/[0.06] text-slate-300 font-semibold transition-all duration-300"
                            >
                                Apply Directly
                            </button>
                        </div>
                    </motion.div>
                </section>


                {/* ── 2. WHY JOIN US ── */}
                <section className="max-w-6xl mx-auto px-6 mb-24 lg:mb-32">
                    <div className="text-center mb-16">
                        <span className="text-xs text-cyan-400 font-bold uppercase tracking-widest">Company Mission</span>
                        <h2 className="text-3xl lg:text-4xl font-display font-bold text-white mt-3">
                            Why Join Our Team
                        </h2>
                        <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-xl mx-auto">
                            We value autonomy, fast iterations, and clinical-grade security. Here is what we offer you.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {WHY_JOIN_US.map((item, index) => (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-50px' }}
                                transition={{ duration: 0.5, delay: index * 0.08 }}
                                className="backdrop-blur-xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 rounded-2xl p-6 hover:bg-white/[0.04] transition-all duration-500 group flex flex-col justify-between"
                            >
                                <div>
                                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300">
                                        <item.icon className="w-6 h-6 text-cyan-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                                    <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>


                {/* ── 3. OPEN ROLES SECTION ── */}
                <section ref={rolesSectionRef} className="max-w-5xl mx-auto px-6 mb-24 lg:mb-32 scroll-mt-24">
                    <div className="text-center mb-12">
                        <span className="text-xs text-cyan-400 font-bold uppercase tracking-widest">Available Nodes</span>
                        <h2 className="text-3xl lg:text-4xl font-display font-bold text-white mt-3">
                            Open Career Roles
                        </h2>
                    </div>

                    {/* Filter & Search Bar */}
                    <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-4 md:p-6 mb-8 shadow-md">
                        <div className="flex flex-col lg:flex-row gap-4">
                            
                            {/* Search */}
                            <div className="relative flex-1">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by role, skills, keywords..."
                                    className="w-full bg-white/[0.03] border border-white/10 focus:border-cyan-500/40 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none transition-all"
                                />
                            </div>

                            {/* Location Filter */}
                            <div className="w-full lg:w-48">
                                <select
                                    value={selectedLoc}
                                    onChange={(e) => setSelectedLoc(e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/10 focus:border-cyan-500/40 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all cursor-pointer"
                                >
                                    <option value="All" className="bg-navy-900 text-slate-200">All Locations</option>
                                    <option value="Remote" className="bg-navy-900 text-slate-200">Remote Only</option>
                                    <option value="Hybrid" className="bg-navy-900 text-slate-200">Hybrid / Bangalore</option>
                                </select>
                            </div>

                            {/* Bookmark Filter Toggle */}
                            <button
                                onClick={() => setShowSavedOnly(!showSavedOnly)}
                                className={`px-5 py-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
                                    showSavedOnly 
                                        ? 'bg-cyan-500/10 border-cyan-400 text-cyan-400 shadow-neon-sm' 
                                        : 'border-white/10 text-slate-400 bg-white/[0.02] hover:bg-white/[0.04]'
                                }`}
                            >
                                <Bookmark className={`w-4 h-4 ${showSavedOnly ? 'fill-cyan-400' : ''}`} />
                                Saved ({savedRoles.length})
                            </button>

                        </div>

                        {/* Department tabs */}
                        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-white/5">
                            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider mr-2">Department:</span>
                            {departments.map(dept => (
                                <button
                                    key={dept}
                                    onClick={() => setSelectedDept(dept)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                                        selectedDept === dept 
                                            ? 'bg-cyan-500 text-navy-950 shadow-md font-bold' 
                                            : 'bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.06]'
                                    }`}
                                >
                                    {dept}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Roles list grid */}
                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {filteredRoles.map((role) => (
                                <motion.div
                                    key={role.id}
                                    layout
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.4 }}
                                    className="backdrop-blur-xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/10 hover:border-cyan-500/30 rounded-2xl p-6 hover:bg-white/[0.04] transition-all duration-300 flex flex-col md:flex-row justify-between gap-6"
                                >
                                    {/* Role Metadata */}
                                    <div className="flex-1 space-y-4">
                                        <div className="flex flex-wrap items-center gap-2.5">
                                            <h3 className="text-xl font-bold text-white">{role.title}</h3>
                                            
                                            {/* Badges */}
                                            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                                {role.department}
                                            </span>
                                            {role.remote ? (
                                                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                    Remote
                                                </span>
                                            ) : (
                                                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                    Hybrid
                                                </span>
                                            )}
                                            {role.intern && (
                                                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 animate-pulse">
                                                    Open to Interns
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">{role.description}</p>

                                        {/* Key Skills */}
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider mr-1">Skills:</span>
                                            {role.skills.map(skill => (
                                                <span 
                                                    key={skill} 
                                                    className="text-xs px-2.5 py-1 rounded-lg bg-white/[0.04] text-slate-300 border border-white/5"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Financial details / location info */}
                                        <div className="flex flex-wrap items-center gap-5 text-xs text-slate-400 pt-1">
                                            <span className="flex items-center gap-1.5">
                                                <MapPin className="w-3.5 h-3.5 text-slate-500" /> {role.location}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5 text-slate-500" /> {role.type}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <DollarSign className="w-3.5 h-3.5 text-slate-500" /> {role.salary}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex md:flex-col items-center justify-end gap-3 self-end md:self-center shrink-0 w-full md:w-auto">
                                        <button
                                            onClick={() => toggleSaveRole(role.id)}
                                            title={savedRoles.includes(role.id) ? "Remove role bookmark" : "Bookmark this role"}
                                            className={`p-3 rounded-xl border transition-all duration-300 cursor-pointer ${
                                                savedRoles.includes(role.id)
                                                    ? 'bg-cyan-500/10 border-cyan-400 text-cyan-400 shadow-neon-sm'
                                                    : 'border-white/10 text-slate-400 hover:text-slate-200 bg-white/[0.02]'
                                            }`}
                                        >
                                            <Bookmark className={`w-4.5 h-4.5 ${savedRoles.includes(role.id) ? 'fill-cyan-400' : ''}`} />
                                        </button>
                                        <button
                                            onClick={() => handleApplyClick(role.title)}
                                            className="flex-1 md:flex-initial px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold hover:shadow-cyan-500/10 hover:shadow-md transition-all text-sm w-full"
                                        >
                                            Apply Role
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {filteredRoles.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-16 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]"
                            >
                                <Briefcase className="w-10 h-10 text-slate-600 mx-auto mb-4" />
                                <h4 className="text-white font-bold">No roles found matching your parameters</h4>
                                <p className="text-sm text-slate-400 mt-2">Try adjusting your filters, location, or clear the search criteria.</p>
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setSelectedDept('All');
                                        setSelectedLoc('All');
                                        setShowSavedOnly(false);
                                    }}
                                    className="mt-4 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-cyan-400 hover:bg-white/10 hover:border-cyan-500/30 transition-all"
                                >
                                    Clear All Filters
                                </button>
                            </motion.div>
                        )}
                    </div>
                </section>


                {/* ── 4. TEAM CULTURE SECTION ── */}
                <section className="max-w-5xl mx-auto px-6 mb-24 lg:mb-32">
                    <div className="text-center mb-16">
                        <span className="text-xs text-cyan-400 font-bold uppercase tracking-widest">Our Culture</span>
                        <h2 className="text-3xl lg:text-4xl font-display font-bold text-white mt-3">
                            The HealthChain Way
                        </h2>
                        <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-xl mx-auto">
                            We are builders, engineers, and healthcare pragmatists focused on real-world interoperability.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {CULTURE_ELEMENTS.map((item, index) => (
                            <motion.div
                                key={item.number}
                                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: '-50px' }}
                                transition={{ duration: 0.6 }}
                                className="backdrop-blur-xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/5 hover:border-cyan-500/20 rounded-2xl p-8 hover:bg-white/[0.06] transition-all duration-500 flex gap-5"
                            >
                                <div className="text-3xl font-extrabold bg-gradient-to-br from-cyan-400 to-blue-500 bg-clip-text text-transparent select-none">
                                    {item.number}
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold text-white">{item.title}</h3>
                                    <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>


                {/* ── 5. HIRING PROCESS ── */}
                <section className="max-w-5xl mx-auto px-6 mb-24 lg:mb-32">
                    <div className="text-center mb-16">
                        <span className="text-xs text-cyan-400 font-bold uppercase tracking-widest">Roadmap</span>
                        <h2 className="text-3xl lg:text-4xl font-display font-bold text-white mt-3">
                            Hiring Process
                        </h2>
                        <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-xl mx-auto">
                            Fast, transparent, and structured. We respect your time and skills.
                        </p>
                    </div>

                    <div className="relative">
                        {/* Connecting Line */}
                        <div className="absolute top-1/2 left-4 md:left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-[90%] bg-gradient-to-b from-cyan-500 via-teal-500 to-blue-600 hidden md:block" />

                        <div className="space-y-12">
                            {HIRING_PROCESS.map((p, idx) => (
                                <motion.div
                                    key={p.step}
                                    initial={{ opacity: 0, y: 25 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: '-50px' }}
                                    transition={{ duration: 0.5 }}
                                    className={`relative flex flex-col md:flex-row items-start md:items-center ${
                                        idx % 2 === 0 ? 'md:flex-row-reverse' : ''
                                    }`}
                                >
                                    {/* Timeline Marker */}
                                    <div className="absolute left-0 md:left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-navy-950 border-2 border-cyan-400 flex items-center justify-center z-10 text-cyan-400 font-bold shadow-neon-sm">
                                        {p.step}
                                    </div>

                                    {/* Content Card */}
                                    <div className="w-full md:w-[45%] pl-12 md:pl-0">
                                        <div className={`backdrop-blur-xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/20 rounded-2xl p-6 hover:bg-white/[0.04] transition-all duration-300 ${
                                            idx % 2 === 0 ? 'md:text-right' : 'md:text-left'
                                        }`}>
                                            <h3 className="text-lg font-bold text-white">{p.title}</h3>
                                            <p className="text-sm text-slate-400 mt-2 leading-relaxed">{p.desc}</p>
                                        </div>
                                    </div>
                                    {/* Empty spacer for alignment */}
                                    <div className="hidden md:block w-[45%]" />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>


                {/* ── 6. APPLICATION FORM ── */}
                <section ref={formSectionRef} className="max-w-3xl mx-auto px-6 mb-24 lg:mb-32 scroll-mt-24">
                    <div className="backdrop-blur-xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/10 rounded-3xl p-8 lg:p-12 relative overflow-hidden shadow-card">
                        
                        {/* Glow accent */}
                        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative z-10">
                            
                            {submitSuccess ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-12"
                                >
                                    <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-neon-sm">
                                        <CheckCircle2 className="w-9 h-9 text-emerald-400" />
                                    </div>
                                    <h2 className="text-2xl lg:text-3xl font-display font-bold text-white mb-4">Application Submitted!</h2>
                                    <p className="text-slate-400 max-w-md mx-auto leading-relaxed mb-8">
                                        Thank you for applying to join the HealthChain network. Our engineering panel is checking all details. We will email/call you to organize the next introductory call.
                                    </p>
                                    <button
                                        onClick={() => setSubmitSuccess(false)}
                                        className="px-6 py-3 rounded-xl bg-white/[0.04] border border-white/10 hover:border-cyan-500/30 text-xs font-bold text-cyan-400 transition-all cursor-pointer"
                                    >
                                        Apply for another role
                                    </button>
                                </motion.div>
                            ) : (
                                <>
                                    <div className="mb-10 text-center md:text-left">
                                        <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto md:mx-0">
                                            <Workflow className="w-6 h-6 text-cyan-400" />
                                        </div>
                                        <h2 className="text-2xl lg:text-3xl font-display font-bold text-white">Join the Node</h2>
                                        <p className="text-sm text-slate-400 mt-2">
                                            Fill out our secure application schema. Required fields are marked *
                                        </p>
                                    </div>

                                    <form onSubmit={handleFormSubmit} className="space-y-6">
                                        
                                        {/* Row 1: Name and Email */}
                                        <div className="grid md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                                    Full Name *
                                                </label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                                                    <input
                                                        type="text"
                                                        value={form.name}
                                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                                        placeholder="Jane Doe"
                                                        className={`w-full bg-white/[0.03] border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none transition-all ${
                                                            formErrors.name ? 'border-red-500/50 focus:border-red-500/80' : 'border-white/10 focus:border-cyan-500/40'
                                                        }`}
                                                    />
                                                </div>
                                                {formErrors.name && (
                                                    <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {formErrors.name}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                                    Email Address *
                                                </label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                                                    <input
                                                        type="email"
                                                        value={form.email}
                                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                                        placeholder="jane@example.com"
                                                        className={`w-full bg-white/[0.03] border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none transition-all ${
                                                            formErrors.email ? 'border-red-500/50 focus:border-red-500/80' : 'border-white/10 focus:border-cyan-500/40'
                                                        }`}
                                                    />
                                                </div>
                                                {formErrors.email && (
                                                    <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {formErrors.email}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Row 2: Phone and Experience */}
                                        <div className="grid md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                                    Phone Number *
                                                </label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                                                    <input
                                                        type="tel"
                                                        value={form.phone}
                                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                                        placeholder="+91 98765 43210"
                                                        className={`w-full bg-white/[0.03] border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none transition-all ${
                                                            formErrors.phone ? 'border-red-500/50 focus:border-red-500/80' : 'border-white/10 focus:border-cyan-500/40'
                                                        }`}
                                                    />
                                                </div>
                                                {formErrors.phone && (
                                                    <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {formErrors.phone}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                                    Experience Level
                                                </label>
                                                <select
                                                    value={form.experience}
                                                    onChange={(e) => setForm({ ...form, experience: e.target.value })}
                                                    className="w-full bg-white/[0.03] border border-white/10 focus:border-cyan-500/40 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all cursor-pointer"
                                                >
                                                    <option value="0-1 years" className="bg-navy-900 text-slate-200">Entry / Intern (0-1 years)</option>
                                                    <option value="1-3 years" className="bg-navy-900 text-slate-200">Associate (1-3 years)</option>
                                                    <option value="3-5 years" className="bg-navy-900 text-slate-200">Mid-Level (3-5 years)</option>
                                                    <option value="5+ years" className="bg-navy-900 text-slate-200">Senior / Lead (5+ years)</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Row 3: Role Selection */}
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                                Role Applied For *
                                            </label>
                                            <select
                                                value={selectedRole}
                                                onChange={(e) => {
                                                    setSelectedRole(e.target.value);
                                                    setFormErrors(prev => ({ ...prev, role: '' }));
                                                }}
                                                className={`w-full bg-white/[0.03] border focus:border-cyan-500/40 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all cursor-pointer ${
                                                    formErrors.role ? 'border-red-500/50' : 'border-white/10'
                                                }`}
                                            >
                                                <option value="" className="bg-navy-900 text-slate-400">-- Choose Role --</option>
                                                {activeRolesList.map(role => (
                                                    <option key={role.id} value={role.title} className="bg-navy-900 text-slate-200">
                                                        {role.title} ({role.department})
                                                    </option>
                                                ))}
                                            </select>
                                            {formErrors.role && (
                                                <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {formErrors.role}
                                                </p>
                                            )}
                                        </div>

                                        {/* Portfolio URL */}
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                                Portfolio / GitHub / LinkedIn
                                            </label>
                                            <div className="relative">
                                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                                                <input
                                                    type="text"
                                                    value={form.portfolioUrl}
                                                    onChange={(e) => setForm({ ...form, portfolioUrl: e.target.value })}
                                                    placeholder="https://github.com/username"
                                                    className={`w-full bg-white/[0.03] border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none transition-all ${
                                                        formErrors.portfolioUrl ? 'border-red-500/50 focus:border-red-500/80' : 'border-white/10 focus:border-cyan-500/40'
                                                    }`}
                                                />
                                            </div>
                                            {formErrors.portfolioUrl && (
                                                <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {formErrors.portfolioUrl}
                                                </p>
                                            )}
                                        </div>

                                        {/* Resume File Upload */}
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                                Resume Upload (PDF, DOCX, PNG, JPG - Max 5MB) *
                                            </label>
                                            
                                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="w-full sm:w-auto px-5 py-3 rounded-xl border border-white/10 hover:border-cyan-500/30 bg-white/[0.02] hover:bg-white/[0.05] text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all duration-300"
                                                >
                                                    <Upload className="w-4.5 h-4.5 text-cyan-400" />
                                                    Attach Document
                                                </button>
                                                
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept=".pdf,.docx,.png,.jpg,.jpeg"
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                />

                                                {resumeFile && (
                                                    <div className="flex items-center justify-between flex-1 w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-2.5">
                                                        <div className="flex items-center gap-2 max-w-[80%]">
                                                            <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                                                            <span className="text-xs text-slate-200 truncate font-mono">
                                                                {resumeFile.name}
                                                            </span>
                                                            <span className="text-[10px] text-slate-500 shrink-0">
                                                                ({(resumeFile.size / (1024 * 1024)).toFixed(2)} MB)
                                                            </span>
                                                        </div>
                                                        
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setResumeFile(null);
                                                                setUploadProgress(0);
                                                                if (fileInputRef.current) fileInputRef.current.value = '';
                                                            }}
                                                            className="text-slate-500 hover:text-red-400 transition-colors p-1"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Upload Progress Bar */}
                                            {isUploading && (
                                                <div className="mt-3">
                                                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                                                        <span>Analyzing structural safety...</span>
                                                        <span>{uploadProgress}%</span>
                                                    </div>
                                                    <div className="w-full bg-white/5 rounded-full h-1">
                                                        <div 
                                                            className="bg-cyan-400 h-full rounded-full transition-all duration-300"
                                                            style={{ width: `${uploadProgress}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {formErrors.resume && (
                                                <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {formErrors.resume}
                                                </p>
                                            )}
                                        </div>

                                        {/* Cover Message */}
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                                Cover Note / Introduction
                                            </label>
                                            <textarea
                                                rows={4}
                                                value={form.coverMessage}
                                                onChange={(e) => setForm({ ...form, coverMessage: e.target.value })}
                                                placeholder="Tell us about your background, healthcare passion, or project stack ideas..."
                                                className="w-full bg-white/[0.03] border border-white/10 focus:border-cyan-500/40 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none transition-all resize-none"
                                            />
                                        </div>

                                        {/* Submit Button */}
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || isUploading}
                                            className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600 hover:shadow-cyan-500/10 hover:shadow-lg hover:-translate-y-0.5 text-white font-bold transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                    Enrolling Node Details...
                                                </>
                                            ) : (
                                                'Submit Application'
                                            )}
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </section>


                {/* ── 7. BENEFITS SECTION ── */}
                <section className="max-w-5xl mx-auto px-6 mb-24 lg:mb-32">
                    <div className="text-center mb-16">
                        <span className="text-xs text-cyan-400 font-bold uppercase tracking-widest">Perks</span>
                        <h2 className="text-3xl lg:text-4xl font-display font-bold text-white mt-3">
                            Wellness & Benefits
                        </h2>
                        <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-xl mx-auto">
                            We take care of our nodes, guaranteeing stability, development, and high performance.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                        {BENEFITS.map((b) => (
                            <div 
                                key={b.title} 
                                className="backdrop-blur-xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/20 rounded-2xl p-6 flex gap-4 transition-all duration-300"
                            >
                                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0">
                                    <b.icon className="w-5 h-5 text-cyan-400" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-base font-bold text-white">{b.title}</h3>
                                    <p className="text-sm text-slate-400 leading-relaxed">{b.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>


                {/* ── 8. FAQ SECTION ── */}
                <section className="max-w-3xl mx-auto px-6 mb-16">
                    <div className="text-center mb-12">
                        <span className="text-xs text-cyan-400 font-bold uppercase tracking-widest">Inquiries</span>
                        <h2 className="text-3xl font-display font-bold text-white mt-3">
                            Frequently Asked Questions
                        </h2>
                    </div>

                    <div className="space-y-3">
                        {FAQs.map((faq, idx) => {
                            const isOpen = openFaq === idx;
                            return (
                                <div 
                                    key={idx} 
                                    className="backdrop-blur-xl bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden transition-all duration-300"
                                >
                                    <button
                                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                                        className="w-full px-6 py-5 flex items-center justify-between text-left text-white font-semibold hover:bg-white/[0.02] transition-colors"
                                    >
                                        <span className="text-sm sm:text-base">{faq.q}</span>
                                        {isOpen ? (
                                            <ChevronUp className="w-5 h-5 text-cyan-400 shrink-0 ml-2" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-slate-500 shrink-0 ml-2" />
                                        )}
                                    </button>

                                    <AnimatePresence initial={false}>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.25 }}
                                            >
                                                <div className="px-6 pb-5 pt-1 text-sm text-slate-400 leading-relaxed border-t border-white/5 bg-white/[0.01]">
                                                    {faq.a}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* SUCCESS MODAL POPUP */}
                <AnimatePresence>
                    {submitSuccess && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080d1a]/85 backdrop-blur-md">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                transition={{ type: 'spring', duration: 0.5 }}
                                className="w-full max-w-lg bg-[#0B0F1A] border border-white/[0.08] rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden"
                            >
                                {/* Decorative ambient glowing accents */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                                <div className="absolute bottom-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

                                <div className="relative z-10 space-y-6">
                                    {/* Success Icon */}
                                    <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto shadow-neon-sm">
                                        <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-display font-black text-white">Application Received!</h3>
                                        <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-mono font-bold">Node Enrolled Successfully</p>
                                    </div>

                                    <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                                        Thank you for applying to join the HealthChain team. A confirmation email has been dispatched. Our team will review your qualifications and contact you shortly to schedule an introductory call.
                                    </p>

                                    <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                                        <button
                                            onClick={() => {
                                                if (selectedRole) {
                                                    const emailSubject = encodeURIComponent(`Inquiry regarding ${selectedRole} position`);
                                                    const emailBody = encodeURIComponent(`Hi HealthChain Recruitment Team,\n\nI just submitted my application for the ${selectedRole} role and wanted to follow up.`);
                                                    window.open(`mailto:careers@healthchain.com?subject=${emailSubject}&body=${emailBody}`, '_blank');
                                                } else {
                                                    window.open('mailto:careers@healthchain.com', '_blank');
                                                }
                                            }}
                                            className="px-5 py-3 rounded-xl border border-white/10 hover:border-cyan-500/30 hover:bg-white/[0.04] text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-2"
                                        >
                                            <Mail className="w-4 h-4 text-cyan-400" /> Contact Careers Team
                                        </button>
                                        
                                        <button
                                            onClick={() => setSubmitSuccess(false)}
                                            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:shadow-emerald-500/10 hover:shadow-lg text-white text-xs font-bold transition-all cursor-pointer"
                                        >
                                            Dismiss
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <Footer />
            </div>
        </div>
    );
}
