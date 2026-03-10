import { cookies } from 'next/headers';
import { BookOpen, Headphones, Smartphone, TrendingUp, Award, Globe, Zap, Heart, Clock, Star } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function FeaturesPage() {
  const cookieStore = cookies();
  const language = cookieStore.get('language')?.value || 'en';

  const features = language === 'de' ? [
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: '15-Minuten Zusammenfassungen',
      description: 'Erhalte schnell die wichtigsten Erkenntnisse aus Bestsellern. Perfekt für einen vollen Terminkalender.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: <Headphones className="w-8 h-8" />,
      title: 'Audio-Zusammenfassungen',
      description: 'Höre unterwegs zu. Perfekt für Pendler oder beim Sport.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: 'Mobile App',
      description: 'Lies jederzeit und überall auf deinem Smartphone oder Tablet.',
      color: 'from-green-500 to-teal-500',
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Lese-Fortschritt',
      description: 'Verfolge deinen Lesefortschritt und bleibe motiviert.',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Qualitätsinhalte',
      description: 'Von Experten kuratierte Zusammenfassungen für maximale Qualität.',
      color: 'from-yellow-500 to-amber-500',
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: 'Mehrsprachig',
      description: 'Zusammenfassungen auf Englisch und Deutsch verfügbar.',
      color: 'from-indigo-500 to-violet-500',
    },
  ] : [
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: '15-Minute Summaries',
      description: 'Get the key insights from bestselling books quickly. Perfect for busy schedules.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: <Headphones className="w-8 h-8" />,
      title: 'Audio Summaries',
      description: 'Listen on the go. Perfect for commutes or workouts.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: 'Mobile App',
      description: 'Read anywhere on your smartphone or tablet.',
      color: 'from-green-500 to-teal-500',
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Reading Progress',
      description: 'Track your reading progress and stay motivated.',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Quality Content',
      description: 'Expert-curated summaries for maximum quality.',
      color: 'from-yellow-500 to-amber-500',
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: 'Multilingual',
      description: 'Summaries available in English and German.',
      color: 'from-indigo-500 to-violet-500',
    },
  ];

  const title = language === 'de' ? 'Entdecke unsere Funktionen' : 'Discover Our Features';
  const subtitle = language === 'de' 
    ? 'Alles was du brauchst, um effizient aus Büchern zu lernen'
    : 'Everything you need to learn efficiently from books';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {title}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="card p-8 hover:shadow-xl transition-shadow"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-6`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
