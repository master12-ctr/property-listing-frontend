import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/lib/api/services';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

export function useAuth() {
  const { user, isAuthenticated, login, logout, updateUser } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      // Store auth data
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('tenantId', data.user.tenantId);
      
      login(data.user, data.access_token);
      toast.success('Login successful!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Login failed');
    },
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('tenantId', data.user.tenantId);
      
      login(data.user, data.access_token);
      toast.success('Registration successful!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Registration failed');
    },
  });

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: authService.getProfile,
    enabled: isAuthenticated,
    onSuccess: (data) => {
      updateUser(data);
    },
    onError: () => {
      // Don't logout on profile fetch error, just show toast
      toast.error('Failed to fetch profile');
    },
  });

  const hasPermission = (permission: string) => {
    return user?.permissions?.includes(permission) || false;
  };

  // Check for admin permissions
  const isAdmin = hasPermission('system.metrics.read') || 
                  hasPermission('system.config.update') ||
                  hasPermission('user.read.all');

  // Check for property owner permissions
  const isPropertyOwner = hasPermission('property.create') || 
                         hasPermission('property.update.own');

  return {
    user,
    isAuthenticated,
    login: (credentials: any) => loginMutation.mutateAsync(credentials),
    register: (data: any) => registerMutation.mutateAsync(data),
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('tenantId');
      logout();
      window.location.href = '/login';
    },
    isLoading: loginMutation.isPending || registerMutation.isPending,
    profileQuery,
    hasPermission,
    isAdmin,
    isPropertyOwner,
  };
}