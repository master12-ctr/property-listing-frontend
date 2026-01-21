import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/lib/api/services';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

export function useAuth() {
  const { 
    user, 
    isAuthenticated, 
    isLoading: authLoading,
    login: storeLogin, 
    logout: storeLogout, 
    updateUser, 
    setLoading,
    initialize: initializeAuth 
  } = useAuthStore();

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      storeLogin(data.user, data.access_token, data.refresh_token);
      toast.success('Login successful!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Login failed');
    },
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      storeLogin(data.user, data.access_token, data.refresh_token);
      toast.success('Registration successful!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Registration failed');
    },
  });

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: authService.getProfile,
    enabled: isAuthenticated && !!user?.id,
    onSuccess: (data) => {
      updateUser(data);
    },
    onError: (error: any) => {
      if (error.response?.status === 401) {
        storeLogout();
        toast.error('Session expired. Please login again.');
      }
    },
  });

  const hasPermission = (permission: string) => {
    return user?.permissions?.includes(permission) || false;
  };

  const isAdmin = hasPermission('system.metrics.read') || 
                  hasPermission('system.config.update') ||
                  hasPermission('user.read.all');

  const isPropertyOwner = hasPermission('property.create') || 
                         hasPermission('property.update.own');

  return {
    user,
    isAuthenticated,
    isLoading: authLoading || loginMutation.isPending || registerMutation.isPending || profileQuery.isLoading,
    login: (credentials: any) => loginMutation.mutateAsync(credentials),
    register: (data: any) => registerMutation.mutateAsync(data),
    logout: storeLogout,
    profileQuery,
    hasPermission,
    isAdmin,
    isPropertyOwner,
  };
}