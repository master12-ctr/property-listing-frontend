'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';

const forgotPasswordSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .max(100, 'Email must be less than 100 characters'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });
  
  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      // TODO: Implement forgot password API call
      // For now, simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Password reset instructions have been sent to your email.');
      setIsSubmitted(true);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset instructions');
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Forgot your password?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
        </div>
        
        {isSubmitted ? (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
            <p className="text-center">
              Password reset instructions have been sent to your email. Please check your inbox.
            </p>
            <div className="mt-4 text-center">
              <Link href="/login" className="text-blue-600 hover:text-blue-500">
                Return to login
              </Link>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
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
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary py-3 px-4 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : 'Send Reset Instructions'}
              </button>
            </div>
            
            <div className="text-center">
              <Link
                href="/login"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Back to login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}