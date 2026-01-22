'use client';

import { Suspense } from 'react';
import PropertyFilters from '@/components/properties/PropertyFilters';
import PropertyList from '@/components/properties/PropertyList';
import { propertyService } from '@/lib/api/services';
import { useSearchParams } from 'next/navigation';

export default function DashboardPropertiesPage() {
  const searchParams = useSearchParams();
  
  // Convert searchParams to filters
  const filters = {
    page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
    limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 12,
    status: searchParams.get('status') as string,
    city: searchParams.get('city') as string,
    minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined,
    maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined,
    type: searchParams.get('type') as string,
    sortBy: searchParams.get('sortBy') as string,
    sortOrder: searchParams.get('sortOrder') as 'asc' | 'desc',
    near: searchParams.get('near') as string,
    maxDistance: searchParams.get('maxDistance') ? parseInt(searchParams.get('maxDistance')!) : undefined,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Browse Properties</h1>
        <p className="text-gray-600 mt-2">
          Find your perfect property from our curated listings
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <PropertyFilters />
        </div>
        
        <div className="lg:col-span-3">
          <Suspense fallback={<PropertyListSkeleton />}>
            <PropertyList initialData={{ data: [], total: 0, page: 1, limit: 12, totalPages: 0 }} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function PropertyListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
          <div className="h-48 bg-gray-300" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-300 rounded w-3/4" />
            <div className="h-4 bg-gray-300 rounded w-1/2" />
            <div className="h-4 bg-gray-300 rounded w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}