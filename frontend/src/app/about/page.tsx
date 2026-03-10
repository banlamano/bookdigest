import { cookies } from 'next/headers';
import { BookOpen, Users, Target, Award } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AboutPage() {
  const cookieStore = cookies();
  const language = cookieStore.get('language')?.value || 'en';

  const isDe = language === 'de';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {isDe ? 'Über BookDigest' : 'About BookDigest'}
          </h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            {isDe 
              ? 'Dein Tor zum Lernen von den besten Büchern der Welt in Minuten'
              : 'Your gateway to learning from the world\'s best books in minutes'}
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {isDe ? 'Unsere Mission' : 'Our Mission'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {isDe 
                ? 'Wir glauben, dass jeder Zugang zu der in den besten Büchern der Welt enthaltenen Weisheit haben sollte. Aber wir wissen auch, dass Zeit kostbar ist, und nicht jeder Stunden hat, um ganze Bücher zu lesen.'
                : 'We believe that everyone should have access to the wisdom contained in the world\'s best books. However, we also understand that time is precious, and not everyone has hours to dedicate to reading full books.'}
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {isDe 
                ? 'Deshalb haben wir BookDigest erstellt - um die wesentlichen Erkenntnisse aus Bestsellern in prägnante Zusammenfassungen zu destillieren, die du unterwegs lesen oder hören kannst.'
                : 'That\'s why we created BookDigest - to distill the essential insights from bestselling books into concise summaries that you can read or listen to on the go.'}
            </p>
          </div>
          <div className="flex justify-center">
            <div className="w-64 h-64 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <BookOpen className="w-32 h-32 text-white" />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">500+</div>
            <div className="text-gray-600 dark:text-gray-400">{isDe ? 'Buchzusammenfassungen' : 'Book Summaries'}</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">10K+</div>
            <div className="text-gray-600 dark:text-gray-400">{isDe ? 'Nutzer' : 'Active Users'}</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">4.8★</div>
            <div className="text-gray-600 dark:text-gray-400">{isDe ? 'Bewertung' : 'User Rating'}</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">15min</div>
            <div className="text-gray-600 dark:text-gray-400">{isDe ? 'Durchschn. Zeit' : 'Avg. Read Time'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
