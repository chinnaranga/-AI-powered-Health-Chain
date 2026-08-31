import { useState, useEffect } from 'react';
import { toast } from '../components/Toast';

/**
 * Custom hook to monitor online/offline network connectivity.
 * Emits global toasts and custom window events when states change.
 * 
 * @returns {boolean} True if the browser is online, false otherwise.
 */
export function useConnectionStatus() {
    const [isOnline, setIsOnline] = useState(
        typeof navigator !== 'undefined' ? navigator.onLine : true
    );

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleOnline = () => {
            setIsOnline(true);
            toast.success('Your connection is restored. Syncing data...');
            window.dispatchEvent(new CustomEvent('connection-restored'));
        };

        const handleOffline = () => {
            setIsOnline(false);
            toast.warning('You are currently offline. Running in offline fallback mode.');
            window.dispatchEvent(new CustomEvent('connection-lost'));
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return isOnline;
}
export default useConnectionStatus;
