import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink, Zap } from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import { apiClient } from '../../services/apiClient';

/* ───── Status Badge Component ───── */
function CustomStatusBadge({ status, className = '' }) {
    const colors = {
        verified: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        revoked: 'bg-red-500/10 text-red-400 border-red-500/20',
    };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${colors[status] || 'bg-[#1A2236] text-[#8899AA] border-[#1E2D4580]'} ${className}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status === 'active' || status === 'verified' ? 'bg-emerald-400' : 'bg-red-400'}`} />
            {status}
        </span>
    );
}

export default function Transactions() {
    const { data: transactions, isLoading } = useQuery({
        queryKey: ['adminTransactions'],
        queryFn: apiClient.getTransactions,
        refetchInterval: 10000, // Live feed simulation
    });

    const columns = [
        {
            header: 'Tx Hash',
            accessor: (row) => (
                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#00C8D4] bg-[#00C8D4]/10 border border-[#00C8D4]/20 px-2 py-1 rounded inline-block">
                        0x{row.hash || Math.random().toString(16).substring(2, 14)}...
                    </span>
                </div>
            )
        },
        {
            header: 'Block',
            accessor: (row) => (
                <div className="flex items-center gap-1.5 font-mono text-sm text-white">
                    <BlocksIcon className="w-3.5 h-3.5 text-[#8899AA]" />
                    {row.blockNumber || Math.floor(15000000 + Math.random() * 100000)}
                </div>
            )
        },
        {
            header: 'Gas Used',
            accessor: (row) => (
                <div className="flex items-center gap-1.5 text-xs text-amber-400/80">
                    <Zap className="w-3 h-3 text-amber-500" />
                    {row.gasUsed || Math.floor(21000 + Math.random() * 50000)} Gwei
                </div>
            )
        },
        {
            header: 'Action Method',
            accessor: (row) => (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold text-[#8899AA] border border-[#1E2D4580] uppercase bg-[#1A2236]/50">
                    {row.method || 'addRecord()'}
                </span>
            )
        },
        {
            header: 'Status',
            accessor: (row) => <CustomStatusBadge status={'verified'} />
        },
        {
            header: 'Time',
            accessor: (row) => {
                const diff = Math.floor(Math.random() * 60);
                return <span className="text-[#8899AA] text-xs">{diff} secs ago</span>;
            }
        },
        {
            header: '',
            align: 'right',
            accessor: (row) => (
                <button className="p-1.5 text-[#8899AA] hover:text-white transition-colors" title="View on Block Explorer">
                    <ExternalLink className="w-4 h-4" />
                </button>
            )
        }
    ];

    // Mock 20 transactions
    const mockData = Array(20).fill(null).map((_, i) => ({ id: i }));
    const tableData = transactions?.length ? transactions : mockData;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold font-display text-white">Live Block Explorer</h1>
                    <p className="text-sm text-[#8899AA]">Real-time view of HealthChain smart contract transactions.</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10B981]"></span>
                    Network Synced
                </div>
            </div>

            <DataTable
                columns={columns}
                data={tableData}
                isLoading={isLoading}
            />
        </div>
    );
}

// Inline icon component since we don't need the full lucide one
function BlocksIcon(props) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="14" y="3" rx="1" /><path d="M10 21V8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H3" /></svg>
    )
}
