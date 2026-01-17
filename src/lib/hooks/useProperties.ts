import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyService } from '@/lib/api/services';
import toast from 'react-hot-toast';
import { useFavoritesStore } from '@/store/favorites.store';
import { PropertyFilters } from '@/types';

export function useProperties(filters?: PropertyFilters) {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: () => propertyService.getProperties(filters),
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['property', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Property updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update property');
    },
  });
}


export function useFavoriteProperty() {
  const queryClient = useQueryClient();
  const { addFavorite, removeFavorite } = useFavoritesStore();
  
  return useMutation({
    mutationFn: ({ id, isFavorited }: { id: string; isFavorited: boolean }) =>
      isFavorited ? propertyService.removeFavorite(id) : propertyService.addFavorite(id),
    onMutate: async ({ id, isFavorited }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['property', id] });
      
      const previousProperty = queryClient.getQueryData(['property', id]);
      
      if (previousProperty) {
        queryClient.setQueryData(['property', id], (old: any) => ({
          ...old,
          isFavorited: !isFavorited,
          favoritesCount: old.favoritesCount + (isFavorited ? -1 : 1),
        }));
      }
      
      // Update favorites store
      if (isFavorited) {
        removeFavorite(id);
      } else {
        addFavorite(id);
      }
      
      return { previousProperty };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousProperty) {
        queryClient.setQueryData(['property', variables.id], context.previousProperty);
      }
      toast.error('Failed to update favorites');
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['property', variables.id] });
    },
  });}