import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import { WebsiteStructuredData, OrganizationStructuredData } from '@/components/StructuredData';
import EmailCapturePopup from '@/components/EmailCapturePopup';
import FAQSchema from '@/components/FAQSchema';

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter',
  display: 'swap', // Optimize font loading
  preload: true,
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#2563eb',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://book-digest.com'),
  verification: {
    google: 'W1TzMoQfgmIyvk4KRMnXIA1us0ayz_RAow9vRQNXp8A',
  },
  title: {
    default: 'BookDigest - Free AI Book Summaries | Learn from 1000+ Books in 15 Minutes',
    template: '%s | BookDigest',
  },
  description: 'Access 454+ free AI-powered book summaries. Read bestselling business, self-help, psychology & personal development books in 15 minutes. Get key insights, quotes & action items from top authors. Better than Blinkist - 100% free.',
  keywords: [
    // Primary keywords
    'book summaries',
    'AI book summaries',
    'free book summaries',
    'book summary',
    '15 minute reads',
    '15 minute book summary',
    
    // Category keywords  
    'business books',
    'business book summaries',
    'self-help books',
    'self-help book summaries',
    'personal development',
    'personal development books',
    'psychology books',
    'productivity books',
    'leadership books',
    'entrepreneurship books',
    
    // Competitive keywords
    'blinkist alternative',
    'blinkist free',
    'shortform alternative',
    'getabstract alternative',
    'free blinkist',
    
    // Value keywords
    'book insights',
    'executive summaries',
    'book recommendations',
    'quick reads',
    'learn faster',
    'book notes',
    'key takeaways',
    'best books to read',
    'top business books',
    'summarized books',
  ],
  authors: [{ name: 'BookDigest' }],
  creator: 'BookDigest',
  publisher: 'BookDigest',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'BookDigest',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://book-digest.com',
    title: 'BookDigest - Free AI Book Summaries | Learn from 1000+ Books in 15 Minutes',
    description: 'Access 454+ free AI-powered book summaries. Read bestselling business, self-help & psychology books in 15 minutes. Better than Blinkist - 100% free with key insights & action items.',
    siteName: 'BookDigest',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'BookDigest - Free AI-Powered Book Summaries - Learn from 1000+ Books',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BookDigest - Free AI Book Summaries',
    description: '454+ free book summaries. Learn from bestselling books in 15 minutes. Better than Blinkist.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://book-digest.com',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains for better performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS prefetch for API and CDN */}
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_API_URL || 'https://bookdigest-lypx.onrender.com'} />
        
        <GoogleAnalytics />
        <WebsiteStructuredData />
        <OrganizationStructuredData />
        <FAQSchema />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <PWAInstallPrompt />
          <EmailCapturePopup />
        </Providers>
      </body>
    </html>
  );
}
