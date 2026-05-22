'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';

type Language = 'en' | 'de';

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.library': 'Library',
    'nav.categories': 'Categories',
    'nav.pricing': 'Pricing',
    'nav.features': 'Features',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.login': 'Login',
    'nav.register': 'Sign Up',
    'nav.dashboard': 'Dashboard',
    'nav.logout': 'Logout',
    'nav.search': 'Search books...',
    'nav.signOut': 'Sign Out',

    // Hero
    'hero.title': 'Learn from the World\'s Best Books in 15 Minutes',
    'hero.subtitle': 'Access 450+ free AI-powered book summaries. Read bestselling business, self-help, psychology & personal development books quickly.',
    'hero.cta': 'Start Free Trial',
    'hero.ctaSecondary': 'Browse Library',
    'hero.stats.books': 'Book Summaries',
    'hero.stats.booksValue': '450+',
    'hero.stats.read': 'Average Read',
    'hero.stats.readValue': '5–10min',
    'hero.stats.rating': 'User Rating',
    'hero.stats.ratingValue': '4.8★',

    // Features
    'features.title': 'Why Choose BookDigest?',
    'features.free.title': '100% Free',
    'features.free.desc': 'Access book summaries at no cost. No credit card required.',
    'features.ai.title': 'AI-Powered',
    'features.ai.desc': 'Advanced AI generates comprehensive summaries with key insights.',
    'features.audio.title': 'Audio Available',
    'features.audio.desc': 'Listen to summaries on the go with premium audio feature.',
    'features.quick.title': '15-Minute Reads',
    'features.quick.desc': 'Get the key ideas from any book in just 15 minutes.',

    // Library
    'library.title': 'Book Library',
    'library.subtitle': 'Browse our collection of 450+ book summaries',
    'library.filter': 'Filter by category',
    'library.sort': 'Sort by',
    'library.all': 'All Books',
    'library.search': 'Search books...',
    'library.noResults': 'No books found',
    'library.readMore': 'Read More',
    'library.sortNewest': 'Newest',
    'library.sortPopular': 'Popular',
    'library.sortTitle': 'Title A-Z',
    'library.booksCount': 'books',

    // Categories
    'categories.title': 'Browse by Category',
    'categories.subtitle': 'Explore books organized by topic',
    'categories.books': 'books',

    // Book Detail
    'book.summary': 'Summary',
    'book.chapters': 'Key Chapters',
    'book.insights': 'Key Insights',
    'book.quotes': 'Notable Quotes',
    'book.actionItems': 'Action Items',
    'book.aboutAuthor': 'About the Author',
    'book.readNow': 'Read Now',
    'book.listenNow': 'Listen Now',
    'book.buyAmazon': 'Buy on Amazon',
    'book.premium': 'Premium Only',
    'book.loginToRead': 'Login to read more',
    'book.freeRemaining': 'Free summaries remaining this month',
    'book.by': 'by',
    'book.minRead': 'min read',
    'book.addToFavorites': 'Add to Favorites',
    'book.removeFromFavorites': 'Remove from Favorites',
    'book.share': 'Share',
    'book.backToLibrary': 'Back to Library',

    // Auth
    'auth.loginTitle': 'Welcome Back',
    'auth.loginSubtitle': 'Login to access your account',
    'auth.registerTitle': 'Create Account',
    'auth.registerSubtitle': 'Start your reading journey today',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.firstName': 'First Name',
    'auth.lastName': 'Last Name',
    'auth.loginButton': 'Login',
    'auth.registerButton': 'Create Account',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.noAccount': 'Don\'t have an account?',
    'auth.haveAccount': 'Already have an account?',
    'auth.loginError': 'Invalid email or password',
    'auth.registerError': 'Registration failed',
    'auth.continueWithGoogle': 'Continue with Google',

    // Footer
    'footer.description': 'Learn from the world\'s best books in minutes. Read or listen on the go.',
    'footer.product': 'Product',
    'footer.company': 'Company',
    'footer.legal': 'Legal',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    'footer.cookies': 'Cookie Policy',
    'footer.contact': 'Contact Us',
    'footer.productHunt': 'Check us out on Product Hunt',
    'footer.about': 'About Us',
    'footer.allRights': 'All rights reserved.',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.retry': 'Retry',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.close': 'Close',
    'common.minutes': 'min',
    'common.hours': 'hours',
    'common.days': 'days',
    'common.learnMore': 'Learn More',
    'common.viewAll': 'View All',
    'common.featured': 'Featured',
    'common.new': 'New',
    'common.popular': 'Popular',

    // Featured section
    'featured.title': 'Featured Summaries',
    'featured.subtitle': 'Start with our most popular book summaries',

    // Features section
    'featuresSection.title': 'Everything you need to learn faster',
    'featuresSection.subtitle': 'Powerful features designed to help you get the most out of your reading time',
    'featuresSection.expertSummaries': 'Expert Summaries',
    'featuresSection.expertDesc': 'Professionally written summaries that capture the essence of each book.',
    'featuresSection.audioExperience': 'Audio Experience',
    'featuresSection.audioDesc': 'Listen to summaries with professional narration while commuting or exercising.',
    'featuresSection.multiPlatform': 'Multi-Platform',
    'featuresSection.multiDesc': 'Access your library on web, iOS, and Android. Sync across all devices.',
    'featuresSection.multipleLanguages': 'Multiple Languages',
    'featuresSection.langDesc': 'Summaries available in multiple languages to reach a global audience.',
    'featuresSection.trackProgress': 'Track Progress',
    'featuresSection.trackDesc': 'Monitor your reading stats, streaks, and achievements.',
    'featuresSection.personalized': 'Personalized',
    'featuresSection.personalDesc': 'Get recommendations based on your interests and reading history.',

    // Testimonials
    'testimonials.title': 'Loved by thousands of learners',
    'testimonials.subtitle': 'See what our community has to say',
    'testimonials.sarah': 'BookDigest has transformed how I learn. I can now finish a book in my lunch break and apply the insights immediately to my business.',
    'testimonials.michael': 'The audio feature is a game-changer. I listen during my commute and have learned more in the past 3 months than the entire last year.',
    'testimonials.emma': 'Amazing platform! The summaries are incredibly well-written and the key insights are exactly what I need for professional growth.',
    'testimonials.name1': 'Sarah Johnson',
    'testimonials.name2': 'Michael Chen',
    'testimonials.name3': 'Emma Williams',
    'testimonials.role1': 'Entrepreneur',
    'testimonials.role2': 'Software Engineer',
    'testimonials.role3': 'Marketing Manager',

    // CTA Section
    'cta.title': 'Start your learning journey today',
    'cta.subtitle': 'Join thousands of learners who are already accelerating their growth with BookDigest',
    'cta.startTrial': 'Start Free Trial',
    'cta.viewPricing': 'View Pricing',
    'cta.trialFeature1': '7-day free trial',
    'cta.trialFeature2': 'No credit card required',
    'cta.trialFeature3': 'Cancel anytime',

    // Search
    'search.title': 'Search Books',
    'search.subtitle': 'Find the perfect book summary for your needs',
    'search.placeholder': 'Search by title, author, or topic...',
    'search.noResults': 'No results found',
    'search.resultsFor': 'Results for',
    'search.startTyping': 'Start typing to search for books...',
    'search.noBooksFound': 'No books found for "{query}"',
    'search.clearSearch': 'Clear Search',
    'search.resultsCount': 'Found {count} results for "{query}"',
    'search.resultsCountSingle': 'Found 1 result for "{query}"',

    // Categories page
    'categories.browseByCategory': 'Browse by Category',
    'categories.exploreSubtitle': 'Explore book summaries organized by topic. Find the perfect books to expand your knowledge.',
    'categories.viewBooks': 'View Books →',
    'categories.explore': 'Explore',
    'categories.categories': 'Categories',
    'categories.bookSummaries': 'Book Summaries',
    'categories.avgReadingTime': 'Avg. Reading Time',

    // Freemium & Login Gate
    'freemium.freeTierUsage': 'Free Tier Usage',
    'freemium.remainingText': '{remaining} of {limit} books remaining this month',
    'freemium.usedTotal': '{used} used • {limit} total',
    'freemium.limitReached': '⚠️ You\'ve reached your monthly limit. Upgrade to Premium for unlimited access!',
    'freemium.oneLeft': '⚡ Only 1 book left this month! Upgrade for unlimited reading.',
    'freemium.wantUnlimited': 'Want unlimited access? Upgrade to Premium!',
    'freemium.upgradeToPremium': 'Upgrade to Premium',
    'freemium.viewPremiumPlans': 'View Premium Plans',
    'freemium.seePremiumBenefits': 'See Premium Benefits',
    'freemium.premiumMember': 'Premium Member',
    'freemium.unlimitedAccess': 'Unlimited book access + Audio narration',
    'freemium.monthlyLimitReached': 'Monthly Limit Reached',
    'freemium.freePlan': 'Free Plan',
    'freemium.booksReadText': '{read} of {limit} books read this month',
    'freemium.remaining': 'remaining',
    'freemium.upgradeToKeepReading': 'You\'ve reached your monthly limit. Upgrade to keep reading!',
    'freemium.upgradeForUnlimited': 'Upgrade to Premium for unlimited books + audio narration',

    'loginGate.signInToRead': 'Sign In to Read',
    'loginGate.createFreeAccountToAccess': 'Create a free account to access this book summary and 2 more this month!',
    'loginGate.freeAccountIncludes': 'Free Account Includes:',
    'loginGate.feature1': '3 book summaries per month',
    'loginGate.feature2': 'Key insights & action items',
    'loginGate.feature3': 'Bookmark your favorite books',
    'loginGate.feature4': 'Track your reading progress',
    'loginGate.createFreeAccount': 'Create Free Account',
    'loginGate.signIn': 'Sign In',
    'loginGate.noCreditCard': 'No credit card required • Cancel anytime',
    'loginGate.wantUnlimited': 'Want unlimited access?',
    'loginGate.viewPremiumPlansLink': 'View Premium Plans →',

    // Category detail
    'categoryDetail.backToCategories': 'Back to Categories',
    'categoryDetail.booksInCategory': 'book in this category',
    'categoryDetail.booksInCategoryPlural': 'books in this category',
    'categoryDetail.noBooksFound': 'No books found in this category yet.',
    'categoryDetail.browseAll': 'Browse All Books',
    'categoryDetail.previous': 'Previous',
    'categoryDetail.next': 'Next',
    'categoryDetail.page': 'Page',
    'categoryDetail.of': 'of',

    // Dashboard
    'dashboard.welcome': 'Welcome back, {name}!',
    'dashboard.reader': 'Reader',
    'dashboard.continueJourney': 'Continue your learning journey',
    'dashboard.booksRead': 'Books Read',
    'dashboard.readingTime': 'Reading Time',
    'dashboard.currentStreak': 'Current Streak',
    'dashboard.days': 'days',
    'dashboard.hours': 'h',
    'dashboard.achievements': 'Achievements',
    'dashboard.favorites': 'Your Favorites',

    // Subscription Card
    'subscriptionCard.premiumPlan': 'Premium Plan',
    'subscriptionCard.freePlan': 'Free Plan',
    'subscriptionCard.active': 'Active',
    'subscriptionCard.activeCanceling': 'Active (Canceling)',
    'subscriptionCard.renewsOn': 'Renews on',
    'subscriptionCard.expiresOn': 'Expires on',
    'subscriptionCard.paymentMethod': 'Payment Method',
    'subscriptionCard.cardOnFile': 'Card on file',
    'subscriptionCard.premiumBenefits': 'Your Premium Benefits:',
    'subscriptionCard.unlimitedSummaries': 'Unlimited book summaries',
    'subscriptionCard.fullAudio': 'Full audio narration',
    'subscriptionCard.offlineDownloads': 'Offline downloads',
    'subscriptionCard.adFree': 'Ad-free experience',
    'subscriptionCard.cancelWarning': 'Your subscription will be canceled on {date}. You\'ll still have access until then.',
    'subscriptionCard.cancelSure': 'Are you sure? You\'ll lose access to premium features.',
    'subscriptionCard.cancelButton': 'Yes, Cancel',
    'subscriptionCard.canceling': 'Canceling...',
    'subscriptionCard.keepPremium': 'Keep Premium',
    'subscriptionCard.cancelSubscription': 'Cancel Subscription',
    'subscriptionCard.upgradePrompt': 'Upgrade to Premium to unlock unlimited book summaries, audio narration, and more!',
    'subscriptionCard.upgradeButton': 'Upgrade to Premium',
    'subscriptionCard.freeIncludes': 'Free Plan Includes:',
    'subscriptionCard.threeSummaries': '3 book summaries per month',
    'subscriptionCard.basicFeatures': 'Basic reading features',
    'subscriptionCard.limitedAudio': 'Limited audio access',
    'subscriptionCard.cancelSuccess': 'Subscription will be canceled at the end of the billing period',

    // Book card
    'bookCard.premium': 'Premium',
    'bookCard.minRead': 'min read',

    // Book Detail
    'bookDetail.chapter': 'Chapter',
    'bookDetail.loadingDetails': 'Loading book details...',
    'bookDetail.backToLibrary': 'Back to Library',
    'bookDetail.quickRead': 'Quick read',
    'bookDetail.audioAvailable': 'Audio available',
    'bookDetail.audioPremium': 'Audio (Premium)',
    'bookDetail.startReading': 'Start Reading',
    'audio.title': 'Audio Narration',
    'audio.subtitle': 'AI-powered text-to-speech',
    'audio.pressPlay': 'Press play to listen to the AI narration of this book summary',
    'bookDetail.buyFullBook': 'Buy Full Book',
    'bookDetail.bookNotFound': 'Book not found',
    'bookDetail.somethingWrong': 'Something went wrong',
    'bookDetail.loginToFavorite': 'Please login to add favorites',
    'bookDetail.updatedFavorites': 'Updated favorites',

    // Book Content
    'bookContent.summary': 'Summary',
    'bookContent.keyInsights': 'Key Insights',
    'bookContent.quotes': 'Memorable Quotes',
    'bookContent.chapters': 'Chapter Breakdown',
    'bookContent.actionItems': 'Action Items',
    'bookContent.tip': 'Tip',
    'bookContent.tipDesc': 'Click on any action item to mark it as complete!',

    // Premium Prompt
    'premiumPrompt.title': '{feature} is a Premium Feature',
    'premiumPrompt.defaultDesc': 'Upgrade to Premium to unlock {feature} and enjoy unlimited book summaries.',
    'premiumPrompt.upgrade': 'Upgrade to Premium',
    'premiumPrompt.browse': 'Browse Books',
    'premiumPrompt.priceHint': 'Starting at just €9.99/month',

    // About Page
    'about.title': 'About BookDigest',
    'about.subtitle': 'Your gateway to learning from the world\'s best books in minutes',
    'about.missionTitle': 'Our Mission',
    'about.missionDesc1': 'We believe that everyone should have access to the wisdom contained in the world\'s best books. However, we also understand that time is precious, and not everyone has hours to dedicate to reading full books.',
    'about.missionDesc2': 'That\'s why we created BookDigest - to distill the essential insights from bestselling books into concise summaries that you can read or listen to on the go.',
    'about.statsSummaries': 'Book Summaries',
    'about.statsUsers': 'Active Users',
    'about.statsRating': 'User Rating',
    'about.statsTime': 'Avg. Read Time',

    // Contact Page
    'contact.title': 'Contact Us',
    'contact.subtitle': 'Have a question or feedback? We\'d love to hear from you.',
    'contact.formTitle': 'Send us a message',
    'contact.nameLabel': 'Your Name',
    'contact.emailLabel': 'Email Address',
    'contact.subjectLabel': 'Subject',
    'contact.messageLabel': 'Message',
    'contact.send': 'Send Message',
    'contact.sending': 'Sending...',
    'contact.emailUs': 'Email Us',
    'contact.generalInquiries': 'For general inquiries:',
    'contact.feedback': 'Feedback',
    'contact.valueFeedback': 'We value your feedback:',
    'contact.responseTime': 'Response Time',
    'contact.responseDesc': 'We typically respond within 24 hours during business days.',
    'contact.sentSuccess': 'Message sent! We\'ll get back to you soon.',

    // Features Page
    'featuresPage.title': 'Discover Our Features',
    'featuresPage.subtitle': 'Everything you need to learn efficiently from books',
    'featuresPage.fifteenMinTitle': '15-Minute Summaries',
    'featuresPage.fifteenMinDesc': 'Get the key insights from bestselling books quickly. Perfect for busy schedules.',
    'featuresPage.audioTitle': 'Audio Summaries',
    'featuresPage.audioDesc': 'Listen on the go. Perfect for commutes or workouts.',
    'featuresPage.mobileTitle': 'Mobile App',
    'featuresPage.mobileDesc': 'Read anywhere on your smartphone or tablet.',
    'featuresPage.progressTitle': 'Reading Progress',
    'featuresPage.progressDesc': 'Track your reading progress and stay motivated.',
    'featuresPage.qualityTitle': 'Quality Content',
    'featuresPage.qualityDesc': 'Expert-curated summaries for maximum quality.',
    'featuresPage.multilingualTitle': 'Multilingual',
    'featuresPage.multilingualDesc': 'Summaries available in English and German.',

    // Pricing page
    'pricing.choosePlan': 'Choose Your Plan',
    'pricing.chooseSubtitle': 'Choose the plan that fits your learning goals. Cancel anytime, no questions asked.',
    'pricing.launchDeal': 'Product Hunt Launch Deal: Use code',
    'pricing.launchDiscount': 'for 20% off (Monthly + Yearly)',
    'pricing.free': 'Free',
    'pricing.forever': 'forever',
    'pricing.perfectStart': 'Perfect for getting started',
    'pricing.summariesPerMonth': '3 book summaries per month',
    'pricing.basicFeatures': 'Basic reading features',
    'pricing.limitedAudio': 'Limited audio access',
    'pricing.mobileAccess': 'Mobile app access',
    'pricing.getStarted': 'Get Started',
    'pricing.premiumMonthly': 'Premium Monthly',
    'pricing.perMonth': 'per month',
    'pricing.seriousLearners': 'For serious learners',
    'pricing.unlimited': 'Unlimited book summaries',
    'pricing.audioNarration': 'Audio narration (Premium)',
    'pricing.adFree': 'Ad-free experience',
    'pricing.prioritySupport': 'Priority customer support',
    'pricing.earlyAccess': 'Early access to new content',
    'pricing.getPremium': 'Get Premium',
    'pricing.premiumYearly': 'Premium Yearly',
    'pricing.perYear': 'per year',
    'pricing.save33': 'Save 33%',
    'pricing.bestValue': 'Best value for committed learners',
    'pricing.everythingMonthly': 'Everything in Monthly',
    'pricing.save40': 'Save €40 per year',
    'pricing.currentPlan': '✓ Current Plan',
    'pricing.manageSubscription': 'Manage Subscription →',
    'pricing.processing': 'Processing...',
    'pricing.comparison': 'Free vs Premium Comparison',
    'pricing.feature': 'Feature',
    'pricing.premium': 'Premium',
    'pricing.summariesMonth': 'Book summaries per month',
    'pricing.threeSummaries': '3 summaries',
    'pricing.unlimitedAccess': 'Unlimited',
    'pricing.keyInsights': 'Key insights & action items',
    'pricing.limited': 'Limited',
    'pricing.quotesHighlights': 'Quotes & highlights',
    'pricing.earlyAccessBooks': 'Early access to new books',
    'pricing.price': 'Price',
    'pricing.startFree': 'Start Free',
    'pricing.youArePremium': "✓ You're Premium!",
    'pricing.faq': 'Frequently Asked Questions',
    'pricing.faqSubtitle': "Have questions? We're here to help.",
    'pricing.contactSupport': 'Contact Support →',
    'pricing.loginToSubscribe': 'Please login to subscribe',

    // Login page
    'login.welcomeBack': 'Welcome back',
    'login.subtitle': 'Sign in to continue your learning journey',
    'login.emailLabel': 'Email address',
    'login.passwordLabel': 'Password',
    'login.rememberMe': 'Remember me',
    'login.forgotPassword': 'Forgot password?',
    'login.signingIn': 'Signing in...',
    'login.signIn': 'Sign in',
    'login.noAccount': "Don't have an account?",
    'login.startTrial': 'Start free trial',

    // Register page
    'register.title': 'Start your free trial',
    'register.subtitle': 'Join thousands of learners today. No credit card required.',
    'register.firstName': 'First Name',
    'register.lastName': 'Last Name',
    'register.emailLabel': 'Email address',
    'register.passwordLabel': 'Password',
    'register.passwordHint': 'Must be at least 8 characters',
    'register.agreeTerms': 'I agree to the',
    'register.termsOfService': 'Terms of Service',
    'register.and': 'and',
    'register.privacyPolicy': 'Privacy Policy',
    'register.creating': 'Creating account...',
    'register.createAccount': 'Create account',
    'register.haveAccount': 'Already have an account?',
    'register.signIn': 'Sign in',

    // Forgot Password
    'forgotPassword.title': 'Forgot Password?',
    'forgotPassword.subtitle': "No worries! Enter your email and we'll send you reset instructions.",
    'forgotPassword.emailLabel': 'Email Address',
    'forgotPassword.sendLink': 'Send Reset Link',
    'forgotPassword.sending': 'Sending...',
    'forgotPassword.backToLogin': 'Back to Login',
    'forgotPassword.successTitle': 'Check Your Email',
    'forgotPassword.successMsg': "We've sent password reset instructions to",
    'forgotPassword.didntReceive': "Didn't receive the email? Check your spam folder or try again.",

    // Reset Password
    'resetPassword.title': 'Reset Password',
    'resetPassword.subtitle': 'Enter your new password below',
    'resetPassword.newPassword': 'New Password',
    'resetPassword.confirmPassword': 'Confirm Password',
    'resetPassword.resetButton': 'Reset Password',
    'resetPassword.resetting': 'Resetting...',
    'resetPassword.successTitle': 'Password Reset!',
    'resetPassword.successMsg': 'Your password has been successfully reset. Redirecting to login...',
    'resetPassword.invalidToken': 'Invalid or missing reset token',
    'resetPassword.mismatch': 'Passwords do not match',
    'resetPassword.tooShort': 'Password must be at least 6 characters',

    // Pagination (shared)
    'pagination.previous': 'Previous',
    'pagination.next': 'Next',
    'pagination.page': 'Page',
    'pagination.of': 'of',
    'pagination.showing': 'Showing',
    'pagination.ofTotal': 'of',
    'pagination.books': 'books',

    // Library extras
    'library.allCategories': 'All Categories',
    'library.premiumOnly': 'Premium only',
    'library.searchPlaceholder': 'Search books, authors, topics...',

    // Navbar extras
    'nav.settings': 'Settings',

    // Email Capture Popup
    'emailPopup.title': 'Get 3 Free Book Summaries!',
    'emailPopup.subtitle': 'Join 10,000+ readers learning from the best books in just 15 minutes.',
    'emailPopup.discount': 'Plus, get early access to Premium with',
    'emailPopup.discountAmount': '20% off!',
    'emailPopup.benefit1Bold': '3 hand-picked summaries',
    'emailPopup.benefit1': 'delivered instantly',
    'emailPopup.benefit2Bold': 'Weekly book recommendations',
    'emailPopup.benefit2': 'tailored to your interests',
    'emailPopup.benefit3Bold': 'Exclusive early access',
    'emailPopup.benefit3': 'to Premium (launching soon!)',
    'emailPopup.placeholder': 'Enter your email address',
    'emailPopup.submit': 'Get My Free Summaries →',
    'emailPopup.submitting': 'Subscribing...',
    'emailPopup.privacy': '🔒 We respect your privacy. Unsubscribe anytime.',
    'emailPopup.success': '🎉 Success! Check your email for your free summaries!',
    'emailPopup.errorInvalid': 'Please enter a valid email address',
    'emailPopup.errorGeneric': 'Something went wrong. Please try again.',

    // Blog
    'blog.title': 'BookDigest Blog',
    'blog.subtitle': 'Tips, strategies, and insights to help you read more, learn faster, and grow personally.',
    'blog.readMore': 'Read more →',
    'blog.comingSoon': 'More articles coming soon! Subscribe to get notified.',
    'blog.backToBlog': '← Back to Blog',
    'blog.by': 'By',
    'blog.ctaTitle': 'Ready to Start Learning?',
    'blog.ctaSubtitle': 'Access 450+ free book summaries on BookDigest',
    'blog.ctaButton': 'Get Started Free →',
  },
  de: {
    // Navigation
    'nav.home': 'Startseite',
    'nav.library': 'Bibliothek',
    'nav.categories': 'Kategorien',
    'nav.pricing': 'Preise',
    'nav.features': 'Funktionen',
    'nav.about': 'Über uns',
    'nav.contact': 'Kontakt',
    'nav.login': 'Anmelden',
    'nav.register': 'Registrieren',
    'nav.dashboard': 'Dashboard',
    'nav.logout': 'Abmelden',
    'nav.search': 'Bücher suchen...',
    'nav.signOut': 'Abmelden',

    // Hero
    'hero.title': 'Lerne von den besten Büchern der Welt in 15 Minuten',
    'hero.subtitle': 'Zugang zu 450+ kostenlosen KI-gestützten Buchzusammenfassungen. Lies Bestseller aus Wirtschaft, Selbsthilfe, Psychologie und Persönlichkeitsentwicklung.',
    'hero.cta': 'Kostenlose Testversion starten',
    'hero.ctaSecondary': 'Bibliothek durchsuchen',
    'hero.stats.books': 'Buchzusammenfassungen',
    'hero.stats.booksValue': '450+',
    'hero.stats.read': 'Durchschnittliche Lesezeit',
    'hero.stats.readValue': '5–10 Min.',
    'hero.stats.rating': 'Benutzerbewertung',
    'hero.stats.ratingValue': '4.8★',

    // Features
    'features.title': 'Warum BookDigest?',
    'features.free.title': '100% Kostenlos',
    'features.free.desc': 'Zugang zu Buchzusammenfassungen ohne Kosten. Keine Kreditkarte erforderlich.',
    'features.ai.title': 'KI-gestützt',
    'features.ai.desc': 'Fortgeschrittene KI erstellt umfassende Zusammenfassungen mit wichtigen Erkenntnissen.',
    'features.audio.title': 'Audio verfügbar',
    'features.audio.desc': 'Höre Zusammenfassungen unterwegs mit der Premium-Audiofunktion.',
    'features.quick.title': '15-Minuten-Lektüre',
    'features.quick.desc': 'Erhalte die wichtigsten Ideen aus jedem Buch in nur 15 Minuten.',

    // Library
    'library.title': 'Buchbibliothek',
    'library.subtitle': 'Durchsuche unsere Sammlung von 450+ Buchzusammenfassungen',
    'library.filter': 'Nach Kategorie filtern',
    'library.sort': 'Sortieren nach',
    'library.all': 'Alle Bücher',
    'library.search': 'Bücher suchen...',
    'library.noResults': 'Keine Bücher gefunden',
    'library.readMore': 'Mehr lesen',
    'library.sortNewest': 'Neueste',
    'library.sortPopular': 'Beliebt',
    'library.sortTitle': 'Titel A-Z',
    'library.booksCount': 'Bücher',

    // Categories
    'categories.title': 'Nach Kategorie durchsuchen',
    'categories.subtitle': 'Erkunde Bücher nach Thema',
    'categories.books': 'Bücher',

    // Book Detail
    'book.summary': 'Zusammenfassung',
    'book.chapters': 'Wichtige Kapitel',
    'book.insights': 'Wichtige Erkenntnisse',
    'book.quotes': 'Bemerkenswerte Zitate',
    'book.actionItems': 'Handlungsempfehlungen',
    'book.aboutAuthor': 'Über den Autor',
    'book.readNow': 'Jetzt lesen',
    'book.listenNow': 'Jetzt hören',
    'book.buyAmazon': 'Bei Amazon kaufen',
    'book.premium': 'Nur Premium',
    'book.loginToRead': 'Anmelden um mehr zu lesen',
    'book.freeRemaining': 'Kostenlose Zusammenfassungen diesen Monat',
    'book.by': 'von',
    'book.minRead': 'Min. Lesezeit',
    'book.addToFavorites': 'Zu Favoriten hinzufügen',
    'book.removeFromFavorites': 'Aus Favoriten entfernen',
    'book.share': 'Teilen',
    'book.backToLibrary': 'Zurück zur Bibliothek',

    // Auth
    'auth.loginTitle': 'Willkommen zurück',
    'auth.loginSubtitle': 'Melde dich an, um auf dein Konto zuzugreifen',
    'auth.registerTitle': 'Konto erstellen',
    'auth.registerSubtitle': 'Beginne heute deine Lesereise',
    'auth.email': 'E-Mail',
    'auth.password': 'Passwort',
    'auth.confirmPassword': 'Passwort bestätigen',
    'auth.firstName': 'Vorname',
    'auth.lastName': 'Nachname',
    'auth.loginButton': 'Anmelden',
    'auth.registerButton': 'Konto erstellen',
    'auth.forgotPassword': 'Passwort vergessen?',
    'auth.noAccount': 'Noch kein Konto?',
    'auth.haveAccount': 'Bereits ein Konto?',
    'auth.loginError': 'Ungültige E-Mail oder Passwort',
    'auth.registerError': 'Registrierung fehlgeschlagen',
    'auth.continueWithGoogle': 'Mit Google fortfahren',

    // Footer
    'footer.description': 'Lerne von den besten Büchern der Welt in Minuten. Lies oder höre unterwegs.',
    'footer.product': 'Produkt',
    'footer.company': 'Unternehmen',
    'footer.legal': 'Rechtliches',
    'footer.privacy': 'Datenschutz',
    'footer.terms': 'Nutzungsbedingungen',
    'footer.cookies': 'Cookie-Richtlinie',
    'footer.contact': 'Kontakt',
    'footer.productHunt': 'Besuchen Sie uns auf Product Hunt',
    'footer.about': 'Über uns',
    'footer.allRights': 'Alle Rechte vorbehalten.',

    // Common
    'common.loading': 'Lädt...',
    'common.error': 'Ein Fehler ist aufgetreten',
    'common.retry': 'Erneut versuchen',
    'common.cancel': 'Abbrechen',
    'common.save': 'Speichern',
    'common.delete': 'Löschen',
    'common.edit': 'Bearbeiten',
    'common.close': 'Schließen',
    'common.minutes': 'Min',
    'common.hours': 'Stunden',
    'common.days': 'Tage',
    'common.learnMore': 'Mehr erfahren',
    'common.viewAll': 'Alle anzeigen',
    'common.featured': 'Empfohlen',
    'common.new': 'Neu',
    'common.popular': 'Beliebt',

    // Featured section
    'featured.title': 'Empfohlene Zusammenfassungen',
    'featured.subtitle': 'Starte mit unseren beliebtesten Buchzusammenfassungen',

    // Features section
    'featuresSection.title': 'Alles was Sie brauchen, um schneller zu lernen',
    'featuresSection.subtitle': 'Leistungsstarke Funktionen, um das Beste aus Ihrer Lesezeit herauszuholen',
    'featuresSection.expertSummaries': 'Experten-Zusammenfassungen',
    'featuresSection.expertDesc': 'Professionell geschriebene Zusammenfassungen, die die Essenz jedes Buches einfangen.',
    'featuresSection.audioExperience': 'Audio-Erlebnis',
    'featuresSection.audioDesc': 'Hören Sie sich Zusammenfassungen mit professioneller Erzählung auf dem Weg zur Arbeit oder beim Sport an.',
    'featuresSection.multiPlatform': 'Multi-Plattform',
    'featuresSection.multiDesc': 'Greifen Sie im Web, unter iOS und Android auf Ihre Bibliothek zu. Über alle Geräte hinweg synchronisiert.',
    'featuresSection.multipleLanguages': 'Mehrere Sprachen',
    'featuresSection.langDesc': 'Zusammenfassungen sind in mehreren Sprachen verfügbar, um ein globales Publikum zu erreichen.',
    'featuresSection.trackProgress': 'Fortschritt verfolgen',
    'featuresSection.trackDesc': 'Überwachen Sie Ihre Lese-Statistiken, Strähnen und Erfolge.',
    'featuresSection.personalized': 'Personalisiert',
    'featuresSection.personalDesc': 'Erhalten Sie Empfehlungen basierend auf Ihren Interessen und Ihrem Leseverlauf.',

    // Testimonials
    'testimonials.title': 'Von Tausenden von Lernenden geliebt',
    'testimonials.subtitle': 'Sehen Sie, was unsere Community zu sagen hat',
    'testimonials.sarah': 'BookDigest hat meine Art zu lernen verändert. Ich kann jetzt ein Buch in meiner Mittagspause durchlesen und die Erkenntnisse sofort auf mein Geschäft anwenden.',
    'testimonials.michael': 'Die Audiofunktion ist ein Game-Changer. Ich höre auf dem Weg zur Arbeit zu und habe in den letzten 3 Monaten mehr gelernt als im gesamten letzten Jahr.',
    'testimonials.emma': 'Erstaunliche Plattform! Die Zusammenfassungen sind unglaublich gut geschrieben und die wichtigsten Erkenntnisse sind genau das, was ich für mein berufliches Wachstum brauche.',
    'testimonials.name1': 'Sarah Johnson',
    'testimonials.name2': 'Michael Chen',
    'testimonials.name3': 'Emma Williams',
    'testimonials.role1': 'Unternehmerin',
    'testimonials.role2': 'Software-Entwickler',
    'testimonials.role3': 'Marketing-Managerin',

    // CTA Section
    'cta.title': 'Starten Sie Ihre Lernreise noch heute',
    'cta.subtitle': 'Schließen Sie sich Tausenden von Lernenden an, die ihr Wachstum mit BookDigest bereits beschleunigen',
    'cta.startTrial': 'Kostenlose Testversion starten',
    'cta.viewPricing': 'Preise ansehen',
    'cta.trialFeature1': '7-tägige kostenlose Testversion',
    'cta.trialFeature2': 'Keine Kreditkarte benötigt',
    'cta.trialFeature3': 'Jederzeit kündbar',

    // Search
    'search.title': 'Bücher suchen',
    'search.subtitle': 'Finden Sie die perfekte Buchzusammenfassung für Ihre Bedürfnisse',
    'search.placeholder': 'Suche nach Titel, Autor oder Thema...',
    'search.noResults': 'Keine Ergebnisse gefunden',
    'search.resultsFor': 'Ergebnisse für',
    'search.startTyping': 'Geben Sie etwas ein, um nach Büchern zu suchen...',
    'search.noBooksFound': 'Keine Bücher gefunden für "{query}"',
    'search.clearSearch': 'Suche löschen',
    'search.resultsCount': '{count} Ergebnisse für "{query}" gefunden',
    'search.resultsCountSingle': '1 Ergebnis für "{query}" gefunden',

    // Subscription
    'subscription.title': 'Abonnement',
    'subscription.upgrade': 'Auf Premium upgraden',
    'subscription.cancel': 'Abonnement kündigen',
    'subscription.manage': 'Abonnement verwalten',
    'subscription.success': 'Abonnement erfolgreich!',
    'subscription.canceled': 'Abonnement gekündigt',

    // Categories page
    'categories.browseByCategory': 'Nach Kategorie durchsuchen',
    'categories.exploreSubtitle': 'Entdecke Buchzusammenfassungen nach Thema sortiert. Finde die perfekten Bücher, um dein Wissen zu erweitern.',
    'categories.viewBooks': 'Bücher ansehen →',
    'categories.explore': 'Entdecke',
    'categories.categories': 'Kategorien',
    'categories.bookSummaries': 'Buchzusammenfassungen',
    'categories.avgReadingTime': 'Durchschnittl. Lesezeit',

    // Freemium & Login Gate
    'freemium.freeTierUsage': 'Gratis-Kontingent Nutzung',
    'freemium.remainingText': '{remaining} von {limit} Büchern verbleiben diesen Monat',
    'freemium.usedTotal': '{used} genutzt • {limit} gesamt',
    'freemium.limitReached': '⚠️ Sie haben Ihr monatliches Limit erreicht. Upgraden Sie auf Premium für unbegrenzten Zugang!',
    'freemium.oneLeft': '⚡ Nur noch 1 Buch diesen Monat übrig! Upgraden für unbegrenztes Lesen.',
    'freemium.wantUnlimited': 'Möchten Sie unbegrenzten Zugang? Upgraden Sie auf Premium!',
    'freemium.upgradeToPremium': 'Auf Premium upgraden',
    'freemium.viewPremiumPlans': 'Premium-Pläne ansehen',
    'freemium.seePremiumBenefits': 'Premium-Vorteile ansehen',
    'freemium.premiumMember': 'Premium-Mitglied',
    'freemium.unlimitedAccess': 'Unbegrenzter Buchzugang + Audio-Erzählung',
    'freemium.monthlyLimitReached': 'Monatliches Limit erreicht',
    'freemium.freePlan': 'Kostenloser Plan',
    'freemium.booksReadText': '{read} von {limit} Büchern diesen Monat gelesen',
    'freemium.remaining': 'verbleibend',
    'freemium.upgradeToKeepReading': 'Sie haben Ihr monatliches Limit erreicht. Upgrade zum Weiterlesen!',
    'freemium.upgradeForUnlimited': 'Upgrade auf Premium für unbegrenzte Bücher + Audio-Erzählung',

    'loginGate.signInToRead': 'Zum Lesen anmelden',
    'loginGate.createFreeAccountToAccess': 'Erstellen Sie ein kostenloses Konto, um auf diese Buchzusammenfassung und 2 weitere diesen Monat zuzugreifen!',
    'loginGate.freeAccountIncludes': 'Kostenloses Konto beinhaltet:',
    'loginGate.feature1': '3 Buchzusammenfassungen pro Monat',
    'loginGate.feature2': 'Wichtige Erkenntnisse & Handlungsschritte',
    'loginGate.feature3': 'Ihre Lieblingsbücher als Lesezeichen speichern',
    'loginGate.feature4': 'Ihren Lesefortschritt verfolgen',
    'loginGate.createFreeAccount': 'Kostenloses Konto erstellen',
    'loginGate.signIn': 'Anmelden',
    'loginGate.noCreditCard': 'Keine Kreditkarte erforderlich • Jederzeit kündbar',
    'loginGate.wantUnlimited': 'Möchten Sie unbegrenzten Zugang?',
    'loginGate.viewPremiumPlansLink': 'Premium-Pläne ansehen →',

    // Category detail
    'categoryDetail.backToCategories': 'Zurück zu Kategorien',
    'categoryDetail.booksInCategory': 'Buch in dieser Kategorie',
    'categoryDetail.booksInCategoryPlural': 'Bücher in dieser Kategorie',
    'categoryDetail.noBooksFound': 'Noch keine Bücher in dieser Kategorie.',
    'categoryDetail.browseAll': 'Alle Bücher durchsuchen',
    'categoryDetail.previous': 'Zurück',
    'categoryDetail.next': 'Weiter',
    'categoryDetail.page': 'Seite',
    'categoryDetail.of': 'von',

    // Dashboard
    'dashboard.welcome': 'Willkommen zurück, {name}!',
    'dashboard.reader': 'Leser',
    'dashboard.continueJourney': 'Setzen Sie Ihre Lernreise fort',
    'dashboard.booksRead': 'Gelesene Bücher',
    'dashboard.readingTime': 'Lesezeit',
    'dashboard.currentStreak': 'Aktuelle Serie',
    'dashboard.days': 'Tage',
    'dashboard.hours': 'Std.',
    'dashboard.achievements': 'Erfolge',
    'dashboard.favorites': 'Ihre Favoriten',

    // Subscription Card
    'subscriptionCard.premiumPlan': 'Premium-Paket',
    'subscriptionCard.freePlan': 'Kostenloses Paket',
    'subscriptionCard.active': 'Aktiv',
    'subscriptionCard.activeCanceling': 'Aktiv (Kündigung läuft)',
    'subscriptionCard.renewsOn': 'Verlängert sich am',
    'subscriptionCard.expiresOn': 'Läuft ab am',
    'subscriptionCard.paymentMethod': 'Zahlungsmethode',
    'subscriptionCard.cardOnFile': 'Hinterlegte Karte',
    'subscriptionCard.premiumBenefits': 'Ihre Premium-Vorteile:',
    'subscriptionCard.unlimitedSummaries': 'Unbegrenzte Buchzusammenfassungen',
    'subscriptionCard.fullAudio': 'Vollständige Audio-Vertonung',
    'subscriptionCard.offlineDownloads': 'Offline-Downloads',
    'subscriptionCard.adFree': 'Werbefreies Erlebnis',
    'subscriptionCard.cancelWarning': 'Ihr Abonnement wird am {date} gekündigt. Sie haben bis dahin weiterhin Zugriff.',
    'subscriptionCard.cancelSure': 'Sind Sie sicher? Sie verlieren den Zugriff auf Premium-Funktionen.',
    'subscriptionCard.cancelButton': 'Ja, kündigen',
    'subscriptionCard.canceling': 'Wird gekündigt...',
    'subscriptionCard.keepPremium': 'Premium behalten',
    'subscriptionCard.cancelSubscription': 'Abonnement kündigen',
    'subscriptionCard.upgradePrompt': 'Upgrade auf Premium, um unbegrenzte Buchzusammenfassungen, Audio-Vertonungen und mehr freizuschalten!',
    'subscriptionCard.upgradeButton': 'Upgrade auf Premium',
    'subscriptionCard.freeIncludes': 'Kostenloses Paket beinhaltet:',
    'subscriptionCard.threeSummaries': '3 Buchzusammenfassungen pro Monat',
    'subscriptionCard.basicFeatures': 'Grundlegende Lesefunktionen',
    'subscriptionCard.limitedAudio': 'Eingeschränkter Audio-Zugriff',
    'subscriptionCard.cancelSuccess': 'Das Abonnement wird zum Ende des Abrechnungszeitraums gekündigt',

    // Book card
    'bookCard.premium': 'Premium',
    'bookCard.minRead': 'Min. Lesezeit',

    // Book Detail
    'bookDetail.chapter': 'Kapitel',
    'bookDetail.loadingDetails': 'Buchdetails werden geladen...',
    'bookDetail.backToLibrary': 'Zurück zur Bibliothek',
    'bookDetail.quickRead': 'Kurze Lektüre',
    'bookDetail.audioAvailable': 'Audio verfügbar',
    'bookDetail.audioPremium': 'Audio (Premium)',
    'bookDetail.startReading': 'Lesen starten',
    'audio.title': 'Audio-Wiedergabe',
    'audio.subtitle': 'KI-gestützte Sprachausgabe',
    'audio.pressPlay': 'Drücke Play, um die KI-Erzählung dieser Buchzusammenfassung zu hören',
    'bookDetail.buyFullBook': 'Vollständiges Buch kaufen',
    'bookDetail.bookNotFound': 'Buch nicht gefunden',
    'bookDetail.somethingWrong': 'Etwas ist schief gelaufen',
    'bookDetail.loginToFavorite': 'Bitte loggen Sie sich ein, um Favoriten hinzuzufügen',
    'bookDetail.updatedFavorites': 'Favoriten aktualisiert',

    // Book Content
    'bookContent.summary': 'Zusammenfassung',
    'bookContent.keyInsights': 'Wichtige Erkenntnisse',
    'bookContent.quotes': 'Denkwürdige Zitate',
    'bookContent.chapters': 'Kapitelübersicht',
    'bookContent.actionItems': 'Handlungsempfehlungen',
    'bookContent.tip': 'Tipp',
    'bookContent.tipDesc': 'Klicken Sie auf ein Element, um es als erledigt zu markieren!',

    // Premium Prompt
    'premiumPrompt.title': '{feature} ist eine Premium-Funktion',
    'premiumPrompt.defaultDesc': 'Upgrade auf Premium, um {feature} freizuschalten und unbegrenzte Buchzusammenfassungen zu genießen.',
    'premiumPrompt.upgrade': 'Upgrade auf Premium',
    'premiumPrompt.browse': 'Bücher durchsuchen',
    'premiumPrompt.priceHint': 'Schon ab 9,99 €/Monat',

    // About Page
    'about.title': 'Über BookDigest',
    'about.subtitle': 'Dein Tor zum Lernen von den besten Büchern der Welt in Minuten',
    'about.missionTitle': 'Unsere Mission',
    'about.missionDesc1': 'Wir glauben, dass jeder Zugang zu der in den besten Büchern der Welt enthaltenen Weisheit haben sollte. Aber wir wissen auch, dass Zeit kostbar ist, und nicht jeder Stunden hat, um ganze Bücher zu lesen.',
    'about.missionDesc2': 'Deshalb haben wir BookDigest erstellt - um die wesentlichen Erkenntnisse aus Bestsellern in prägnante Zusammenfassungen zu destillieren, die du unterwegs lesen oder hören kannst.',
    'about.statsSummaries': 'Buchzusammenfassungen',
    'about.statsUsers': 'Aktive Nutzer',
    'about.statsRating': 'Nutzerbewertung',
    'about.statsTime': 'Durchschn. Lesezeit',

    // Contact Page
    'contact.title': 'Kontaktiere uns',
    'contact.subtitle': 'Haben Sie eine Frage oder Feedback? Wir würden uns freuen, von Ihnen zu hören.',
    'contact.formTitle': 'Schreiben Sie uns eine Nachricht',
    'contact.nameLabel': 'Ihr Name',
    'contact.emailLabel': 'E-Mail-Adresse',
    'contact.subjectLabel': 'Betreff',
    'contact.messageLabel': 'Nachricht',
    'contact.send': 'Nachricht senden',
    'contact.sending': 'Wird gesendet...',
    'contact.emailUs': 'Schreiben Sie uns',
    'contact.generalInquiries': 'Für allgemeine Anfragen:',
    'contact.feedback': 'Feedback',
    'contact.valueFeedback': 'Wir schätzen Ihr Feedback:',
    'contact.responseTime': 'Reaktionszeit',
    'contact.responseDesc': 'Wir antworten in der Regel innerhalb von 24 Stunden an Werktagen.',
    'contact.sentSuccess': 'Nachricht gesendet! Wir melden uns in Kürze bei Ihnen.',

    // Features Page
    'featuresPage.title': 'Entdecke unsere Funktionen',
    'featuresPage.subtitle': 'Alles was du brauchst, um effizient aus Büchern zu lernen',
    'featuresPage.fifteenMinTitle': '15-Minuten Zusammenfassungen',
    'featuresPage.fifteenMinDesc': 'Erhalte schnell die wichtigsten Erkenntnisse aus Bestsellern. Perfekt für einen vollen Terminkalender.',
    'featuresPage.audioTitle': 'Audio-Zusammenfassungen',
    'featuresPage.audioDesc': 'Höre unterwegs zu. Perfekt für Pendler oder beim Sport.',
    'featuresPage.mobileTitle': 'Mobile App',
    'featuresPage.mobileDesc': 'Lies jederzeit und überall auf deinem Smartphone oder Tablet.',
    'featuresPage.progressTitle': 'Lese-Fortschritt',
    'featuresPage.progressDesc': 'Verfolge deinen Lesefortschritt und bleibe motiviert.',
    'featuresPage.qualityTitle': 'Qualitätsinhalte',
    'featuresPage.qualityDesc': 'Von Experten kuratierte Zusammenfassungen für maximale Qualität.',
    'featuresPage.multilingualTitle': 'Mehrsprachig',
    'featuresPage.multilingualDesc': 'Zusammenfassungen auf Englisch und Deutsch verfügbar.',

    // Pricing page
    'pricing.choosePlan': 'Wähle deinen Plan',
    'pricing.chooseSubtitle': 'Wähle den Plan, der zu deinen Lernzielen passt. Jederzeit kündbar, ohne Wenn und Aber.',
    'pricing.launchDeal': 'Product Hunt Startangebot: Nutze den Code',
    'pricing.launchDiscount': 'für 20% Rabatt (Monatlich + Jährlich)',
    'pricing.free': 'Kostenlos',
    'pricing.forever': 'für immer',
    'pricing.perfectStart': 'Perfekt zum Einstieg',
    'pricing.summariesPerMonth': '3 Buchzusammenfassungen/Monat',
    'pricing.basicFeatures': 'Grundlegende Lesefunktionen',
    'pricing.limitedAudio': 'Eingeschränkter Audio-Zugang',
    'pricing.mobileAccess': 'Mobile-App-Zugang',
    'pricing.getStarted': 'Jetzt starten',
    'pricing.premiumMonthly': 'Premium Monatlich',
    'pricing.perMonth': 'pro Monat',
    'pricing.seriousLearners': 'Für ambitionierte Lerner',
    'pricing.unlimited': 'Unbegrenzte Buchzusammenfassungen',
    'pricing.audioNarration': 'Audio-Vorlesung (Premium)',
    'pricing.adFree': 'Werbefreies Erlebnis',
    'pricing.prioritySupport': 'Prioritäts-Kundensupport',
    'pricing.earlyAccess': 'Frühzeitiger Zugang zu neuen Inhalten',
    'pricing.getPremium': 'Premium holen',
    'pricing.premiumYearly': 'Premium Jährlich',
    'pricing.perYear': 'pro Jahr',
    'pricing.save33': '33% sparen',
    'pricing.bestValue': 'Bestes Angebot für engagierte Lerner',
    'pricing.everythingMonthly': 'Alles aus Monatlich',
    'pricing.save40': '€40 pro Jahr sparen',
    'pricing.currentPlan': '✓ Aktueller Plan',
    'pricing.manageSubscription': 'Abonnement verwalten →',
    'pricing.processing': 'Wird verarbeitet...',
    'pricing.comparison': 'Kostenlos vs Premium Vergleich',
    'pricing.feature': 'Funktion',
    'pricing.premium': 'Premium',
    'pricing.summariesMonth': 'Buchzusammenfassungen pro Monat',
    'pricing.threeSummaries': '3 Zusammenfassungen',
    'pricing.unlimitedAccess': 'Unbegrenzt',
    'pricing.keyInsights': 'Erkenntnisse & Handlungsempfehlungen',
    'pricing.limited': 'Eingeschränkt',
    'pricing.quotesHighlights': 'Zitate & Highlights',
    'pricing.earlyAccessBooks': 'Frühzeitiger Zugang zu neuen Büchern',
    'pricing.price': 'Preis',
    'pricing.startFree': 'Kostenlos starten',
    'pricing.youArePremium': '✓ Du bist Premium!',
    'pricing.faq': 'Häufig gestellte Fragen',
    'pricing.faqSubtitle': 'Hast du Fragen? Wir helfen gerne.',
    'pricing.contactSupport': 'Support kontaktieren →',
    'pricing.loginToSubscribe': 'Bitte anmelden zum Abonnieren',

    // Login page
    'login.welcomeBack': 'Willkommen zurück',
    'login.subtitle': 'Melde dich an, um deine Lernreise fortzusetzen',
    'login.emailLabel': 'E-Mail-Adresse',
    'login.passwordLabel': 'Passwort',
    'login.rememberMe': 'Angemeldet bleiben',
    'login.forgotPassword': 'Passwort vergessen?',
    'login.signingIn': 'Anmeldung...',
    'login.signIn': 'Anmelden',
    'login.noAccount': 'Noch kein Konto?',
    'login.startTrial': 'Kostenlos starten',

    // Register page
    'register.title': 'Starte deine kostenlose Testphase',
    'register.subtitle': 'Schließe dich tausenden Lernenden an. Keine Kreditkarte erforderlich.',
    'register.firstName': 'Vorname',
    'register.lastName': 'Nachname',
    'register.emailLabel': 'E-Mail-Adresse',
    'register.passwordLabel': 'Passwort',
    'register.passwordHint': 'Mindestens 8 Zeichen',
    'register.agreeTerms': 'Ich stimme den',
    'register.termsOfService': 'Nutzungsbedingungen',
    'register.and': 'und der',
    'register.privacyPolicy': 'Datenschutzerklärung',
    'register.creating': 'Konto wird erstellt...',
    'register.createAccount': 'Konto erstellen',
    'register.haveAccount': 'Bereits ein Konto?',
    'register.signIn': 'Anmelden',

    // Forgot Password
    'forgotPassword.title': 'Passwort vergessen?',
    'forgotPassword.subtitle': 'Keine Sorge! Geben Sie Ihre E-Mail ein und wir senden Ihnen Anweisungen zum Zurücksetzen.',
    'forgotPassword.emailLabel': 'E-Mail-Adresse',
    'forgotPassword.sendLink': 'Link zum Zurücksetzen senden',
    'forgotPassword.sending': 'Wird gesendet...',
    'forgotPassword.backToLogin': 'Zurück zum Login',
    'forgotPassword.successTitle': 'E-Mails prüfen',
    'forgotPassword.successMsg': 'Wir haben Anweisungen zum Zurücksetzen des Passworts gesendet an',
    'forgotPassword.didntReceive': 'Keine E-Mail erhalten? Prüfen Sie Ihren Spam-Ordner oder versuchen Sie es erneut.',

    // Reset Password
    'resetPassword.title': 'Passwort zurücksetzen',
    'resetPassword.subtitle': 'Geben Sie unten Ihr neues Passwort ein',
    'resetPassword.newPassword': 'Neues Passwort',
    'resetPassword.confirmPassword': 'Passwort bestätigen',
    'resetPassword.resetButton': 'Passwort zurücksetzen',
    'resetPassword.resetting': 'Wird zurückgesetzt...',
    'resetPassword.successTitle': 'Passwort zurückgesetzt!',
    'resetPassword.successMsg': 'Ihr Passwort wurde erfolgreich zurückgesetzt. Weiterleitung zum Login...',
    'resetPassword.invalidToken': 'Ungültiger oder fehlender Reset-Token',
    'resetPassword.mismatch': 'Passwörter stimmen nicht überein',
    'resetPassword.tooShort': 'Passwort muss mindestens 6 Zeichen lang sein',

    // Pagination (shared)
    'pagination.previous': 'Zurück',
    'pagination.next': 'Weiter',
    'pagination.page': 'Seite',
    'pagination.of': 'von',
    'pagination.showing': 'Zeige',
    'pagination.ofTotal': 'von',
    'pagination.books': 'Büchern',

    // Library extras
    'library.allCategories': 'Alle Kategorien',
    'library.premiumOnly': 'Nur Premium',
    'library.searchPlaceholder': 'Bücher, Autoren, Themen suchen...',

    // Navbar extras
    'nav.settings': 'Einstellungen',

    // Email Capture Popup
    'emailPopup.title': '3 kostenlose Buchzusammenfassungen!',
    'emailPopup.subtitle': 'Schließe dich 10.000+ Lesern an, die in nur 15 Minuten von den besten Büchern lernen.',
    'emailPopup.discount': 'Zusätzlich erhältst du frühzeitigen Zugang zu Premium mit',
    'emailPopup.discountAmount': '20% Rabatt!',
    'emailPopup.benefit1Bold': '3 handverlesene Zusammenfassungen',
    'emailPopup.benefit1': 'sofort geliefert',
    'emailPopup.benefit2Bold': 'Wöchentliche Buchempfehlungen',
    'emailPopup.benefit2': 'auf deine Interessen zugeschnitten',
    'emailPopup.benefit3Bold': 'Exklusiver Frühzugang',
    'emailPopup.benefit3': 'zu Premium (bald verfügbar!)',
    'emailPopup.placeholder': 'Gib deine E-Mail-Adresse ein',
    'emailPopup.submit': 'Meine kostenlosen Zusammenfassungen holen →',
    'emailPopup.submitting': 'Wird abonniert...',
    'emailPopup.privacy': '🔒 Wir respektieren deine Privatsphäre. Jederzeit abbestellbar.',
    'emailPopup.success': '🎉 Erfolg! Prüfe deine E-Mails für deine kostenlosen Zusammenfassungen!',
    'emailPopup.errorInvalid': 'Bitte gib eine gültige E-Mail-Adresse ein',
    'emailPopup.errorGeneric': 'Etwas ist schief gelaufen. Bitte versuche es erneut.',

    // Blog
    'blog.title': 'BookDigest Blog',
    'blog.subtitle': 'Tipps, Strategien und Erkenntnisse, die dir helfen, mehr zu lesen, schneller zu lernen und persönlich zu wachsen.',
    'blog.readMore': 'Mehr lesen →',
    'blog.comingSoon': 'Weitere Artikel folgen in Kürze! Abonniere, um benachrichtigt zu werden.',
    'blog.backToBlog': '← Zurück zum Blog',
    'blog.by': 'Von',
    'blog.ctaTitle': 'Bereit zum Lernen?',
    'blog.ctaSubtitle': 'Zugang zu 450+ kostenlosen Buchzusammenfassungen auf BookDigest',
    'blog.ctaButton': 'Jetzt kostenlos starten →',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isReady: boolean;
}

const defaultContext: LanguageContextType = {
  language: 'en',
  setLanguage: () => { },
  t: (key: string) => {
    return translations.en[key] || key;
  },
  isReady: false,
};

const LanguageContext = createContext<LanguageContextType>(defaultContext);

function getLanguageFromStorage(): Language | null {
  if (typeof window === 'undefined') return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get('lang');
    if (urlLang === 'en' || urlLang === 'de') return urlLang;
    const cookieLang = Cookies.get('language') as Language;
    if (cookieLang === 'en' || cookieLang === 'de') return cookieLang;
  } catch (e) { }
  return null;
}

export function LanguageProvider({ children, initialLanguage = 'en' }: { children: ReactNode; initialLanguage?: Language }) {
  const [language, setLanguageState] = useState<Language>(initialLanguage);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const stored = getLanguageFromStorage();
    if (stored) {
      if (stored !== initialLanguage) {
        setLanguageState(stored);
      }
    } else if (typeof window !== 'undefined' && !Cookies.get('language')) {
      // If no cookie, try browser language
      const browserLang = navigator.language.split('-')[0];
      if (browserLang === 'de' && language !== 'de') {
        setLanguage('de');
      }
    }
    setIsReady(true);
  }, [initialLanguage]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    Cookies.set('language', lang, { expires: 365, path: '/' });
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isReady }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return defaultContext;
  }
  return context;
}
