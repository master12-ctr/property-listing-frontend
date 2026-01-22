// components/dashboard/DashboardSidebar.tsx
'use client';

import { User } from '@/types';
import { useAuth } from '@/lib/hooks/useAuth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  BuildingLibraryIcon,
  HeartIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  ChartBarIcon,
  InboxIcon,
  PlusCircleIcon,
  UsersIcon,
  ShieldCheckIcon,
  ArchiveBoxIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

interface DashboardSidebarProps {
  user: User;
}

export default function DashboardSidebar({ user }: DashboardSidebarProps) {
  const { isAdmin, isPropertyOwner } = useAuth();
  const pathname = usePathname();

  // Common navigation for all users (excluding admin dashboard)
  const commonNavigation = [
    {
      name: 'User Dashboard',
      href: '/dashboard/user',
      icon: HomeIcon,
    },
  ];

  // Add Browse Properties for non-admin users
  if (!isAdmin) {
    commonNavigation.push({
      name: 'Browse Properties',
      href: '/dashboard/properties',
      icon: MagnifyingGlassIcon,
    });
  }

  // Add Favorites for non-admin users
  if (!isAdmin) {
    commonNavigation.push({
      name: 'Favorites',
      href: '/dashboard/user/favorites',
      icon: HeartIcon,
    });
  }

  // Messages for all users
  commonNavigation.push({
    name: 'Messages',
    href: '/dashboard/user/messages',
    icon: InboxIcon,
  });

  // Profile for all users
  commonNavigation.push({
    name: 'Profile',
    href: '/dashboard/user/profile',
    icon: UserCircleIcon,
  });

  // Property Owner navigation
  const ownerNavigation = isPropertyOwner ? [
    {
      name: 'My Properties',
      href: '/dashboard/owner/properties',
      icon: BuildingLibraryIcon,
    },
    {
      name: 'Add Property',
      href: '/dashboard/owner/properties/new',
      icon: PlusCircleIcon,
    },
    {
      name: 'Archived',
      href: '/dashboard/owner/properties/archived',
      icon: ArchiveBoxIcon,
    },
  ] : [];

  // Admin navigation - distinct from user dashboard
  const adminNavigation = isAdmin ? [
    {
      name: 'Admin Dashboard',
      href: '/dashboard/admin',
      icon: ShieldCheckIcon,
    },
    {
      name: 'User Management',
      href: '/dashboard/admin/users',
      icon: UsersIcon,
    },
    {
      name: 'System Metrics',
      href: '/dashboard/admin/metrics',
      icon: ChartBarIcon,
    },
  ] : [];

  // Settings only for authenticated users
  const settingsNavigation = [
    {
      name: 'Settings',
      href: '/dashboard/user/settings',
      icon: Cog6ToothIcon,
    },
  ];

  // Combine navigation based on user role
  const navigation = [
    ...commonNavigation,
    ...ownerNavigation,
    ...adminNavigation,
    ...settingsNavigation,
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center space-x-4 mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-2xl text-blue-600 font-semibold">
            {user.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
          <p className="text-sm text-gray-500">{user.email}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {isAdmin && (
              <span className="inline-block px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                Admin
              </span>
            )}
            {isPropertyOwner && (
              <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                Property Owner
              </span>
            )}
            {!isAdmin && !isPropertyOwner && (
              <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                Regular User
              </span>
            )}
          </div>
        </div>
      </div>
      
      <nav className="space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={`${item.name}-${item.href}`}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                active
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-gray-400'}`} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}