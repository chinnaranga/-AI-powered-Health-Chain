import { apiClient } from './apiClient';

export const userService = {
    /**
     * Get user by ID from Neon PostgreSQL
     */
    getUserById: async (userId) => {
        try {
            const data = await apiClient.get(`/users/${userId}`);
            return data.user || data;
        } catch (e) {
            console.error('[userService] getUserById failed:', e.message);
            throw e;
        }
    },

    /**
     * Get all users (admin directory)
     */
    getUsers: async (role = null) => {
        try {
            const endpoint = role ? `/users?role=${encodeURIComponent(role)}` : '/users';
            const data = await apiClient.get(endpoint);
            return data.users || (Array.isArray(data) ? data : []);
        } catch (e) {
            console.error('[userService] getUsers failed:', e.message);
            throw e;
        }
    },

    /**
     * Update user profile
     */
    updateUser: async (userId, data) => {
        try {
            await apiClient.put(`/users/${userId}`, data);
            return { id: userId, ...data };
        } catch (e) {
            console.error('[userService] updateUser failed:', e.message);
            throw e;
        }
    }
};

export default userService;
