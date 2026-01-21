'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Property, PropertyStatus } from '@/types';
import { formatPrice } from '@/lib/utils/format';
import { HeartIcon, EyeIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useFavoriteProperty } from '@/lib/hooks/useProperties';
import { useFavoritesStore } from '@/store/favorites.store';
import { useAuth } from '@/lib/hooks/useAuth';
import PropertyActions from './PropertyActions';

interface PropertyCardProps {
  property: Property;
  showActions?: boolean;
  isOwnerView?: boolean;
}

export function PropertyCard({ property, showActions = true, isOwnerView = false }: PropertyCardProps) {
  const { user } = useAuth();
  const { toggleFavorite, hasFavorite } = useFavoritesStore();
  const favoriteMutation = useFavoriteProperty();
  
  const isFavorited = hasFavorite(property.id) || property.isFavorited;
  
  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!showActions) return;
    
    const currentFavoriteStatus = isFavorited || false;
    
    // Optimistic update
    toggleFavorite(property.id);
    
    // API call
    favoriteMutation.mutate({
      id: property.id,
      isFavorited: currentFavoriteStatus,
    });
  };
  
  const isOwner = user?.id === property.owner.id;
  
  return (
    <div className="group relative bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <Link href={`/properties/${property.id}`}>
        <div className="relative h-48 overflow-hidden">
          {property.images && property.images.length > 0 ? (
            <img
              src={property.images[0]}
              alt={property.title}
              className="object-cover group-hover:scale-105 transition-transform duration-300 w-full h-full"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">No Image</span>
            </div>
          )}
          
          <div className="absolute top-4 left-4">
            <span className={`px-2 py-1 text-xs rounded-full ${
              property.status === PropertyStatus.PUBLISHED ? 'bg-green-100 text-green-800' :
              property.status === PropertyStatus.DRAFT ? 'bg-yellow-100 text-yellow-800' :
              property.status === PropertyStatus.ARCHIVED ? 'bg-gray-100 text-gray-800' :
              'bg-red-100 text-red-800'
            }`}>
              {property.status}
            </span>
          </div>
          
          {showActions && (
            <button
              onClick={handleFavorite}
              className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 z-10"
            >
              {isFavorited ? (
                <HeartIconSolid className="w-5 h-5 text-red-500" />
              ) : (
                <HeartIcon className="w-5 h-5 text-gray-600" />
              )}
            </button>
          )}
        </div>
      </Link>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Link href={`/properties/${property.id}`} className="flex-1">
            <h3 className="font-semibold text-lg truncate hover:text-blue-600">
              {property.title}
            </h3>
          </Link>
          <span className="text-lg font-bold text-blue-600 ml-4">
            {formatPrice(property.price)}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {property.description}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-1">
            <EyeIcon className="w-4 h-4" />
            <span>{property.views} views</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <HeartIcon className="w-4 h-4" />
            <span>{property.favoritesCount}</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {property.location.city}, {property.location.country}
            </span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {property.type}
            </span>
          </div>
        </div>
        
        {isOwnerView && isOwner && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <PropertyActions property={property} />
          </div>
        )}
      </div>
    </div>
  );
}