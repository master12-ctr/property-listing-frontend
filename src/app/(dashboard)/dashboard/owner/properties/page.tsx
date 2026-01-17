'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { propertyService } from '@/lib/api/services';
import { PropertyCard } from '@/components/properties/PropertyCard';
import Link from 'next/link';
import { PlusCircleIcon } from '@heroicons/react/24/outline';

export default function OwnerPropertiesPage() {
  const { user } = useAuth();
  
  const { data: properties, isLoading } = useQuery({
    queryKey: ['owner-properties', user?.id],
    queryFn: () => propertyService.getMyProperties(),
  });

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

      {properties && properties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">No properties yet</h3>
          <p className="text-gray-600 mt-2">Start by creating your first property listing!</p>
        </div>
      )}
    </div>
  );
}