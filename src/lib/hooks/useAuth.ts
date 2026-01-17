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
  });

  // Handle profile query side effects
  useEffect(() => {
    if (profileQuery.data) {
      updateUser(profileQuery.data);
    }
  }, [profileQuery.data, updateUser]);

  useEffect(() => {
    if (profileQuery.error) {
      logout();
      toast.error('Session expired. Please login again.');
    }
  }, [profileQuery.error, logout]);

  const hasPermission = (permission: string) => {
    return user?.permissions?.includes(permission) || false;
  };

  const isAdmin = hasPermission('system.metrics.read');
  const isPropertyOwner = hasPermission('property.create');
  const isRegularUser = hasPermission('favorite.create');

  return {
    user,
    isAuthenticated,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    isLoading: loginMutation.isPending || registerMutation.isPending,
    profileQuery,
    hasPermission,
    isAdmin,
    isPropertyOwner,
    isRegularUser,
  };
}