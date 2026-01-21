'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';

export function AuthInitializer() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    // Initialize auth state on mount
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const refreshToken = localStorage.getItem('refreshToken');
        const userStr = localStorage.getItem('user');
        
        if (token && userStr && refreshToken) {
          const user = JSON.parse(userStr);
          // Manually set auth state
          useAuthStore.setState({
            user,
            token,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          useAuthStore.setState({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        useAuthStore.setState({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    initializeAuth();
  }, []);

  return null;
}