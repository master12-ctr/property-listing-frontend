'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyService } from '@/lib/api/services';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { PropertyStatus } from '@/types';
import { ArchiveBoxIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';



export default function ArchivedPropertiesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const { data: properties, isLoading } = useQuery({
    queryKey: ['archived-properties', user?.id],
    queryFn: () => propertyService.getArchivedProperties(),
  });

  const unarchiveMutation = useMutation({
    mutationFn: (propertyId: string) => 
      propertyService.updateProperty(propertyId, { status: PropertyStatus.DRAFT }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['archived-properties', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['owner-properties'] });
      toast.success('Property unarchived successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to unarchive property');
    },
  });

  const browsePropertiesNav = [
  {
    name: 'Browse Properties',
    href: '/properties',
    icon: BuildingOfficeIcon,
  },
];

  const handleUnarchive = async (propertyId: string) => {
    if (window.confirm('Are you sure you want to unarchive this property? It will be moved back to draft status.')) {
      await unarchiveMutation.mutateAsync(propertyId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center space-x-3">
          <ArchiveBoxIcon className="h-8 w-8 text-gray-500" />
          <h1 className="text-3xl font-bold text-gray-900">Archived Properties</h1>
        </div>
        <p className="text-gray-600 mt-2">
          View and manage your archived properties. Archived properties can be unarchived to draft status.
        </p>
      </div>

      {properties && properties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div key={property.id} className="relative">
              <PropertyCard 
                property={property}
                showActions={true}
                isOwnerView={true}
              />
              <div className="mt-4">
                <button
                  onClick={() => handleUnarchive(property.id)}
                  disabled={unarchiveMutation.isPending}
                  className="w-full btn-secondary py-2"
                >
                  {unarchiveMutation.isPending ? 'Unarchiving...' : 'Unarchive to Draft'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <ArchiveBoxIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No archived properties</h3>
          <p className="text-gray-600 mt-2">
            When you archive published properties, they will appear here.
          </p>
        </div>
      )}
    </div>
  );
}