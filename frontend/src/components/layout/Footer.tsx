'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { BookOpen, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export function Footer() {
  const searchParams = useSearchParams();
  const language = searchParams.get('lang') || 'en';
  
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold">BookDigest</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {language === 'de' 
                ? 'Lerne von den besten Büchern der Welt in Minuten. Lies oder höre unterwegs.'
                : 'Learn from the world\'s best books in minutes. Read or listen on the go.'}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{language === 'de' ? 'Produkt' : 'Product'}</h3>
            <ul className="space-y-2">
              <li>
                <Link href={`/library?lang=${language}`} className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                  {language === 'de' ? 'Bibliothek' : 'Library'}
                </Link>
              </li>
              <li>
                <Link href={`/categories?lang=${language}`} className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                  {language === 'de' ? 'Kategorien' : 'Categories'}
                </Link>
              </li>
              <li>
                <Link href={`/pricing?lang=${language}`} className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                  {language === 'de' ? 'Preise' : 'Pricing'}
                </Link>
              </li>
              <li>
                <Link href={`/features?lang=${language}`} className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                  {language === 'de' ? 'Funktionen' : 'Features'}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{language === 'de' ? 'Unternehmen' : 'Company'}</h3>
            <ul className="space-y-2">
              <li>
                <Link href={`/about?lang=${language}`} className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                  {language === 'de' ? 'Über uns' : 'About Us'}
                </Link>
              </li>
              <li>
                <Link href={`/contact?lang=${language}`} className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                  {language === 'de' ? 'Kontakt' : 'Contact'}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{language === 'de' ? 'Rechtliches' : 'Legal'}</h3>
            <ul className="space-y-2">
              <li>
                <Link href={`/privacy?lang=${language}`} className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                  {language === 'de' ? 'Datenschutz' : 'Privacy Policy'}
                </Link>
              </li>
              <li>
                <Link href={`/terms?lang=${language}`} className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                  {language === 'de' ? 'Nutzungsbedingungen' : 'Terms of Service'}
                </Link>
              </li>
              <li>
                <Link href={`/cookies?lang=${language}`} className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                  {language === 'de' ? 'Cookie-Richtlinie' : 'Cookie Policy'}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 space-y-4">
          <div className="flex justify-center">
            <a
              href="https://www.producthunt.com/products/book-digest?utm_source=book-digest.com&utm_medium=badge&utm_campaign=product-hunt"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/60 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:border-primary-300 hover:text-primary-700 dark:hover:text-primary-300 transition"
            >
              <span>Check us out on Product Hunt</span>
              <span className="text-gray-400">→</span>
            </a>
          </div>
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} BookDigest. {language === 'de' ? 'Alle Rechte vorbehalten.' : 'All rights reserved.'}
          </p>
        </div>
      </div>
    </footer>
  );
}
