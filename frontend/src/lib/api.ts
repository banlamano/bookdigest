import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bookdigest-lypx.onrender.com';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const token = Cookies.get('token');
      const isAuthEndpoint = error.config?.url?.includes('/auth/login') || 
                            error.config?.url?.includes('/auth/register');
      
      if (token && !isAuthEndpoint && !window.location.pathname.includes('/login')) {
        Cookies.remove('token');
        localStorage.removeItem('auth-storage');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Books API
export const booksAPI = {
  getAll: (params?: any) => {
    const lang = Cookies.get('language') || 'en';
    return api.get('/books', { params: { ...params, language: lang } });
  },
  getById: (id: string) => {
    const lang = Cookies.get('language') || 'en';
    return api.get(`/books/${id}`, { params: { language: lang } });
  },
  getFeatured: () => api.get('/books/featured'),
  search: (query: string, params?: any) => {
    const lang = Cookies.get('language') || 'en';
    return api.get('/books/search', { params: { q: query, language: lang, ...params } });
  },
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
  getBooks: (slug: string, params?: any) => {
    const lang = Cookies.get('language') || 'en';
    return api.get(`/categories/${slug}/books`, { params: { language: lang, ...params } });
  },
};

// Auth API
export const authAPI = {
  register: (data: { email: string; password: string; firstName?: string; lastName?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
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
