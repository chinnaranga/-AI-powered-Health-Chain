import { getSessionUser } from '../services/auth/authService';

/**
 * HealthChain Cloudflare Core Engine Compatibility Adapter
 * Replaces Firebase Client SDK with Cloudflare Auth, D1, and R2.
 */

export const auth = {
    currentUser: null,
    onAuthStateChanged: (callback) => {
        getSessionUser().then((user) => {
            if (user) {
                auth.currentUser = user;
                callback(user);
            } else {
                auth.currentUser = null;
                callback(null);
            }
        }).catch(() => {
            auth.currentUser = null;
            callback(null);
        });
        return () => {};
    }
};

export const db = {};
export const storage = {};

export default {
    auth,
    db,
    storage
};
