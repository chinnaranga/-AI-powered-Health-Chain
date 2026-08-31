/**
 * Retries an asynchronous function with exponential backoff.
 * Rejects immediately if the browser is offline to prevent unnecessary delay.
 * 
 * @param {Function} fn - The asynchronous function to execute.
 * @param {number} retries - Maximum number of retry attempts.
 * @param {number} delay - Initial delay in milliseconds.
 * @param {number} backoff - Multiplier for each subsequent delay.
 * @param {Function} onRetry - Callback function executed before a retry attempt.
 * @returns {Promise<any>}
 */
export async function retryWithBackoff(fn, retries = 3, delay = 1000, backoff = 2, onRetry = null) {
    let currentDelay = delay;

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            // Check if we are offline during the failure
            const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
            const isFirestoreOffline = error.code === 'unavailable' || 
                                       error.message?.toLowerCase().includes('offline') ||
                                       error.message?.toLowerCase().includes('network');

            // If we are at the last attempt or if we are offline, propagate error immediately
            if (attempt === retries || isOffline || isFirestoreOffline) {
                throw error;
            }

            if (onRetry) {
                onRetry(attempt, error);
            }

            // Wait before next attempt
            await new Promise(resolve => setTimeout(resolve, currentDelay));
            currentDelay *= backoff;
        }
    }
}
