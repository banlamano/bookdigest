'use client';

import { useLanguage } from '@/components/LanguageProvider';

export default function PrivacyPage() {
  const { language } = useLanguage();
  const isDe = language === 'de';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          {isDe ? 'Datenschutzerklärung' : 'Privacy Policy'}
        </h1>

        <div className="card p-8 prose dark:prose-invert max-w-none">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
            {isDe ? 'Zuletzt aktualisiert: 3. Februar 2026' : 'Last updated: February 3, 2026'}
          </p>

          {isDe ? (
            <>
              <h2>1. Einleitung</h2>
              <p>
                Willkommen bei BookDigest ("wir", "uns" oder "unser"). Wir respektieren Ihre Privatsphäre und verpflichten uns, Ihre persönlichen Daten zu schützen.
                Diese Datenschutzerklärung erklärt, wie wir Ihre Informationen sammeln, verwenden und schützen, wenn Sie unseren Dienst nutzen.
              </p>

              <h2>2. Von uns gesammelte Informationen</h2>
              <h3>2.1 Personenbezogene Informationen</h3>
              <ul>
                <li>E-Mail-Adresse</li>
                <li>Name (Vor- und Nachname)</li>
                <li>Passwort (verschlüsselt)</li>
                <li>Zahlungsinformationen (sicher verarbeitet über Stripe)</li>
              </ul>

              <h3>2.2 Nutzungsinformationen</h3>
              <ul>
                <li>Bücher, die Sie lesen und hören</li>
                <li>Lesefortschritt und Statistiken</li>
                <li>Geräteinformationen und IP-Adresse</li>
                <li>Browsertyp und -version</li>
              </ul>

              <h2>3. Wie wir Ihre Informationen verwenden</h2>
              <p>Wir verwenden Ihre Informationen, um:</p>
              <ul>
                <li>Unseren Dienst bereitzustellen und aufrechtzuerhalten</li>
                <li>Ihr Abonnement und Ihre Zahlungen zu verarbeiten</li>
                <li>Ihnen dienstbezogene Mitteilungen zu senden</li>
                <li>Ihr Erlebnis und Ihre Empfehlungen zu personalisieren</li>
                <li>Unseren Dienst zu verbessern und neue Funktionen zu entwickeln</li>
                <li>Betrug zu verhindern und Sicherheit zu gewährleisten</li>
              </ul>

              <h2>4. Datenaustausch und Offenlegung</h2>
              <p>Wir verkaufen Ihre persönlichen Daten nicht. Wir können Daten teilen mit:</p>
              <ul>
                <li><strong>Dienstleistern:</strong> Stripe (Zahlungen), AWS (Hosting), E-Mail-Dienste</li>
                <li><strong>Rechtlichen Anforderungen:</strong> Wenn gesetzlich vorgeschrieben oder um unsere Rechte zu schützen</li>
                <li><strong>Geschäftsübertragungen:</strong> Im Falle einer Fusion, Übernahme oder eines Verkaufs</li>
              </ul>

              <h2>5. Datensicherheit</h2>
              <p>Wir implementieren branchenübliche Sicherheitsmaßnahmen, einschließlich:</p>
              <ul>
                <li>Verschlüsselung von Daten bei der Übertragung (HTTPS/SSL)</li>
                <li>Verschlüsselte Passwortspeicherung</li>
                <li>Regelmäßige Sicherheitsaudits</li>
                <li>Sichere Zahlungsabwicklung über Stripe</li>
              </ul>

              <h2>6. Ihre Rechte</h2>
              <p>Sie haben das Recht:</p>
              <ul>
                <li>Auf Ihre personenbezogenen Daten zuzugreifen</li>
                <li>Ungenaue Daten zu korrigieren</li>
                <li>Die Löschung Ihrer Daten zu verlangen</li>
                <li>Ihre Daten zu exportieren</li>
                <li>Sich von Marketing-Mitteilungen abzumelden</li>
                <li>Ihre Einwilligung jederzeit zu widerrufen</li>
              </ul>

              <h2>7. Cookies und Tracking</h2>
              <p>
                Wir verwenden Cookies und ähnliche Technologien, um Ihr Erlebnis zu verbessern, Ihre Präferenzen zu speichern
                und Nutzungsmuster zu analysieren. Sie können Cookies über Ihre Browsereinstellungen steuern.
              </p>

              <h2>8. Datenspeicherung</h2>
              <p>
                Wir speichern Ihre personenbezogenen Daten so lange, wie Ihr Konto aktiv ist oder wie es für die Bereitstellung der Dienste erforderlich ist.
                Sie können jederzeit die Löschung Ihres Kontos beantragen.
              </p>

              <h2>9. Privatsphäre von Kindern</h2>
              <p>
                Unser Dienst ist nicht für Kinder unter 13 Jahren gedacht. Wir sammeln wissentlich keine Daten von Kindern unter 13 Jahren.
              </p>

              <h2>10. Internationale Datentransfers</h2>
              <p>
                Ihre Daten können in andere Länder als Ihr eigenes übertragen und dort verarbeitet werden.
                Wir stellen sicher, dass angemessene Schutzmaßnahmen für solche Übertragungen getroffen werden.
              </p>

              <h2>11. Änderungen an dieser Richtlinie</h2>
              <p>
                Wir können diese Datenschutzerklärung von Zeit zu Zeit aktualisieren. Wir werden Sie über wesentliche Änderungen
                per E-Mail oder über unseren Dienst informieren.
              </p>

              <h2>12. Kontaktieren Sie uns</h2>
              <p>
                Wenn Sie Fragen zu dieser Datenschutzerklärung oder Ihren Daten haben, kontaktieren Sie uns bitte unter:
              </p>
              <ul>
                <li>E-Mail: privacy@bookdigest.com</li>
                <li>Adresse: [Ihre Firmenadresse]</li>
              </ul>

              <div className="mt-8 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-0">
                  <strong>DSGVO-Konformität:</strong> Wenn Sie im Europäischen Wirtschaftsraum (EWR) ansässig sind,
                  haben Sie zusätzliche Rechte gemäß der Datenschutz-Grundverordnung (DSGVO).
                  Bitte kontaktieren Sie uns, um diese Rechte auszuüben.
                </p>
              </div>
            </>
          ) : (
            <>
              <h2>1. Introduction</h2>
              <p>
                Welcome to BookDigest ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data.
                This privacy policy explains how we collect, use, and safeguard your information when you use our service.
              </p>

              <h2>2. Information We Collect</h2>
              <h3>2.1 Personal Information</h3>
              <ul>
                <li>Email address</li>
                <li>Name (first and last)</li>
                <li>Password (encrypted)</li>
                <li>Payment information (processed securely through Stripe)</li>
              </ul>

              <h3>2.2 Usage Information</h3>
              <ul>
                <li>Books you read and listen to</li>
                <li>Reading progress and statistics</li>
                <li>Device information and IP address</li>
                <li>Browser type and version</li>
              </ul>

              <h2>3. How We Use Your Information</h2>
              <p>We use your information to:</p>
              <ul>
                <li>Provide and maintain our service</li>
                <li>Process your subscription and payments</li>
                <li>Send you service-related communications</li>
                <li>Personalize your experience and recommendations</li>
                <li>Improve our service and develop new features</li>
                <li>Prevent fraud and ensure security</li>
              </ul>

              <h2>4. Data Sharing and Disclosure</h2>
              <p>We do not sell your personal information. We may share data with:</p>
              <ul>
                <li><strong>Service Providers:</strong> Stripe (payments), AWS (hosting), email services</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale</li>
              </ul>

              <h2>5. Data Security</h2>
              <p>
                We implement industry-standard security measures including:
              </p>
              <ul>
                <li>Encryption of data in transit (HTTPS/SSL)</li>
                <li>Encrypted password storage</li>
                <li>Regular security audits</li>
                <li>Secure payment processing through Stripe</li>
              </ul>

              <h2>6. Your Rights</h2>
              <p>You have the right to:</p>
              <ul>
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Export your data</li>
                <li>Opt-out of marketing communications</li>
                <li>Withdraw consent at any time</li>
              </ul>

              <h2>7. Cookies and Tracking</h2>
              <p>
                We use cookies and similar technologies to enhance your experience, remember your preferences,
                and analyze usage patterns. You can control cookies through your browser settings.
              </p>

              <h2>8. Data Retention</h2>
              <p>
                We retain your personal data for as long as your account is active or as needed to provide services.
                You can request account deletion at any time.
              </p>

              <h2>9. Children's Privacy</h2>
              <p>
                Our service is not intended for children under 13. We do not knowingly collect data from children under 13.
              </p>

              <h2>10. International Data Transfers</h2>
              <p>
                Your data may be transferred to and processed in countries other than your own.
                We ensure appropriate safeguards are in place for such transfers.
              </p>

              <h2>11. Changes to This Policy</h2>
              <p>
                We may update this privacy policy from time to time. We will notify you of significant changes
                via email or through our service.
              </p>

              <h2>12. Contact Us</h2>
              <p>
                If you have questions about this privacy policy or your data, please contact us at:
              </p>
              <ul>
                <li>Email: privacy@bookdigest.com</li>
                <li>Address: [Your Company Address]</li>
              </ul>

              <div className="mt-8 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-0">
                  <strong>GDPR Compliance:</strong> If you are a resident of the European Economic Area (EEA),
                  you have additional rights under the General Data Protection Regulation (GDPR).
                  Please contact us to exercise these rights.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
