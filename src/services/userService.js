import { 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    setDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where 
} from 'firebase/firestore';
import { db } from '../firebase/config';

const USERS_COLLECTION = 'users';

export const userService = {
    /**
     * Get user by ID
     */
    getUserById: async (userId) => {
        const userRef = doc(db, USERS_COLLECTION, userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            return { id: userSnap.id, ...userSnap.data() };
        }
        return null;
    },

    /**
     * Get all users (optionally filtered by role)
     */
    getUsers: async (role = null) => {
        const usersRef = collection(db, USERS_COLLECTION);
        let q = usersRef;
        
        if (role) {
            q = query(usersRef, where("role", "==", role));
        }

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    /**
     * Update user profile
     */
    updateUser: async (userId, data) => {
        const userRef = doc(db, USERS_COLLECTION, userId);
        await updateDoc(userRef, data);
        return { id: userId, ...data };
    },

    /**
     * Update user status (e.g., active, revoked)
     */
    updateUserStatus: async (userId, status) => {
        const userRef = doc(db, USERS_COLLECTION, userId);
        await updateDoc(userRef, { status });
        return { id: userId, status };
    },

    /**
     * Delete user from Firestore
     */
    deleteUser: async (userId) => {
        const userRef = doc(db, USERS_COLLECTION, userId);
        await deleteDoc(userRef);
        return userId;
    }
};
