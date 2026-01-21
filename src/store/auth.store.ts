import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,
      
      login: (user, token, refreshToken) => {
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('tenantId', user.tenantId || 'main');
        
        set({ 
          user, 
          token, 
          refreshToken, 
          isAuthenticated: true, 
          isLoading: false 
        });
      },
      
      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('tenantId');
        
        set({ 
          user: null, 
          token: null, 
          refreshToken: null, 
          isAuthenticated: false, 
          isLoading: false 
        });
      },
      
      updateUser: (updatedUser) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedUser } : null,
        })),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      initialize: () => {
        if (typeof window === 'undefined') {
          set({ isLoading: false });
          return;
        }
        
        try {
          const token = localStorage.getItem('token');
          const refreshToken = localStorage.getItem('refreshToken');
          const userStr = localStorage.getItem('user');
          
          if (token && userStr) {
            const user = JSON.parse(userStr);
            set({ 
              user, 
              token, 
              refreshToken, 
              isAuthenticated: true, 
              isLoading: false 
            });
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          localStorage.removeItem('tenantId');
          set({ 
            user: null, 
            token: null, 
            refreshToken: null, 
            isAuthenticated: false, 
            isLoading: false 
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);