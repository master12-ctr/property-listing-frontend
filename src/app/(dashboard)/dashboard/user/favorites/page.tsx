'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { propertyService } from '@/lib/api/services';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { HeartIcon } from '@heroicons/react/24/outline';

export default function FavoritesPage() {
  const { user } = useAuth();
  
  const { data: favoritesData, isLoading, error } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => propertyService.getFavorites(),
    enabled: !!user?.id,
  });

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
        <h2 className="text-2xl font-bold text-gray-900">Error Loading Favorites</h2>
        <p className="text-gray-600 mt-2">Please try again later</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center space-x-3">
          <HeartIcon className="h-8 w-8 text-red-500" />
          <h1 className="text-3xl font-bold text-gray-900">Favorite Properties</h1>
        </div>
        <p className="text-gray-600 mt-2">Your saved properties</p>
      </div>

      {favoritesData && favoritesData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoritesData.map((property) => (
            <PropertyCard 
              key={property.id} 
              property={property} 
              showActions={true}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <HeartIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No favorites yet</h3>
          <p className="text-gray-600 mt-2">Start by browsing properties and adding them to your favorites!</p>
        </div>
      )}
    </div>
  );
}