export type PropertyStatus = 'draft' | 'published' | 'archived' | 'disabled';
export type PropertyType = 'apartment' | 'house' | 'villa' | 'commercial' | 'land';

export interface User {
  id: string;
  name: string;
  email: string;
  permissions: string[];
  tenantId: string;
  role?: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  location: {
    address: string;
    city: string;
    state?: string;
    country: string;
    coordinates?: {
      type: string;
      coordinates: [number, number];
    };
  };
  price: number;
  images: string[];
  status: PropertyStatus;
  type: PropertyType;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  views: number;
  favoritesCount: number;
  isFavorited?: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  tenantId?: string;
  tenant?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  company?: string;
}

export interface PropertyFilters {
  page?: number;
  limit?: number;
  status?: PropertyStatus;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  type?: PropertyType;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  near?: string;
  maxDistance?: number;
}

export interface ContactMessage {
  propertyId: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export interface CreatePropertyDto {
  title: string;
  description: string;
  location: {
    address: string;
    city: string;
    country: string;
    state?: string;
    coordinates?: {
      type: string;
      coordinates: [number, number];
    };
  };
  price: number;
  type: PropertyType;
  images?: string[];
  metadata?: Record<string, any>;
}

export interface UpdatePropertyDto {
  title?: string;
  description?: string;
  location?: {
    address?: string;
    city?: string;
    country?: string;
    state?: string;
    coordinates?: {
      type: string;
      coordinates: [number, number];
    };
  };
  price?: number;
  type?: PropertyType;
  images?: string[];
  status?: PropertyStatus;
}

export interface SystemMetrics {
  summary: {
    tenants: {
      total: number;
      active: number;
    };
    properties: {
      total: number;
      published: number;
      draft: number;
      archived: number;
      disabled: number;
    };
    users: {
      total: number;
      regular: number;
      owners: number;
      admins: number;
    };
    contacts: {
      total: number;
      unread: number;
    };
  };
  recentActivity: {
    recentProperties: Array<{
      id: string;
      title: string;
      status: PropertyStatus;
      createdAt: string;
      owner: any;
    }>;
    topViewedProperties: Array<{
      id: string;
      title: string;
      views: number;
      favoritesCount: number;
    }>;
    recentContacts: Array<{
      id: string;
      property: any;
      fromUser: any;
      toUser: any;
      message: string;
      createdAt: string;
    }>;
  };
  updatedAt: string;
}