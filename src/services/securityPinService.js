import { doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getDocSafe, updateDocSafe } from '../firebase/firestoreUtils';

export const securityPinService = {
    /**
     * Checks if the user has a security PIN configured.
     * Looks at local storage first when offline to bypass connection delays.
     * 
     * @param {string} userId - The user's UID.
     * @returns {Promise<string|null>} PIN or null.
     */
    getUserPin: async (userId) => {
        if (!userId) return null;

        const cacheKey = `hc_profile_${userId}`;

        // 1. If offline, use cached user details from localStorage immediately
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    console.info('[Security PIN] Operating offline. Loaded PIN from local cache.');
                    return parsed.securityPin || null;
                } catch (e) {
                    console.warn('[Security PIN] Failed to parse cached PIN profile:', e);
                }
            }
            return null;
        }

        // 2. If online, fetch from firestore using the safe utility
        try {
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDocSafe(userRef, 'Failed to fetch security settings');
            
            if (userSnap && userSnap.exists()) {
                const data = userSnap.data();
                if (data.securityPin) {
                    // Sync PIN into local profile cache
                    const cached = localStorage.getItem(cacheKey);
                    let cachedData = {};
                    if (cached) {
                        try { cachedData = JSON.parse(cached); } catch (e) {}
                    }
                    localStorage.setItem(cacheKey, JSON.stringify({ ...cachedData, securityPin: data.securityPin }));
                    return data.securityPin;
                }
            }
            return null;
        } catch (error) {
            console.warn('[Security PIN] Firestore query failed, falling back to local storage profile cache:', error);
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    return parsed.securityPin || null;
                } catch (e) {}
            }
            return null;
        }
    },

    /**
     * Updates/saves the user's security PIN.
     * 
     * @param {string} userId - The user's UID.
     * @param {string} pin - The 4-digit PIN.
     * @returns {Promise<boolean>} Success.
     */
    setUserPin: async (userId, pin) => {
        if (!userId) throw new Error('User ID is required to set PIN.');
        
        const cacheKey = `hc_profile_${userId}`;
        const userRef = doc(db, 'users', userId);

        // Update online document in Firestore
        await updateDocSafe(userRef, { securityPin: pin }, 'Failed to save security settings');

        // Sync local storage cache
        const cached = localStorage.getItem(cacheKey);
        let cachedData = {};
        if (cached) {
            try { cachedData = JSON.parse(cached); } catch (e) {}
        }
        localStorage.setItem(cacheKey, JSON.stringify({ ...cachedData, securityPin: pin }));
        
        return true;
    }
};
export default securityPinService;
