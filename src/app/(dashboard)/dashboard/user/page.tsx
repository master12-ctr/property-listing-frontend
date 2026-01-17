'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import Link from 'next/link';
import { 
  BuildingLibraryIcon, 
  HeartIcon, 
  ArrowRightIcon,
  PlusCircleIcon 
} from '@heroicons/react/24/outline';

export default function UserDashboard() {
  const { user, isPropertyOwner, isAdmin } = useAuth();

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}!</h2>
        <p className="text-gray-600">What would you like to do today?</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Link 
          href="/properties" 
          className="card hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Browse Properties</h3>
              <p className="text-gray-600 mt-1">Find your next property</p>
            </div>
            <ArrowRightIcon className="w-6 h-6 text-blue-600" />
          </div>
        </Link>
        
        <Link 
          href="/dashboard/user/favorites" 
          className="card hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Your Favorites</h3>
              <p className="text-gray-600 mt-1">View saved properties</p>
            </div>
            <HeartIcon className="w-6 h-6 text-red-500" />
          </div>
        </Link>
        
        {isPropertyOwner && (
          <>
            <Link 
              href="/dashboard/owner/properties" 
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">My Properties</h3>
                  <p className="text-gray-600 mt-1">Manage your listings</p>
                </div>
                <BuildingLibraryIcon className="w-6 h-6 text-green-600" />
              </div>
            </Link>
            
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
          </>
        )}
        
        {isAdmin && (
          <Link 
            href="/dashboard/admin" 
            className="card hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Admin Dashboard</h3>
                <p className="text-gray-600 mt-1">View system metrics</p>
              </div>
              <ArrowRightIcon className="w-6 h-6 text-purple-600" />
            </div>
          </Link>
        )}
      </div>
      
      {/* Recent Activity Section */}
      <div className="mt-12">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h3>
        <div className="bg-gray-50 rounded-lg p-6">
          <p className="text-gray-600 text-center">
            No recent activity to show. Start by browsing properties!
          </p>
        </div>
      </div>
    </div>
  );
}