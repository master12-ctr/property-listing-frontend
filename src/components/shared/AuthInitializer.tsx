'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';

export function AuthInitializer() {
  const { login } = useAuthStore();

  useEffect(() => {
    // Check if there's auth data in localStorage on initial load
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const tenantId = localStorage.getItem('tenantId');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        // Restore auth state from localStorage
        login(user, token);
      } catch (error) {
        console.error('Failed to parse user data from localStorage', error);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('tenantId');
      }
    }
  }, [login]);

  return null;
}