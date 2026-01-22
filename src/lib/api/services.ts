import apiClient from './client';
import {
  Property,
  PaginatedResponse,
  LoginCredentials,
  RegisterData,
  PropertyFilters,
  ContactMessage,
  User,
  CreatePropertyDto,
  UpdatePropertyDto,
  SystemMetrics,
  PropertyStatus
} from '@/types';

// Auth Services
// Update the authService login method
export const authService = {
  login: (credentials: LoginCredentials) =>
    apiClient.post('/auth/login', credentials).then((res) => res.data).catch(error => {
      // Handle specific error messages
      if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      }
      throw error;
    }),
  
  register: (data: RegisterData) =>
    apiClient.post('/auth/register', data).then((res) => res.data),
  
  refreshToken: (refreshToken: string) =>
    apiClient.post('/auth/refresh', { refreshToken }).then((res) => res.data),
  
  getProfile: () =>
    apiClient.get('/users/profile').then((res) => res.data),
};

// Property Services
export const propertyService = {
  getProperties: (filters?: PropertyFilters) => {
    const params: Record<string, any> = {};
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params[key] = value;
        }
      });
    }
    return apiClient.get<PaginatedResponse<Property>>('/properties', { params }).then((res) => res.data);
  },
  
  getProperty: (id: string) =>
    apiClient.get<Property>(`/properties/${id}`).then((res) => res.data),
  
  createProperty: (data: CreatePropertyDto) =>
    apiClient.post('/properties', data).then((res) => res.data),
  
  updateProperty: (id: string, data: UpdatePropertyDto) =>
    apiClient.patch(`/properties/${id}`, data).then((res) => res.data),
  
  deleteProperty: (id: string) =>
    apiClient.delete(`/properties/${id}`).then((res) => res.data),
  
  publishProperty: (id: string) =>
    apiClient.post(`/properties/${id}/publish`).then((res) => res.data),
  
  archiveProperty: (id: string) =>
    apiClient.post(`/properties/${id}/archive`).then((res) => res.data),
  
  addFavorite: (id: string) =>
    apiClient.post(`/properties/${id}/favorite`).then((res) => res.data),
  
  removeFavorite: (id: string) =>
    apiClient.delete(`/properties/${id}/favorite`).then((res) => res.data),
  
  getMyProperties: () =>
    apiClient.get<Property[]>('/properties/my').then((res) => res.data),

  
  validateForPublishing: (id: string) =>
    apiClient.get(`/properties/${id}/validate`).then((res) => res.data),
  
  uploadImages: (propertyId: string, formData: FormData) =>
    apiClient.post(`/properties/${propertyId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((res) => res.data),
  
  deleteImages: (propertyId: string, urls: string[]) =>
    apiClient.delete(`/properties/${propertyId}/images`, { data: { urls } }).then((res) => res.data),

// Add this method for checking favorite status:
getFavoriteStatus: (id: string) =>
  apiClient.get<{ isFavorited: boolean }>(`/properties/${id}/favorite/status`).then((res) => res.data),


getFavorites: () =>
  apiClient.get('/properties/favorites').then((res) => res.data),

// Make sure the contactService has correct endpoint:
sendMessage: (data: ContactMessage) =>
  apiClient.post('/contact', data).then((res) => res.data),


 getArchivedProperties: () =>
    apiClient.get<Property[]>('/properties/my', { 
      params: { status: PropertyStatus.ARCHIVED } 
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
  
  markAsRead: (id: string) =>
    apiClient.patch(`/contact/${id}/read`).then((res) => res.data),
  
  deleteMessage: (id: string) =>
    apiClient.delete(`/contact/${id}`).then((res) => res.data),
};

// User Services
export const userService = {
  updateProfile: (data: Partial<User>) =>
    apiClient.put('/users/profile', data).then((res) => res.data),
  
  getAllUsers: () =>
    apiClient.get<User[]>('/users').then((res) => res.data),
  
  getUserById: (id: string) =>
    apiClient.get<User>(`/users/${id}`).then((res) => res.data),

   deleteUser: (id: string) =>
    apiClient.delete(`/users/${id}`).then((res) => res.data),
  
  addUserRole: (userId: string, roleId: string) =>
    apiClient.post(`/users/${userId}/roles/${roleId}`).then((res) => res.data),
  
  removeUserRole: (userId: string, roleId: string) =>
    apiClient.delete(`/users/${userId}/roles/${roleId}`).then((res) => res.data),
};

// Role Services
export const roleService = {
  getAllRoles: () =>
    apiClient.get('/roles').then((res) => res.data),
  
  getRoleById: (id: string) =>
    apiClient.get(`/roles/${id}`).then((res) => res.data),
  
  createRole: (data: any) =>
    apiClient.post('/roles', data).then((res) => res.data),
  
  updateRole: (id: string, data: any) =>
    apiClient.put(`/roles/${id}`, data).then((res) => res.data),
  
  deleteRole: (id: string) =>
    apiClient.delete(`/roles/${id}`).then((res) => res.data),
};

// Admin Services
export const adminService = {
  getSystemMetrics: () =>
    apiClient.get<SystemMetrics>('/metrics/system').then((res) => res.data),
  
  getPropertyMetrics: (timeRange: 'day' | 'week' | 'month' = 'week') =>
    apiClient.get('/metrics/property', { params: { timeRange } }).then((res) => res.data),
  
  getTenantMetrics: (tenantId: string) =>
    apiClient.get('/metrics/tenant', { params: { tenantId } }).then((res) => res.data),
  
  disableProperty: (id: string) =>
    apiClient.post(`/properties/${id}/disable`).then((res) => res.data),
  
  enableProperty: (id: string) =>
    apiClient.post(`/properties/${id}/enable`).then((res) => res.data),
};

// Image Services
// Image Services
export const imageService = {
  uploadImages: (files: File[], folder?: string) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });
    
    if (folder) {
      formData.append('folder', folder);
    }
    
    return apiClient.post('/images/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((res) => res.data);
  },
  
  deleteImages: (urls: string[]) =>
    apiClient.delete('/images/delete', { data: { urls } }).then((res) => res.data),
  
  uploadPropertyImages: (propertyId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });
    
    return apiClient.post(`/properties/${propertyId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((res) => res.data);
  },
  
  deletePropertyImages: (propertyId: string, urls: string[]) =>
    apiClient.delete(`/properties/${propertyId}/images`, { data: { urls } }).then((res) => res.data),
};



