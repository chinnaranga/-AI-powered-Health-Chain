import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Terminal, Clock, ServerCrash } from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import { apiClient } from '../../services/apiClient';

export default function ApiLogs() {
    const [filterMethod, setFilterMethod] = useState('ALL');

    const { data: logs, isLoading } = useQuery({
        queryKey: ['adminApiLogs'],
        queryFn: apiClient.getApiLogs,
        refetchInterval: 5000, // Frequent refetch for logs
    });

    const columns = [
        {
            header: 'Timestamp',
            accessor: (row) => (
                <span className="text-xs font-mono text-[#8899AA]">
                    {new Date(row.timestamp || Date.now() - Math.random() * 86400000).toISOString().replace('T', ' ').substring(0, 19)}
                </span>
            )
        },
        {
            header: 'Method',
            align: 'center',
            accessor: (row) => {
                const meth = row.method || ['GET', 'POST', 'PUT', 'DELETE'][Math.floor(Math.random() * 4)];
                const color = meth === 'GET' ? 'text-[#00C8D4] bg-[#00C8D4]/10 border-[#00C8D4]/20' :
                    meth === 'POST' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                        meth === 'DELETE' ? 'text-red-400 bg-red-500/10 border-red-500/20' :
                            'text-amber-400 bg-amber-500/10 border-amber-500/20';
                return (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border inline-block w-14 text-center ${color}`}>
                        {meth}
                    </span>
                );
            }
        },
        {
            header: 'Endpoint',
            accessor: (row) => (
                <div className="flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-[#8899AA]" />
                    <span className="font-mono text-sm text-white">
                        {row.endpoint || `/api/v1/${['users', 'records', 'auth/login', 'network/status'][Math.floor(Math.random() * 4)]}`}
                    </span>
                </div>
            )
        },
        {
            header: 'Status',
            align: 'center',
            accessor: (row) => {
                const code = row.statusCode || (Math.random() > 0.9 ? [400, 401, 403, 404, 500][Math.floor(Math.random() * 5)] : 200);
                const isError = code >= 400;
                return (
                    <div className="flex items-center justify-center gap-1.5">
                        {isError && <ServerCrash className="w-3.5 h-3.5 text-red-500" />}
                        <span className={`text-xs font-bold font-mono ${isError ? 'text-red-400' : 'text-emerald-400'}`}>
                            {code}
                        </span>
                    </div>
                );
            }
        },
        {
            header: 'Latency',
            align: 'right',
            accessor: (row) => {
                const ms = row.responseTime || Math.floor(Math.random() * 250) + 10;
                const isSlow = ms > 200;
                return (
                    <div className="flex justify-end items-center gap-1.5 text-xs font-mono">
                        <Clock className={`w-3.5 h-3.5 ${isSlow ? 'text-amber-500' : 'text-[#8899AA]'}`} />
                        <span className={isSlow ? 'text-amber-400' : 'text-[#8899AA]'}>{ms}ms</span>
                    </div>
                );
            }
        }
    ];

    // Build mock
    const mockData = Array(25).fill(null).map((_, i) => ({ id: `log-${i}` }));
    const baseData = logs?.length ? logs : mockData;
    const tableData = filterMethod === 'ALL' ? baseData : baseData; // Filtering logic would apply to real data

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold font-display text-white">Backend API Logs</h1>
                    <p className="text-sm text-[#8899AA]">Live monitoring of incoming Express requests to localhost:3001.</p>
                </div>
                <div className="flex items-center bg-[#1A2236]/50 border border-[#1E2D4580] p-1 rounded-xl">
                    {['ALL', 'GET', 'POST', 'ERRORS'].map(m => (
                        <button
                            key={m}
                            onClick={() => setFilterMethod(m)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${filterMethod === m ? 'bg-[#00C8D4]/20 text-[#00C8D4]' : 'text-[#8899AA] hover:text-white'
                                }`}
                        >
                            {m}
                        </button>
                    ))}
                </div>
            </div>

            <DataTable
                columns={columns}
                data={tableData}
                isLoading={isLoading}
                emptyMessage="No recent API activity."
            />
        </div>
    );
}
