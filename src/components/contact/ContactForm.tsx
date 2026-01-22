'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { contactService } from '@/lib/api/services';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/hooks/useAuth';

const contactSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string()
    .email('Invalid email address'),
  phone: z.string()
    .min(10, 'Phone must be at least 10 characters')
    .max(15, 'Phone must be less than 15 characters')
    .optional()
    .or(z.literal('')),
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be less than 1000 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactFormProps {
  propertyId: string;
  propertyTitle: string;
  onSuccess?: () => void;
}

export default function ContactForm({ propertyId, propertyTitle, onSuccess }: ContactFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      phone: '',
    },
  });

  // Pre-fill form with user data if logged in
  useEffect(() => {
    if (user) {
      setValue('name', user.name || '');
      setValue('email', user.email || '');
      // You can add phone from user metadata if available
    }
  }, [user, setValue]);
  
  const sendMessageMutation = useMutation({
    mutationFn: (data: ContactFormData) =>
      contactService.sendMessage({
        propertyId,
        ...data,
      }),
    onSuccess: () => {
      toast.success('Message sent successfully!');
      reset();
      setIsOpen(false);
      onSuccess?.();
      // Refresh messages list
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to send message';
      toast.error(message);
      
      // If property is not published, show specific guidance
      if (message.includes('not published') || message.includes('not available')) {
        toast.error('This property is not currently available for contact.');
      }
    },
  });
  
  const onSubmit = (data: ContactFormData) => {
    sendMessageMutation.mutate(data);
  };
  
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full btn-primary"
      >
        Contact Owner
      </button>
      
      {isOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Contact Property Owner
              </h3>
              <p className="text-sm text-gray-600 mt-1">{propertyTitle}</p>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  {...register('name')}
                  type="text"
                  className="input"
                  placeholder="John Doe"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Email *
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className="input"
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number (Optional)
                </label>
                <input
                  {...register('phone')}
                  type="tel"
                  className="input"
                  placeholder="+1 (555) 123-4567"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Message *
                </label>
                <textarea
                  {...register('message')}
                  rows={4}
                  className="input"
                  placeholder="I'm interested in this property. Please provide more details..."
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                )}
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Your contact information will be shared with the property owner.
                  Please be respectful in your communication.
                </p>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendMessageMutation.isPending}
                  className="btn-primary"
                >
                  {sendMessageMutation.isPending ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}