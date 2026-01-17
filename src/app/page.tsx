'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { isAuthenticated, profileQuery } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && !profileQuery.isLoading) {
      // Redirect to user dashboard if authenticated
      router.push('/dashboard/user');
    }
  }, [isAuthenticated, profileQuery.isLoading, router]);

  if (profileQuery.isLoading || isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Find Your Perfect Property
        </h1>
        <p className="text-xl text-gray-600 mb-10">
          Discover amazing properties for rent or sale. Join our multi-tenant platform and start listing or finding properties today.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/properties" 
            className="btn-primary px-8 py-3 text-lg font-semibold"
          >
            Browse Properties
          </Link>
          <Link 
            href="/register" 
            className="btn-secondary px-8 py-3 text-lg font-semibold"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}