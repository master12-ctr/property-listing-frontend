import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface FavoritesState {
  favorites: Set<string>;
  addFavorite: (propertyId: string) => void;
  removeFavorite: (propertyId: string) => void;
  toggleFavorite: (propertyId: string) => void;
  hasFavorite: (propertyId: string) => boolean;
  clearFavorites: () => void;
}

// Helper to serialize/deserialize Set
const setSerializer = {
  serialize: (state: { favorites: Set<string> }) => ({
    ...state,
    favorites: Array.from(state.favorites),
  }),
  deserialize: (state: { favorites: string[] }) => ({
    ...state,
    favorites: new Set(state.favorites || []),
  }),
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: new Set<string>(),
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