'use client';

import { useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { PropertyType, PropertyStatus } from '@/types';
import { useAuth } from '@/lib/hooks/useAuth';

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

export default function PropertyFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAdmin, isPropertyOwner } = useAuth();
  
  // Regular users can only see published properties
  const defaultStatus = (isAdmin || isPropertyOwner) ? '' : PropertyStatus.PUBLISHED;
  
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    type: searchParams.get('type') || '',
    status: searchParams.get('status') || defaultStatus,
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc',
  });

  // Status options based on user role
  const getStatusOptions = () => {
    const baseOptions = [
      { value: PropertyStatus.PUBLISHED, label: 'Published' },
    ];
    
    if (isAdmin || isPropertyOwner) {
      return [
        { value: '', label: 'All Statuses' },
        ...baseOptions,
        { value: PropertyStatus.DRAFT, label: 'Draft' },
        { value: PropertyStatus.ARCHIVED, label: 'Archived' },
        { value: PropertyStatus.DISABLED, label: 'Disabled' },
      ];
    }
    
    return [
      { value: '', label: 'All Statuses' },
      ...baseOptions,
    ];
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build query string
    const params = new URLSearchParams();
    
    if (filters.city) params.set('city', filters.city);
    if (filters.minPrice) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    if (filters.type) params.set('type', filters.type);
    if (filters.status) params.set('status', filters.status);
    params.set('sortBy', filters.sortBy);
    params.set('sortOrder', filters.sortOrder);
    
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleReset = () => {
    setFilters({
      city: '',
      minPrice: '',
      maxPrice: '',
      type: '',
      status: defaultStatus,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    router.push(pathname);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Filters</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City
          </label>
          <input
            type="text"
            name="city"
            value={filters.city}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter city"
          />
        </div>
        
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Price Range
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Min"
                min="0"
              />
            </div>
            <div>
              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Max"
                min="0"
              />
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Property Type
          </label>
          <select
            name="type"
            value={filters.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            {propertyTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            name="status"
            value={filters.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!isAdmin && !isPropertyOwner}
          >
            {getStatusOptions().map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          {(!isAdmin && !isPropertyOwner) && (
            <p className="mt-1 text-xs text-gray-500">
              Regular users can only view published properties
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <select
            name="sortBy"
            value={filters.sortBy}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
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
        
        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Apply Filters
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}