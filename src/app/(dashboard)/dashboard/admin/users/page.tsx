// app/(dashboard)/dashboard/admin/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService, roleService } from '@/lib/api/services';
import { User } from '@/types';
import toast from 'react-hot-toast';
import {
  TrashIcon,
  EyeIcon,
  PencilIcon,
  UserPlusIcon,
  KeyIcon,
  CheckIcon,
  XMarkIcon,
  PowerIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  roleName: z.enum(['regular_user', 'property_owner', 'admin']),
});

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const editUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  roleName: z.enum(['regular_user', 'property_owner', 'admin']),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
type EditUserFormData = z.infer<typeof editUserSchema>;

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState<string | null>(null);
  const [showEditUser, setShowEditUser] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Fetch all users
  const { data: users, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAllUsers(),
  });

  // Fetch all roles
  const { data: roles, isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => roleService.getAllRoles(),
  });

  // Filter users
  const filteredUsers = users?.filter(user => {
    let matchesSearch = true;
    let matchesActive = true;
    let matchesRole = true;

    if (searchTerm) {
      matchesSearch = 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toLowerCase().includes(searchTerm.toLowerCase());
    }

    if (activeFilter !== 'all') {
      if (activeFilter === 'active') {
        matchesActive = user.isActive === true;
      } else if (activeFilter === 'inactive') {
        matchesActive = user.isActive === false;
      } else if (activeFilter === 'deleted') {
        matchesActive = !!user.deletedAt;
      }
    }

    if (roleFilter !== 'all') {
      // Determine role based on permissions
      const isAdmin = user.permissions?.includes('system.metrics.read') || 
                      user.permissions?.includes('system.config.update');
      const isPropertyOwner = user.permissions?.includes('property.create');
      
      if (roleFilter === 'admin') matchesRole = isAdmin;
      else if (roleFilter === 'property_owner') matchesRole = isPropertyOwner && !isAdmin;
      else if (roleFilter === 'regular_user') matchesRole = !isAdmin && !isPropertyOwner;
    }

    return matchesSearch && matchesActive && matchesRole;
  }) || [];

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: (data: CreateUserFormData) => {
      const userData = {
        name: data.name,
        email: data.email,
        password: data.password,
        roleName: data.roleName,
      };
      return userService.createUser(userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User created successfully');
      setShowCreateForm(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create user');
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: ({ userId, newPassword }: { userId: string; newPassword: string }) =>
      userService.resetPassword(userId, newPassword),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Password reset successfully');
      setShowResetPassword(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => userService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    },
  });

  // Update user role mutation
  const updateUserRoleMutation = useMutation({
    mutationFn: ({ userId, roleName }: { userId: string; roleName: string }) => {
      // Find role ID by name
      const role = roles?.find((r: any) => r.name === roleName);
      if (!role) throw new Error('Role not found');
      return userService.addUserRole(userId, role.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User role updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update user role');
    },
  });

  // Update user info mutation - FIXED: Remove userId from data
  const updateUserMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: EditUserFormData }) =>
      userService.updateUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User updated successfully');
      setShowEditUser(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update user');
    },
  });

  // Toggle user active status mutation
  const toggleActiveMutation = useMutation({
    mutationFn: (userId: string) => userService.toggleActive(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User status updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update user status');
    },
  });

  // Create user form
  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    formState: { errors: createErrors },
    reset: resetCreateForm,
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      roleName: 'regular_user',
    },
  });

  // Reset password form
  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    formState: { errors: resetErrors },
    reset: resetResetForm,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  // Edit user form
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    formState: { errors: editErrors },
    reset: resetEditForm,
    setValue,
  } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
  });

  // Load user data into edit form
  useEffect(() => {
    if (showEditUser && users) {
      const user = users.find(u => u.id === showEditUser);
      if (user) {
        const isAdmin = user.permissions?.includes('system.metrics.read');
        const isPropertyOwner = user.permissions?.includes('property.create');
        
        let roleName: 'regular_user' | 'property_owner' | 'admin' = 'regular_user';
        if (isAdmin) roleName = 'admin';
        else if (isPropertyOwner) roleName = 'property_owner';
        
        resetEditForm({
          name: user.name,
          email: user.email,
          roleName,
        });
      }
    }
  }, [showEditUser, users, resetEditForm]);

  const onCreateSubmit = async (data: CreateUserFormData) => {
    await createUserMutation.mutateAsync(data);
    resetCreateForm();
  };

  const onResetPasswordSubmit = async (data: ResetPasswordFormData) => {
    if (showResetPassword) {
      await resetPasswordMutation.mutateAsync({
        userId: showResetPassword,
        newPassword: data.newPassword,
      });
      resetResetForm();
    }
  };

  const onEditSubmit = async (data: EditUserFormData) => {
    if (showEditUser) {
      await updateUserMutation.mutateAsync({
        userId: showEditUser,
        data,
      });
      
      // Also update role if changed
      const currentUser = users?.find(u => u.id === showEditUser);
      if (currentUser) {
        const currentIsAdmin = currentUser.permissions?.includes('system.metrics.read');
        const currentIsPropertyOwner = currentUser.permissions?.includes('property.create');
        
        let currentRole: 'regular_user' | 'property_owner' | 'admin' = 'regular_user';
        if (currentIsAdmin) currentRole = 'admin';
        else if (currentIsPropertyOwner) currentRole = 'property_owner';
        
        if (currentRole !== data.roleName) {
          await updateUserRoleMutation.mutateAsync({
            userId: showEditUser,
            roleName: data.roleName,
          });
        }
      }
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      await deleteUserMutation.mutateAsync(userId);
    }
  };

  const handleRoleChange = async (userId: string, roleName: string, userName: string) => {
    if (window.confirm(`Are you sure you want to change "${userName}" role to ${roleName}?`)) {
      await updateUserRoleMutation.mutateAsync({ 
        userId, 
        roleName 
      });
    }
  };

  const handleToggleActive = async (userId: string, userName: string, isCurrentlyActive: boolean) => {
    const action = isCurrentlyActive ? 'deactivate' : 'activate';
    if (window.confirm(`Are you sure you want to ${action} user "${userName}"?`)) {
      await toggleActiveMutation.mutateAsync(userId);
    }
  };

  const getRoleFromPermissions = (user: User) => {
    const isAdmin = user.permissions?.includes('system.metrics.read') || 
                   user.permissions?.includes('system.config.update');
    const isPropertyOwner = user.permissions?.includes('property.create');
    
    if (isAdmin) return 'admin';
    if (isPropertyOwner) return 'property_owner';
    return 'regular_user';
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'property_owner': return 'Property Owner';
      default: return 'Regular User';
    }
  };

  const getStatusBadge = (user: User) => {
    if (user.deletedAt) {
      return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Deleted</span>;
    }
    if (user.isActive) {
      return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>;
    }
    return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Inactive</span>;
  };

  const getStatusDisplay = (user: User) => {
    if (user.deletedAt) return 'Deleted';
    if (user.isActive) return 'Active';
    return 'Inactive';
  };

  const isLoading = usersLoading || rolesLoading;

  if (usersError) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Error Loading Users</h2>
        <p className="text-gray-600 mt-2">Please check your permissions or try again later</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-2">Manage users and their roles</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn-primary flex items-center space-x-2 px-4 py-2"
          >
            <UserPlusIcon className="w-5 h-5" />
            <span>Create User</span>
          </button>
        </div>

        {/* Filters Section */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search by name, email, or ID..."
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="deleted">Deleted</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Role</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="regular_user">Regular User</option>
              <option value="property_owner">Property Owner</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setActiveFilter('all');
                setRoleFilter('all');
              }}
              className="w-full btn-secondary py-2"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Create User Form */}
      {showCreateForm && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Create New User</h2>
            <button
              onClick={() => {
                setShowCreateForm(false);
                resetCreateForm();
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmitCreate(onCreateSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  {...registerCreate('name')}
                  type="text"
                  className="input"
                  placeholder="John Doe"
                />
                {createErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{createErrors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  {...registerCreate('email')}
                  type="email"
                  className="input"
                  placeholder="user@example.com"
                />
                {createErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{createErrors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  {...registerCreate('password')}
                  type="password"
                  className="input"
                  placeholder="••••••••"
                />
                {createErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{createErrors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  {...registerCreate('roleName')}
                  className="input"
                >
                  <option value="regular_user">Regular User</option>
                  <option value="property_owner">Property Owner</option>
                  <option value="admin">Admin</option>
                </select>
                {createErrors.roleName && (
                  <p className="mt-1 text-sm text-red-600">{createErrors.roleName.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  resetCreateForm();
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createUserMutation.isPending}
                className="btn-primary px-4 py-2"
              >
                {createUserMutation.isPending ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              All Users
            </h2>
            <p className="text-sm text-gray-600">
              {filteredUsers.length} of {users?.length || 0} users
            </p>
          </div>
          <div className="text-sm text-gray-600">
            {isLoading ? 'Loading...' : ''}
          </div>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center">
            <UserPlusIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No users found</h3>
            <p className="text-gray-600 mt-2">
              {searchTerm || activeFilter !== 'all' || roleFilter !== 'all' 
                ? 'Try adjusting your filters'
                : 'Create your first user'}
            </p>
            {!searchTerm && activeFilter === 'all' && roleFilter === 'all' && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="mt-4 btn-primary"
              >
                Create User
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user: User) => {
                  const userRole = getRoleFromPermissions(user);
                  const userStatus = getStatusDisplay(user);
                  
                  return (
                    <tr key={`user-${user.id}-${user.email}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-semibold">
                                {user.name?.charAt(0).toUpperCase() || 'U'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {user.id?.substring(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                        <div className="text-xs text-gray-500">
                          Tenant: {user.tenantId || 'main'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <select
                            value={userRole}
                            onChange={(e) => handleRoleChange(user.id, e.target.value, user.name)}
                            className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={updateUserRoleMutation.isPending}
                          >
                            <option value="regular_user">Regular User</option>
                            <option value="property_owner">Property Owner</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(user)}
                          {!user.deletedAt && (
                            <button
                              onClick={() => handleToggleActive(user.id, user.name, user.isActive || false)}
                              className={`p-1 rounded-full ${
                                user.isActive 
                                  ? 'text-green-600 hover:text-green-800 hover:bg-green-50' 
                                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                              }`}
                              title={user.isActive ? 'Deactivate User' : 'Activate User'}
                            >
                              <PowerIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded"
                            title="View Details"
                          >
                            <EyeIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setShowEditUser(user.id)}
                            className="p-1 text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50 rounded"
                            title="Edit User"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setShowResetPassword(user.id)}
                            className="p-1 text-green-600 hover:text-green-900 hover:bg-green-50 rounded"
                            title="Reset Password"
                          >
                            <KeyIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            disabled={deleteUserMutation.isPending}
                            className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded disabled:opacity-50"
                            title="Delete User"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reset Password Modal */}
      {showResetPassword && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Reset Password</h3>
              <p className="text-sm text-gray-600 mt-1">
                For user: {users?.find(u => u.id === showResetPassword)?.name}
              </p>
            </div>
            <form onSubmit={handleSubmitReset(onResetPasswordSubmit)} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    {...registerReset('newPassword')}
                    type="password"
                    className="input"
                    placeholder="Enter new password"
                  />
                  {resetErrors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">{resetErrors.newPassword.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    {...registerReset('confirmPassword')}
                    type="password"
                    className="input"
                    placeholder="Confirm new password"
                  />
                  {resetErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{resetErrors.confirmPassword.message}</p>
                  )}
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> The user will need to use this new password to login.
                    Consider notifying them about the password change.
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetPassword(null);
                    resetResetForm();
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetPasswordMutation.isPending}
                  className="btn-primary"
                >
                  {resetPasswordMutation.isPending ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUser && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Edit User</h3>
            </div>
            <form onSubmit={handleSubmitEdit(onEditSubmit)} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    {...registerEdit('name')}
                    type="text"
                    className="input"
                    placeholder="John Doe"
                  />
                  {editErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{editErrors.name.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    {...registerEdit('email')}
                    type="email"
                    className="input"
                    placeholder="user@example.com"
                  />
                  {editErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{editErrors.email.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    {...registerEdit('roleName')}
                    className="input"
                  >
                    <option value="regular_user">Regular User</option>
                    <option value="property_owner">Property Owner</option>
                    <option value="admin">Admin</option>
                  </select>
                  {editErrors.roleName && (
                    <p className="mt-1 text-sm text-red-600">{editErrors.roleName.message}</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditUser(null);
                    resetEditForm();
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateUserMutation.isPending}
                  className="btn-primary"
                >
                  {updateUserMutation.isPending ? 'Updating...' : 'Update User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">User Details</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xl text-blue-600 font-semibold">
                      {selectedUser.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{selectedUser.name}</h4>
                    <p className="text-sm text-gray-600">{selectedUser.email}</p>
                    <div className="mt-2">
                      {getStatusBadge(selectedUser)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">User ID</label>
                    <p className="mt-1 text-sm text-gray-900 font-mono truncate">
                      {selectedUser.id || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tenant ID</label>
                    <p className="mt-1 text-sm text-gray-900 font-mono">
                      {selectedUser.tenantId || 'main'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {getRoleDisplayName(getRoleFromPermissions(selectedUser))}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.permissions?.length > 0 ? (
                      selectedUser.permissions.map((permission: string, index: number) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full"
                        >
                          {permission}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">No permissions assigned</span>
                    )}
                  </div>
                </div>

                {selectedUser.metadata && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Metadata</label>
                    <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-40">
                      {JSON.stringify(selectedUser.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end space-x-3">
              <button
                onClick={() => setSelectedUser(null)}
                className="btn-secondary"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setShowEditUser(selectedUser.id);
                }}
                className="btn-primary"
              >
                Edit User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}