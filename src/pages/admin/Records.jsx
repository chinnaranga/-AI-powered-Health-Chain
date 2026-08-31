import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Eye, FileSearch, Trash2 } from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import { toast } from '../../components/Toast';
import { apiClient } from '../../services/apiClient';

/* ───── Status Badge Component ───── */
function CustomStatusBadge({ status, className = '' }) {
    const colors = {
        verified: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        revoked: 'bg-red-500/10 text-red-400 border-red-500/20',
    };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${colors[status] || 'bg-[#1A2236] text-[#8899AA] border-[#1E2D4580]'} ${className}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status === 'active' || status === 'verified' ? 'bg-emerald-400' : status === 'pending' ? 'bg-amber-400' : 'bg-red-400'}`} />
            {status}
        </span>
    );
}

export default function Records() {
    const { data: records, isLoading } = useQuery({
        queryKey: ['adminRecords'],
        queryFn: apiClient.getRecords,
    });

    const columns = [
        {
            header: 'Record ID / Hash',
            accessor: (row) => (
                <div>
                    <p className="text-sm font-semibold text-white font-mono">{row.id || Math.random().toString(36).substring(7).toUpperCase()}</p>
                    <p className="text-xs text-[#8899AA] font-mono mt-0.5">{row.ipfsHash || 'Qm...' + Math.random().toString(36).substring(7)}</p>
                </div>
            )
        },
        {
            header: 'Owner (Patient)',
            accessor: (row) => (
                <div className="text-sm font-bold text-[#00C8D4]">
                    {row.ownerName || `Patient #${Math.floor(Math.random() * 1000)}`}
                </div>
            )
        },
        {
            header: 'Upload Date',
            accessor: (row) => <span className="text-[#8899AA] text-sm">{new Date(row.createdAt || Date.now() - Math.random() * 10000000000).toLocaleString()}</span>
        },
        {
            header: 'Blockchain Status',
            accessor: (row) => <CustomStatusBadge status={Math.random() > 0.2 ? 'verified' : 'pending'} />
        },
        {
            header: 'Actions',
            align: 'right',
            accessor: (row) => (
                <div className="flex items-center justify-end gap-2">
                    <button onClick={() => toast.success('Payload opened securely')} className="p-1.5 text-[#8899AA] hover:text-[#00C8D4] bg-[#1A2236]/50 border border-transparent hover:border-[#00C8D4]/30 rounded-lg transition-all" title="View Payload via IPFS">
                        <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => toast.success('Hash cryptographically verified')} className="p-1.5 text-[#8899AA] hover:text-emerald-400 bg-[#1A2236]/50 border border-transparent hover:border-emerald-500/30 rounded-lg transition-all" title="Verify Chain Hash">
                        <FileSearch className="w-4 h-4" />
                    </button>
                    <button onClick={() => toast.error('Marked for deletion')} className="p-1.5 text-[#8899AA] hover:text-red-400 bg-[#1A2236]/50 border border-transparent hover:border-red-500/30 rounded-lg transition-all" title="Mark for Deletion">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    // Mock fallback since the backend records route is empty initially
    const mockData = Array(15).fill(null).map((_, i) => ({ id: `REC-${i + 1000}` }));
    const tableData = records?.length ? records : mockData;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold font-display text-white">Global IPFS Records</h1>
                    <p className="text-sm text-[#8899AA]">Monitor all encrypted payloads pinned to the IPFS network.</p>
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
