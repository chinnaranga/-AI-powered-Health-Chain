import React from 'react';
import { motion } from 'framer-motion';

const MiniChart = ({ data = [], color = '#14B8A6', label = '', type = 'area', height = 80 }) => {
    if (!data.length) return null;

    const max = Math.max(...data, 1);
    const min = Math.min(...data);
    const range = max - min || 1;
    const W = 240;
    const H = height;
    const PAD = 4;

    const points = data.map((v, i) => ({
        x: PAD + (i / (data.length - 1 || 1)) * (W - PAD * 2),
        y: PAD + (1 - (v - min) / range) * (H - PAD * 2),
    }));

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

    const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${H} L ${points[0].x.toFixed(1)} ${H} Z`;

    const lastPoint = points[points.length - 1];
    const lastValue = data[data.length - 1];

    return (
        <div className="flex flex-col gap-1">
            {label && <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{label}</p>}
            <div className="relative" style={{ height }}>
                <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-full overflow-visible">
                    {type === 'area' && (
                        <defs>
                            <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                                <stop offset="100%" stopColor={color} stopOpacity="0.02" />
                            </linearGradient>
                        </defs>
                    )}
                    {type === 'area' && (
                        <path d={areaD} fill={`url(#grad-${label})`} />
                    )}
                    <path
                        d={pathD}
                        fill="none"
                        stroke={color}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    {/* Last value dot */}
                    <circle cx={lastPoint.x} cy={lastPoint.y} r="3" fill={color} />
                </svg>
            </div>
        </div>
    );
};

// ── Stat card with embedded sparkline ────────────────────────────────────────
export const ChartStatCard = ({ label, value, sub, trend, data, color = '#14B8A6', icon: Icon }) => {
    const isPositive = trend >= 0;
    return (
        <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex flex-col gap-4"
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">{label}</p>
                    <p className="text-2xl font-semibold text-slate-100 mt-0.5">{value}</p>
                    {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
                </div>
                <div className="flex flex-col items-end gap-2">
                    {Icon && <Icon className="w-5 h-5 text-slate-600" />}
                    {trend !== undefined && (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${isPositive ? 'bg-teal-900/50 text-teal-400' : 'bg-red-900/50 text-red-400'}`}>
                            {isPositive ? '+' : ''}{trend}%
                        </span>
                    )}
                </div>
            </div>
            {data && <MiniChart data={data} color={color} height={56} />}
        </motion.div>
    );
};

export default MiniChart;
