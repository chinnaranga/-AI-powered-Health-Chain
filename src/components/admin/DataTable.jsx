import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function DataTable({
    columns,
    data = [],
    isLoading = false,
    emptyMessage = 'No data available.',
    defaultPerPage = 10
}) {
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(defaultPerPage);

    // Calculate pagination values
    const totalItems = data.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
    const startIndex = (currentPage - 1) * perPage;
    const endIndex = Math.min(startIndex + perPage, totalItems);
    const paginatedData = data.slice(startIndex, endIndex);

    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(1, prev - 1));
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(totalPages, prev + 1));
    };

    const getAlignmentClass = (align) => {
        if (align === 'right') return 'text-right justify-end';
        if (align === 'center') return 'text-center justify-center';
        return 'text-left justify-start';
    };

    return (
        <div className="bg-[#111827] border border-[#1E2D4580] rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.25)] flex flex-col">
            <div className="overflow-x-auto w-full">
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr className="border-b border-[#1E2D4580] bg-[#1A2236]/40">
                            {columns.map((col, idx) => (
                                <th
                                    key={idx}
                                    className={`px-6 py-4 text-[10px] font-bold text-[#8899AA] uppercase tracking-widest font-mono ${getAlignmentClass(col.align)}`}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E2D4550]">
                        {isLoading ? (
                            // Render sleek skeleton loaders
                            Array.from({ length: perPage }).map((_, rIdx) => (
                                <tr key={rIdx} className="animate-pulse">
                                    {columns.map((_, cIdx) => (
                                        <td key={cIdx} className="px-6 py-4">
                                            <div className="h-4 bg-[#1E2D45]/40 rounded-md w-3/4 my-1" />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : paginatedData.length === 0 ? (
                            // Render empty message
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-16 text-center text-[#8899AA] text-xs font-mono">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            // Render table rows
                            <AnimatePresence mode="wait">
                                {paginatedData.map((row, rIdx) => (
                                    <motion.tr
                                        key={row.id || rIdx}
                                        initial={{ opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -4 }}
                                        transition={{ duration: 0.2, delay: rIdx * 0.02 }}
                                        className="hover:bg-[#1A2236]/35 transition-colors group border-b border-[#1E2D4530] last:border-0"
                                    >
                                        {columns.map((col, cIdx) => {
                                            const cellValue = typeof col.accessor === 'function'
                                                ? col.accessor(row)
                                                : row[col.accessor];

                                            return (
                                                <td
                                                    key={cIdx}
                                                    className={`px-6 py-4 text-slate-300 font-sans ${getAlignmentClass(col.align)}`}
                                                >
                                                    {cellValue}
                                                </td>
                                            );
                                        })}
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {!isLoading && totalItems > 0 && (
                <div className="px-6 py-4 border-t border-[#1E2D4550] bg-[#1A2236]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs text-[#8899AA] font-mono">
                        Showing <span className="text-white font-semibold">{totalItems === 0 ? 0 : startIndex + 1}</span> to{' '}
                        <span className="text-white font-semibold">{endIndex}</span> of{' '}
                        <span className="text-white font-semibold">{totalItems}</span> entries
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {/* Page Size Select */}
                        <div className="flex items-center gap-2 mr-4">
                            <span className="text-[10px] text-[#8899AA] uppercase tracking-wider font-mono">Per Page:</span>
                            <select
                                value={perPage}
                                onChange={(e) => {
                                    setPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="bg-[#111827] border border-[#1E2D4580] rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-[#00C8D4]/50 font-mono"
                            >
                                {[5, 10, 20, 50].map(size => (
                                    <option key={size} value={size}>{size}</option>
                                ))}
                            </select>
                        </div>

                        {/* Page Navigation */}
                        <div className="flex items-center gap-1">
                            <button
                                onClick={handlePrevPage}
                                disabled={currentPage === 1}
                                className="p-1.5 rounded-lg border border-[#1E2D4580] text-[#8899AA] hover:text-white hover:border-[#00C8D4]/50 disabled:opacity-30 disabled:hover:text-[#8899AA] disabled:hover:border-[#1E2D4580] transition-all bg-[#111827]"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            
                            <span className="text-xs text-white font-mono px-3">
                                {currentPage} / {totalPages}
                            </span>
                            
                            <button
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                                className="p-1.5 rounded-lg border border-[#1E2D4580] text-[#8899AA] hover:text-white hover:border-[#00C8D4]/50 disabled:opacity-30 disabled:hover:text-[#8899AA] disabled:hover:border-[#1E2D4580] transition-all bg-[#111827]"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
