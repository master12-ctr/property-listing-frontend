export enum PropertyStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  DISABLED = 'disabled',
}

export enum PropertyType {
  APARTMENT = 'apartment',
  HOUSE = 'house',
  VILLA = 'villa',
  COMMERCIAL = 'commercial',
  LAND = 'land',
}

// Use string literals for type flexibility
export type PropertyStatusType = `${PropertyStatus}`;
export type PropertyTypeType = `${PropertyType}`;

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
  status: PropertyStatusType;
  type: PropertyTypeType;
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

export interface User {
  id: string;
  name: string;
  email: string;
  permissions: string[];
  tenantId: string;
  role?: string;
  isActive?: boolean;
  deletedAt?: string;
  metadata?: {
    phone?: string;
    bio?: string;
    preferences?: Record<string, any>;
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
  status?: PropertyStatusType | PropertyStatus;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  type?: PropertyTypeType | PropertyType;
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
  type: PropertyTypeType;
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
  type?: PropertyTypeType;
  images?: string[];
  status?: PropertyStatusType;
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
      status: PropertyStatusType;
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

// Add this for property details response
export interface PropertyDetail extends Property {
  features?: string[];
  amenities?: string[];
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  areaUnit?: string;
  yearBuilt?: number;
  contactInfo?: {
    name: string;
    phone: string;
    email: string;
  };
}