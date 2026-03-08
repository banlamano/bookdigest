import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bookdigest-lypx.onrender.com';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add auth token and language
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Add language parameter for German support
    const language = Cookies.get('language');
    if (language && !config.url?.includes('language=')) {
      config.url = config.url + (config.url?.includes('?') ? '&' : '?') + `language=${language}`;
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
    // Only redirect on 401 if we're on a protected route AND have a token
    // Don't redirect if login/register itself fails (that's just wrong credentials)
    if (error.response?.status === 401) {
      const token = Cookies.get('token');
      const isAuthEndpoint = error.config?.url?.includes('/auth/login') || 
                            error.config?.url?.includes('/auth/register');
      
      // Only redirect if:
      // 1. We have a token (meaning we're authenticated)
      // 2. This is NOT a login/register request
      // 3. We're not already on the login page
      if (token && !isAuthEndpoint && !window.location.pathname.includes('/login')) {
        // Token is invalid/expired - clear it and redirect
        Cookies.remove('token');
        // Clear localStorage auth state
        localStorage.removeItem('auth-storage');
        window.location.href = '/login';
      }
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
  verifySubscription: () => api.post('/users/verify-subscription'),
};

// Payment API
export const paymentAPI = {
  createCheckoutSession: (planType: 'monthly' | 'yearly' | 'team') =>
    api.post('/payments/create-checkout-session', { planType }),
  getSubscriptionStatus: () => api.get('/payments/subscription-status'),
  cancelSubscription: () => api.post('/payments/cancel-subscription'),
};
