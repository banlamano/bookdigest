import { cookies } from 'next/headers';
import { categoriesAPI } from '@/lib/api';
import Link from 'next/link';
import { BookOpen, TrendingUp, Brain, Zap, Users, DollarSign, Award, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const iconMap: { [key: string]: any } = {
  briefcase: BookOpen,
  heart: Heart,
  brain: Brain,
  zap: Zap,
  users: Users,
  'dollar-sign': DollarSign,
  book: Award,
  'heart-pulse': Heart,
};

export default async function CategoriesPage() {
  const cookieStore = cookies();
  const language = cookieStore.get('language')?.value || 'en';
  
  const { data } = await categoriesAPI.getAll();
  const categories = data?.data?.categories || [];

  const title = language === 'de' ? 'Nach Kategorie durchsuchen' : 'Browse by Category';
  const subtitle = language === 'de' ? 'Erkunde Bücher nach Thema' : 'Explore books organized by topic';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{title}</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category: any, index: number) => (
            <Link key={category.id} href={`/categories/${category.slug}`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{category.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {language === 'de' ? `${category.bookCount || 0} Bücher` : `${category.bookCount || 0} books`}
                    </p>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
