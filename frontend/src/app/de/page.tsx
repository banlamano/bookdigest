import { Metadata } from 'next';
import { cookies } from 'next/headers';
import GermanLandingClient from './GermanLandingClient';

export const metadata: Metadata = {
  title: 'BookDigest – Buchzusammenfassungen auf Deutsch in 15 Minuten',
  description:
    'Über 450 deutsche Buchzusammenfassungen: Business, Selbsthilfe, Psychologie. ' +
    'Jede Zusammenfassung endet mit "Was machst du Montag damit?" – konkrete Schritte statt nur Theorie. ' +
    'Bessere und günstigere Alternative zu Blinkist.',
  keywords: [
    'Buchzusammenfassungen',
    'Bücher Zusammenfassung deutsch',
    'Blinkist Alternative',
    'Sachbuch Zusammenfassung',
    'Business Bücher',
    'Selbsthilfe Bücher',
    'Buch in 15 Minuten',
    'KI Buchzusammenfassung',
  ],
  openGraph: {
    title: 'BookDigest – Buchzusammenfassungen auf Deutsch',
    description: 'Über 450 deutsche Zusammenfassungen. Jede mit konkreten Schritten für die nächste Woche.',
    locale: 'de_DE',
    type: 'website',
    url: 'https://book-digest.com/de',
  },
  alternates: {
    canonical: 'https://book-digest.com/de',
    languages: {
      de: 'https://book-digest.com/de',
      en: 'https://book-digest.com',
      'x-default': 'https://book-digest.com',
    },
  },
};

export default function GermanLandingPage() {
  // Set the language cookie so /library, /pricing, etc. render in German for this visitor.
  // (Server Components can't set cookies on a GET — the client component below handles it.)
  const cookieLang = cookies().get('language')?.value;
  return <GermanLandingClient initialLanguageCookie={cookieLang || null} />;
}
