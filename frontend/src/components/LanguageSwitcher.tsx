'use client';

import { useLanguage } from './LanguageProvider';
import { Globe } from 'lucide-react';
import { useState, useEffect } from 'react';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'de' : 'en';
    setLanguage(newLang);
    // Use URL param - middleware will handle cookie and redirect
    window.location.href = window.location.pathname + '?lang=' + newLang;
  };

  if (!mounted) {
    return (
      <button className="flex items-center gap-1 px-2 py-1 text-sm">
        <Globe className="w-4 h-4" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
      aria-label={language === 'en' ? 'Switch to German' : 'Auf Englisch wechseln'}
      title={language === 'en' ? 'Deutsch' : 'English'}
    >
      <Globe className="w-4 h-4" />
      <span className="font-medium">{language === 'en' ? 'DE' : 'EN'}</span>
    </button>
  );
}
