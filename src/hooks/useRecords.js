import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../firebase/config';

export function useRecords(options = {}) {
    const { fetchAll = false } = options;
    const [records, setRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userId, setUserId] = useState(null);

    // ── Step 1: Wait for Firebase Auth to resolve ────────────────────────
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            const currentToken = localStorage.getItem('hc_token');
            setUserId(user?.uid ?? currentToken ?? null);
            if (!user && !currentToken) setIsLoading(false);
        });

        // Proactive initialization for development simulated bypass states
        const currentToken = localStorage.getItem('hc_token');
        if (currentToken) {
            setUserId(currentToken);
        }

        return () => unsub();
    }, []);

    // ── Step 2: Real-time Firestore subscription ───────────────────────────
    useEffect(() => {
        if (!userId) return;

        setIsLoading(true);

        const q = fetchAll
            ? query(collection(db, 'records'))
            : query(collection(db, 'records'), where('patientId', '==', userId));

        const unsub = onSnapshot(
            q,
            (snapshot) => {
                const formatted = snapshot.docs.map((doc, i) => {
                    const r = doc.data();
                    let dataObj = r.data;
                    try {
                        dataObj = typeof r.data === 'string' ? JSON.parse(r.data) : r.data;
                    } catch {}

                    // Normalize timestamps
                    const tsMs = r.createdAt?.seconds 
                        ? r.createdAt.seconds * 1000 
                        : (Number(r.timestamp) * 1000 || Date.now());

                    return {
                        id: doc.id,
                        cid: r.cidHash || dataObj?.ipfsHash || r.hash || 'N/A',
                        timestamp: tsMs,
                        date: new Date(tsMs).toLocaleDateString(),
                        name: r.fileName || dataObj?.name || dataObj?.description || `Record ${i + 1}`,
                        type: r.category || dataObj?.type || 'Medical Document',
                        status: r.verified ? 'verified' : 'pending',
                        txHash: r.blockchainHash || r.hash || '',
                        size: r.fileSize || dataObj?.size || '---',
                        patientId: r.patientId || 'unknown',
                    };
                });

                // Sort newest first
                formatted.sort((a, b) => b.timestamp - a.timestamp);
                setRecords(formatted);
                setIsLoading(false);
            },
            (err) => {
                console.error('[useRecords] Firestore error:', err.message);
                setIsLoading(false);
            }
        );

        return () => unsub();
    }, [userId, fetchAll]);

    return { records, isLoading };
}
