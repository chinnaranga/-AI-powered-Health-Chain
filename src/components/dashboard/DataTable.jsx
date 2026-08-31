import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronUp, ChevronDown, Filter } from 'lucide-react';
import { EmptyState } from '../UIComponents';
import { FileText } from 'lucide-react';

const DataTable = ({
    columns = [],     // [{key, label, render?, sortable?, width?}]
    data = [],
    searchable = true,
    searchKeys = [],
    emptyTitle = 'No records found',
    emptyDescription = '',
    className = '',
}) => {
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState(null);
    const [sortDir, setSortDir] = useState('asc');

    const filtered = useMemo(() => {
        let rows = [...data];
        if (search && searchKeys.length) {
            rows = rows.filter(row =>
                searchKeys.some(k =>
                    String(row[k] ?? '').toLowerCase().includes(search.toLowerCase())
                )
            );
        }
        if (sortKey) {
            rows.sort((a, b) => {
                const av = a[sortKey] ?? '';
                const bv = b[sortKey] ?? '';
                const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
                return sortDir === 'asc' ? cmp : -cmp;
            });
        }
        return rows;
    }, [data, search, sortKey, sortDir, searchKeys]);

    const handleSort = (key) => {
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortDir('asc'); }
    };

    return (
        <div className={`flex flex-col ${className}`}>
            {/* Toolbar */}
            {searchable && (
                <div className="flex items-center gap-3 mb-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search records..."
                            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
                        />
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 text-xs font-medium">
                        <Filter className="w-3.5 h-3.5" />
                        {filtered.length} results
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-700">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-slate-900/80 border-b border-slate-700">
                            {columns.map(col => (
                                <th
                                    key={col.key}
                                    onClick={() => col.sortable && handleSort(col.key)}
                                    className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap ${col.sortable ? 'cursor-pointer select-none hover:text-slate-200 transition-colors' : ''} ${col.width ? col.width : ''}`}
                                >
                                    <div className="flex items-center gap-1">
                                        {col.label}
                                        {col.sortable && sortKey === col.key && (
                                            sortDir === 'asc'
                                                ? <ChevronUp className="w-3 h-3 text-teal-400" />
                                                : <ChevronDown className="w-3 h-3 text-teal-400" />
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length}>
                                    <EmptyState
                                        icon={FileText}
                                        title={emptyTitle}
                                        description={emptyDescription}
                                    />
                                </td>
                            </tr>
                        ) : (
                            filtered.map((row, i) => (
                                <motion.tr
                                    key={row.id ?? row.hash ?? i}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors"
                                >
                                    {columns.map(col => (
                                        <td key={col.key} className="px-4 py-3 text-slate-300">
                                            {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                                        </td>
                                    ))}
                                </motion.tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DataTable;
