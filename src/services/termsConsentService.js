import { getApiBaseUrl } from './apiClient';
import useAuthStore from '../store/authStore';

export const CURRENT_TERMS_VERSION = '1.0';
export const TERMS_LAST_UPDATED = 'June 2026';

/**
 * Check if the user has accepted the current version of Terms & Conditions
 */
export function hasUserAcceptedCurrentTerms(user) {
    if (!user) return false;
    const userId = user.id || user.uid;
    if (!userId) return false;

    // Check in user profile object
    if (user.termsAcceptedVersion === CURRENT_TERMS_VERSION) {
        return true;
    }

    // Check in authenticated local consent store
    try {
        const stored = localStorage.getItem(`hc_terms_consent_${userId}`);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.accepted === true && parsed.termsVersion === CURRENT_TERMS_VERSION) {
                return true;
            }
        }
    } catch (e) {
        console.warn('[TermsConsentService] Failed to read local consent:', e);
    }

    return false;
}

/**
 * Persist user acceptance of the Terms & Conditions
 */
export async function recordTermsConsent(user, version = CURRENT_TERMS_VERSION) {
    if (!user) throw new Error('User required to record terms consent');
    const userId = user.id || user.uid;
    if (!userId) throw new Error('User ID required to record terms consent');

    const consentData = {
        userId,
        termsVersion: version,
        accepted: true,
        acceptedAt: new Date().toISOString()
    };

    // 1. Try to sync to backend database
    const token = localStorage.getItem('hc_cf_jwt') || localStorage.getItem('hc_token');
    try {
        const res = await fetch(`${getApiBaseUrl()}/auth/terms-consent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify(consentData)
        });
        if (!res.ok) {
            console.warn('[TermsConsentService] Server sync response not ok, proceeding with local fallback');
        }
    } catch (apiErr) {
        console.warn('[TermsConsentService] Server unreachable, persisting to client storage:', apiErr.message);
    }

    // 2. Persist to authoritative local client storage for this user ID
    try {
        localStorage.setItem(`hc_terms_consent_${userId}`, JSON.stringify(consentData));
    } catch (storageErr) {
        console.error('[TermsConsentService] Storage error:', storageErr);
        throw new Error('Unable to save your acceptance. Please try again.');
    }

    // 3. Update auth store user profile
    const updatedUser = {
        ...user,
        termsAcceptedVersion: version,
        termsConsentAt: consentData.acceptedAt
    };

    try {
        localStorage.setItem('hc_user', JSON.stringify(updatedUser));
        useAuthStore.setState({ user: updatedUser });
    } catch (e) {
        console.warn('[TermsConsentService] Error updating authStore user:', e);
    }

    return consentData;
}
