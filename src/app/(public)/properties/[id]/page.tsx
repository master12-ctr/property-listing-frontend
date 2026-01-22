'use client';

import { useParams } from 'next/navigation';
import { useProperty } from '@/lib/hooks/useProperties';
import { formatPrice } from '@/lib/utils/format';
import Image from 'next/image';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useFavoriteProperty } from '@/lib/hooks/useProperties';
import { useFavoritesStore } from '@/store/favorites.store';
import { useState } from 'react';
import ContactForm from '@/components/contact/ContactForm';
import { PropertyStatus } from '@/types';
import { useAuth } from '@/lib/hooks/useAuth';

export default function PropertyDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: property, isLoading, error } = useProperty(id);
  const { toggleFavorite, hasFavorite } = useFavoritesStore();
  const favoriteMutation = useFavoriteProperty();
  const [activeImage, setActiveImage] = useState(0);
  const { user } = useAuth();
  
  const isOwner = user?.id === property?.owner.id;
  const isPublished = property?.status === PropertyStatus.PUBLISHED;
  const canFavorite = isPublished && !isOwner;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-300 rounded-lg mb-4"></div>
          <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Property Not Found</h2>
          <p className="text-gray-600 mt-2">The property you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const isFavorited = hasFavorite(property.id) || property.isFavorited;

  const handleFavorite = () => {
    if (!canFavorite) return;
    
    toggleFavorite(property.id);
    favoriteMutation.mutate({
      id: property.id,
      isFavorited: isFavorited || false,
    });
  };

  // Determine if contact form should be shown
  const showContactForm = isPublished && !isOwner && user;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <a href="/properties" className="text-gray-600 hover:text-blue-600">
                Properties
              </a>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-gray-500">{property.title}</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      {/* Property Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-lg font-bold text-blue-600">
                {formatPrice(property.price)}
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                {property.type}
              </span>
              <span className={`px-3 py-1 text-sm rounded-full ${
                property.status === 'published' ? 'bg-green-100 text-green-800' :
                property.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                property.status === 'archived' ? 'bg-gray-100 text-gray-800' :
                'bg-red-100 text-red-800'
              }`}>
                {property.status}
              </span>
            </div>
          </div>
          {canFavorite && (
            <button
              onClick={handleFavorite}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100"
            >
              {isFavorited ? (
                <HeartIconSolid className="w-6 h-6 text-red-500" />
              ) : (
                <HeartIcon className="w-6 h-6 text-gray-600" />
              )}
              <span>{property.favoritesCount} favorites</span>
            </button>
          )}
        </div>
        <div className="mt-4">
          <p className="text-gray-700">{property.location.address}, {property.location.city}, {property.location.country}</p>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="mb-8">
        <div className="relative h-96 rounded-xl overflow-hidden">
          {property.images && property.images.length > 0 ? (
            <img
              src={property.images[activeImage]}
              alt={property.title}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">No Image Available</span>
            </div>
          )}
        </div>
        
        {/* Thumbnails */}
        {property.images && property.images.length > 1 && (
          <div className="flex space-x-2 mt-4 overflow-x-auto">
            {property.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setActiveImage(index)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden ${
                  activeImage === index ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <img
                  src={image}
                  alt={`${property.title} - Image ${index + 1}`}
                  className="object-cover w-full h-full"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Property Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Description */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
            <p className="text-gray-700 whitespace-pre-line">{property.description}</p>
          </div>

          {/* Features */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Property Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Type</p>
                <p className="font-medium capitalize">{property.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-medium capitalize">{property.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Views</p>
                <p className="font-medium">{property.views}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Listed</p>
                <p className="font-medium">{new Date(property.createdAt).toLocaleDateString()}</p>
              </div>
              {property.publishedAt && (
                <div>
                  <p className="text-sm text-gray-600">Published</p>
                  <p className="font-medium">{new Date(property.publishedAt).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contact & Owner Info */}
        <div className="space-y-6">
          {/* Owner Info */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Owner Information</h2>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold">
                  {property.owner.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{property.owner.name}</h3>
                <p className="text-sm text-gray-600">{property.owner.email}</p>
              </div>
            </div>
          </div>

          {/* Contact Form or Status Message */}
          {showContactForm ? (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Owner</h2>
              <ContactForm 
                propertyId={property.id}
                propertyTitle={property.title}
              />
            </div>
          ) : !user ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <h2 className="text-xl font-bold text-yellow-800 mb-4">Login Required</h2>
              <p className="text-yellow-700 mb-4">
                Please login to contact the property owner.
              </p>
              <a
                href="/login"
                className="inline-block px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
              >
                Login Now
              </a>
            </div>
          ) : isOwner ? (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h2 className="text-xl font-bold text-blue-800 mb-4">Your Property</h2>
              <p className="text-blue-700">
                This is your property listing. You cannot contact yourself.
              </p>
            </div>
          ) : !isPublished ? (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Property Not Available</h2>
              <p className="text-gray-700">
                This property is not published and cannot be contacted.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}