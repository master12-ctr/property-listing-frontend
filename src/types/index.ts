export type PropertyStatus = 'draft' | 'published' | 'archived' | 'disabled';
export type PropertyType = 'apartment' | 'house' | 'villa' | 'commercial' | 'land';




export interface User {
  id: string;
  name: string;
  email: string;
  permissions: string[];
  tenantId?: string;
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
  status: 'draft' | 'published' | 'archived' | 'disabled';
  type: 'apartment' | 'house' | 'villa' | 'commercial' | 'land';
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
  status?: Property['status'];
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  type?: Property['type'];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ContactMessage {
  propertyId: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
}



export interface PropertyFilters {
  page?: number;
  limit?: number;
  status?: Property['status'];
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  type?: Property['type'];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  near?: string;
  maxDistance?: number;
}

// Make sure all other interfaces are defined
export interface User {
  id: string;
  name: string;
  email: string;
  permissions: string[];
  tenantId?: string;
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
  status: 'draft' | 'published' | 'archived' | 'disabled';
  type: 'apartment' | 'house' | 'villa' | 'commercial' | 'land';
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

export interface ContactMessage {
  propertyId: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
}