'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const { isAuthenticated, profileQuery } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (requireAuth && !isAuthenticated && !profileQuery.isLoading) {
      router.push('/login');
    }
  }, [isAuthenticated, profileQuery.isLoading, requireAuth, router]);

  if (profileQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}