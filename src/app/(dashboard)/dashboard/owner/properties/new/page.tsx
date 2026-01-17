'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateProperty } from '@/lib/hooks/useProperties';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { PropertyType } from '@/types';

const propertySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(1, 'Description is required').max(5000, 'Description too long'),
  location: z.object({
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    country: z.string().min(1, 'Country is required'),
    state: z.string().optional(),
  }),
  price: z.number().min(0, 'Price must be positive'),
  type: z.enum(['apartment', 'house', 'villa', 'commercial', 'land']),
});

type PropertyFormData = z.infer<typeof propertySchema>;

export default function NewPropertyPage() {
  const router = useRouter();
  const createProperty = useCreateProperty();
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      type: 'apartment',
    },
  });

  const onSubmit = async (data: PropertyFormData) => {
    try {
      const propertyData = {
        ...data,
        images: [], // Will be uploaded separately
        metadata: {},
      };

      const result = await createProperty.mutateAsync(propertyData);
      toast.success('Property created successfully!');
      
      // Upload images if any
      if (images.length > 0 && result.id) {
        const formData = new FormData();
        images.forEach((image) => {
          formData.append('images', image);
        });
        
        // You would call the image upload API here
        // await propertyService.uploadImages(result.id, formData);
      }
      
      router.push('/dashboard/owner/properties');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create property');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(files);
    
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Property</h1>
        <p className="text-gray-600 mt-2">Fill in the details to list your property</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                {...register('title')}
                type="text"
                className="input"
                placeholder="Beautiful 3-bedroom apartment"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Type *
              </label>
              <select
                {...register('type')}
                className="input"
              >
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="villa">Villa</option>
                <option value="commercial">Commercial</option>
                <option value="land">Land</option>
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className="input"
              placeholder="Describe your property in detail..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price *
            </label>
            <input
              {...register('price', { valueAsNumber: true })}
              type="number"
              min="0"
              step="0.01"
              className="input"
              placeholder="0.00"
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Location</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <input
                {...register('location.address')}
                type="text"
                className="input"
                placeholder="123 Main Street"
              />
              {errors.location?.address && (
                <p className="mt-1 text-sm text-red-600">{errors.location.address.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  {...register('location.city')}
                  type="text"
                  className="input"
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
                  className="input"
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
                  className="input"
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
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Images</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Images (Max 10)
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="input"
            />
            
            {imagePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createProperty.isPending}
            className="btn-primary"
          >
            {createProperty.isPending ? 'Creating...' : 'Create Property'}
          </button>
        </div>
      </form>
    </div>
  );
}