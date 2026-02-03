export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          Cookie Policy
        </h1>
        
        <div className="card p-8 prose dark:prose-invert max-w-none">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
            Last updated: February 3, 2026
          </p>

          <h2>1. What Are Cookies?</h2>
          <p>
            Cookies are small text files that are placed on your device when you visit our website. 
            They help us provide you with a better experience by remembering your preferences and understanding how you use our service.
          </p>

          <h2>2. How We Use Cookies</h2>
          <p>BookDigest uses cookies for the following purposes:</p>

          <h3>2.1 Essential Cookies</h3>
          <p>These cookies are necessary for the website to function properly:</p>
          <ul>
            <li><strong>Authentication:</strong> Keep you logged in as you navigate the site</li>
            <li><strong>Security:</strong> Protect your account and detect fraudulent activity</li>
            <li><strong>Session Management:</strong> Remember your preferences during your visit</li>
          </ul>

          <h3>2.2 Analytics Cookies</h3>
          <p>These cookies help us understand how visitors use our website:</p>
          <ul>
            <li><strong>Google Analytics:</strong> Track page views, user behavior, and engagement</li>
            <li><strong>Performance Monitoring:</strong> Identify technical issues and improve speed</li>
            <li><strong>User Experience:</strong> Understand which features are most popular</li>
          </ul>

          <h3>2.3 Functional Cookies</h3>
          <p>These cookies enhance your experience:</p>
          <ul>
            <li><strong>Theme Preference:</strong> Remember your dark/light mode choice</li>
            <li><strong>Reading Progress:</strong> Save where you left off in a book</li>
            <li><strong>Language Selection:</strong> Remember your preferred language</li>
          </ul>

          <h3>2.4 Marketing Cookies</h3>
          <p>These cookies help us show you relevant content:</p>
          <ul>
            <li><strong>Personalization:</strong> Recommend books based on your interests</li>
            <li><strong>Advertising:</strong> Show relevant ads (if you're on the free tier)</li>
            <li><strong>Social Media:</strong> Enable sharing on social platforms</li>
          </ul>

          <h2>3. Types of Cookies We Use</h2>
          <table className="min-w-full">
            <thead>
              <tr>
                <th>Cookie Name</th>
                <th>Purpose</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>auth-token</td>
                <td>Keep you logged in</td>
                <td>7 days</td>
              </tr>
              <tr>
                <td>theme</td>
                <td>Remember dark/light mode</td>
                <td>1 year</td>
              </tr>
              <tr>
                <td>_ga</td>
                <td>Google Analytics</td>
                <td>2 years</td>
              </tr>
              <tr>
                <td>reading-progress</td>
                <td>Save your place in books</td>
                <td>30 days</td>
              </tr>
            </tbody>
          </table>

          <h2>4. Third-Party Cookies</h2>
          <p>We use services from trusted third parties that may set cookies:</p>
          <ul>
            <li><strong>Stripe:</strong> Secure payment processing</li>
            <li><strong>Google Analytics:</strong> Website analytics</li>
            <li><strong>Amazon Associates:</strong> Affiliate program tracking</li>
          </ul>

          <h2>5. Managing Cookies</h2>
          <p>You have several options to manage cookies:</p>

          <h3>5.1 Browser Settings</h3>
          <p>You can control cookies through your browser settings:</p>
          <ul>
            <li><strong>Chrome:</strong> Settings → Privacy and Security → Cookies</li>
            <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies</li>
            <li><strong>Safari:</strong> Preferences → Privacy → Cookies</li>
            <li><strong>Edge:</strong> Settings → Privacy → Cookies</li>
          </ul>

          <h3>5.2 Opt-Out Options</h3>
          <ul>
            <li><strong>Google Analytics:</strong> <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">Opt-out browser add-on</a></li>
            <li><strong>Advertising:</strong> Visit <a href="https://www.youronlinechoices.com/" target="_blank" rel="noopener noreferrer">Your Online Choices</a></li>
          </ul>

          <h2>6. Impact of Disabling Cookies</h2>
          <p>If you disable cookies, some features may not work properly:</p>
          <ul>
            <li>You may need to log in each time you visit</li>
            <li>Your preferences won't be saved</li>
            <li>Reading progress won't be tracked</li>
            <li>Personalized recommendations won't work</li>
          </ul>

          <h2>7. Cookie Consent</h2>
          <p>
            By using BookDigest, you consent to our use of cookies as described in this policy. 
            When you first visit our site, you'll see a cookie banner where you can accept or customize your cookie preferences.
          </p>

          <h2>8. Updates to This Policy</h2>
          <p>
            We may update this Cookie Policy from time to time. We will notify you of significant changes 
            by posting a notice on our website or sending you an email.
          </p>

          <h2>9. Contact Us</h2>
          <p>
            If you have questions about our use of cookies, please contact us at:
          </p>
          <ul>
            <li>Email: privacy@bookdigest.com</li>
            <li>Address: [Your Company Address]</li>
          </ul>

          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-0">
              <strong>Your Privacy Matters:</strong> We take your privacy seriously and use cookies 
              responsibly to enhance your experience while respecting your choices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
