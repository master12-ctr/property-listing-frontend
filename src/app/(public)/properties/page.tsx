import { Suspense } from 'react';
import PropertyFilters from '@/components/properties/PropertyFilters';
import PropertyList from '@/components/properties/PropertyList';
import { propertyService } from '@/lib/api/services';

interface SearchParams {
  [key: string]: string | string[] | undefined;
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  
  // Convert searchParams to the expected format
  const filters:any = {
    page: params.page ? parseInt(params.page as string) : 1,
    limit: params.limit ? parseInt(params.limit as string) : 12,
    status: params.status as string,
    city: params.city as string,
    minPrice: params.minPrice ? parseInt(params.minPrice as string) : undefined,
    maxPrice: params.maxPrice ? parseInt(params.maxPrice as string) : undefined,
    type: params.type as string,
    sortBy: params.sortBy as string,
    sortOrder: params.sortOrder as 'asc' | 'desc',
    near: params.near as string,
    maxDistance: params.maxDistance ? parseInt(params.maxDistance as string) : undefined,
  };

  // Fetch initial data server-side
  const initialData = await propertyService.getProperties(filters).catch(() => ({
    data: [],
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0,
  }));

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
            <PropertyList initialData={initialData} />
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