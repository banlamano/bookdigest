export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          Terms of Service
        </h1>
        
        <div className="card p-8 prose dark:prose-invert max-w-none">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
            Last updated: February 3, 2026
          </p>

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
        </div>
      </div>
    </div>
  );
}
