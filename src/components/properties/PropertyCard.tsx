'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Property } from '@/types';
import { formatPrice } from '@/lib/utils/format';
import { HeartIcon, EyeIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useFavoriteProperty } from '@/lib/hooks/useProperties';
import { useFavoritesStore } from '@/store/favorites.store';
import toast from 'react-hot-toast';

interface PropertyCardProps {
  property: Property;
  showActions?: boolean;
}

export function PropertyCard({ property, showActions = true }: PropertyCardProps) {
  const { toggleFavorite, hasFavorite } = useFavoritesStore();
  const favoriteMutation = useFavoriteProperty();
  
  const isFavorited = hasFavorite(property.id) || property.isFavorited;
  
 
  const handleFavorite = (e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
  
  if (!showActions) return;
  
  // Use a boolean value (default false if undefined)
  const currentFavoriteStatus = isFavorited || false;
  
  // Optimistic update
  toggleFavorite(property.id);
  
  // API call
  favoriteMutation.mutate({
    id: property.id,
    isFavorited: currentFavoriteStatus,
  });
};

  
  return (
    <Link href={`/properties/${property.id}`}>
      <div className="group relative bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div className="relative h-48 overflow-hidden">
          {property.images && property.images.length > 0 ? (
            <Image
              src={property.images[0]}
              alt={property.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">No Image</span>
            </div>
          )}
          
          <div className="absolute top-4 right-4 flex space-x-2">
            {showActions && (
              <button
                onClick={handleFavorite}
                className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
              >
                {isFavorited ? (
                  <HeartIconSolid className="w-5 h-5 text-red-500" />
                ) : (
                  <HeartIcon className="w-5 h-5 text-gray-600" />
                )}
              </button>
            )}
            
            {property.status === 'draft' && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                Draft
              </span>
            )}
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg truncate">{property.title}</h3>
            <span className="text-lg font-bold text-blue-600">
              {formatPrice(property.price)}
            </span>
          </div>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {property.description}
          </p>
          
          <div className="flex items-center justify-between text-sm text-gray-500">
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
        </div>
      </div>
    </Link>
  );
}