import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShieldX, Key, UserCheck } from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
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

export default function AccessControl() {
    const { data: grants, isLoading } = useQuery({
        queryKey: ['adminAccessGrants'],
        queryFn: apiClient.getAccessGrants,
    });

    const columns = [
        {
            header: 'Grant ID',
            accessor: (row) => (
                <span className="text-xs font-mono text-[#8899AA]">
                    {row.id || Math.random().toString(36).substring(7).toUpperCase()}
                </span>
            )
        },
        {
            header: 'Patient (Granter)',
            accessor: (row) => (
                <div className="flex items-center gap-2 text-sm font-bold text-[#00C8D4]">
                    <UserCheck className="w-3.5 h-3.5" />
                    {row.patientName || `Patient ${Math.floor(Math.random() * 1000)}`}
                </div>
            )
        },
        {
            header: 'Doctor (Grantee)',
            accessor: (row) => (
                <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
                    <Key className="w-3.5 h-3.5" />
                    {row.doctorName || `Dr. ${['Smith', 'Chen', 'Doe'][Math.floor(Math.random() * 3)]}`}
                </div>
            )
        },
        {
            header: 'Record Access',
            accessor: (row) => (
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Full Access
                </span>
            )
        },
        {
            header: 'Status',
            accessor: (row) => <CustomStatusBadge status={row.status || 'active'} />
        },
        {
            header: 'Timestamp',
            accessor: (row) => <span className="text-[#8899AA] text-sm">{new Date(row.createdAt || Date.now()).toLocaleString()}</span>
        },
        {
            header: 'Actions',
            align: 'right',
            accessor: (row) => (
                <button className="p-1.5 text-[#8899AA] hover:text-red-400 bg-[#1A2236]/50 border border-transparent hover:border-red-500/30 rounded-lg transition-all flex items-center justify-center ml-auto" title="Force Revoke Access">
                    <ShieldX className="w-4 h-4" />
                </button>
            )
        }
    ];

    // Mock fallback since the backend grants route is empty initially
    const mockData = Array(12).fill(null).map((_, i) => ({ id: `GR-${i + 100}`, status: Math.random() > 0.8 ? 'revoked' : 'active' }));
    const tableData = grants?.length ? grants : mockData;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold font-display text-white">Access Control Overseer</h1>
                    <p className="text-sm text-[#8899AA]">Monitor and manage all cryptographic viewing grants across the network.</p>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={tableData}
                isLoading={isLoading}
                emptyMessage="No access grants found."
            />
        </div>
    );
}
