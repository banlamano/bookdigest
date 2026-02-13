import { BookOpen, Headphones, Smartphone, TrendingUp, Award, Globe, Zap, Heart, Clock, Star } from 'lucide-react';

export default function FeaturesPage() {
  const features = [
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: '15-Minute Summaries',
      description: 'Get the key insights from bestselling books quickly. Perfect for busy schedules.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: <Headphones className="w-8 h-8" />,
      title: 'Audio Narration',
      description: 'Listen to professional narrations while commuting, exercising, or doing chores.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: 'Multi-Platform Access',
      description: 'Read on web, iOS, or Android. Your library syncs seamlessly across all devices.',
      color: 'from-green-500 to-teal-500',
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Progress Tracking',
      description: 'Monitor your reading stats, track streaks, and celebrate achievements.',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Expert Curation',
      description: 'Books selected by experts and summarized by professional writers.',
      color: 'from-indigo-500 to-blue-500',
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: 'Multiple Languages',
      description: 'Access summaries in multiple languages to expand your global knowledge.',
      color: 'from-pink-500 to-rose-500',
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Quick Key Insights',
      description: 'Every summary includes 5-7 actionable key insights you can apply immediately.',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Favorites & Collections',
      description: 'Save your favorite books and create custom reading lists for later.',
      color: 'from-red-500 to-pink-500',
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: 'Offline Access',
      description: 'Download summaries and audio to read offline, anytime, anywhere.',
      color: 'from-teal-500 to-green-500',
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: 'Personalized Recommendations',
      description: 'Get book suggestions based on your reading history and interests.',
      color: 'from-violet-500 to-purple-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Everything You Need to Learn Faster
          </h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            Powerful features designed to maximize your learning and help you grow
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="card p-8 hover:shadow-xl transition-all duration-300 group"
            >
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="card p-12 bg-gradient-to-br from-primary-600 to-primary-800 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of learners who are already accelerating their growth with BookDigest
          </p>
          <a href="/register" className="inline-block bg-white text-primary-600 hover:bg-primary-50 px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
            Start Free Trial
          </a>
        </div>
      </div>
    </div>
  );
}
