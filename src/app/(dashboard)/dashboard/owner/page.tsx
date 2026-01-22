'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { propertyService, contactService } from '@/lib/api/services';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BuildingLibraryIcon,
  HeartIcon,
  EnvelopeIcon,
  ArchiveBoxIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { PropertyStatus } from '@/types';
import Link from 'next/link';
import { ArrowRightIcon, PlusCircleIcon } from '@heroicons/react/24/outline';

export default function OwnerDashboardPage() {
  const { user } = useAuth();
  
  const { data: properties, isLoading: propertiesLoading } = useQuery({
    queryKey: ['owner-properties', user?.id],
    queryFn: () => propertyService.getMyProperties(),
  });
  
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', 'received'],
    queryFn: () => contactService.getMessages('received'),
  });
  
  if (propertiesLoading || messagesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  const totalProperties = properties?.length || 0;
  const publishedProperties = properties?.filter(p => p.status === PropertyStatus.PUBLISHED).length || 0;
  const draftProperties = properties?.filter(p => p.status === PropertyStatus.DRAFT).length || 0;
  const archivedProperties = properties?.filter(p => p.status === PropertyStatus.ARCHIVED).length || 0;
  
  const totalFavorites = properties?.reduce((sum, property) => sum + property.favoritesCount, 0) || 0;
  const totalViews = properties?.reduce((sum, property) => sum + property.views, 0) || 0;
  
  const totalMessages = messages?.length || 0;
  const unreadMessages = messages?.filter((m:any) => !m.isRead).length || 0;
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Owner Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of your properties and interactions</p>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link 
          href="/dashboard/owner/properties/new" 
          className="card hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Add New Property</h3>
              <p className="text-gray-600 mt-1">Create a new listing</p>
            </div>
            <PlusCircleIcon className="w-6 h-6 text-purple-600" />
          </div>
        </Link>
        
        <Link 
          href="/dashboard/owner/properties" 
          className="card hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Manage Properties</h3>
              <p className="text-gray-600 mt-1">View and edit your listings</p>
            </div>
            <BuildingLibraryIcon className="w-6 h-6 text-green-600" />
          </div>
        </Link>
        
        <Link 
          href="/dashboard/user/messages" 
          className="card hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">View Messages</h3>
              <p className="text-gray-600 mt-1">Check inquiries</p>
            </div>
            <EnvelopeIcon className="w-6 h-6 text-yellow-600" />
          </div>
        </Link>
      </div>
      
      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <BuildingLibraryIcon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProperties}</div>
            <div className="grid grid-cols-3 gap-1 text-xs text-gray-500 mt-1">
              <div>
                <div className="font-medium">Published</div>
                <div>{publishedProperties}</div>
              </div>
              <div>
                <div className="font-medium">Draft</div>
                <div>{draftProperties}</div>
              </div>
              <div>
                <div className="font-medium">Archived</div>
                <div>{archivedProperties}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <HeartIcon className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Favorites</span>
                <span className="font-bold">{totalFavorites}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Views</span>
                <span className="font-bold">{totalViews}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <EnvelopeIcon className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMessages}</div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Total: {totalMessages}</span>
              <span className="text-red-600">Unread: {unreadMessages}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status Overview</CardTitle>
            <ArchiveBoxIcon className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm">Published</span>
                </div>
                <span className="font-medium">{publishedProperties}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-sm">Draft</span>
                </div>
                <span className="font-medium">{draftProperties}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                  <span className="text-sm">Archived</span>
                </div>
                <span className="font-medium">{archivedProperties}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Properties */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Properties</h2>
            <Link 
              href="/dashboard/owner/properties" 
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
            >
              View All <ArrowRightIcon className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="space-y-3">
            {properties?.slice(0, 5).map((property) => (
              <div key={property.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium truncate">{property.title}</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-sm text-gray-600">
                      {new Date(property.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex items-center space-x-2">
                      <EyeIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-600">{property.views} views</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <HeartIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-600">{property.favoritesCount} favorites</span>
                    </div>
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Messages</h2>
            <Link 
              href="/dashboard/user/messages" 
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
            >
              View All <ArrowRightIcon className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="space-y-3">
            {messages?.slice(0, 5).map((message: any) => (
              <div key={message.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">{message.fromUser?.name || 'Unknown'}</p>
                    <p className="text-sm text-gray-600 truncate">
                      {message.property?.title || 'Unknown Property'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!message.isRead && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        New
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      {new Date(message.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-700 line-clamp-2">{message.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}