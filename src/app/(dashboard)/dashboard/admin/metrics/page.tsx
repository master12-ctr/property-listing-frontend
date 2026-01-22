'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/lib/api/services';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BuildingLibraryIcon,
  UsersIcon,
  EnvelopeIcon,
  ChartBarIcon,
  EyeIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminMetricsPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  
  const { data: systemMetrics, isLoading, error } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: () => adminService.getSystemMetrics(),
    enabled: isAdmin,
  });

  const { data: propertyMetrics } = useQuery({
    queryKey: ['property-metrics'],
    queryFn: () => adminService.getPropertyMetrics('week'),
    enabled: isAdmin,
  });

  useEffect(() => {
    if (user && !isAdmin) {
      router.push('/dashboard/user');
    }
  }, [isAdmin, user, router]);

  if (!user) {
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
        <p className="text-gray-600 mt-2">Admin access required</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Error Loading Metrics</h2>
        <p className="text-gray-600 mt-2">Please try again later</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">System Metrics</h1>
        <p className="text-gray-600 mt-2">Comprehensive system analytics and insights</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <BuildingLibraryIcon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics?.summary?.properties?.total || 0}</div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Published: {systemMetrics?.summary?.properties?.published || 0}</span>
              <span>Draft: {systemMetrics?.summary?.properties?.draft || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UsersIcon className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics?.summary?.users?.total || 0}</div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Admins: {systemMetrics?.summary?.users?.admins || 0}</span>
              <span>Owners: {systemMetrics?.summary?.users?.owners || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <EnvelopeIcon className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics?.summary?.contacts?.total || 0}</div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Total: {systemMetrics?.summary?.contacts?.total || 0}</span>
              <span className="text-red-600">Unread: {systemMetrics?.summary?.contacts?.unread || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tenants</CardTitle>
            <ChartBarIcon className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics?.summary?.tenants?.total || 1}</div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Total: {systemMetrics?.summary?.tenants?.total || 1}</span>
              <span>Active: {systemMetrics?.summary?.tenants?.active || 1}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Property Engagement Metrics */}
      {propertyMetrics && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Property Engagement (Last 7 Days)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Properties Created</CardTitle>
                <BuildingLibraryIcon className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{propertyMetrics.metrics?.propertiesCreated || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Properties Published</CardTitle>
                <EyeIcon className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{propertyMetrics.metrics?.propertiesPublished || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                <EyeIcon className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{propertyMetrics.metrics?.totalViews || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Favorites</CardTitle>
                <HeartIcon className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{propertyMetrics.metrics?.totalFavorites || 0}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Properties */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Properties</h2>
          <div className="space-y-3">
            {systemMetrics?.recentActivity?.recentProperties?.slice(0, 5).map((property: any) => (
              <div key={property.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium truncate">{property.title}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-sm text-gray-600">{property.owner?.name || 'Unknown'}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(property.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  property.status === 'published' ? 'bg-green-100 text-green-800' :
                  property.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                  property.status === 'archived' ? 'bg-gray-100 text-gray-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {property.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Messages */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Messages</h2>
          <div className="space-y-3">
            {systemMetrics?.recentActivity?.recentContacts?.slice(0, 5).map((contact: any) => (
              <div key={contact.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">{contact.fromUser?.name || 'Unknown'}</p>
                    <p className="text-sm text-gray-600 truncate">
                      {contact.property?.title || 'Unknown Property'}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(contact.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 line-clamp-2">{contact.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}