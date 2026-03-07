'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';

type Language = 'en' | 'de';

const translations: Record<Language, Record<string, string>> = {
  en: {
    'nav.home': 'Home',
    'nav.library': 'Library',
    'nav.categories': 'Categories',
    'nav.pricing': 'Pricing',
    'nav.features': 'Features',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.login': 'Login',
    'nav.register': 'Sign Up',
    'nav.dashboard': 'Dashboard',
    'nav.logout': 'Logout',
    'nav.search': 'Search books...',
    'hero.title': 'Learn from the World\'s Best Books in 15 Minutes',
    'hero.subtitle': 'Access 454+ free AI-powered book summaries. Read bestselling business, self-help, psychology & personal development books quickly.',
    'hero.cta': 'Start Reading Free',
    'hero.ctaSecondary': 'View Library',
    'footer.description': 'Learn from the world\'s best books in minutes. Read or listen on the go.',
    'footer.product': 'Product',
    'footer.company': 'Company',
    'footer.legal': 'Legal',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    'footer.cookies': 'Cookie Policy',
    'footer.contact': 'Contact Us',
    'footer.about': 'About Us',
    'footer.allRights': 'All rights reserved.',
  },
  de: {
    'nav.home': 'Startseite',
    'nav.library': 'Bibliothek',
    'nav.categories': 'Kategorien',
    'nav.pricing': 'Preise',
    'nav.features': 'Funktionen',
    'nav.about': 'Über uns',
    'nav.contact': 'Kontakt',
    'nav.login': 'Anmelden',
    'nav.register': 'Registrieren',
    'nav.dashboard': 'Dashboard',
    'nav.logout': 'Abmelden',
    'nav.search': 'Bücher suchen...',
    'hero.title': 'Lerne von den besten Büchern der Welt in 15 Minuten',
    'hero.subtitle': 'Zugang zu 450+ kostenlosen KI-gestützten Buchzusammenfassungen. Lies Bestseller schnell.',
    'hero.cta': 'Kostenlos starten',
    'hero.ctaSecondary': 'Bibliothek ansehen',
    'footer.description': 'Lerne von den besten Büchern der Welt in Minuten. Lies oder höre unterwegs.',
    'footer.product': 'Produkt',
    'footer.company': 'Unternehmen',
    'footer.legal': 'Rechtliches',
    'footer.privacy': 'Datenschutz',
    'footer.terms': 'Nutzungsbedingungen',
    'footer.cookies': 'Cookie-Richtlinie',
    'footer.contact': 'Kontakt',
    'footer.about': 'Über uns',
    'footer.allRights': 'Alle Rechte vorbehalten.',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isReady: boolean;
}

const defaultContext: LanguageContextType = {
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => {
    return translations.en[key] || key;
  },
  isReady: false,
};

const LanguageContext = createContext<LanguageContextType>(defaultContext);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const savedLang = Cookies.get('language') as Language;
    if (savedLang && (savedLang === 'en' || savedLang === 'de')) {
      setLanguageState(savedLang);
    }
    setIsReady(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    Cookies.set('language', lang, { expires: 365 });
  };

  const t = (key: string): string => {
    if (!isReady) return key;
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isReady }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return defaultContext;
  }
  return context;
}
