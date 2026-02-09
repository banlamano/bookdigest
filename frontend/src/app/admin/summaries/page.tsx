'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  summary?: string;
  isPremium: boolean;
}

export default function AdminSummaries() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState<string | null>(null);
  const [selectedBooks, setSelectedBooks] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'missing' | 'has'>('all');

  const adminKey = typeof window !== 'undefined' ? localStorage.getItem('admin_key') : null;

  useEffect(() => {
    if (!adminKey) {
      router.push('/admin/dashboard');
      return;
    }
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin-panel/books?limit=500`,
        {
          headers: { 'X-Admin-Key': adminKey! }
        }
      );

      const data = await response.json();
      if (data.success) {
        setBooks(data.data.books);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasSummary = (book: Book) => {
    return book.summary && book.summary.length > 100;
  };

  const handleRegenerateSingle = async (bookId: string) => {
    if (!confirm('Regenerate summary for this book using AI?')) return;

    try {
      setRegenerating(bookId);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/regenerate/${bookId}`,
        {
          method: 'POST',
          headers: { 'X-Admin-Key': adminKey! }
        }
      );

      if (response.ok) {
        alert('Summary regenerated successfully!');
        fetchBooks();
      } else {
        alert('Failed to regenerate summary');
      }
    } catch (error) {
      console.error('Error regenerating summary:', error);
      alert('Failed to regenerate summary');
    } finally {
      setRegenerating(null);
    }
  };

  const handleRegenerateAll = async () => {
    const booksToRegenerate = filteredBooks.filter(b => selectedBooks.has(b.id));
    
    if (booksToRegenerate.length === 0) {
      alert('No books selected');
      return;
    }

    if (!confirm(`Regenerate summaries for ${booksToRegenerate.length} selected books? This may take several minutes.`)) return;

    try {
      setRegenerating('bulk');
      
      for (const book of booksToRegenerate) {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/regenerate/${book.id}`,
          {
            method: 'POST',
            headers: { 'X-Admin-Key': adminKey! }
          }
        );
      }

      alert(`Successfully regenerated ${booksToRegenerate.length} summaries!`);
      setSelectedBooks(new Set());
      fetchBooks();
    } catch (error) {
      console.error('Error bulk regenerating:', error);
      alert('Failed to regenerate some summaries');
    } finally {
      setRegenerating(null);
    }
  };

  const handleSelectBook = (bookId: string) => {
    const newSelected = new Set(selectedBooks);
    if (newSelected.has(bookId)) {
      newSelected.delete(bookId);
    } else {
      newSelected.add(bookId);
    }
    setSelectedBooks(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedBooks.size === filteredBooks.length) {
      setSelectedBooks(new Set());
    } else {
      setSelectedBooks(new Set(filteredBooks.map(b => b.id)));
    }
  };

  const filteredBooks = books.filter(book => {
    if (filter === 'missing') return !hasSummary(book);
    if (filter === 'has') return hasSummary(book);
    return true;
  });

  const booksWithSummaries = books.filter(hasSummary).length;
  const booksWithoutSummaries = books.length - booksWithSummaries;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">📝 Summary Management</h1>
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
            <h3 className="text-sm text-gray-600 mb-1">With Summaries</h3>
            <p className="text-3xl font-bold text-green-600">{booksWithSummaries}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm text-gray-600 mb-1">Missing Summaries</h3>
            <p className="text-3xl font-bold text-red-600">{booksWithoutSummaries}</p>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Books ({books.length})
              </button>
              <button
                onClick={() => setFilter('missing')}
                className={`px-4 py-2 rounded-lg ${
                  filter === 'missing'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Missing ({booksWithoutSummaries})
              </button>
              <button
                onClick={() => setFilter('has')}
                className={`px-4 py-2 rounded-lg ${
                  filter === 'has'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Has Summary ({booksWithSummaries})
              </button>
            </div>

            {selectedBooks.size > 0 && (
              <button
                onClick={handleRegenerateAll}
                disabled={regenerating === 'bulk'}
                className="ml-auto px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center"
              >
                {regenerating === 'bulk' ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Regenerating...
                  </>
                ) : (
                  `Regenerate Selected (${selectedBooks.size})`
                )}
              </button>
            )}
          </div>
        </div>

        {/* Books Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedBooks.size === filteredBooks.length && filteredBooks.length > 0}
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Summary</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      Loading books...
                    </td>
                  </tr>
                ) : filteredBooks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No books found
                    </td>
                  </tr>
                ) : (
                  filteredBooks.map((book) => (
                    <tr key={book.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedBooks.has(book.id)}
                          onChange={() => handleSelectBook(book.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {book.title}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {book.author}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {book.category}
                      </td>
                      <td className="px-6 py-4">
                        {book.isPremium ? (
                          <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded">
                            Premium
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">
                            Free
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {hasSummary(book) ? (
                          <div className="flex items-center">
                            <span className="text-green-600 mr-2">✓</span>
                            <span className="text-xs text-gray-500">
                              {book.summary!.length} chars
                            </span>
                          </div>
                        ) : (
                          <span className="text-red-600">✗ Missing</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleRegenerateSingle(book.id)}
                          disabled={regenerating === book.id}
                          className="text-sm text-purple-600 hover:text-purple-800 disabled:opacity-50"
                        >
                          {regenerating === book.id ? 'Regenerating...' : 'Regenerate'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Summary Regeneration</p>
              <p>Summaries are generated using AI. Each regeneration takes about 30-60 seconds per book. You can select multiple books and regenerate them in batch.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
