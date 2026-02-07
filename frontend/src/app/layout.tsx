import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import { WebsiteStructuredData, OrganizationStructuredData } from '@/components/StructuredData';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  metadataBase: new URL('https://bookdigest-iota.vercel.app'),
  title: {
    default: 'BookDigest - AI-Powered Book Summaries | 454+ Business & Self-Help Books',
    template: '%s | BookDigest',
  },
  description: 'Discover 454+ AI-generated book summaries for business, self-help, and personal development. Learn from the best books in 15 minutes. Free book summaries with key insights, quotes, and action items.',
  keywords: [
    'book summaries',
    'AI book summaries',
    'business books',
    'self-help books',
    'personal development',
    'book summary',
    '15 minute reads',
    'productivity books',
    'leadership books',
    'book insights',
    'executive summaries',
    'book recommendations',
    'quick reads',
    'learn faster',
    'book notes',
  ],
  authors: [{ name: 'BookDigest' }],
  creator: 'BookDigest',
  publisher: 'BookDigest',
  manifest: '/manifest.json',
  themeColor: '#2563eb',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'BookDigest',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
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
    url: 'https://bookdigest-iota.vercel.app',
    title: 'BookDigest - AI-Powered Book Summaries | 454+ Books',
    description: 'Discover 454+ AI-generated book summaries. Learn from business, self-help, and personal development books in 15 minutes.',
    siteName: 'BookDigest',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'BookDigest - AI-Powered Book Summaries',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BookDigest - AI Book Summaries',
    description: '454+ AI-generated book summaries. Learn faster from the best books.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://bookdigest-iota.vercel.app',
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
        <GoogleAnalytics />
        <WebsiteStructuredData />
        <OrganizationStructuredData />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <PWAInstallPrompt />
        </Providers>
      </body>
    </html>
  );
}
