'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { BookOpen, Search, Menu, X, Sun, Moon, User, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
    setIsProfileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg group-hover:shadow-glow transition-shadow">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-400 dark:to-primary-600 bg-clip-text text-transparent">
              BookDigest
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/library" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              Library
            </Link>
            <Link href="/categories" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              Categories
            </Link>
            <Link href="/pricing" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              Pricing
            </Link>
            <Link href="/search" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
              <Search className="w-5 h-5" />
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                )}
              </button>
            )}

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.firstName?.[0] || user?.email?.[0].toUpperCase()}
                    </span>
                  </div>
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2">
                    <Link
                      href="/dashboard"
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Login
                </Link>
                <Link href="/register" className="btn-primary">
                  Start Free Trial
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="px-4 py-4 space-y-3">
            <Link href="/library" className="block py-2 text-gray-700 dark:text-gray-300">
              Library
            </Link>
            <Link href="/categories" className="block py-2 text-gray-700 dark:text-gray-300">
              Categories
            </Link>
            <Link href="/pricing" className="block py-2 text-gray-700 dark:text-gray-300">
              Pricing
            </Link>
            <Link href="/search" className="block py-2 text-gray-700 dark:text-gray-300">
              Search
            </Link>
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="block py-2 text-gray-700 dark:text-gray-300">
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="block py-2 text-gray-700 dark:text-gray-300 w-full text-left">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block py-2 text-gray-700 dark:text-gray-300">
                  Login
                </Link>
                <Link href="/register" className="btn-primary block text-center">
                  Start Free Trial
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
