'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { UserMenu } from './UserMenu';

export default function Navbar() {
  const { isAuthenticated, user, isAdmin, isPropertyOwner } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-blue-600">
              PropertyHub
            </Link>
            
            <div className="hidden md:flex space-x-6">
              <Link href="/properties" className="text-gray-700 hover:text-blue-600">
                Browse Properties
              </Link>
              
              {isPropertyOwner && (
                <Link href="/dashboard/owner" className="text-gray-700 hover:text-blue-600">
                  My Properties
                </Link>
              )}
              
              {isAuthenticated && (
                <Link href="/dashboard/user/favorites" className="text-gray-700 hover:text-blue-600">
                  Favorites
                </Link>
              )}
              
              {isAdmin && (
                <Link href="/dashboard/admin" className="text-gray-700 hover:text-blue-600">
                  Admin Dashboard
                </Link>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <UserMenu user={user!} />
            ) : (
              <>
                <Link href="/login" className="text-gray-700 hover:text-blue-600">
                  Login
                </Link>
                <Link href="/register" className="btn-primary">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}