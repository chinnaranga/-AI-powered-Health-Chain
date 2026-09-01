import { getApiBaseUrl } from '../apiClient';

const getBase = () => getApiBaseUrl();

/**
 * HealthChain Cloudflare Worker Auth Service
 * Replaces Firebase Authentication with Cloudflare Workers, JWT, and D1 Database.
 */

export async function loginUser(email, password, requestedRole = 'patient') {
    const res = await fetch(`${getBase()}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: requestedRole })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid email or password.');
    }

    if (data.token) {
        localStorage.setItem('hc_cf_jwt', data.token);
        localStorage.setItem('hc_token', data.token);
        localStorage.setItem('hc_user_role', data.user?.role || requestedRole);
        localStorage.setItem('hc_role', data.user?.role || requestedRole);
    }

    return data;
}

export async function registerUser({ email, password, name, role = 'patient', hospitalId = 'hosp_central_01' }) {
    const res = await fetch(`${getBase()}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role, hospitalId })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
        throw new Error(data.message || 'Registration failed.');
    }

    return data;
}

export async function getSessionUser() {
    const token = localStorage.getItem('hc_cf_jwt') || localStorage.getItem('hc_token');
    if (!token) return null;

    try {
        const res = await fetch(`${getBase()}/auth/session`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('text/html') || !res.ok) {
            return null;
        }

        const data = await res.json();
        if (data && data.success) {
            return data.user;
        }
    } catch (err) {
        // Silently fallback without noisy parse errors on static hosting
    }
    return null;
}

export async function logoutUser() {
    const token = localStorage.getItem('hc_cf_jwt') || localStorage.getItem('hc_token');
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
    localStorage.removeItem('hc_token');
    localStorage.removeItem('hc_user_role');
    localStorage.removeItem('hc_role');
    localStorage.removeItem('hc_user');
}

export default {
    loginUser,
    registerUser,
    getSessionUser,
    logoutUser
};
