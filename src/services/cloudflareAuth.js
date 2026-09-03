import { getApiBaseUrl } from './apiClient';

const getBase = () => getApiBaseUrl();

/**
 * Register a new user with email verification
 */
export async function registerWithCloudflare({ email, password, name, role = 'patient', hospitalId = 'hosp_central_01', phone = '', specialty = '', licenseNumber = '' }) {
    const res = await fetch(`${getBase()}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role, hospitalId, phone, specialty, licenseNumber })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
        throw new Error(data.message || 'Registration failed.');
    }

    return data;
}

/**
 * Verify Email with Verification Token
 */
export async function verifyEmailToken(token) {
    const res = await fetch(`${getBase()}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
        throw new Error(data.message || 'Email verification failed.');
    }

    return data;
}

/**
 * Login user and store Cloudflare JWT session token
 */
export async function loginWithCloudflare(email, password, role = 'patient') {
    const res = await fetch(`${getBase()}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid email or password.');
    }

    if (data.token) {
        localStorage.setItem('hc_cf_jwt', data.token);
        localStorage.setItem('hc_user_role', data.user?.role || 'patient');
    }

    return data;
}

/**
 * Get current authenticated user profile from Cloudflare Worker & D1
 */
export async function getCurrentCloudflareUser() {
    const token = localStorage.getItem('hc_cf_jwt');
    if (!token) return null;

    try {
        const res = await fetch(`${getBase()}/auth/me`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await res.json();
        if (res.ok && data.success) {
            return data.user;
        }
    } catch (err) {
        console.warn('[Cloudflare Auth notice]', err.message);
    }
    return null;
}

/**
 * Logout and clear session
 */
export async function logoutCloudflareUser() {
    const token = localStorage.getItem('hc_cf_jwt');
    if (token) {
        try {
            await fetch(`${getBase()}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (e) {}
    }

    localStorage.removeItem('hc_cf_jwt');
    localStorage.removeItem('hc_user_role');
}

export default {
    registerWithCloudflare,
    verifyEmailToken,
    loginWithCloudflare,
    getCurrentCloudflareUser,
    logoutCloudflareUser
};
