import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Stethoscope, Building2, Shield, ArrowRight } from 'lucide-react';
import ParticleBackground from '../components/homepage/ParticleBackground';

const roles = [
    { 
        value: 'patient', 
        label: 'Patient Node', 
        icon: User, 
        desc: 'Initialize a secure personal health vault to view, control, and share your records.',
        path: '/register/patient',
        color: '#405D4E',
        shadow: 'rgba(64, 93, 78, 0.15)'
    },
    { 
        value: 'doctor', 
        label: 'Doctor Node', 
        icon: Stethoscope, 
        desc: 'Enroll an authorized medical workstation to view patient-delegated charts.',
        path: '/register/doctor',
        color: '#B89047',
        shadow: 'rgba(184, 144, 71, 0.15)'
    },
    { 
        value: 'clinical', 
        label: 'Clinical Node', 
        icon: Building2, 
        desc: 'Register a staff access station to issue cryptographically signed patient records.',
        path: '/register/clinical',
        color: '#405D4E',
        shadow: 'rgba(64, 93, 78, 0.15)'
    },
];

export default function Register() {
    const navigate = useNavigate();

    return (
        <div className="relative min-h-screen flex items-center justify-center px-6 pt-24 pb-12 bg-navy-950">
            <ParticleBackground />

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-4xl"
            >
                <div className="bg-white/90 backdrop-blur-xl border border-navy-800/80 shadow-card rounded-2xl p-8 md:p-12">
                    
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sage-600 to-gold-500 flex items-center justify-center mx-auto mb-4 shadow-md shadow-sage-600/10">
                            <Shield className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-navy-50 font-display">Initialize HealthChain Node</h1>
                        <p className="text-sm md:text-base text-navy-400 mt-3 max-w-lg mx-auto">
                            Select the appropriate cryptographic identity type to enroll and connect your node to the secure network.
                        </p>
                    </div>

                    {/* Role Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        {roles.map((role) => (
                            <motion.button
                                key={role.value}
                                onClick={() => navigate(role.path)}
                                whileHover={{ y: -6, borderColor: role.color }}
                                whileTap={{ scale: 0.98 }}
                                style={{ '--hover-shadow': role.shadow }}
                                className="group relative text-left p-6 rounded-2xl border border-navy-800 bg-white hover:bg-navy-900/30 shadow-soft hover:shadow-card transition-all flex flex-col justify-between min-h-[220px]"
                            >
                                <div>
                                    <div 
                                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                                        style={{ backgroundColor: `${role.color}15`, border: `1px solid ${role.color}30` }}
                                    >
                                        <role.icon className="w-6 h-6" style={{ color: role.color }} />
                                    </div>
                                    <h3 className="text-lg font-bold text-navy-50 mb-2 font-display">{role.label}</h3>
                                    <p className="text-xs text-navy-400 leading-relaxed mb-6">{role.desc}</p>
                                </div>

                                <div className="flex items-center gap-1.5 text-xs font-bold transition-all" style={{ color: role.color }}>
                                    Begin Enrollment <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </div>
                            </motion.button>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="text-center border-t border-navy-800 pt-6">
                        <p className="text-sm text-navy-400">
                            Already have an initialized portal?{' '}
                            <Link to="/login/patient" className="text-sage-600 hover:text-sage-700 font-semibold transition-colors">
                                Authenticate Vault
                            </Link>
                        </p>
                    </div>

                </div>
            </motion.div>
        </div>
    );
}
