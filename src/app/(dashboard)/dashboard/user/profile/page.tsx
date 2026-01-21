'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function UserProfilePage() {
  const { user, isAdmin, isPropertyOwner } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      // In a real app, you would call userService.updateProfile(data)
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const getRoleName = () => {
    if (isAdmin) return 'Administrator';
    if (isPropertyOwner) return 'Property Owner';
    return 'Regular User';
  };

  const getPermissions = () => {
    return user?.permissions || [];
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Information */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    {...register('name')}
                    type="text"
                    className="input"
                    placeholder="John Doe"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    className="input"
                    placeholder="you@example.com"
                    disabled
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Email cannot be changed
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Account Information */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Account Information</h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Account Type</p>
                <p className="font-medium">{getRoleName()}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Account ID</p>
                <p className="font-mono text-sm">{user?.id}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Tenant ID</p>
                <p className="font-mono text-sm">{user?.tenantId}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Permissions</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {getPermissions().map((permission, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full"
                    >
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Role Information Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Role: {getRoleName()}</h3>
            
            <div className="space-y-3">
              {isAdmin && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <h4 className="font-medium text-purple-800">Administrator</h4>
                  <p className="text-sm text-purple-600 mt-1">
                    Full system access including user management, system metrics, and property management.
                  </p>
                </div>
              )}
              
              {isPropertyOwner && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800">Property Owner</h4>
                  <p className="text-sm text-green-600 mt-1">
                    Can create, manage, and publish property listings.
                  </p>
                </div>
              )}
              
              {!isAdmin && !isPropertyOwner && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800">Regular User</h4>
                  <p className="text-sm text-blue-600 mt-1">
                    Can browse properties, save favorites, and contact property owners.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                <strong>Need a different role?</strong> Contact an administrator to change your account type.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}