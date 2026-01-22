import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyService } from '@/lib/api/services';
import toast from 'react-hot-toast';
import { useFavoritesStore } from '@/store/favorites.store';
import { PropertyFilters } from '@/types';

export function useProperties(filters?: PropertyFilters) {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: () => propertyService.getProperties(filters),
    staleTime: 30000, // 30 seconds
  });
}

export function useProperty(id: string) {
  return useQuery({
    queryKey: ['property', id],
    queryFn: () => propertyService.getProperty(id),
    enabled: !!id,
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: propertyService.createProperty,
    onSuccess: (data) => {
      // Invalidate and refetch properties queries
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['owner-properties'] });
      
      // Update the specific property cache
      queryClient.setQueryData(['property', data.id], data);
      
      toast.success('Property created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create property');
    },
  });
}

export function useUpdateProperty() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      propertyService.updateProperty(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['property', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['owner-properties'] });
      toast.success('Property updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update property');
    },
  });
}

export function useFavoriteProperty() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, isFavorited }: { id: string; isFavorited: boolean }) =>
      isFavorited ? propertyService.removeFavorite(id) : propertyService.addFavorite(id),
    onMutate: async ({ id, isFavorited }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['property', id] });
      
      // Snapshot the previous value
      const previousProperty = queryClient.getQueryData(['property', id]);
      
      // Optimistically update to the new value
      if (previousProperty) {
        queryClient.setQueryData(['property', id], (old: any) => ({
          ...old,
          isFavorited: !isFavorited,
          favoritesCount: old.favoritesCount + (isFavorited ? -1 : 1),
        }));
      }
      
      return { previousProperty };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousProperty) {
        queryClient.setQueryData(['property', variables.id], context.previousProperty);
      }
      toast.error('Failed to update favorite');
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['property', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}