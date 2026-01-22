// components/properties/PropertyList.tsx
'use client';

import { useState, useEffect } from 'react';
import { useProperties } from '@/lib/hooks/useProperties';
import { PropertyCard } from './PropertyCard';
import { PropertyFilters as FiltersType, PaginatedResponse, Property, PropertyStatus } from '@/types';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  FunnelIcon,
  ExclamationTriangleIcon,
  BuildingOfficeIcon 
} from '@heroicons/react/24/outline';

interface PropertyListProps {
  initialData?: PaginatedResponse<Property>;
  initialFilters?: any;
  isAuthenticated?: boolean;
}

export default function PropertyList({ initialData, initialFilters, isAuthenticated }: PropertyListProps) {
  const [filters, setFilters] = useState<FiltersType>({
    page: initialFilters?.page || 1,
    limit: initialFilters?.limit || 12,
    status: initialFilters?.status || (isAuthenticated ? '' : PropertyStatus.PUBLISHED),
    city: initialFilters?.city,
    minPrice: initialFilters?.minPrice ? parseInt(initialFilters.minPrice) : undefined,
    maxPrice: initialFilters?.maxPrice ? parseInt(initialFilters.maxPrice) : undefined,
    type: initialFilters?.type,
    sortBy: initialFilters?.sortBy || 'createdAt',
    sortOrder: initialFilters?.sortOrder || 'desc',
  });
  
  const { data, isLoading, isError, error } = useProperties(filters);
  
  const properties = data?.data || initialData?.data || [];
  const pagination = data || initialData || { 
    data: [], 
    total: 0, 
    page: 1, 
    limit: 12, 
    totalPages: 1 
  };
  
  // Update filters when initialFilters change
  useEffect(() => {
    if (initialFilters) {
      setFilters(prev => ({
        ...prev,
        ...initialFilters,
        page: initialFilters.page || 1,
        minPrice: initialFilters.minPrice ? parseInt(initialFilters.minPrice) : undefined,
        maxPrice: initialFilters.maxPrice ? parseInt(initialFilters.maxPrice) : undefined,
      }));
    }
  }, [initialFilters]);

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  if (isError) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
          <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error loading properties</h3>
        <p className="text-gray-600 mb-4">
          {error instanceof Error ? error.message : 'Please try adjusting your filters or try again later'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Retry
        </button>
      </div>
    );
  }
  
  if (!isLoading && properties.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <BuildingOfficeIcon className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties found</h3>
        <p className="text-gray-600 mb-6">
          Try adjusting your filters or browse all properties
        </p>
        <div className="space-x-3">
          <a 
            href="/dashboard/properties" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 inline-block"
          >
            Clear All Filters
          </a>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      {/* Results Header */}
      <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isLoading ? 'Loading properties...' : `${pagination.total} Properties Found`}
            </h2>
            {!isLoading && filters.city && (
              <p className="text-sm text-gray-600 mt-1">
                Showing properties in {filters.city}
              </p>
            )}
            {!isLoading && filters.status && (
              <p className="text-sm text-gray-600 mt-1">
                Status: {filters.status.charAt(0).toUpperCase() + filters.status.slice(1)}
              </p>
            )}
          </div>
          <div className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
            Page {pagination.page} of {pagination.totalPages}
          </div>
        </div>
      </div>
      
      {/* Loading State */}
      {isLoading ? (
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
      ) : (
        <>
          {/* Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.total}</span> properties
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    aria-label="Previous page"
                  >
                    <ChevronLeftIcon className="w-5 h-5" />
                  </button>
                  
                  {/* Page numbers */}
                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-1 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            pagination.page === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 hover:bg-gray-100 border border-gray-300'
                          }`}
                          aria-label={`Page ${pageNum}`}
                          aria-current={pagination.page === pageNum ? 'page' : undefined}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    aria-label="Next page"
                  >
                    <ChevronRightIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Quick jump to first/last */}
              {pagination.totalPages > 5 && (
                <div className="mt-4 flex justify-center space-x-4">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 text-sm text-gray-700 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    First
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.totalPages)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-3 py-1 text-sm text-gray-700 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Last
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}