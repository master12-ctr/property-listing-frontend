'use client';

import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { User } from '@/types';
import { useAuth } from '@/lib/hooks/useAuth';
import Link from 'next/link';
import { ChevronDownIcon, UserCircleIcon, CogIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

interface UserMenuProps {
  user: User;
}

export function UserMenu({ user }: UserMenuProps) {
  const { logout } = useAuth();

  const menuItems = [
    {
      label: 'Profile',
      href: '/dashboard/user/profile',
      icon: UserCircleIcon,
    },
    {
      label: 'Settings',
      href: '/dashboard/user/settings',
      icon: CogIcon,
    },
    {
      label: 'Logout',
      onClick: logout,
      icon: ArrowRightOnRectangleIcon,
      className: 'text-red-600 hover:bg-red-50',
    },
  ];

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center space-x-3 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-blue-600 font-semibold">
            {user.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-900">{user.name}</p>
          <p className="text-xs text-gray-500 truncate max-w-[120px]">{user.email}</p>
        </div>
        <ChevronDownIcon className="w-4 h-4 text-gray-500 hidden md:block" />
      </Menu.Button>
      
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="px-1 py-2">
            <div className="px-3 py-2 mb-2 border-b">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
            
            {menuItems.map((item) => (
              <Menu.Item key={item.label}>
                {({ active }) => (
                  item.href ? (
                    <Link
                      href={item.href}
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } ${item.className || 'text-gray-900'} group flex w-full items-center rounded-md px-3 py-2 text-sm`}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.label}
                    </Link>
                  ) : (
                    <button
                      onClick={item.onClick}
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } ${item.className || 'text-gray-900'} group flex w-full items-center rounded-md px-3 py-2 text-sm`}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.label}
                    </button>
                  )
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}