'use client';

import { useState } from 'react';
import { useProperties } from '@/lib/hooks/useProperties';
import { PropertyCard } from './PropertyCard';
import { PropertyFilters as FiltersType, PaginatedResponse, Property } from '@/types';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface PropertyListProps {
  initialData: PaginatedResponse<Property>;
}

export default function PropertyList({ initialData }: PropertyListProps) {
  const [filters, setFilters] = useState<FiltersType>({
    page: initialData.page,
    limit: initialData.limit,
  });
  
  const { data, isLoading, isError } = useProperties(filters);
  
  const properties = data?.data || initialData.data;
  const pagination = data || initialData;
  
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  if (isError) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Error loading properties</h3>
        <p className="text-gray-600 mt-2">Please try again later</p>
      </div>
    );
  }
  
  if (!isLoading && properties.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">No properties found</h3>
        <p className="text-gray-600 mt-2">Try adjusting your filters</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
      
      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between">
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
              className="p-2 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            
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
                  className={`px-3 py-1 rounded-md ${
                    pagination.page === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="p-2 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}