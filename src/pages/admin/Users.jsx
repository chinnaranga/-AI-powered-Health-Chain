import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserX, ShieldAlert, Eye, Download } from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import { apiClient } from '../../services/apiClient';

/* ───── Status Badge Component ───── */
function CustomStatusBadge({ status, className = '' }) {
    const colors = {
        active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        revoked: 'bg-red-500/10 text-red-400 border-red-500/20',
    };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${colors[status] || 'bg-[#1A2236] text-[#8899AA] border-[#1E2D4580]'} ${className}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status === 'active' ? 'bg-emerald-400' : 'bg-red-400'}`} />
            {status}
        </span>
    );
}

export default function Users() {
    const { data: users, isLoading } = useQuery({
        queryKey: ['adminUsers'],
        queryFn: apiClient.getUsers,
    });

    const columns = [
        {
            header: 'User',
            accessor: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00C8D4]/20 to-blue-600/20 border border-[#00C8D4]/30 flex items-center justify-center font-bold text-[#00C8D4] text-xs uppercase shadow-[0_0_10px_rgba(0,200,212,0.1)]">
                        {row.email ? row.email.charAt(0) : '?'}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-white">{row.name || 'Anonymous User'}</p>
                        <p className="text-xs text-[#8899AA]">{row.email}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Role',
            accessor: (row) => {
                const roleColors = {
                    admin: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
                    doctor: 'bg-[#00C8D4]/10 text-[#00C8D4] border-[#00C8D4]/20',
                };
                const colorClass = roleColors[row.role] || 'bg-[#1A2236] text-[#8899AA] border-[#1E2D4580]';
                
                return (
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold border ${colorClass}`}>
                        {row.role}
                    </span>
                );
            }
        },
        {
            header: 'Wallet Address',
            accessor: (row) => (
                <div className="font-mono text-xs text-[#8899AA] bg-[#1A2236]/50 px-2 py-1 rounded border border-[#1E2D4580] inline-block">
                    {row.walletAddress ? `${row.walletAddress.slice(0, 6)}...${row.walletAddress.slice(-4)}` : 'Not connected'}
                </div>
            )
        },
        {
            header: 'Status',
            accessor: (row) => <CustomStatusBadge status={Math.random() > 0.1 ? 'active' : 'revoked'} />
        },
        {
            header: 'Created Date',
            accessor: (row) => <span className="text-[#8899AA] font-mono text-xs">{new Date(row.createdAt || Date.now()).toLocaleDateString()}</span>
        },
        {
            header: 'Actions',
            align: 'right',
            accessor: (row) => (
                <div className="flex items-center justify-end gap-2">
                    <button className="p-1.5 text-[#8899AA] hover:text-[#00C8D4] bg-[#1A2236]/50 border border-transparent hover:border-[#00C8D4]/30 rounded-lg transition-all" title="View Profile">
                        <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-[#8899AA] hover:text-amber-400 bg-[#1A2236]/50 border border-transparent hover:border-amber-500/30 rounded-lg transition-all" title="Reset Access">
                        <ShieldAlert className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-[#8899AA] hover:text-red-400 bg-[#1A2236]/50 border border-transparent hover:border-red-500/30 rounded-lg transition-all" title="Disable User">
                        <UserX className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    // Safe fallback if users is missing or error
    const tableData = Array.isArray(users) ? users : [];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold font-display text-white">Users Management</h1>
                    <p className="text-sm text-[#8899AA]">Manage all registered entities on the chain.</p>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="px-4 py-2.5 bg-[#111827] border border-[#1E2D4580] rounded-xl text-sm text-white placeholder:text-[#8899AA] focus:outline-none focus:border-[#00C8D4]/50 transition-colors w-full sm:w-64"
                    />
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#111827] text-[#8899AA] border border-[#1E2D4580] font-bold hover:text-white hover:border-[#00C8D4]/50 transition-all text-sm">
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={tableData}
                isLoading={isLoading}
                emptyMessage="No users found on the network."
            />
        </div>
    );
}
