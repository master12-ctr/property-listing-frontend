'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !isAdmin) {
      router.push('/dashboard/user');
    }
  }, [isAdmin, user, router]);

  if (!user) {
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
        <p className="text-gray-600 mt-2">Admin access required</p>
      </div>
    );
  }

  return (
    <div>
      {children}
    </div>
  );
}