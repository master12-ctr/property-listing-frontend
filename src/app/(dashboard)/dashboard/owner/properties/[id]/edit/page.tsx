'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useProperty, useUpdateProperty } from '@/lib/hooks/useProperties';
import { PropertyType } from '@/types';
import toast from 'react-hot-toast';
import ImageUploader from '@/components/shared/ImageUploader';

const propertySchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: z.string()
    .min(1, 'Description is required')
    .max(5000, 'Description must be less than 5000 characters'),
  location: z.object({
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    country: z.string().min(1, 'Country is required'),
    state: z.string().optional(),
  }),
  price: z.number()
    .min(0, 'Price must be positive')
    .max(1000000000, 'Price is too high'),
  type: z.enum(['apartment', 'house', 'villa', 'commercial', 'land']),
});

type PropertyFormData = z.infer<typeof propertySchema>;

export default function EditPropertyPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: property, isLoading } = useProperty(id);
  const updateProperty = useUpdateProperty();
  
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
  });

  // Load property data into form
  useEffect(() => {
    if (property) {
      reset({
        title: property.title,
        description: property.description,
        location: {
          address: property.location.address,
          city: property.location.city,
          country: property.location.country,
          state: property.location.state || '',
        },
        price: property.price,
        type: property.type,
      });
      setExistingImages(property.images || []);
    }
  }, [property, reset]);

  const onSubmit = async (data: PropertyFormData) => {
    if (!property) return;

    try {
      setIsUploading(true);
      
      let imageUrls = [...existingImages];
      
      // Upload new images if any
      if (images.length > 0) {
        const formData = new FormData();
        images.forEach((image) => {
          formData.append('images', image);
        });
        
        // Upload images
        const uploadResult = await fetch('/api/v1/images/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: formData,
        });
        
        if (uploadResult.ok) {
          const uploadData = await uploadResult.json();
          imageUrls = [...imageUrls, ...uploadData.urls];
        }
      }
      
      // Prepare update data
      const updateData = {
        title: data.title.trim(),
        description: data.description.trim(),
        location: {
          address: data.location.address.trim(),
          city: data.location.city.trim(),
          country: data.location.country.trim(),
          ...(data.location.state && { state: data.location.state.trim() }),
        },
        price: Number(data.price),
        type: data.type,
        images: imageUrls,
      };

      await updateProperty.mutateAsync({ id, data: updateData });
      toast.success('Property updated successfully!');
      
      router.push('/dashboard/owner/properties');
    } catch (error: any) {
      console.error('Property update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update property');
    } finally {
      setIsUploading(false);
    }
  };

  const propertyTypes = [
    { value: 'apartment', label: 'Apartment' },
    { value: 'house', label: 'House' },
    { value: 'villa', label: 'Villa' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'land', label: 'Land' },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Property Not Found</h2>
        <p className="text-gray-600 mt-2">The property you're trying to edit doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Property</h1>
        <p className="text-gray-600 mt-2">Update your property details</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">Basic Information</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                {...register('title')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Beautiful 3-bedroom apartment in downtown"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your property in detail..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type *
                </label>
                <select
                  {...register('type')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {propertyTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (ETB) *
                </label>
                <input
                  {...register('price', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">Location</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <input
                {...register('location.address')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="123 Main Street"
              />
              {errors.location?.address && (
                <p className="mt-1 text-sm text-red-600">{errors.location.address.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  {...register('location.city')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="New York"
                />
                {errors.location?.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.city.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State (Optional)
                </label>
                <input
                  {...register('location.state')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="NY"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country *
                </label>
                <input
                  {...register('location.country')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="United States"
                />
                {errors.location?.country && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.country.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">Images</h2>
          <ImageUploader
            maxImages={10}
            maxSize={5}
            onImagesChange={setImages}
            initialPreviews={existingImages}
            folder="property-listings"
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            disabled={isUploading || updateProperty.isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isUploading || updateProperty.isPending}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading || updateProperty.isPending ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Updating Property...
              </span>
            ) : (
              'Update Property'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}