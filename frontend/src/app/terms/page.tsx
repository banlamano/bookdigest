'use client';

import { useLanguage } from '@/components/LanguageProvider';

export default function TermsPage() {
  const { language } = useLanguage();
  const isDe = language === 'de';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          {isDe ? 'Nutzungsbedingungen' : 'Terms of Service'}
        </h1>

        <div className="card p-8 prose dark:prose-invert max-w-none">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
            {isDe ? 'Zuletzt aktualisiert: 3. Februar 2026' : 'Last updated: February 3, 2026'}
          </p>

          {isDe ? (
            <>
              <h2>1. Annahme der Bedingungen</h2>
              <p>
                Durch den Zugriff auf und die Nutzung von BookDigest ("Dienst") akzeptieren Sie diese Nutzungsbedingungen und erklären sich mit ihnen einverstanden.
                Wenn Sie diesen Bedingungen nicht zustimmen, nutzen Sie unseren Dienst bitte nicht.
              </p>

              <h2>2. Beschreibung des Dienstes</h2>
              <p>
                BookDigest bietet Zugriff auf Buchzusammenfassungen im Text- und Audioformat über unsere Website und mobilen Anwendungen.
                Wir bieten sowohl kostenlose als auch Premium-Abonnements an.
              </p>

              <h2>3. Registrierung des Kontos</h2>
              <h3>3.1 Erstellung des Kontos</h3>
              <ul>
                <li>Sie müssen genaue und vollständige Informationen angeben</li>
                <li>Sie sind für die Sicherheit Ihres Kontos verantwortlich</li>
                <li>Sie müssen mindestens 13 Jahre alt sein</li>
                <li>Nur ein Konto pro Person</li>
              </ul>

              <h2>4. Abonnement und Abrechnung</h2>
              <h3>4.1 Kostenlose Stufe</h3>
              <ul>
                <li>Begrenzter Zugriff auf 3 Buchzusammenfassungen pro Monat</li>
                <li>Nur Basisfunktionen</li>
              </ul>

              <h3>4.2 Premium-Abonnement</h3>
              <ul>
                <li>Monatlich: 9,99 €/Monat</li>
                <li>Jährlich: 79,99 €/Jahr</li>
                <li>Unbegrenzter Zugriff auf alle Inhalte</li>
                <li>Audio-Narration inklusive</li>
                <li>Werbefreies Erlebnis</li>
              </ul>

              <h3>4.3 Abrechnung</h3>
              <ul>
                <li>Abonnements verlängern sich automatisch, sofern sie nicht gekündigt werden</li>
                <li>Zahlungen werden sicher über Stripe verarbeitet</li>
                <li>Preise können mit einer Frist von 30 Tagen geändert werden</li>
              </ul>

              <h2>5. Kündigung und Rückerstattung</h2>
              <p>
                Sie können Ihr Abonnement jederzeit kündigen. Ihr Zugriff bleibt bis zum Ende des laufenden Abrechnungszeitraums bestehen.
              </p>

              <h2>6. Zulässige Nutzung</h2>
              <p>Sie erklären sich damit einverstanden, Folgendes NICHT zu tun:</p>
              <ul>
                <li>Ihre Kontodaten mit anderen teilen</li>
                <li>Unsere Inhalte kopieren, verbreiten oder weiterverkaufen</li>
                <li>Automatisierte Tools zum Auslesen von Inhalten nutzen</li>
                <li>Versuchen, den Dienst zu hacken oder zu beeinträchtigen</li>
              </ul>

              <h2>7. Geistiges Eigentum</h2>
              <p>
                Alle Buchzusammenfassungen, Audio-Narrationen und Plattforminhalte sind Eigentum von BookDigest oder an uns lizenziert.
                Eine Vervielfältigung oder Verbreitung ohne Genehmigung ist untersagt.
              </p>

              <h2>8. Gewährleistungsausschluss</h2>
              <p>
                Der Dienst wird "WIE BESEHEN" bereitgestellt. Wir garantieren keinen unterbrechungsfreien Dienst
                oder die Richtigkeit aller Zusammenfassungen.
              </p>

              <h2>9. Haftungsbeschränkung</h2>
              <p>
                BookDigest haftet nicht für indirekte oder Folgeschäden, die aus der Nutzung des Dienstes entstehen.
              </p>

              <h2>10. Beendigung</h2>
              <p>
                Wir behalten uns das Recht vor, Ihr Konto bei Verstößen gegen diese Bedingungen oder Betrugsverdacht zu sperren.
              </p>

              <h2>11. Kontaktinformationen</h2>
              <ul>
                <li>E-Mail: legal@bookdigest.com</li>
                <li>Adresse: [Ihre Firmenadresse]</li>
              </ul>

              <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-0">
                  <strong>Wichtig:</strong> Mit der Nutzung von BookDigest bestätigen Sie, dass Sie diese Nutzungsbedingungen
                  und unsere Datenschutzerklärung gelesen und verstanden haben.
                </p>
              </div>
            </>
          ) : (
            <>
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing and using BookDigest ("Service"), you accept and agree to be bound by these Terms of Service.
                If you do not agree to these terms, please do not use our Service.
              </p>

              <h2>2. Description of Service</h2>
              <p>
                BookDigest provides access to book summaries in text and audio format through our website and mobile applications.
                We offer both free and premium subscription tiers.
              </p>

              <h2>3. Account Registration</h2>
              <h3>3.1 Account Creation</h3>
              <ul>
                <li>You must provide accurate and complete information</li>
                <li>You are responsible for maintaining account security</li>
                <li>You must be at least 13 years old to create an account</li>
                <li>One account per person</li>
              </ul>

              <h3>3.2 Account Security</h3>
              <p>
                You are responsible for all activities under your account. Notify us immediately of any unauthorized access.
              </p>

              <h2>4. Subscription and Billing</h2>
              <h3>4.1 Free Tier</h3>
              <ul>
                <li>Limited access to 3 book summaries per month</li>
                <li>Basic features only</li>
                <li>May include advertisements</li>
              </ul>

              <h3>4.2 Premium Subscription</h3>
              <ul>
                <li>Monthly: €9.99/month</li>
                <li>Yearly: €79.99/year</li>
                <li>Unlimited access to all content</li>
                <li>Audio narration included</li>
                <li>Ad-free experience</li>
              </ul>

              <h3>4.3 Billing</h3>
              <ul>
                <li>Subscriptions automatically renew unless cancelled</li>
                <li>Payments are processed securely through Stripe</li>
                <li>Prices may change with 30 days notice</li>
                <li>No refunds for partial months</li>
              </ul>

              <h3>4.4 Free Trial</h3>
              <ul>
                <li>7-day free trial for new premium users</li>
                <li>Credit card required but not charged during trial</li>
                <li>Cancel anytime during trial with no charge</li>
                <li>One free trial per user</li>
              </ul>

              <h2>5. Cancellation and Refunds</h2>
              <h3>5.1 Cancellation</h3>
              <p>
                You may cancel your subscription at any time. Your access will continue until the end of the current billing period.
              </p>

              <h3>5.2 Refund Policy</h3>
              <ul>
                <li>No refunds for partial months</li>
                <li>Refunds within 7 days of annual subscription purchase (if no content accessed)</li>
                <li>Refunds processed within 5-10 business days</li>
              </ul>

              <h2>6. Acceptable Use</h2>
              <p>You agree NOT to:</p>
              <ul>
                <li>Share your account credentials with others</li>
                <li>Copy, distribute, or resell our content</li>
                <li>Use automated tools to scrape content</li>
                <li>Attempt to hack or compromise the service</li>
                <li>Upload malicious code or viruses</li>
                <li>Violate any applicable laws or regulations</li>
              </ul>

              <h2>7. Intellectual Property</h2>
              <h3>7.1 Our Content</h3>
              <p>
                All book summaries, audio narrations, and platform content are owned by BookDigest or licensed to us.
                You may not reproduce, distribute, or create derivative works without permission.
              </p>

              <h3>7.2 Fair Use</h3>
              <p>
                Our summaries are created under fair use principles for educational purposes.
                We respect copyright and will respond to valid DMCA notices.
              </p>

              <h2>8. Disclaimer of Warranties</h2>
              <p>
                The Service is provided "AS IS" without warranties of any kind. We do not guarantee:
              </p>
              <ul>
                <li>Uninterrupted or error-free service</li>
                <li>Accuracy or completeness of summaries</li>
                <li>Availability of specific titles</li>
              </ul>

              <h2>9. Limitation of Liability</h2>
              <p>
                BookDigest shall not be liable for any indirect, incidental, special, or consequential damages
                arising from your use of the Service. Our total liability shall not exceed the amount you paid
                in the last 12 months.
              </p>

              <h2>10. Termination</h2>
              <p>
                We reserve the right to suspend or terminate your account for:
              </p>
              <ul>
                <li>Violation of these Terms</li>
                <li>Fraudulent activity</li>
                <li>Non-payment of fees</li>
                <li>Any reason with 30 days notice</li>
              </ul>

              <h2>11. Changes to Terms</h2>
              <p>
                We may modify these Terms at any time. Significant changes will be notified via email.
                Continued use of the Service after changes constitutes acceptance.
              </p>

              <h2>12. Governing Law</h2>
              <p>
                These Terms are governed by the laws of [Your Jurisdiction]. Any disputes shall be resolved
                in the courts of [Your Jurisdiction].
              </p>

              <h2>13. Contact Information</h2>
              <p>
                For questions about these Terms, contact us at:
              </p>
              <ul>
                <li>Email: legal@bookdigest.com</li>
                <li>Address: [Your Company Address]</li>
              </ul>

              <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-0">
                  <strong>Important:</strong> By using BookDigest, you acknowledge that you have read, understood,
                  and agree to be bound by these Terms of Service and our Privacy Policy.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
