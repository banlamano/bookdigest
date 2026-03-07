'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';

type Language = 'en' | 'de';

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
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
    'nav.signOut': 'Sign Out',

    // Hero
    'hero.title': 'Learn from the World\'s Best Books in 15 Minutes',
    'hero.subtitle': 'Access 454+ free AI-powered book summaries. Read bestselling business, self-help, psychology & personal development books quickly.',
    'hero.cta': 'Start Reading Free',
    'hero.ctaSecondary': 'Browse Library',
    'hero.stats.books': 'Book Summaries',
    'hero.stats.read': 'Average Read',
    'hero.stats.rating': 'User Rating',

    // Features
    'features.title': 'Why Choose BookDigest?',
    'features.free.title': '100% Free',
    'features.free.desc': 'Access book summaries at no cost. No credit card required.',
    'features.ai.title': 'AI-Powered',
    'features.ai.desc': 'Advanced AI generates comprehensive summaries with key insights.',
    'features.audio.title': 'Audio Available',
    'features.audio.desc': 'Listen to summaries on the go with premium audio feature.',
    'features.quick.title': '15-Minute Reads',
    'features.quick.desc': 'Get the key ideas from any book in just 15 minutes.',

    // Library
    'library.title': 'Book Library',
    'library.subtitle': 'Browse our collection of 454+ book summaries',
    'library.filter': 'Filter by category',
    'library.sort': 'Sort by',
    'library.all': 'All Books',
    'library.search': 'Search books...',
    'library.noResults': 'No books found',
    'library.readMore': 'Read More',
    'library.sortNewest': 'Newest',
    'library.sortPopular': 'Popular',
    'library.sortTitle': 'Title A-Z',
    'library.booksCount': 'books',

    // Categories
    'categories.title': 'Browse by Category',
    'categories.subtitle': 'Explore books organized by topic',
    'categories.books': 'books',

    // Book Detail
    'book.summary': 'Summary',
    'book.chapters': 'Key Chapters',
    'book.insights': 'Key Insights',
    'book.quotes': 'Notable Quotes',
    'book.actionItems': 'Action Items',
    'book.aboutAuthor': 'About the Author',
    'book.readNow': 'Read Now',
    'book.listenNow': 'Listen Now',
    'book.buyAmazon': 'Buy on Amazon',
    'book.premium': 'Premium Only',
    'book.loginToRead': 'Login to read more',
    'book.freeRemaining': 'Free summaries remaining this month',
    'book.by': 'by',
    'book.minRead': 'min read',
    'book.addToFavorites': 'Add to Favorites',
    'book.removeFromFavorites': 'Remove from Favorites',
    'book.share': 'Share',
    'book.backToLibrary': 'Back to Library',

    // Pricing
    'pricing.title': 'Simple, Transparent Pricing',
    'pricing.subtitle': 'Choose the plan that works for you',
    'pricing.free': 'Free',
    'pricing.freePrice': '$0',
    'pricing.freePeriod': '/month',
    'pricing.freeFeatures': '3 book summaries/month, Basic features',
    'pricing.premium': 'Premium',
    'pricing.premiumPrice': '$9.99',
    'pricing.premiumPeriod': '/month',
    'pricing.premiumFeatures': 'Unlimited access, Audio summaries, Offline reading, Priority support',
    'pricing.getStarted': 'Get Started',
    'pricing.current': 'Current Plan',
    'pricing.feature.unlimited': 'Unlimited summaries',
    'pricing.feature.audio': 'Audio narrations',
    'pricing.feature.offline': 'Offline reading',
    'pricing.feature.priority': 'Priority support',
    'pricing.feature.noAds': 'No ads',

    // Auth
    'auth.loginTitle': 'Welcome Back',
    'auth.loginSubtitle': 'Login to access your account',
    'auth.registerTitle': 'Create Account',
    'auth.registerSubtitle': 'Start your reading journey today',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.firstName': 'First Name',
    'auth.lastName': 'Last Name',
    'auth.loginButton': 'Login',
    'auth.registerButton': 'Create Account',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.noAccount': 'Don\'t have an account?',
    'auth.haveAccount': 'Already have an account?',
    'auth.loginError': 'Invalid email or password',
    'auth.registerError': 'Registration failed',
    'auth.continueWithGoogle': 'Continue with Google',

    // Dashboard
    'dashboard.title': 'My Dashboard',
    'dashboard.welcome': 'Welcome back',
    'dashboard.booksRead': 'Books Read',
    'dashboard.readingTime': 'Reading Time',
    'dashboard.currentStreak': 'Current Streak',
    'dashboard.favorites': 'My Favorites',
    'dashboard.history': 'Reading History',
    'dashboard.subscription': 'Subscription',
    'dashboard.minutes': 'min',
    'dashboard.days': 'days',
    'dashboard.continueReading': 'Continue Reading',
    'dashboard.noFavorites': 'No favorites yet',
    'dashboard.noHistory': 'No reading history yet',

    // Footer
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

    // Common
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.retry': 'Retry',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.close': 'Close',
    'common.minutes': 'min',
    'common.hours': 'hours',
    'common.days': 'days',
    'common.learnMore': 'Learn More',
    'common.viewAll': 'View All',
    'common.featured': 'Featured',
    'common.new': 'New',
    'common.popular': 'Popular',

    // Search
    'search.title': 'Search',
    'search.placeholder': 'Search for books, authors, or categories...',
    'search.noResults': 'No results found',
    'search.resultsFor': 'Results for',

    // Subscription
    'subscription.title': 'Subscription',
    'subscription.upgrade': 'Upgrade to Premium',
    'subscription.cancel': 'Cancel Subscription',
    'subscription.manage': 'Manage Subscription',
    'subscription.success': 'Subscription successful!',
    'subscription.canceled': 'Subscription canceled',
  },
  de: {
    // Navigation
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
    'nav.signOut': 'Abmelden',

    // Hero
    'hero.title': 'Lerne von den besten Büchern der Welt in 15 Minuten',
    'hero.subtitle': 'Zugang zu 450+ kostenlosen KI-gestützten Buchzusammenfassungen. Lies Bestseller aus Wirtschaft, Selbsthilfe, Psychologie und Persönlichkeitsentwicklung.',
    'hero.cta': 'Kostenlos starten',
    'hero.ctaSecondary': 'Bibliothek durchsuchen',
    'hero.stats.books': 'Buchzusammenfassungen',
    'hero.stats.read': 'Durchschnittliche Lesezeit',
    'hero.stats.rating': 'Benutzerbewertung',

    // Features
    'features.title': 'Warum BookDigest?',
    'features.free.title': '100% Kostenlos',
    'features.free.desc': 'Zugang zu Buchzusammenfassungen ohne Kosten. Keine Kreditkarte erforderlich.',
    'features.ai.title': 'KI-gestützt',
    'features.ai.desc': 'Fortgeschrittene KI erstellt umfassende Zusammenfassungen mit wichtigen Erkenntnissen.',
    'features.audio.title': 'Audio verfügbar',
    'features.audio.desc': 'Höre Zusammenfassungen unterwegs mit der Premium-Audiofunktion.',
    'features.quick.title': '15-Minuten-Lektüre',
    'features.quick.desc': 'Erhalte die wichtigsten Ideen aus jedem Buch in nur 15 Minuten.',

    // Library
    'library.title': 'Buchbibliothek',
    'library.subtitle': 'Durchsuche unsere Sammlung von 450+ Buchzusammenfassungen',
    'library.filter': 'Nach Kategorie filtern',
    'library.sort': 'Sortieren nach',
    'library.all': 'Alle Bücher',
    'library.search': 'Bücher suchen...',
    'library.noResults': 'Keine Bücher gefunden',
    'library.readMore': 'Mehr lesen',
    'library.sortNewest': 'Neueste',
    'library.sortPopular': 'Beliebt',
    'library.sortTitle': 'Titel A-Z',
    'library.booksCount': 'Bücher',

    // Categories
    'categories.title': 'Nach Kategorie durchsuchen',
    'categories.subtitle': 'Erkunde Bücher nach Thema',
    'categories.books': 'Bücher',

    // Book Detail
    'book.summary': 'Zusammenfassung',
    'book.chapters': 'Wichtige Kapitel',
    'book.insights': 'Wichtige Erkenntnisse',
    'book.quotes': 'Bemerkenswerte Zitate',
    'book.actionItems': 'Handlungsempfehlungen',
    'book.aboutAuthor': 'Über den Autor',
    'book.readNow': 'Jetzt lesen',
    'book.listenNow': 'Jetzt hören',
    'book.buyAmazon': 'Bei Amazon kaufen',
    'book.premium': 'Nur Premium',
    'book.loginToRead': 'Anmelden um mehr zu lesen',
    'book.freeRemaining': 'Kostenlose Zusammenfassungen diesen Monat',
    'book.by': 'von',
    'book.minRead': 'Min. Lesezeit',
    'book.addToFavorites': 'Zu Favoriten hinzufügen',
    'book.removeFromFavorites': 'Aus Favoriten entfernen',
    'book.share': 'Teilen',
    'book.backToLibrary': 'Zurück zur Bibliothek',

    // Pricing
    'pricing.title': 'Einfache, transparente Preise',
    'pricing.subtitle': 'Wähle den Plan, der zu dir passt',
    'pricing.free': 'Kostenlos',
    'pricing.freePrice': '0€',
    'pricing.freePeriod': '/Monat',
    'pricing.freeFeatures': '3 Buchzusammenfassungen/Monat, Basis-Funktionen',
    'pricing.premium': 'Premium',
    'pricing.premiumPrice': '9,99€',
    'pricing.premiumPeriod': '/Monat',
    'pricing.premiumFeatures': 'Unbegrenzter Zugang, Audio-Zusammenfassungen, Offline-Lesen, Prioritäts-Support',
    'pricing.getStarted': 'Jetzt starten',
    'pricing.current': 'Aktueller Plan',
    'pricing.feature.unlimited': 'Unbegrenzte Zusammenfassungen',
    'pricing.feature.audio': 'Audio-Vorlesungen',
    'pricing.feature.offline': 'Offline-Lesen',
    'pricing.feature.priority': 'Prioritäts-Support',
    'pricing.feature.noAds': 'Keine Werbung',

    // Auth
    'auth.loginTitle': 'Willkommen zurück',
    'auth.loginSubtitle': 'Melde dich an, um auf dein Konto zuzugreifen',
    'auth.registerTitle': 'Konto erstellen',
    'auth.registerSubtitle': 'Beginne heute deine Lesereise',
    'auth.email': 'E-Mail',
    'auth.password': 'Passwort',
    'auth.confirmPassword': 'Passwort bestätigen',
    'auth.firstName': 'Vorname',
    'auth.lastName': 'Nachname',
    'auth.loginButton': 'Anmelden',
    'auth.registerButton': 'Konto erstellen',
    'auth.forgotPassword': 'Passwort vergessen?',
    'auth.noAccount': 'Noch kein Konto?',
    'auth.haveAccount': 'Bereits ein Konto?',
    'auth.loginError': 'Ungültige E-Mail oder Passwort',
    'auth.registerError': 'Registrierung fehlgeschlagen',
    'auth.continueWithGoogle': 'Mit Google fortfahren',

    // Dashboard
    'dashboard.title': 'Mein Dashboard',
    'dashboard.welcome': 'Willkommen zurück',
    'dashboard.booksRead': 'Gelesene Bücher',
    'dashboard.readingTime': 'Lesezeit',
    'dashboard.currentStreak': 'Aktuelle Serie',
    'dashboard.favorites': 'Meine Favoriten',
    'dashboard.history': 'Leseverlauf',
    'dashboard.subscription': 'Abonnement',
    'dashboard.minutes': 'Min',
    'dashboard.days': 'Tage',
    'dashboard.continueReading': 'Weiterlesen',
    'dashboard.noFavorites': 'Noch keine Favoriten',
    'dashboard.noHistory': 'Noch kein Leseverlauf',

    // Footer
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

    // Common
    'common.loading': 'Lädt...',
    'common.error': 'Ein Fehler ist aufgetreten',
    'common.retry': 'Erneut versuchen',
    'common.cancel': 'Abbrechen',
    'common.save': 'Speichern',
    'common.delete': 'Löschen',
    'common.edit': 'Bearbeiten',
    'common.close': 'Schließen',
    'common.minutes': 'Min',
    'common.hours': 'Stunden',
    'common.days': 'Tage',
    'common.learnMore': 'Mehr erfahren',
    'common.viewAll': 'Alle anzeigen',
    'common.featured': 'Empfohlen',
    'common.new': 'Neu',
    'common.popular': 'Beliebt',

    // Search
    'search.title': 'Suche',
    'search.placeholder': 'Suche nach Büchern, Autoren oder Kategorien...',
    'search.noResults': 'Keine Ergebnisse gefunden',
    'search.resultsFor': 'Ergebnisse für',

    // Subscription
    'subscription.title': 'Abonnement',
    'subscription.upgrade': 'Auf Premium upgraden',
    'subscription.cancel': 'Abonnement kündigen',
    'subscription.manage': 'Abonnement verwalten',
    'subscription.success': 'Abonnement erfolgreich!',
    'subscription.canceled': 'Abonnement gekündigt',
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
