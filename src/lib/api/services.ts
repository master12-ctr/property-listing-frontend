import apiClient from './client';
import {
  Property,
  PaginatedResponse,
  LoginCredentials,
  RegisterData,
  PropertyFilters,
  ContactMessage,
  User,
} from '@/types';

// Auth Services
export const authService = {
  login: (credentials: LoginCredentials) =>
    apiClient.post('/auth/login', credentials).then((res) => res.data),
  
  register: (data: RegisterData) =>
    apiClient.post('/auth/register', data).then((res) => res.data),
  
  logout: () => {
    // Clear local storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('tenantId');
    }
  },
  
  getProfile: () =>
    apiClient.get('/users/profile').then((res) => res.data),
};

// Property Services
export const propertyService = {
  getProperties: (filters?: PropertyFilters) => {
    // Remove undefined values
    const params: Record<string, any> = {};
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params[key] = value;
        }
      });
    }
    return apiClient.get<PaginatedResponse<Property>>('/properties', { params }).then((res) => res.data);
  },
  
  getProperty: (id: string) =>
    apiClient.get<Property>(`/properties/${id}`).then((res) => res.data),
  
  createProperty: (data: any) =>
    apiClient.post('/properties', data).then((res) => res.data),
  
  updateProperty: (id: string, data: any) =>
    apiClient.patch(`/properties/${id}`, data).then((res) => res.data),
  
  deleteProperty: (id: string) =>
    apiClient.delete(`/properties/${id}`).then((res) => res.data),
  
  publishProperty: (id: string) =>
    apiClient.post(`/properties/${id}/publish`).then((res) => res.data),
  
  addFavorite: (id: string) =>
    apiClient.post(`/properties/${id}/favorite`).then((res) => res.data),
  
  removeFavorite: (id: string) =>
    apiClient.delete(`/properties/${id}/favorite`).then((res) => res.data),
  
  getMyProperties: (status?: string) =>
    apiClient.get<Property[]>(`/properties/my`, { params: { status } }).then((res) => res.data),
  
  getFavorites: () =>
    apiClient.get<Property[]>('/properties/favorites').then((res) => res.data),
  
  uploadImages: (propertyId: string, formData: FormData) =>
    apiClient.post(`/properties/${propertyId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((res) => res.data),
};

// Contact Services
export const contactService = {
  sendMessage: (data: ContactMessage) =>
    apiClient.post('/contact', data).then((res) => res.data),
  
  getMessages: (type: 'received' | 'sent' = 'received') =>
    apiClient.get('/contact', { params: { type } }).then((res) => res.data),
  
  getUnreadCount: () =>
    apiClient.get('/contact/unread-count').then((res) => res.data),
};

// User Services
export const userService = {
  updateProfile: (data: Partial<User>) =>
    apiClient.put('/users/profile', data).then((res) => res.data),
};

// Admin Services
export const adminService = {
  getSystemMetrics: () =>
    apiClient.get('/metrics/system').then((res) => res.data),
  
  getPropertyMetrics: (timeRange: 'day' | 'week' | 'month') =>
    apiClient.get('/metrics/property', { params: { timeRange } }).then((res) => res.data),
  
  disableProperty: (id: string) =>
    apiClient.post(`/properties/${id}/disable`).then((res) => res.data),
  
  enableProperty: (id: string) =>
    apiClient.post(`/properties/${id}/enable`).then((res) => res.data),
};