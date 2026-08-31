import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Reusable DataTable component for Admin Panel
 * @param {Array} columns - Array of objects { header: string, accessor: string | func, align?: 'left'|'center'|'right', cell?: func }
 * @param {Array} data - Array of data rows
 * @param {boolean} isLoading - Loading state
 * @param {string} emptyMessage - Message to show when data is empty
 */
export default function DataTable({ columns, data, isLoading = false, emptyMessage = 'No data found', title = null, headerAction = null }) {
    return (
        <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl w-full overflow-hidden flex flex-col">
            {(title || headerAction) && (
                <div className="px-6 py-4 border-b border-[#1E2D4580] flex items-center justify-between bg-[#1A2236]/50">
                    {title && <h3 className="text-sm font-semibold text-white">{title}</h3>}
                    {headerAction && <div>{headerAction}</div>}
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-[#1E2D4580] bg-[#1A2236]">
                            {columns.map((col, i) => (
                                <th
                                    key={i}
                                    className={`px-6 py-3.5 text-xs text-[#8899AA] font-bold uppercase tracking-wider ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                                        }`}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence mode="popLayout">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={columns.length} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-6 h-6 border-2 border-[#00C8D4]/30 border-t-[#00C8D4] rounded-full animate-spin mb-3"></div>
                                            <p className="text-[#8899AA] text-sm font-semibold">Loading data...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : data && data.length > 0 ? (
                                data.map((row, rowIndex) => (
                                    <motion.tr
                                        key={row.id || rowIndex}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2, delay: Math.min(rowIndex * 0.03, 0.5) }}
                                        className="border-b border-[#1E2D4580] last:border-0 hover:bg-[#1A2236]/50 transition-colors"
                                    >
                                        {columns.map((col, colIndex) => (
                                            <td
                                                key={colIndex}
                                                className={`px-6 py-3 whitespace-nowrap ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                                                    }`}
                                            >
                                                {col.cell ? col.cell(row) : (
                                                    <span className="text-white">
                                                        {typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor]}
                                                    </span>
                                                )}
                                            </td>
                                        ))}
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length} className="px-6 py-12 text-center text-[#8899AA] font-semibold">
                                        {emptyMessage}
                                    </td>
                                </tr>
                            )}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
