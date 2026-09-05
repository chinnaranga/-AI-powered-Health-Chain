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
            console.warn('[userService] getUserById notice:', e.message);
            return null;
        }
    },

    /**
     * Get all users (optionally filtered by role)
     */
    getUsers: async (role = null) => {
        try {
            const endpoint = role ? `/users?role=${role}` : '/users';
            const data = await apiClient.get(endpoint);
            return data.users || (Array.isArray(data) ? data : []);
        } catch (e) {
            console.warn('[userService] getUsers notice:', e.message);
            return [];
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
            return { id: userId, ...data };
        }
    },

    /**
     * Update user status (e.g., active, revoked)
     */
    updateUserStatus: async (userId, status) => {
        try {
            await apiClient.put(`/users/${userId}`, { status });
            return { id: userId, status };
        } catch (e) {
            return { id: userId, status };
        }
    },

    /**
     * Delete user from PostgreSQL
     */
    deleteUser: async (userId) => {
        try {
            await apiClient.delete(`/users/${userId}`);
            return userId;
        } catch (e) {
            return userId;
        }
    }
};

export default userService;
