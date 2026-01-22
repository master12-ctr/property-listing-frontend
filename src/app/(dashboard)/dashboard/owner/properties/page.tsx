'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { propertyService } from '@/lib/api/services';
import { PropertyCard } from '@/components/properties/PropertyCard';
import Link from 'next/link';
import { PlusCircleIcon } from '@heroicons/react/24/outline';
import { PropertyStatus } from '@/types';

type TabType = 'all' | 'draft' | 'published' | 'archived';

export default function OwnerPropertiesPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  
  const { data: properties, isLoading } = useQuery({
    queryKey: ['owner-properties', user?.id, activeTab],
    queryFn: () => propertyService.getMyProperties(),
  });

  // Filter properties based on active tab
  const filteredProperties = properties?.filter(property => {
    if (activeTab === 'all') return true;
    return property.status === activeTab;
  });

  const getStatusCount = (status: PropertyStatus) => {
    return properties?.filter(p => p.status === status).length || 0;
  };

  const tabs = [
    { id: 'all' as TabType, name: 'All', count: properties?.length || 0 },
    { id: 'draft' as TabType, name: 'Draft', count: getStatusCount(PropertyStatus.DRAFT) },
    { id: 'published' as TabType, name: 'Published', count: getStatusCount(PropertyStatus.PUBLISHED) },
    { id: 'archived' as TabType, name: 'Archived', count: getStatusCount(PropertyStatus.ARCHIVED) },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
          <p className="text-gray-600 mt-2">Manage your property listings</p>
        </div>
        <Link
          href="/dashboard/owner/properties/new"
          className="btn-primary flex items-center space-x-2"
        >
          <PlusCircleIcon className="h-5 w-5" />
          <span>Add Property</span>
        </Link>
      </div>

      {/* Status Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.name}
                {tab.count > 0 && (
                  <span className={`ml-2 py-0.5 px-2 text-xs rounded-full ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {filteredProperties && filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <PropertyCard 
              key={property.id} 
              property={property}
              showActions={true}
              isOwnerView={true}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">No properties found</h3>
          <p className="text-gray-600 mt-2">
            {activeTab === 'all' 
              ? 'Start by creating your first property listing!' 
              : `You don't have any ${activeTab} properties.`}
          </p>
          {activeTab !== 'all' && (
            <button
              onClick={() => setActiveTab('all')}
              className="mt-4 text-blue-600 hover:text-blue-700"
            >
              View all properties
            </button>
          )}
        </div>
      )}
    </div>
  );
}