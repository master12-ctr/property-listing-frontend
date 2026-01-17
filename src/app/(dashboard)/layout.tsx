'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { AuthGuard } from '@/components/shared/AuthGuard';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profileQuery } = useAuth();
  const router = useRouter();

  if (profileQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AuthGuard requireAuth>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <DashboardSidebar user={user!} />
            </div>
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-md p-6">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}