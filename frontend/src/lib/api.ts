import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      Cookies.remove('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { email: string; password: string; firstName?: string; lastName?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
};

// Books API
export const booksAPI = {
  getAll: (params?: any) => api.get('/books', { params }),
  getById: (id: string) => api.get(`/books/${id}`),
  getFeatured: () => api.get('/books/featured'),
  search: (query: string, params?: any) => api.get('/books/search', { params: { q: query, ...params } }),
  toggleFavorite: (id: string) => api.post(`/books/${id}/favorite`),
  getFavorites: () => api.get('/books/favorites/me'),
  updateProgress: (id: string, data: any) => api.post(`/books/${id}/progress`, data),
  getProgress: (id: string) => api.get(`/books/${id}/progress`),
  addReview: (id: string, data: { rating: number; comment?: string }) =>
    api.post(`/books/${id}/reviews`, data),
  getReviews: (id: string, params?: any) => api.get(`/books/${id}/reviews`, { params }),
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getBooks: (slug: string, params?: any) => api.get(`/categories/${slug}/books`, { params }),
};

// User API
export const userAPI = {
  getStats: () => api.get('/users/stats'),
  getHistory: (params?: any) => api.get('/users/history', { params }),
  getFreemiumStatus: () => api.get('/users/freemium-status'),
};

// Payment API
export const paymentAPI = {
  createCheckoutSession: (planType: 'monthly' | 'yearly' | 'team') =>
    api.post('/payments/create-checkout-session', { planType }),
  getSubscriptionStatus: () => api.get('/payments/subscription-status'),
  cancelSubscription: () => api.post('/payments/cancel-subscription'),
};
