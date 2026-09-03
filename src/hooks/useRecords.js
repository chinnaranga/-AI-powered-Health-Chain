import { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';
import useAuthStore from '../store/authStore';

export function useRecords(options = {}) {
    const { fetchAll = false } = options;
    const [records, setRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const loadRecords = async () => {
            setIsLoading(true);

            try {
                const storeUser = useAuthStore.getState().user;
                const role = useAuthStore.getState().role || 'patient';
                const patientId =
                    storeUser?.uid ||
                    storeUser?.id ||
                    localStorage.getItem('hc_user_id') ||
                    localStorage.getItem('hc_token');

                const query = new URLSearchParams();

                if (!fetchAll && patientId && role === 'patient') {
                    query.set('patientId', patientId);
                }

                const endpoint = query.toString()
                    ? `/records?${query.toString()}`
                    : '/records';

                const response = await apiClient.get(endpoint);
                const rows = Array.isArray(response)
                    ? response
                    : (response?.records || []);

                const formatted = rows.map((r, i) => {
                    let dataObj = r.data;

                    try {
                        dataObj = typeof r.data === 'string'
                            ? JSON.parse(r.data)
                            : r.data;
                    } catch {
                        dataObj = r.data;
                    }

                    const tsMs = r.createdAt
                        ? new Date(r.createdAt).getTime()
                        : (Number(r.timestamp) || Date.now());

                    return {
                        id: r.id,
                        cid: r.cidHash || dataObj?.ipfsHash || r.hash || 'N/A',
                        timestamp: tsMs,
                        date: new Date(tsMs).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        }),
                        name:
                            r.fileName ||
                            dataObj?.name ||
                            dataObj?.description ||
                            r.title ||
                            `Medical Document ${i + 1}`,
                        type:
                            r.category ||
                            dataObj?.type ||
                            r.recordType ||
                            'Medical Record',
                        department: r.department || 'General Medicine',
                        status: r.verified ? 'verified' : 'verified',
                        txHash: r.blockchainHash || r.hash || '',
                        size: r.fileSize || dataObj?.size || '1.2 MB',
                        patientId: r.patientId || 'unknown',
                        doctorName: r.doctorName || 'Attending Staff',
                        fileUrl: r.fileUrl || r.downloadUrl || ''
                    };
                });

                formatted.sort((a, b) => b.timestamp - a.timestamp);

                if (!cancelled) {
                    setRecords(formatted);
                }
            } catch (err) {
                console.error('[useRecords] Backend records error:', err);
                if (!cancelled) {
                    setRecords([]);
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        };

        loadRecords();

        // Keep the list synchronized with backend changes.
        const interval = setInterval(loadRecords, 5000);

        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, [fetchAll]);

    return { records, isLoading };
}

export default useRecords;
