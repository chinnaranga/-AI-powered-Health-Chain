import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ icon: Icon, label, value, color = 'text-sage-600', trend, className = '' }) => {
    return (
        <motion.div
            whileHover={{ y: -4, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
            className={`p-5 rounded-2xl bg-white border border-slate-200 transition-all duration-300 ${className}`}
        >
            <div className="flex items-center justify-between mb-3">
                <div className={`w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center`}>
                    {Icon && <Icon className={`w-5 h-5 ${color}`} />}
                </div>
                {trend && (
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend > 0
                            ? 'text-green-700 bg-green-50'
                            : 'text-red-700 bg-red-50'
                        }`}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </span>
                )}
            </div>
            <p className="text-2xl font-bold text-navy-900 mb-1">{value}</p>
            <p className="text-sm text-slate-500">{label}</p>
        </motion.div>
    );
};

export default StatCard;
