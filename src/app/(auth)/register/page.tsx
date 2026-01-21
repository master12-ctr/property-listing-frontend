'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const registerSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  email: z.string()
    .email('Invalid email address')
    .max(100, 'Email must be less than 100 characters'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(50, 'Password must be less than 50 characters'),
  phone: z.string()
    .min(10, 'Phone must be at least 10 characters')
    .max(15, 'Phone must be less than 15 characters')
    .optional()
    .or(z.literal('')), // Allow empty string
  company: z.string()
    .min(2, 'Company must be at least 2 characters')
    .max(50, 'Company must be less than 50 characters')
    .optional()
    .or(z.literal('')), // Allow empty string
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isLoading } = useAuth();
  const [error, setError] = useState('');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      phone: '',
      company: '',
    },
  });
  
  const onSubmit = async (data: RegisterFormData) => {
    setError('');
    
    try {
      // Prepare the data for the backend
      const payload: any = {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
      };
      
      // Only include phone if provided
      if (data.phone && data.phone.trim()) {
        payload.phone = data.phone.trim();
      }
      
      // Only include company if provided
      if (data.company && data.company.trim()) {
        payload.company = data.company.trim();
      }
      
      console.log('Register payload:', payload); // For debugging
      
      await registerUser(payload);
      router.push('/');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              sign in to existing account
            </Link>
          </p>
       

          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 text-center">
              <strong>Note:</strong> This registration creates a Regular User account.
              Property Owner and Admin accounts are created by administrators.
            </p>
          </div>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}
          
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <input
                {...register('name')}
                type="text"
                className="input mt-1"
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <input
                {...register('email')}
                type="email"
                className="input mt-1"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password *
              </label>
              <input
                {...register('password')}
                type="password"
                className="input mt-1"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number (Optional)
              </label>
              <input
                {...register('phone')}
                type="tel"
                className="input mt-1"
                placeholder="+1 (555) 123-4567"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                Company (Optional)
              </label>
              <input
                {...register('company')}
                type="text"
                className="input mt-1"
                placeholder="Your Company"
              />
              {errors.company && (
                <p className="mt-1 text-sm text-red-600">{errors.company.message}</p>
              )}
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 px-4 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </div>
          
          <div className="text-sm text-gray-600 text-center">
            <p>By registering, you agree to our Terms of Service and Privacy Policy</p>
          </div>
        </form>
      </div>
    </div>
  );
}