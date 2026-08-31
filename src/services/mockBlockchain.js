const API_URL = 'http://localhost:3001/api';

class MockBlockchainService {
    constructor() {
        this.listeners = [];
        this.startSimulation();
    }

    subscribe(callback) {
        this.listeners.push(callback);
        return () => { this.listeners = this.listeners.filter(l => l !== callback); };
    }

    notify(event) {
        this.listeners.forEach(l => l(event));
    }

    startSimulation() {
        // Occasionally simulate a "new record" being found on the network (if applicable)
        setInterval(() => {
            if (Math.random() > 0.9) {
                this.notify({ type: 'NETWORK_TICK', timestamp: Date.now() });
            }
        }, 10000);
    }

    // Helper for requests
    async request(endpoint, method = 'GET', body = null) {
        try {
            const options = {
                method,
                headers: { 'Content-Type': 'application/json' },
            };
            if (body) options.body = JSON.stringify(body);

            const res = await fetch(`${API_URL}${endpoint}`, options);
            if (!res.ok) {
                const err = await res.json();
                return { success: false, message: err.error || 'Request failed' };
            }
            const data = await res.json();
            if (method !== 'GET') this.notify({ type: 'DATA_CHANGED', endpoint });
            return data;
        } catch (error) {
            console.error('API Error:', error);
            return { success: false, message: `Connection Error: ${error.message}. Check if Backend (port 3001) is running.` };
        }
    }

    async registerUser(userData) {
        const res = await this.request('/register', 'POST', userData);
        if (res.id) return { success: true, user: res };
        return { success: false, message: res.message };
    }

    async loginUser(email, password) {
        const res = await this.request('/login', 'POST', { email, password });
        if (res.id) return { success: true, user: res };
        return { success: false, message: res.message || 'Invalid credentials' };
    }

    async getUsers() {
        const res = await this.request('/users');
        return Array.isArray(res) ? res : [];
    }

    async addRecord(recordData) {
        const hash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
        const newBlock = {
            id: 'tx_' + Date.now(),
            data: recordData,
            hash,
            previousHash: '0x0000',
            timestamp: Date.now(),
            patientId: recordData.patientId
        };

        await this.request('/records', 'POST', newBlock);
        return newBlock;
    }

    async setAccessCode(userId, code) {
        const res = await this.request('/access-code', 'POST', { userId, code });
        return res.success;
    }

    async verifyAccessCode(patientId, code) {
        const res = await this.request('/verify-access', 'POST', { patientId, code });
        return res.valid;
    }

    async getRecords(role, userId, patientIdForDoctor = null) {
        let query = `?role=${role}&userId=${userId}`;
        if (patientIdForDoctor) query += `&patientIdForDoctor=${patientIdForDoctor}`;

        const res = await this.request(`/records${query}`);
        return Array.isArray(res) ? res : [];
    }
}

export const mockBlockchain = new MockBlockchainService();
