import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/UIComponents';
import { FadeIn, SlideIn, StaggerContainer } from '../components/AnimatedComponents';
import { ethers } from 'ethers';
import './Dashboard.css';

const AuditLogPage = () => {
    const { user } = useAuth();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, [user]);

    const fetchLogs = async () => {
        try {
            // If user has wallet, use it to filter. Admin sees all? 
            let query = '';
            if (user.role !== 'admin') {
                // Try to get wallet from window or user object
                let wallet = user.walletAddress;
                if (!wallet && window.ethereum) {
                    const provider = new ethers.BrowserProvider(window.ethereum);
                    const accounts = await provider.send("eth_requestAccounts", []);
                    wallet = accounts[0];
                }
                if (wallet) {
                    query = `?walletAddress=${wallet}`;
                }
            }

            const response = await fetch(`http://localhost:3001/api/history${query}`);
            const data = await response.json();
            if (Array.isArray(data)) {
                setLogs(data);
            }
        } catch (error) {
            console.error("Failed to fetch audit logs", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-container">
            <FadeIn>
                <div className="dashboard-header">
                    <h2>System Audit Trail</h2>
                    <span className="user-badge">SECURE LOGGING ENABLED</span>
                </div>
            </FadeIn>

            <StaggerContainer>
                <GlassCard className="full-width-card">
                    <h3 className="section-title">Access & Transaction History</h3>

                    {loading ? (
                        <p className="text-dim">Loading secure logs...</p>
                    ) : (
                        <div className="audit-table-container">
                            <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-primary)' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left' }}>
                                        <th style={{ padding: '1rem', color: 'var(--primary-cyan)' }}>Timestamp</th>
                                        <th style={{ padding: '1rem', color: 'var(--primary-cyan)' }}>Patient Node (Wallet)</th>
                                        <th style={{ padding: '1rem', color: 'var(--primary-cyan)' }}>Doctor Node (Wallet)</th>
                                        <th style={{ padding: '1rem', color: 'var(--primary-cyan)' }}>Action ID</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.length === 0 && (
                                        <tr>
                                            <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                                                No immutable records found for this node.
                                            </td>
                                        </tr>
                                    )}
                                    {logs.map((log, index) => (
                                        <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: index % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                                            <td style={{ padding: '1rem' }}>{new Date(log.accessTime).toLocaleString()}</td>
                                            <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                                                {log.patientWallet ? `${log.patientWallet.substring(0, 8)}...` : 'Unknown'}
                                            </td>
                                            <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                                                {log.doctorWallet ? `${log.doctorWallet.substring(0, 8)}...` : 'System'}
                                            </td>
                                            <td style={{ padding: '1rem', fontFamily: 'monospace', color: 'var(--text-dim)' }}>{log.id}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </GlassCard>
            </StaggerContainer>
        </div>
    );
};

export default AuditLogPage;
