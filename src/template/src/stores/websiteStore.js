import { create } from 'zustand';

const useWebsiteStore = create((set) => ({
  title: '{{ title }}',
  description: '{{ description }}',
  phone: '{{ phone }}',
  address: '{{ address }}',
  domain: '{{ domain }}',
  
  updateWebsiteData: (data) => set(data),
  
  // Theme settings
  theme: {
    primaryColor: '#2563eb',
    secondaryColor: '#7c3aed',
    accentColor: '#06b6d4',
  },
  
  updateTheme: (theme) => set((state) => ({
    theme: { ...state.theme, ...theme }
  })),
}));

export default useWebsiteStore;