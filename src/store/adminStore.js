import { create } from 'zustand';

// Basic admin UI state store
const useAdminStore = create((set) => ({
    sidebarCollapsed: false,
    toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

    // Potential filters or search terms for global use
    globalSearch: '',
    setGlobalSearch: (term) => set({ globalSearch: term }),
}));

export default useAdminStore;
