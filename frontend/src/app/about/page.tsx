import { BookOpen, Users, Target, Award } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About BookDigest</h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            Your gateway to learning from the world's best books in minutes
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Our Mission
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We believe that everyone should have access to the wisdom contained in the world's best books. 
              However, we also understand that time is precious, and not everyone has hours to dedicate to reading full books.
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              That's why we created BookDigest - to distill the essential insights from bestselling books into 
              concise summaries that you can read or listen to on the go.
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Our goal is to help you learn faster, grow continuously, and achieve your personal and professional goals 
              through the power of condensed knowledge.
            </p>
          </div>
          <div className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-800 dark:to-gray-800 rounded-xl p-8">
            <BookOpen className="w-16 h-16 text-primary-600 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              500+ Books
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Carefully selected and summarized by our expert team
            </p>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            Our Values
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card p-6 text-center">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Quality First
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Every summary is crafted with care to capture the essence of the original work
              </p>
            </div>

            <div className="card p-6 text-center">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                User-Centric
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                We design every feature with your learning experience in mind
              </p>
            </div>

            <div className="card p-6 text-center">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Excellence
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                We constantly improve our platform to provide the best learning experience
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-8">BookDigest by the Numbers</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-primary-100">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-primary-100">Book Summaries</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">5–10min</div>
              <div className="text-primary-100">Average Read Time</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">4.8★</div>
              <div className="text-primary-100">User Rating</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
