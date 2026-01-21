import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface FavoritesState {
  favorites: Set<string>;
  isLoading: boolean;
  addFavorite: (propertyId: string) => void;
  removeFavorite: (propertyId: string) => void;
  toggleFavorite: (propertyId: string) => void;
  hasFavorite: (propertyId: string) => boolean;
  clearFavorites: () => void;
  initialize: () => void;
  setLoading: (loading: boolean) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: new Set<string>(),
      isLoading: true,
      
      addFavorite: (propertyId) =>
        set((state) => {
          const newFavorites = new Set(state.favorites);
          newFavorites.add(propertyId);
          return { favorites: newFavorites };
        }),
        
      removeFavorite: (propertyId) =>
        set((state) => {
          const newFavorites = new Set(state.favorites);
          newFavorites.delete(propertyId);
          return { favorites: newFavorites };
        }),
        
      toggleFavorite: (propertyId) => {
        const { hasFavorite, addFavorite, removeFavorite } = get();
        if (hasFavorite(propertyId)) {
          removeFavorite(propertyId);
        } else {
          addFavorite(propertyId);
        }
      },
      
      hasFavorite: (propertyId) => get().favorites.has(propertyId),
      
      clearFavorites: () => set({ favorites: new Set() }),
      
      initialize: () => {
        if (typeof window !== 'undefined') {
          const favoritesStr = localStorage.getItem('favorites-storage');
          if (favoritesStr) {
            try {
              const parsed = JSON.parse(favoritesStr);
              if (parsed.state && parsed.state.favorites) {
                set({ 
                  favorites: new Set(parsed.state.favorites),
                  isLoading: false 
                });
                return;
              }
            } catch (error) {
              console.error('Failed to parse favorites from localStorage', error);
            }
          }
        }
        set({ isLoading: false });
      },
      
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'favorites-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        favorites: Array.from(state.favorites),
      }),
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        favorites: new Set(persistedState?.favorites || []),
      }),
    }
  )
);