// Google Analytics utilities
// Events tracking for user behavior analysis

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

// Initialize GA (called automatically by GoogleAnalytics component)
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

// Page view tracking
export const pageview = (url: string) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
};

// Custom event tracking
type EventParams = {
  action: string;
  category: string;
  label?: string;
  value?: number;
};

export const event = ({ action, category, label, value }: EventParams) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Specific event helpers
export const trackBookView = (bookId: string, bookTitle: string) => {
  event({
    action: 'view_book',
    category: 'Books',
    label: `${bookTitle} (${bookId})`,
  });
};

export const trackSearch = (query: string, resultsCount: number) => {
  event({
    action: 'search',
    category: 'Engagement',
    label: query,
    value: resultsCount,
  });
};

export const trackCategoryClick = (categoryName: string) => {
  event({
    action: 'category_click',
    category: 'Navigation',
    label: categoryName,
  });
};

export const trackPremiumClick = (location: string) => {
  event({
    action: 'premium_click',
    category: 'Conversion',
    label: location,
  });
};

export const trackReadingTime = (bookId: string, seconds: number) => {
  event({
    action: 'reading_time',
    category: 'Engagement',
    label: bookId,
    value: seconds,
  });
};

export const trackBookmark = (bookId: string, action: 'add' | 'remove') => {
  event({
    action: `bookmark_${action}`,
    category: 'Engagement',
    label: bookId,
  });
};

export const trackShareClick = (bookId: string, platform: string) => {
  event({
    action: 'share',
    category: 'Social',
    label: `${platform} - ${bookId}`,
  });
};
