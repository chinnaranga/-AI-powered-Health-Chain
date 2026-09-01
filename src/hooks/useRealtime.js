import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * HealthChain Real-time WebSocket Subscription Hook
 * Replaces Firebase onSnapshot / Realtime DB with WebSocket event streaming.
 * 
 * @param {string|Array<string>} channels - Channel(s) to subscribe to, e.g. "patient:123" or "hospital:hosp_01"
 * @param {Function} onEvent - Callback when an event is received: (event) => void
 */
export function useRealtime(channels = [], onEvent = null) {
    const [isConnected, setIsConnected] = useState(false);
    const wsRef = useRef(null);
    const channelList = Array.isArray(channels) ? channels : [channels].filter(Boolean);

    const connect = useCallback(() => {
        if (typeof window === 'undefined') return;

        const token = localStorage.getItem('hc_token') || localStorage.getItem('hc_cf_jwt') || '';
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        
        let wsHost = 'localhost:3001';
        if (import.meta.env.VITE_API_URL) {
            try {
                const parsed = new URL(import.meta.env.VITE_API_URL);
                wsHost = parsed.host;
            } catch (e) {}
        } else if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            wsHost = 'healthchain-backend-kz6q.onrender.com';
        }

        const wsUrl = `${protocol}//${wsHost}/ws?token=${encodeURIComponent(token)}`;

        try {
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                setIsConnected(true);
                // Subscribe to channels
                channelList.forEach(channel => {
                    if (channel) {
                        ws.send(JSON.stringify({ type: 'SUBSCRIBE', channel }));
                    }
                });
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (onEvent && typeof onEvent === 'function') {
                        onEvent(data);
                    }
                    // Dispatch window event for global component reactivity
                    if (data.type) {
                        window.dispatchEvent(new CustomEvent(`hc_realtime_${data.type}`, { detail: data }));
                    }
                } catch (e) {}
            };

            ws.onclose = () => {
                setIsConnected(false);
                // Reconnect after 3 seconds
                setTimeout(() => {
                    if (wsRef.current === ws) {
                        connect();
                    }
                }, 3000);
            };

            ws.onerror = () => {
                setIsConnected(false);
            };
        } catch (err) {
            console.warn('[Realtime Hook Warning]: WebSocket connection notice:', err.message);
        }
    }, [channelList.join(','), onEvent]);

    useEffect(() => {
        connect();
        return () => {
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [connect]);

    const send = useCallback((payload) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(payload));
        }
    }, []);

    return { isConnected, send };
}

export default useRealtime;
