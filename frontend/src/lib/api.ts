import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bookdigest-lypx.onrender.com';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Add interceptor to append the token to all requests
api.interceptors.request.use(
  (config) => {
    // Safely get token
    let token = null;
    if (typeof window !== 'undefined') {
      // First try to get from js-cookie 
      const match = document.cookie.match(/(^|;)\s*token\s*=\s*([^;]+)/);
      if (match) {
        token = match[2];
      }
      
      // Fallback: try from localStorage zustand state if needed
      if (!token) {
        try {
          const authStorage = localStorage.getItem('auth-storage');
          if (authStorage) {
            const parsed = JSON.parse(authStorage);
            if (parsed?.state?.token) {
              token = parsed.state.token;
            }
          }
        } catch (e) {
          console.error("Failed to parse auth-storage", e);
        }
      }
    }

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Get language from URL query param, cookie, or default to 'en'
function getLanguageFromURL(): string {
  if (typeof window !== 'undefined') {
    // 1. Try URL parameter
    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get('lang');
    if (urlLang === 'en' || urlLang === 'de') return urlLang;

    // 2. Try Cookie
    const match = document.cookie.match(/(^|;)\s*language\s*=\s*([^;]+)/);
    if (match) {
      const cookieLang = match[2];
      if (cookieLang === 'en' || cookieLang === 'de') return cookieLang;
    }

    // 3. Try Browser language if no preference set
    const browserLang = navigator.language.split('-')[0];
    if (browserLang === 'de') return 'de';
  }
  return 'en';
}

// Cache-busting headers
const noCacheHeaders = {
  'Cache-Control': 'no-cache, no-store, must-revalidate, proxy-revalidate, s-maxage=0',
  'Pragma': 'no-cache',
  'Expires': '0',
  'Surrogate-Control': 'no-store',
};

// Books API
export const booksAPI = {
  getAll: (params?: any) => {
    const lang = getLanguageFromURL();
    return api.get('/books', {
      params: { language: lang, ...params },
      headers: noCacheHeaders
    });
  },
  getById: (id: string, params?: any) => {
    const lang = getLanguageFromURL();
    return api.get(`/books/${id}`, {
      params: { language: lang, ...params },
      headers: noCacheHeaders
    });
  },
  getFeatured: (params?: any) => {
    const lang = getLanguageFromURL();
    return api.get('/books/featured', {
      params: { language: lang, ...params },
      headers: noCacheHeaders
    });
  },
  search: (query: string, params?: any) => {
    const lang = getLanguageFromURL();
    return api.get('/books/search', {
      params: { language: lang, q: query, ...params },
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
  getAll: (params?: any) => {
    const lang = getLanguageFromURL();
    return api.get('/categories', {
      params: { language: lang, ...params },
      headers: noCacheHeaders
    });
  },
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
  register: (data: { email: string; password: string; firstName?: string; lastName?: string; language?: 'en' | 'de' }) =>
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
  getAchievements: () => api.get('/users/achievements'),
  getFreemiumStatus: () => api.get('/users/freemium-status'),
  verifySubscription: () => api.post('/users/verify-subscription'),
};

// Payment API
export const paymentAPI = {
  createCheckoutSession: (planType: 'monthly' | 'yearly' | 'team' | 'lifetime') =>
    api.post('/payments/create-checkout-session', { planType }),
  getSubscriptionStatus: () => api.get('/payments/subscription-status'),
  cancelSubscription: () => api.post('/payments/cancel-subscription'),
};
