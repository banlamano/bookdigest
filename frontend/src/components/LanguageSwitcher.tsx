'use client';

import { useLanguage } from './LanguageProvider';
import { Globe } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'de' : 'en';
    setLanguage(newLang);
    // Reload to apply language change
    router.refresh();
  };

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
