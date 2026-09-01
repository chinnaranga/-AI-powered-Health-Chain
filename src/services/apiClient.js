export const getApiBaseUrl = () => {
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
        if (isLocal) {
            return 'http://localhost:3001/api';
        }
    }
    return 'https://healthchain-backend-kz6q.onrender.com/api';
};

export const apiClient = {
    async request(endpoint, options = {}) {
        const baseUrl = getApiBaseUrl();
        const token = localStorage.getItem('hc_token') || localStorage.getItem('hc_cf_jwt') || 'session_token';
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers
        };

        try {
            const res = await fetch(`${baseUrl}${endpoint}`, config);
            const contentType = res.headers.get('content-type') || '';

            if (contentType.includes('text/html')) {
                throw new Error('API server unreachable (received HTML fallback page).');
            }

            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.message || `Request failed with status ${res.status}`);
            }
            return data;
        } catch (err) {
            console.warn(`[ApiClient] ${endpoint} request notice:`, err.message);
            throw err;
        }
    },

    get(endpoint, headers = {}) {
        return this.request(endpoint, { method: 'GET', headers });
    },

    post(endpoint, body, headers = {}) {
        return this.request(endpoint, { method: 'POST', body: JSON.stringify(body), headers });
    },

    put(endpoint, body, headers = {}) {
        return this.request(endpoint, { method: 'PUT', body: JSON.stringify(body), headers });
    },

    delete(endpoint, headers = {}) {
        return this.request(endpoint, { method: 'DELETE', headers });
    }
};

export default apiClient;
