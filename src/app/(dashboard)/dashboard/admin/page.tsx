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
} from '@heroicons/react/24/outline';

export default function AdminDashboard() {
  const { isAdmin } = useAuth();
  
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: () => adminService.getSystemMetrics(),
    enabled: isAdmin,
  });

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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">System overview and metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <BuildingLibraryIcon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.summary?.properties?.total || 0}</div>
            <p className="text-xs text-gray-500">
              {metrics?.summary?.properties?.published || 0} published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UsersIcon className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.summary?.users?.total || 0}</div>
            <p className="text-xs text-gray-500">
              {metrics?.summary?.users?.admins || 0} admins
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <EnvelopeIcon className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.summary?.contacts?.total || 0}</div>
            <p className="text-xs text-gray-500">
              {metrics?.summary?.contacts?.unread || 0} unread
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tenants</CardTitle>
            <ChartBarIcon className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.summary?.tenants?.total || 1}</div>
            <p className="text-xs text-gray-500">
              {metrics?.summary?.tenants?.active || 1} active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
        
        {/* Recent Properties */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Properties</h3>
          <div className="space-y-3">
            {metrics?.recentActivity?.recentProperties?.slice(0, 5).map((property: any) => (
              <div key={property.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{property.title}</p>
                  <p className="text-sm text-gray-600">{property.owner?.name || 'Unknown'}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  property.status === 'published' ? 'bg-green-100 text-green-800' :
                  property.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {property.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Contacts */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Messages</h3>
          <div className="space-y-3">
            {metrics?.recentActivity?.recentContacts?.slice(0, 5).map((contact: any) => (
              <div key={contact.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">{contact.fromUser?.name || 'Unknown'}</p>
                    <p className="text-sm text-gray-600">{contact.property?.title || 'Unknown Property'}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(contact.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{contact.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}