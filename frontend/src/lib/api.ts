import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bookdigest-lypx.onrender.com';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Get language from URL query param or default to 'en'
function getLanguageFromURL(): string {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    return params.get('lang') || 'en';
  }
  return 'en';
}

// Cache-busting headers
const noCacheHeaders = {
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

// Books API
export const booksAPI = {
  getAll: (params?: any) => {
    const lang = getLanguageFromURL();
    return api.get('/books', { 
      params: { ...params, language: lang },
      headers: noCacheHeaders
    });
  },
  getById: (id: string) => {
    const lang = getLanguageFromURL();
    return api.get(`/books/${id}`, { 
      params: { language: lang },
      headers: noCacheHeaders
    });
  },
  getFeatured: () => api.get('/books/featured', { headers: noCacheHeaders }),
  search: (query: string, params?: any) => {
    const lang = getLanguageFromURL();
    return api.get('/books/search', { 
      params: { q: query, language: lang, ...params },
      headers: noCacheHeaders
    });
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
    const lang = getLanguageFromURL();
    return api.get(`/categories/${slug}/books`, { 
      params: { language: lang, ...params },
      headers: noCacheHeaders
    });
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
