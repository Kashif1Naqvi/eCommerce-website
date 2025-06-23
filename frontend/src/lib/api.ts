import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (data: { email: string; password: string; full_name?: string }) =>
    api.post('/auth/register', data),
  
  login: (data: { username: string; password: string }) => {
    // Create form data for OAuth2
    const formData = new URLSearchParams();  
    formData.append('username', data.username);
    formData.append('password', data.password);
    
    return api.post('/auth/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  },
  
  getMe: () => api.get('/auth/me'),
};

// Products API
export const productsAPI = {
  getAll: (params?: any) => api.get('/products', { params }),
  getById: (id: number) => api.get(`/products/${id}`),
  create: (data: any) => api.post('/products', data),
  update: (id: number, data: any) => api.put(`/products/${id}`, data),
  delete: (id: number) => api.delete(`/products/${id}`),
  uploadImage: (id: number, formData: FormData) => 
    api.post(`/products/${id}/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get('/products/categories').then(res => res.data),
  getById: (id: number) => api.get(`/products/categories/${id}`).then(res => res.data),
  create: (data: any) => api.post('/products/categories', data).then(res => res.data),
  update: (id: number, data: any) => api.put(`/products/categories/${id}`, data).then(res => res.data),
  delete: (id: number) => api.delete(`/products/categories/${id}`).then(res => res.data),
};

// Cart API
export const cartAPI = {
  get: () => api.get('/cart'),
  addItem: (data: { product_id: number; quantity: number }) =>
    api.post('/cart/items', data),
  updateItem: (itemId: number, data: { quantity: number }) =>
    api.put(`/cart/items/${itemId}`, data),
  removeItem: (itemId: number) => api.delete(`/cart/items/${itemId}`),
  clear: () => api.delete('/cart'),
};