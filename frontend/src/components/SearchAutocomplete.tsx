'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search, X, Loader2 } from 'lucide-react';
import { booksAPI } from '@/lib/api';
import { useLanguage } from '@/components/LanguageProvider';
import { generateBookSlug } from '@/lib/slugs';

type Suggestion = {
  id: string;
  title: string;
  author: string;
  slug?: string;
  language?: string;
  coverImage?: string;
};

type Variant = 'navbar' | 'page';

interface Props {
  variant?: Variant;
  autoFocus?: boolean;
  initialQuery?: string;
  onSelect?: () => void;
}

const DEBOUNCE_MS = 180;
const MIN_CHARS = 2;
const MAX_SUGGESTIONS = 6;

function highlight(text: string, query: string) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="font-semibold text-primary-600 dark:text-primary-400">
        {text.slice(idx, idx + query.length)}
      </span>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function SearchAutocomplete({
  variant = 'page',
  autoFocus = false,
  initialQuery = '',
  onSelect,
}: Props) {
  const { t } = useLanguage();
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < MIN_CHARS) {
      setSuggestions([]);
      setLoading(false);
      abortRef.current?.abort();
      return;
    }

    debounceRef.current = setTimeout(async () => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      setLoading(true);
      try {
        const res = await booksAPI.search(query.trim(), {
          page: 1,
          limit: MAX_SUGGESTIONS,
        });
        if (ac.signal.aborted) return;
        const list: Suggestion[] = res?.data?.data?.books ?? [];
        setSuggestions(list);
        setActiveIndex(-1);
      } catch (err: any) {
        if (err?.name === 'CanceledError' || ac.signal.aborted) return;
        setSuggestions([]);
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function goToBook(s: Suggestion) {
    const slug = s.slug || generateBookSlug(s.title, s.author);
    setOpen(false);
    setQuery('');
    onSelect?.();
    router.push(`/books/${slug}`);
  }

  function goToFullSearch() {
    if (!query.trim()) return;
    setOpen(false);
    onSelect?.();
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        goToBook(suggestions[activeIndex]);
      } else {
        goToFullSearch();
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  const showDropdown =
    open && query.trim().length >= MIN_CHARS && (loading || suggestions.length > 0 || !loading);

  const inputClass =
    variant === 'navbar'
      ? 'w-full pl-10 pr-9 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent'
      : 'w-full pl-12 pr-12 py-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg';

  const iconClass =
    variant === 'navbar'
      ? 'absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4'
      : 'absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5';

  const clearIconClass =
    variant === 'navbar'
      ? 'absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1'
      : 'absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600';

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <Search className={iconClass} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={t('search.placeholder')}
          className={inputClass}
          aria-autocomplete="list"
          aria-expanded={showDropdown}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSuggestions([]);
              inputRef.current?.focus();
            }}
            className={clearIconClass}
            aria-label="Clear"
          >
            <X className={variant === 'navbar' ? 'w-4 h-4' : 'w-5 h-5'} />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute left-0 right-0 mt-2 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden">
          {loading && suggestions.length === 0 && (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('search.startTyping')}
            </div>
          )}

          {!loading && suggestions.length === 0 && query.trim().length >= MIN_CHARS && (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              {t('search.noBooksFound').replace('{query}', query.trim())}
            </div>
          )}

          {suggestions.length > 0 && (
            <ul className="max-h-96 overflow-y-auto" role="listbox">
              {suggestions.map((s, i) => {
                const slug = s.slug || generateBookSlug(s.title, s.author);
                const active = i === activeIndex;
                return (
                  <li key={s.id} role="option" aria-selected={active}>
                    <Link
                      href={`/books/${slug}`}
                      onClick={() => {
                        setOpen(false);
                        setQuery('');
                        onSelect?.();
                      }}
                      onMouseEnter={() => setActiveIndex(i)}
                      className={`flex items-center gap-3 px-3 py-2 transition-colors ${
                        active
                          ? 'bg-primary-50 dark:bg-gray-700'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="relative flex-shrink-0 w-10 h-14 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                        {s.coverImage && (
                          <Image
                            src={s.coverImage}
                            alt=""
                            fill
                            sizes="40px"
                            className="object-cover"
                            unoptimized
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm text-gray-900 dark:text-white truncate">
                          {highlight(s.title, query.trim())}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {s.author}
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          {suggestions.length > 0 && (
            <button
              type="button"
              onClick={goToFullSearch}
              className="w-full text-left px-4 py-2.5 text-sm border-t border-gray-100 dark:border-gray-700 text-primary-600 dark:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
            >
              {t('search.seeAll').replace('{query}', query.trim())}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
