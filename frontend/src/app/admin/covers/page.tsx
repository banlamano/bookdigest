'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Cookies from 'js-cookie';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface Book {
  id: string;
  title: string;
  author: string;
  coverImage: string;
}

export default function AdminCovers() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [newCoverUrl, setNewCoverUrl] = useState('');
  const [regenerating, setRegenerating] = useState(false);

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const { user, isAuthenticated } = useAuthStore.getState();

    // Check if user is logged in and is admin
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'ADMIN') {
      toast.error('Access Denied: Admin privileges required');
      router.push('/dashboard');
      return;
    }

    fetchBooks();
  }, [mounted, search, router]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const authToken = useAuthStore.getState().token || Cookies.get('token');
      
      if (!authToken) {
        router.push('/login');
        return;
      }

      const params = new URLSearchParams({
        limit: '500',
        ...(search && { search })
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin-panel/books?${params}`,
        {
          headers: { 
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      if (response.status === 401) {
        toast.error('Session expired. Please login again.');
        router.push('/login');
        return;
      }

      const data = await response.json();
      if (data.success) {
        setBooks(data.data.books);
      } else {
        toast.error(data.message || 'Failed to load books');
      }
    } catch (error) {
      console.error('Error fetching books:', error);
      toast.error('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCover = async () => {
    if (!selectedBook || !newCoverUrl) return;

    try {
      const authToken = useAuthStore.getState().token || Cookies.get('token');
      
      if (!authToken) {
        router.push('/login');
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin-panel/books/${selectedBook.id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ coverImage: newCoverUrl })
        }
      );

      if (response.ok) {
        alert('Cover updated successfully!');
        setSelectedBook(null);
        setNewCoverUrl('');
        fetchBooks();
      }
    } catch (error) {
      console.error('Error updating cover:', error);
      alert('Failed to update cover');
    }
  };

  const handleRegenerateAICovers = async () => {
    if (!confirm('Regenerate AI covers for books with missing covers? This may take a few minutes.')) return;

    try {
      setRegenerating(true);
      const authToken = useAuthStore.getState().token || Cookies.get('token');
      
      if (!authToken) {
        router.push('/login');
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin-simple/update-covers`,
        {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success(`Successfully updated ${data.data.success} covers!`);
        fetchBooks();
      }
    } catch (error) {
      console.error('Error regenerating covers:', error);
      toast.error('Failed to regenerate covers');
    } finally {
      setRegenerating(false);
    }
  };

  const booksWithMissingCovers = books.filter(
    b => !b.coverImage || b.coverImage.includes('placeholder')
  );

  // Show loading while mounting or loading data
  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">🎨 Cover Management</h1>
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm text-gray-600 mb-1">Total Books</h3>
            <p className="text-3xl font-bold text-gray-900">{books.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm text-gray-600 mb-1">With Covers</h3>
            <p className="text-3xl font-bold text-green-600">
              {books.length - booksWithMissingCovers.length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm text-gray-600 mb-1">Missing Covers</h3>
            <p className="text-3xl font-bold text-red-600">
              {booksWithMissingCovers.length}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleRegenerateAICovers}
              disabled={regenerating}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center"
            >
              {regenerating ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Regenerating...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Regenerate AI Covers
                </>
              )}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <input
            type="text"
            placeholder="Search books..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              Loading books...
            </div>
          ) : books.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              No books found
            </div>
          ) : (
            books.map((book) => (
              <div
                key={book.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  setSelectedBook(book);
                  setNewCoverUrl(book.coverImage);
                }}
              >
                <div className="aspect-[2/3] relative bg-gray-100">
                  <Image
                    src={book.coverImage || '/placeholder-book.svg'}
                    alt={book.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  {(!book.coverImage || book.coverImage.includes('placeholder')) && (
                    <div className="absolute inset-0 bg-red-500 bg-opacity-20 flex items-center justify-center">
                      <span className="text-red-600 font-bold">Missing</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm text-gray-900 truncate">
                    {book.title}
                  </h3>
                  <p className="text-xs text-gray-500 truncate">{book.author}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Edit Cover Modal */}
      {selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Update Cover</h2>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Book:</strong> {selectedBook.title}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                <strong>Author:</strong> {selectedBook.author}
              </p>
            </div>

            <div className="mb-4">
              <div className="aspect-[2/3] w-48 mx-auto relative bg-gray-100 rounded mb-4">
                <Image
                  src={newCoverUrl || '/placeholder-book.svg'}
                  alt="Preview"
                  fill
                  className="object-cover rounded"
                  unoptimized
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Image URL
              </label>
              <input
                type="text"
                value={newCoverUrl}
                onChange={(e) => setNewCoverUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="https://example.com/cover.jpg"
              />
              <p className="mt-2 text-xs text-gray-500">
                For AI covers, use: /ai-covers/{selectedBook.id}.svg
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setSelectedBook(null);
                  setNewCoverUrl('');
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateCover}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update Cover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
