'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';

interface Book {
  id: number;
  title: string;
  author: string;
  coverImage: string | null;
  category: { name: string };
}

export default function AdminCoversPage() {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'broken' | 'good'>('broken');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [newCoverUrl, setNewCoverUrl] = useState('');
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Check if user is admin (you can add a role check here)
    fetchBooks();
  }, [isAuthenticated, router]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/books?limit=1000`);
      const bookData = response.data.data.books;
      setBooks(bookData);
      applyFilters(bookData, filter, searchTerm);
    } catch (error) {
      console.error('Error fetching books:', error);
      setMessage('Error loading books');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (bookData: Book[], filterType: string, search: string) => {
    let filtered = bookData;

    // Apply broken/good filter
    if (filterType === 'broken') {
      filtered = filtered.filter(
        (book) =>
          !book.coverImage ||
          book.coverImage.includes('openlibrary.org') ||
          book.coverImage.includes('placeholder')
      );
    } else if (filterType === 'good') {
      filtered = filtered.filter(
        (book) =>
          book.coverImage &&
          !book.coverImage.includes('openlibrary.org') &&
          !book.coverImage.includes('placeholder')
      );
    }

    // Apply search filter
    if (search) {
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(search.toLowerCase()) ||
          book.author.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredBooks(filtered);
  };

  const handleFilterChange = (newFilter: 'all' | 'broken' | 'good') => {
    setFilter(newFilter);
    applyFilters(books, newFilter, searchTerm);
  };

  const handleSearchChange = (search: string) => {
    setSearchTerm(search);
    applyFilters(books, filter, search);
  };

  const handleSelectBook = (book: Book) => {
    setSelectedBook(book);
    setNewCoverUrl(book.coverImage || '');
    setMessage('');
  };

  const handleUpdateCover = async () => {
    if (!selectedBook || !newCoverUrl.trim()) {
      setMessage('Please enter a cover URL');
      return;
    }

    try {
      setUpdating(true);
      setMessage('');

      // Update via API
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/books/${selectedBook.id}`,
        { coverImage: newCoverUrl.trim() }
      );

      setMessage('✅ Cover updated successfully!');
      
      // Refresh books
      await fetchBooks();
      
      // Clear selection after 2 seconds
      setTimeout(() => {
        setSelectedBook(null);
        setNewCoverUrl('');
        setMessage('');
      }, 2000);
      
    } catch (error) {
      console.error('Error updating cover:', error);
      setMessage('❌ Error updating cover. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const isBroken = (book: Book) => {
    return (
      !book.coverImage ||
      book.coverImage.includes('openlibrary.org') ||
      book.coverImage.includes('placeholder')
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading books...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Book Cover Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Update book covers for books with missing or broken images
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {books.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Books</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">
              {books.filter((b) => !isBroken(b)).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Good Covers</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-red-600">
              {books.filter((b) => isBroken(b)).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Broken Covers</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Filter buttons */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleFilterChange('all')}
                  className={`px-4 py-2 rounded-lg ${
                    filter === 'all'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  All ({books.length})
                </button>
                <button
                  onClick={() => handleFilterChange('broken')}
                  className={`px-4 py-2 rounded-lg ${
                    filter === 'broken'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Broken ({books.filter((b) => isBroken(b)).length})
                </button>
                <button
                  onClick={() => handleFilterChange('good')}
                  className={`px-4 py-2 rounded-lg ${
                    filter === 'good'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Good ({books.filter((b) => !isBroken(b)).length})
                </button>
              </div>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search by title or author..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Book List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Books ({filteredBooks.length})
            </h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredBooks.map((book) => (
                <div
                  key={book.id}
                  onClick={() => handleSelectBook(book)}
                  className={`p-4 rounded-lg cursor-pointer transition-colors ${
                    selectedBook?.id === book.id
                      ? 'bg-primary-100 dark:bg-primary-900 border-2 border-primary-500'
                      : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Status indicator */}
                    <div
                      className={`w-3 h-3 rounded-full ${
                        isBroken(book) ? 'bg-red-500' : 'bg-green-500'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white truncate">
                        {book.title}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {book.author}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">ID: {book.id}</div>
                  </div>
                </div>
              ))}
              {filteredBooks.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No books found
                </div>
              )}
            </div>
          </div>

          {/* Update Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Update Cover
            </h2>

            {selectedBook ? (
              <div className="space-y-4">
                {/* Book Info */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="font-medium text-gray-900 dark:text-white mb-1">
                    {selectedBook.title}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    by {selectedBook.author}
                  </div>
                  <div className="text-xs text-gray-500">
                    ID: {selectedBook.id} | Category: {selectedBook.category.name}
                  </div>
                </div>

                {/* Current Cover Preview */}
                {selectedBook.coverImage && !isBroken(selectedBook) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Cover
                    </label>
                    <img
                      src={selectedBook.coverImage}
                      alt={selectedBook.title}
                      className="w-32 h-48 object-cover rounded-lg"
                    />
                  </div>
                )}

                {/* Cover URL Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Cover URL
                  </label>
                  <input
                    type="url"
                    value={newCoverUrl}
                    onChange={(e) => setNewCoverUrl(e.target.value)}
                    placeholder="https://example.com/cover.jpg"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Paste the URL of the new cover image
                  </p>
                </div>

                {/* Preview new cover */}
                {newCoverUrl && newCoverUrl.startsWith('http') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Preview
                    </label>
                    <img
                      src={newCoverUrl}
                      alt="Preview"
                      className="w-32 h-48 object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-book.svg';
                      }}
                    />
                  </div>
                )}

                {/* Message */}
                {message && (
                  <div
                    className={`p-3 rounded-lg ${
                      message.startsWith('✅')
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                    }`}
                  >
                    {message}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleUpdateCover}
                    disabled={updating || !newCoverUrl.trim()}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    {updating ? 'Updating...' : 'Update Cover'}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedBook(null);
                      setNewCoverUrl('');
                      setMessage('');
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>

                {/* Help Text */}
                <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 text-sm text-blue-800 dark:text-blue-200">
                  <div className="font-medium mb-2">💡 Where to find cover images:</div>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Google: Search "{selectedBook.title} book cover"</li>
                    <li>Amazon: Right-click cover and copy image address</li>
                    <li>Upload to ImgBB.com for free hosting</li>
                    <li>Use Goodreads cover images</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <svg
                  className="w-16 h-16 mx-auto mb-4 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p>Select a book from the list to update its cover</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
