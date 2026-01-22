// components/properties/PropertyFilters.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { PropertyType, PropertyStatus } from '@/types';
import { useAuth } from '@/lib/hooks/useAuth';
import { FunnelIcon } from '@heroicons/react/24/outline';

const propertyTypes: { value: PropertyType; label: string }[] = [
  { value: PropertyType.APARTMENT, label: 'Apartment' },
  { value: PropertyType.HOUSE, label: 'House' },
  { value: PropertyType.VILLA, label: 'Villa' },
  { value: PropertyType.COMMERCIAL, label: 'Commercial' },
  { value: PropertyType.LAND, label: 'Land' },
];

const sortOptions = [
  { value: 'createdAt', label: 'Newest' },
  { value: 'price', label: 'Price' },
  { value: 'views', label: 'Views' },
  { value: 'favoritesCount', label: 'Favorites' },
];

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: PropertyStatus.PUBLISHED, label: 'Published' },
  { value: PropertyStatus.DRAFT, label: 'Draft' },
  { value: PropertyStatus.ARCHIVED, label: 'Archived' },
  { value: PropertyStatus.DISABLED, label: 'Disabled' },
];

export default function PropertyFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAdmin, isPropertyOwner } = useAuth();
  
  // Get initial values from URL
  const getInitialFilters = () => ({
    city: searchParams.get('city') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    type: searchParams.get('type') || '',
    status: searchParams.get('status') || (isAdmin || isPropertyOwner ? '' : PropertyStatus.PUBLISHED),
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc',
  });

  const [filters, setFilters] = useState(getInitialFilters());
  const [isDirty, setIsDirty] = useState(false);

  // Update filters when URL changes
  useEffect(() => {
    setFilters(getInitialFilters());
    setIsDirty(false);
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setIsDirty(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    
    // Add all active filters
    if (filters.city.trim()) params.set('city', filters.city.trim());
    if (filters.minPrice) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    if (filters.type) params.set('type', filters.type);
    
    // Handle status filter
    if (filters.status) {
      params.set('status', filters.status);
    } else if (!isAdmin && !isPropertyOwner) {
      params.set('status', PropertyStatus.PUBLISHED);
    }
    
    // Always include sort parameters
    params.set('sortBy', filters.sortBy);
    params.set('sortOrder', filters.sortOrder);
    
    // Reset to page 1 when filters change
    params.set('page', '1');
    
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleReset = () => {
    const params = new URLSearchParams();
    if (!isAdmin && !isPropertyOwner) {
      params.set('status', PropertyStatus.PUBLISHED);
    }
    params.set('sortBy', 'createdAt');
    params.set('sortOrder', 'desc');
    params.set('page', '1');
    
    router.push(`${pathname}?${params.toString()}`);
  };

  const getStatusOptions = () => {
    if (isAdmin || isPropertyOwner) {
      return statusOptions;
    }
    return [{ value: PropertyStatus.PUBLISHED, label: 'Published' }];
  };

  const hasActiveFilters = () => {
    return !!(
      filters.city || 
      filters.minPrice || 
      filters.maxPrice || 
      filters.type || 
      filters.status ||
      filters.sortBy !== 'createdAt' ||
      filters.sortOrder !== 'desc'
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <FunnelIcon className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>
        {hasActiveFilters() && (
          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
            Filtered
          </span>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* City Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City
          </label>
          <input
            type="text"
            name="city"
            value={filters.city}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter city name"
          />
        </div>
        
        {/* Price Range */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Price Range (ETB)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Min"
                min="0"
                step="1000"
              />
            </div>
            <div>
              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Max"
                min="0"
                step="1000"
              />
            </div>
          </div>
        </div>
        
        {/* Property Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Property Type
          </label>
          <select
            name="type"
            value={filters.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Types</option>
            {propertyTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            name="status"
            value={filters.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={!isAdmin && !isPropertyOwner}
          >
            {getStatusOptions().map((status) => (
              <option key={status.value || 'all'} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          {(!isAdmin && !isPropertyOwner) && (
            <p className="mt-1 text-xs text-gray-500">
              Only published properties are available
            </p>
          )}
        </div>
        
        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <select
            name="sortBy"
            value={filters.sortBy}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Sort Order */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort Order
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="sortOrder"
                value="desc"
                checked={filters.sortOrder === 'desc'}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Descending</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="sortOrder"
                value="asc"
                checked={filters.sortOrder === 'asc'}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Ascending</span>
            </label>
          </div>
        </div>
        
        {/* Active Filters Display */}
        {hasActiveFilters() && (
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">Active Filters:</p>
            <div className="flex flex-wrap gap-2">
              {filters.city && (
                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  City: {filters.city}
                </span>
              )}
              {filters.minPrice && (
                <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Min: ETB {parseInt(filters.minPrice).toLocaleString()}
                </span>
              )}
              {filters.maxPrice && (
                <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Max: ETB {parseInt(filters.maxPrice).toLocaleString()}
                </span>
              )}
              {filters.type && (
                <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                  Type: {propertyTypes.find(t => t.value === filters.type)?.label}
                </span>
              )}
              {filters.status && (
                <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                  Status: {statusOptions.find(s => s.value === filters.status)?.label}
                </span>
              )}
              {filters.sortBy !== 'createdAt' && (
                <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                  Sorted by: {sortOptions.find(s => s.value === filters.sortBy)?.label}
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            disabled={!isDirty}
            className={`flex-1 px-4 py-2 rounded-md transition-colors font-medium ${
              isDirty
                ? 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                : 'bg-blue-100 text-blue-400 cursor-not-allowed'
            }`}
          >
            Apply Filters
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-medium"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}