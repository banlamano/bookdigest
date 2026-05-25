'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Headphones, Target, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface Props {
  initialLanguageCookie: string | null;
}

export default function GermanLandingClient({ initialLanguageCookie }: Props) {
  const { isAuthenticated } = useAuthStore();

  // Force the language preference to German for this visitor so /library,
  // /pricing, and book pages all render in German on follow-up navigation.
  useEffect(() => {
    if (initialLanguageCookie !== 'de') {
      document.cookie = 'language=de; path=/; max-age=31536000; SameSite=Lax';
    }
  }, [initialLanguageCookie]);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20 lg:py-28">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 dark:bg-primary-900 rounded-full opacity-20 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-200 dark:bg-secondary-900 rounded-full opacity-20 blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-6">
              🇩🇪 450+ Bücher auf Deutsch · 220 mit Audio
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Die wichtigsten Bücher.<br />
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Auf Deutsch. In 15 Minuten.
              </span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 mb-4 max-w-3xl mx-auto">
              Mit konkreten Schritten für die nächste Woche.
            </p>

            <p className="text-base text-gray-500 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
              Jede Zusammenfassung endet mit einer Frage: <strong>„Was machst du Montag damit?"</strong>
              <br />
              Keine Theorie ohne Anwendung. Keine Listen ohne Aufgaben.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                href={isAuthenticated ? '/library' : '/register'}
                className="btn-primary text-lg px-8 py-4 inline-flex items-center justify-center gap-2"
              >
                7 Tage kostenlos testen
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/library" className="btn-outline text-lg px-8 py-4">
                Bibliothek durchsuchen
              </Link>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Keine Belastung heute · Jederzeit kündbar · Kein Risiko
            </p>
          </motion.div>
        </div>
      </section>

      {/* Differentiator */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Warum die meisten Buchzusammenfassungen scheitern
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Du liest eine 12-Minuten-Zusammenfassung. Du nickst innerlich. Eine Woche später erinnerst du dich an nichts –
              und in deinem Leben hat sich nichts geändert. Genau dieses Problem lösen wir.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="card p-8 border-2 border-red-100 dark:border-red-900/30"
            >
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">
                ❌ Andere Anbieter
              </h3>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li>Drei abstrakte „Key Takeaways" pro Buch</li>
                <li>Englische Übersetzung – holprig, voller Anglizismen</li>
                <li>Du weißt was, aber nicht wie</li>
                <li>9,99 € / Monat oder 79,99 €/Jahr</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="card p-8 border-2 border-primary-200 dark:border-primary-800 bg-primary-50/30 dark:bg-primary-900/10"
            >
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">
                ✅ BookDigest auf Deutsch
              </h3>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li>10 detaillierte Kapitel + 12 umsetzbare Insights</li>
                <li>Echtes Deutsch – kein automatisch übersetzter Murks</li>
                <li>„Was machst du Montag damit?" am Ende jeder Zusammenfassung</li>
                <li>
                  9,99 €/Monat oder <strong>6,67 €/Monat</strong> mit Jahresabo (Blinkist: 12,99 €/Monat)
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Was du bekommst
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <Feature
              icon={<BookOpen className="w-8 h-8" />}
              title="450+ deutsche Zusammenfassungen"
              description="Atomic Habits, Sapiens, Das Café am Rande der Welt – die wichtigsten Sachbücher auf Deutsch."
              gradient="from-blue-500 to-cyan-500"
            />
            <Feature
              icon={<Clock className="w-8 h-8" />}
              title="15 Minuten pro Buch"
              description="Statt 8 Stunden Lesezeit. Die wichtigsten Kapitel, Zitate und Lehren – komprimiert."
              gradient="from-orange-500 to-red-500"
            />
            <Feature
              icon={<Headphones className="w-8 h-8" />}
              title="Echte Audio-Erzählung"
              description="220 Bücher mit Neural2-Sprache vertont. Hör beim Pendeln, Sport oder Kochen."
              gradient="from-purple-500 to-pink-500"
            />
            <Feature
              icon={<Target className="w-8 h-8" />}
              title="„Montag-Aufgaben"
              description="Jede Zusammenfassung endet mit konkreten Schritten, die du nächste Woche umsetzen kannst."
              gradient="from-green-500 to-teal-500"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">
            So funktioniert's
          </h2>

          <div className="space-y-8">
            <Step
              number="1"
              title="Registrieren – 7 Tage kostenlos"
              description="Keine Kreditkartenabbuchung in der Testphase. Volle Funktionen freigeschaltet."
            />
            <Step
              number="2"
              title="Buch auswählen"
              description="Stöbere durch 10 Kategorien: Wirtschaft, Selbsthilfe, Psychologie, Geschichte und mehr."
            />
            <Step
              number="3"
              title="15 Minuten lesen oder hören"
              description="Die wichtigsten Kapitel, Zitate, Insights und Aufgaben – auf Deutsch, von Menschen redigiert."
            />
            <Step
              number="4"
              title="Am Montag umsetzen"
              description={'Jede Zusammenfassung gibt dir 1–3 konkrete Schritte mit. Kein „irgendwann", sondern diese Woche.'}
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-secondary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Eine Stunde lesen. Ein Leben verändern.
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Starte heute mit 7 Tagen Vollzugriff. Wenn es nichts für dich ist, kündigst du mit zwei Klicks.
          </p>
          <Link
            href={isAuthenticated ? '/library' : '/register'}
            className="inline-flex items-center gap-2 bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-4 rounded-lg font-semibold transition-colors"
          >
            7 Tage kostenlos testen
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-sm mt-4 opacity-75">
            Über 450 Bücher · 220 mit echtem Audio · 6,67 €/Monat im Jahresabo
          </p>
        </div>
      </section>
    </div>
  );
}

function Feature({ icon, title, description, gradient }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="card p-6"
    >
      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-4`}>
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </motion.div>
  );
}

function Step({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="flex gap-6"
    >
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center text-xl font-bold">
        {number}
      </div>
      <div>
        <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </motion.div>
  );
}
