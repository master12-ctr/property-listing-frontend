'use client';

import { useState } from 'react';
import { Property, PropertyStatus } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyService } from '@/lib/api/services';
import toast from 'react-hot-toast';
import {
  PencilIcon,
  EyeIcon,
  ArchiveBoxIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowUturnLeftIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';

interface PropertyActionsProps {
  property: Property;
  onUpdate?: () => void;
}

export default function PropertyActions({ property, onUpdate }: PropertyActionsProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isPublishing, setIsPublishing] = useState(false);
  const queryClient = useQueryClient();
  
  const isOwner = user?.id === property.owner.id;
  
  const publishMutation = useMutation({
    mutationFn: () => propertyService.publishProperty(property.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property', property.id] });
      queryClient.invalidateQueries({ queryKey: ['owner-properties'] });
      toast.success('Property published successfully!');
      onUpdate?.();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to publish property');
    },
  });
  
  const archiveMutation = useMutation({
    mutationFn: () => propertyService.archiveProperty(property.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property', property.id] });
      queryClient.invalidateQueries({ queryKey: ['owner-properties'] });
      toast.success('Property archived successfully!');
      onUpdate?.();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to archive property');
    },
  });
  
  const deleteMutation = useMutation({
    mutationFn: () => propertyService.deleteProperty(property.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-properties'] });
      toast.success('Property deleted successfully!');
      onUpdate?.();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete property');
    },
  });

  const updateProperty = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      propertyService.updateProperty(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['property', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['owner-properties'] });
      toast.success('Property updated successfully!');
      onUpdate?.();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update property');
    },
  });
  
  const validateForPublishing = async () => {
    try {
      setIsPublishing(true);
      const validation = await propertyService.validateForPublishing(property.id);
      
      if (validation.isValid) {
        if (window.confirm('Are you sure you want to publish this property? Published properties cannot be edited.')) {
          await publishMutation.mutateAsync();
        }
      } else {
        toast.error(`Cannot publish property: ${validation.errors.join(', ')}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Validation failed');
    } finally {
      setIsPublishing(false);
    }
  };
  
  const handleArchive = () => {
    if (window.confirm('Are you sure you want to archive this property?')) {
      archiveMutation.mutate();
    }
  };
  
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      deleteMutation.mutate();
    }
  };

  const handleUnarchive = () => {
    if (window.confirm('Are you sure you want to unarchive this property? It will be moved back to draft status.')) {
      updateProperty.mutate({
        id: property.id,
        data: { status: PropertyStatus.DRAFT }
      });
    }
  };
  
  // Only show actions for property owners
  if (!isOwner) {
    return (
      <div className="flex items-center space-x-2">
        <a
          href={`/properties/${property.id}`}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
          title="View Property"
        >
          <EyeIcon className="w-5 h-5" />
        </a>
      </div>
    );
  }
  
  return (
    <div className="flex items-center space-x-2">
      {/* View Button - Always visible for owners */}
      <a
        href={`/properties/${property.id}`}
        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
        title="View Property"
      >
        <EyeIcon className="w-5 h-5" />
      </a>
      
      {/* Edit Button - Only for draft properties */}
      {property.status === PropertyStatus.DRAFT && (
        <a
          href={`/dashboard/owner/properties/${property.id}/edit`}
          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg"
          title="Edit Property"
        >
          <PencilIcon className="w-5 h-5" />
        </a>
      )}
      
      {/* Publish Button - Only for draft properties */}
      {property.status === PropertyStatus.DRAFT && (
        <button
          onClick={validateForPublishing}
          disabled={isPublishing || publishMutation.isPending}
          className="p-2 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50"
          title="Publish Property"
        >
          <CheckCircleIcon className="w-5 h-5" />
        </button>
      )}
      
      {/* Archive Button - Only for published properties */}
      {property.status === PropertyStatus.PUBLISHED && (
        <button
          onClick={handleArchive}
          disabled={archiveMutation.isPending}
          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg disabled:opacity-50"
          title="Archive Property"
        >
          <ArchiveBoxIcon className="w-5 h-5" />
        </button>
      )}
      
      {/* Unarchive Button - Only for archived properties */}
      {property.status === PropertyStatus.ARCHIVED && (
        <button
          onClick={handleUnarchive}
          disabled={updateProperty.isPending}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50"
          title="Unarchive to Draft"
        >
          <ArrowUturnLeftIcon className="w-5 h-5" />
        </button>
      )}
      
      {/* Delete Button - Only for draft/archived properties */}
      {(property.status === PropertyStatus.DRAFT || property.status === PropertyStatus.ARCHIVED) && (
        <button
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
          title="Delete Property"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}