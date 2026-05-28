import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;
const FROM_EMAIL = process.env.FROM_EMAIL || 'BookDigest <onboarding@resend.dev>';
const SITE_URL = process.env.FRONTEND_URL || 'https://bookdigest-iota.vercel.app';

// Helper to check if email service is enabled
function isEmailEnabled(): boolean {
  return !!resend;
}

export class EmailService {
  /**
   * Send welcome email to new users
   */
  static async sendWelcomeEmail(user: { email: string; firstName: string }) {
    if (!isEmailEnabled()) {
      console.log('⚠️  Email service not configured, skipping welcome email');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      await resend!.emails.send({
        from: FROM_EMAIL,
        to: user.email,
        subject: 'Welcome to BookDigest! 🎉',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
              .feature-list { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .feature-item { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
              .feature-item:last-child { border-bottom: none; }
              .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📚 Welcome to BookDigest!</h1>
              </div>
              <div class="content">
                <h2>Hi ${user.firstName}! 👋</h2>
                <p>Thanks for joining BookDigest! You now have access to <strong>454+ AI-powered book summaries</strong> from the world's best business, self-help, and personal development books.</p>
                
                <div class="feature-list">
                  <div class="feature-item">📖 <strong>3 Free Summaries Per Month</strong> - Start learning today!</div>
                  <div class="feature-item">⚡ <strong>15-Minute Reads</strong> - Get key insights fast</div>
                  <div class="feature-item">🎧 <strong>Audio Narrations</strong> - Listen on the go (Premium)</div>
                  <div class="feature-item">⭐ <strong>Save Favorites</strong> - Build your personal library</div>
                  <div class="feature-item">📊 <strong>Track Progress</strong> - See how much you've learned</div>
                </div>

                <p style="text-align: center;">
                  <a href="${SITE_URL}/categories" class="button">Start Reading Now →</a>
                </p>

                <p><strong>Popular Categories:</strong></p>
                <ul>
                  <li>Business & Leadership</li>
                  <li>Self-Help & Motivation</li>
                  <li>Productivity & Time Management</li>
                  <li>Personal Finance</li>
                  <li>Health & Wellness</li>
                </ul>

                <p>Need help? Just reply to this email and we'll be happy to assist!</p>
                
                <p>Happy reading! 📚<br>The BookDigest Team</p>
              </div>
              <div class="footer">
                <p>BookDigest - Learn from the best books in 15 minutes<br>
                <a href="${SITE_URL}/terms">Terms</a> | <a href="${SITE_URL}/privacy">Privacy</a></p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
      
      console.log(`✅ Welcome email sent to ${user.email}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to send welcome email:', error);
      return { success: false, error };
    }
  }

  /**
   * Schedule the Day-3 "discovery" email — sent 3 days after signup.
   * Re-engages users who haven't returned by suggesting popular books.
   */
  static async scheduleDay3Email(user: { email: string; firstName: string }) {
    if (!isEmailEnabled()) return { success: false, error: 'Email service not configured' };

    const scheduledAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    try {
      const result = await resend!.emails.send({
        from: FROM_EMAIL,
        to: user.email,
        subject: `${user.firstName}, 5 books most readers start with 📚`,
        scheduledAt,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .book { background: white; padding: 16px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #2563eb; }
              .book-title { font-weight: bold; color: #1e40af; }
              .book-takeaway { font-size: 14px; color: #6b7280; margin: 6px 0 0; }
              .button { background: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; font-weight: bold; }
              .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📚 Where most people start</h1>
              </div>
              <div class="content">
                <p>Hi ${user.firstName},</p>
                <p>You signed up a few days ago — welcome again. New readers always ask the same question: <em>"Out of 900+ books, where do I start?"</em></p>
                <p>Here are 5 that consistently get readers hooked:</p>

                <div class="book">
                  <div class="book-title">Atomic Habits — James Clear</div>
                  <div class="book-takeaway">Why tiny changes compound, and how to design systems that make good habits automatic.</div>
                </div>
                <div class="book">
                  <div class="book-title">The Book Thief — Markus Zusak</div>
                  <div class="book-takeaway">Death narrates a girl's story in WWII Germany. One of the most-read books on the platform.</div>
                </div>
                <div class="book">
                  <div class="book-title">Me Before You — Jojo Moyes</div>
                  <div class="book-takeaway">A story about choosing how to live. Short, devastating, unforgettable.</div>
                </div>
                <div class="book">
                  <div class="book-title">The Subtle Art of Not Giving a F*ck — Mark Manson</div>
                  <div class="book-takeaway">A counterintuitive approach to figuring out what actually matters to you.</div>
                </div>
                <div class="book">
                  <div class="book-title">The Art of Racing in the Rain — Garth Stein</div>
                  <div class="book-takeaway">Told from a dog's perspective. Funny, philosophical, devastating.</div>
                </div>

                <p style="text-align: center;">
                  <a href="${SITE_URL}/library" class="button">Browse all 900+ summaries →</a>
                </p>

                <p style="font-size: 14px; color: #6b7280;">Reply to this email if you want a personal recommendation — I read every message.</p>
                <p>Happy reading,<br>The BookDigest Team</p>
              </div>
              <div class="footer">
                <a href="${SITE_URL}/terms">Terms</a> | <a href="${SITE_URL}/privacy">Privacy</a>
              </div>
            </div>
          </body>
          </html>
        `,
      });
      console.log(`📬 Day-3 email scheduled for ${user.email} (id: ${result.data?.id})`);
      return { success: true, id: result.data?.id };
    } catch (error) {
      console.error('❌ Failed to schedule Day-3 email:', error);
      return { success: false, error };
    }
  }

  /**
   * Schedule the Day-7 "upgrade nudge" email — sent 7 days after signup.
   * Pitches the 7-day free trial / annual plan to free users.
   */
  static async scheduleDay7Email(user: { email: string; firstName: string }) {
    if (!isEmailEnabled()) return { success: false, error: 'Email service not configured' };

    const scheduledAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    try {
      const result = await resend!.emails.send({
        from: FROM_EMAIL,
        to: user.email,
        subject: `${user.firstName}, want unlimited access? (7-day free trial inside)`,
        scheduledAt,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .compare { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .compare-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
              .compare-row:last-child { border-bottom: none; }
              .compare-row .yes { color: #10b981; font-weight: bold; }
              .compare-row .no { color: #ef4444; }
              .pricing-card { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 24px; border-radius: 10px; text-align: center; margin: 24px 0; }
              .button { background: white; color: #1e40af; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0; font-weight: bold; }
              .secondary { font-size: 14px; opacity: 0.85; }
              .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>One week in — how's it going?</h1>
              </div>
              <div class="content">
                <p>Hi ${user.firstName},</p>
                <p>You've been with BookDigest for a week. If you've been reading, you've probably hit the 3-summary free monthly limit.</p>

                <p>Here's what Premium unlocks:</p>

                <div class="compare">
                  <div class="compare-row">
                    <span>Book summaries per month</span>
                    <span><span class="no">3</span> → <span class="yes">Unlimited</span></span>
                  </div>
                  <div class="compare-row">
                    <span>Real audio narration (220 books)</span>
                    <span class="yes">✓ Included</span>
                  </div>
                  <div class="compare-row">
                    <span>Offline reading</span>
                    <span class="yes">✓ Included</span>
                  </div>
                  <div class="compare-row">
                    <span>Ad-free experience</span>
                    <span class="yes">✓ Included</span>
                  </div>
                  <div class="compare-row">
                    <span>Early access to new summaries</span>
                    <span class="yes">✓ Included</span>
                  </div>
                </div>

                <div class="pricing-card">
                  <p style="margin: 0; font-size: 14px; opacity: 0.9;">Try Premium free for 7 days</p>
                  <h2 style="margin: 8px 0; font-size: 32px;">€79.99/year</h2>
                  <p class="secondary" style="margin: 0;">That's €6.67/month — half the price of Blinkist</p>
                  <a href="${SITE_URL}/pricing" class="button">Start free trial →</a>
                </div>

                <p style="font-size: 14px; color: #6b7280; text-align: center;">No charges during the trial. Cancel anytime.</p>

                <p style="margin-top: 30px;">Not ready? No problem — your free 3 summaries refresh next month.</p>

                <p>Either way, thanks for being here.<br>The BookDigest Team</p>
              </div>
              <div class="footer">
                <a href="${SITE_URL}/terms">Terms</a> | <a href="${SITE_URL}/privacy">Privacy</a>
              </div>
            </div>
          </body>
          </html>
        `,
      });
      console.log(`📬 Day-7 email scheduled for ${user.email} (id: ${result.data?.id})`);
      return { success: true, id: result.data?.id };
    } catch (error) {
      console.error('❌ Failed to schedule Day-7 email:', error);
      return { success: false, error };
    }
  }

  /**
   * Send payment confirmation email
   */
  static async sendPaymentConfirmation(
    user: { email: string; firstName: string },
    payment: { amount: number; plan: string; currency?: string }
  ) {
    if (!isEmailEnabled()) {
      console.log('⚠️  Email service not configured, skipping payment confirmation');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const currency = payment.currency || '€';
      
      await resend!.emails.send({
        from: FROM_EMAIL,
        to: user.email,
        subject: 'Payment Confirmed - Welcome to Premium! 💳',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
              .receipt { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #10b981; }
              .receipt-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
              .total { font-weight: bold; font-size: 18px; }
              .benefits { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .benefit-item { padding: 8px 0; }
              .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Thank You ${user.firstName}!</h1>
                <p style="font-size: 18px; margin: 10px 0 0 0;">Your payment has been confirmed</p>
              </div>
              <div class="content">
                <p>Your premium subscription is now active! Welcome to unlimited book summaries.</p>
                
                <div class="receipt">
                  <h3 style="margin-top: 0;">Payment Receipt</h3>
                  <div class="receipt-row">
                    <span>Plan:</span>
                    <strong>${payment.plan}</strong>
                  </div>
                  <div class="receipt-row">
                    <span>Amount:</span>
                    <strong>${currency}${payment.amount.toFixed(2)}</strong>
                  </div>
                  <div class="receipt-row">
                    <span>Date:</span>
                    <strong>${new Date().toLocaleDateString()}</strong>
                  </div>
                  <div class="receipt-row total">
                    <span>Total Paid:</span>
                    <span>${currency}${payment.amount.toFixed(2)}</span>
                  </div>
                </div>

                <div class="benefits">
                  <h3>Your Premium Benefits:</h3>
                  <div class="benefit-item">✅ <strong>Unlimited Access</strong> - Read all 454+ summaries</div>
                  <div class="benefit-item">✅ <strong>Audio Narrations</strong> - Listen to summaries</div>
                  <div class="benefit-item">✅ <strong>Offline Downloads</strong> - Read anywhere</div>
                  <div class="benefit-item">✅ <strong>Ad-Free Experience</strong> - Distraction-free reading</div>
                  <div class="benefit-item">✅ <strong>Early Access</strong> - New summaries first</div>
                  <div class="benefit-item">✅ <strong>Priority Support</strong> - Faster help when needed</div>
                </div>

                <p style="text-align: center;">
                  <a href="${SITE_URL}/library" class="button">Browse All Books →</a>
                </p>

                <p>Thank you for supporting BookDigest! We're excited to be part of your learning journey.</p>
                
                <p>Best regards,<br>The BookDigest Team</p>
              </div>
              <div class="footer">
                <p>Need help? Reply to this email or visit our <a href="${SITE_URL}/contact">support page</a><br>
                <a href="${SITE_URL}/terms">Terms</a> | <a href="${SITE_URL}/privacy">Privacy</a></p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
      
      console.log(`✅ Payment confirmation sent to ${user.email}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to send payment confirmation:', error);
      return { success: false, error };
    }
  }

  /**
   * Send payment failed notification
   */
  static async sendPaymentFailed(user: { email: string; firstName: string }) {
    if (!isEmailEnabled()) {
      console.log('⚠️  Email service not configured, skipping payment failed email');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      await resend!.emails.send({
        from: FROM_EMAIL,
        to: user.email,
        subject: '⚠️ Payment Failed - Action Required',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
              .warning-box { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px; }
              .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>⚠️ Payment Failed</h1>
              </div>
              <div class="content">
                <p>Hi ${user.firstName},</p>
                <p>We were unable to process your subscription payment.</p>
                
                <div class="warning-box">
                  <strong>⏰ Action Required:</strong> Your subscription will be cancelled in <strong>3 days</strong> if payment is not received.
                </div>

                <p><strong>Common reasons for payment failure:</strong></p>
                <ul>
                  <li>Expired credit card</li>
                  <li>Insufficient funds</li>
                  <li>Card issuer declined the transaction</li>
                  <li>Incorrect billing information</li>
                </ul>

                <p style="text-align: center;">
                  <a href="${SITE_URL}/dashboard" class="button">Update Payment Method →</a>
                </p>

                <p>Once you update your payment method, we'll automatically retry the payment.</p>
                
                <p>If you have any questions or need help, please don't hesitate to contact us.</p>
                
                <p>Best regards,<br>The BookDigest Team</p>
              </div>
              <div class="footer">
                <p>Need help? <a href="${SITE_URL}/contact">Contact Support</a><br>
                <a href="${SITE_URL}/terms">Terms</a> | <a href="${SITE_URL}/privacy">Privacy</a></p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
      
      console.log(`✅ Payment failed email sent to ${user.email}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to send payment failed email:', error);
      return { success: false, error };
    }
  }

  /**
   * Send renewal reminder (3 days before renewal)
   */
  static async sendRenewalReminder(
    user: { email: string; firstName: string },
    subscription: { amount: number; plan: string; renewalDate: Date; currency?: string }
  ) {
    if (!isEmailEnabled()) {
      console.log('⚠️  Email service not configured, skipping renewal reminder');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const currency = subscription.currency || '€';
      
      await resend!.emails.send({
        from: FROM_EMAIL,
        to: user.email,
        subject: '🔔 Your Subscription Renews in 3 Days',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #2563eb; }
              .info-row { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
              .info-row:last-child { border-bottom: none; }
              .button { background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 5px; }
              .button-secondary { background: #6b7280; }
              .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔔 Subscription Renewal Reminder</h1>
              </div>
              <div class="content">
                <p>Hi ${user.firstName},</p>
                <p>Your BookDigest premium subscription will automatically renew in <strong>3 days</strong>.</p>
                
                <div class="info-box">
                  <h3 style="margin-top: 0;">Renewal Details:</h3>
                  <div class="info-row">
                    <strong>Plan:</strong> ${subscription.plan}
                  </div>
                  <div class="info-row">
                    <strong>Amount:</strong> ${currency}${subscription.amount.toFixed(2)}
                  </div>
                  <div class="info-row">
                    <strong>Renewal Date:</strong> ${subscription.renewalDate.toLocaleDateString()}
                  </div>
                </div>

                <p><strong>No action needed!</strong> Your subscription will automatically renew using your saved payment method.</p>

                <p>Want to make changes?</p>
                <p style="text-align: center;">
                  <a href="${SITE_URL}/dashboard" class="button">Update Payment Method</a>
                  <a href="${SITE_URL}/subscription/cancel" class="button button-secondary">Cancel Subscription</a>
                </p>

                <p>Thank you for being a premium member! We appreciate your continued support.</p>
                
                <p>Best regards,<br>The BookDigest Team</p>
              </div>
              <div class="footer">
                <p>Questions? <a href="${SITE_URL}/contact">Contact Us</a><br>
                <a href="${SITE_URL}/terms">Terms</a> | <a href="${SITE_URL}/privacy">Privacy</a></p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
      
      console.log(`✅ Renewal reminder sent to ${user.email}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to send renewal reminder:', error);
      return { success: false, error };
    }
  }

  /**
   * Send free tier limit reached notification
   */
  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(user: { email: string; firstName: string; resetUrl: string }) {
    if (!isEmailEnabled()) {
      console.log('⚠️  Email service not configured, skipping password reset email');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      await resend!.emails.send({
        from: FROM_EMAIL,
        to: user.email,
        subject: '🔐 Reset Your Password - BookDigest',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { background: #2563eb; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; font-weight: bold; }
              .warning-box { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px; }
              .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔐 Reset Your Password</h1>
              </div>
              <div class="content">
                <p>Hi ${user.firstName},</p>
                <p>We received a request to reset your password for your BookDigest account.</p>
                
                <p style="text-align: center;">
                  <a href="${user.resetUrl}" class="button">Reset Password →</a>
                </p>

                <p>Or copy and paste this link into your browser:</p>
                <p style="background: white; padding: 15px; border-radius: 6px; word-break: break-all; font-size: 14px; color: #4b5563;">
                  ${user.resetUrl}
                </p>

                <div class="warning-box">
                  <strong>⏰ This link expires in 1 hour</strong>
                </div>

                <p><strong>Didn't request this?</strong></p>
                <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
                
                <p>For security reasons:</p>
                <ul>
                  <li>Never share this link with anyone</li>
                  <li>We'll never ask for your password via email</li>
                  <li>This link can only be used once</li>
                </ul>

                <p>Need help? Reply to this email and we'll assist you!</p>
                
                <p>Best regards,<br>The BookDigest Team</p>
              </div>
              <div class="footer">
                <p>BookDigest - Learn from the best books in 15 minutes<br>
                <a href="${SITE_URL}/terms">Terms</a> | <a href="${SITE_URL}/privacy">Privacy</a></p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
      
      console.log(`✅ Password reset email sent to ${user.email}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error);
      return { success: false, error };
    }
  }

  /**
   * Send streak milestone celebration when a user hits 3 / 7 / 30 / 100 day streak.
   * Triggered from progress.controller when computeUpdatedStreak crosses a threshold.
   */
  static async sendStreakMilestone(
    user: { email: string; firstName: string },
    days: number
  ) {
    if (!isEmailEnabled()) {
      console.log('⚠️  Email service not configured, skipping streak milestone email');
      return { success: false, error: 'Email service not configured' };
    }

    const messageMap: Record<number, { headline: string; body: string }> = {
      3: {
        headline: "You're on a 3-day streak 🔥",
        body: "Three days in a row. Most people quit on day 2 — you didn't. Keep going: 4 days locks in the habit, 7 days makes it part of who you are.",
      },
      7: {
        headline: 'One full week. 7-day streak 🔥🔥',
        body: "A week of consistent reading. Research shows 7 days is where new habits stop feeling like effort. Next stop: 30 days.",
      },
      30: {
        headline: '30 days. You\'re a different reader now 🏆',
        body: "Thirty consecutive days. That's not a streak — that's an identity. Most people don't read 30 books in a year. You've now built the system that makes it inevitable.",
      },
      100: {
        headline: '100-DAY STREAK. 🏆🏆🏆',
        body: "One hundred days. Hit reply and tell us what you've read — we want to feature you. This is the rarest milestone on BookDigest.",
      },
    };
    const msg = messageMap[days];
    if (!msg) return { success: false, error: `No template for ${days}-day milestone` };

    try {
      await resend!.emails.send({
        from: FROM_EMAIL,
        to: user.email,
        subject: msg.headline,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .streak-num { font-size: 72px; font-weight: bold; line-height: 1; margin: 0; }
              .streak-label { font-size: 18px; opacity: 0.95; margin: 8px 0 0; letter-spacing: 1px; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { background: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; font-weight: bold; }
              .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <p class="streak-num">${days}</p>
                <p class="streak-label">DAY STREAK</p>
              </div>
              <div class="content">
                <h2>${msg.headline}</h2>
                <p>Hi ${user.firstName},</p>
                <p>${msg.body}</p>
                <p style="text-align: center;">
                  <a href="${SITE_URL}/dashboard" class="button">Keep the streak alive →</a>
                </p>
                <p>Proud of you,<br>The BookDigest Team</p>
              </div>
              <div class="footer">
                <a href="${SITE_URL}/terms">Terms</a> | <a href="${SITE_URL}/privacy">Privacy</a>
              </div>
            </div>
          </body>
          </html>
        `,
      });
      console.log(`✅ Streak milestone (${days}d) sent to ${user.email}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to send streak milestone email:', error);
      return { success: false, error };
    }
  }

  /**
   * Warn a user that their streak is about to break (haven't read today, end of day approaching).
   * Triggered from the daily streak-warning cron job.
   */
  static async sendStreakAtRisk(
    user: { email: string; firstName: string },
    currentStreak: number
  ) {
    if (!isEmailEnabled()) {
      console.log('⚠️  Email service not configured, skipping streak warning');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      await resend!.emails.send({
        from: FROM_EMAIL,
        to: user.email,
        subject: `⏰ Your ${currentStreak}-day streak ends at midnight`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .streak-box { background: white; padding: 24px; border-radius: 10px; text-align: center; margin: 20px 0; border: 2px solid #f59e0b; }
              .streak-num { font-size: 56px; font-weight: bold; color: #f59e0b; margin: 0; line-height: 1; }
              .streak-label { font-size: 14px; color: #6b7280; margin: 8px 0 0; letter-spacing: 1px; }
              .button { background: #f59e0b; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; font-weight: bold; font-size: 16px; }
              .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>⏰ Don't lose it now</h1>
              </div>
              <div class="content">
                <p>Hi ${user.firstName},</p>
                <p>You haven't read today, and your streak resets at midnight.</p>

                <div class="streak-box">
                  <p class="streak-num">${currentStreak}</p>
                  <p class="streak-label">DAYS — DON'T BREAK IT</p>
                </div>

                <p>One 15-minute summary is enough to keep it alive.</p>

                <p style="text-align: center;">
                  <a href="${SITE_URL}/library" class="button">Read one now →</a>
                </p>

                <p style="font-size: 14px; color: #6b7280;">Don't want streak reminders? Reply with "no streak emails" and we'll turn them off for you.</p>
                <p>The BookDigest Team</p>
              </div>
              <div class="footer">
                <a href="${SITE_URL}/terms">Terms</a> | <a href="${SITE_URL}/privacy">Privacy</a>
              </div>
            </div>
          </body>
          </html>
        `,
      });
      console.log(`✅ Streak warning (${currentStreak}d at risk) sent to ${user.email}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to send streak warning email:', error);
      return { success: false, error };
    }
  }

  static async sendFreeTierLimitReached(user: { email: string; firstName: string }) {
    if (!isEmailEnabled()) {
      console.log('⚠️  Email service not configured, skipping free tier limit email');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      await resend!.emails.send({
        from: FROM_EMAIL,
        to: user.email,
        subject: '🎉 You\'ve Read 3 Summaries! Upgrade to Continue',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
              .benefits { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .benefit-item { padding: 8px 0; }
              .pricing { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
              .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Congratulations ${user.firstName}!</h1>
                <p style="font-size: 18px; margin: 10px 0 0 0;">You've read 3 book summaries this month</p>
              </div>
              <div class="content">
                <p>Great job on your learning journey! You've reached your free monthly limit.</p>
                
                <p>To continue reading and unlock all features, upgrade to Premium:</p>

                <div class="benefits">
                  <div class="benefit-item">✅ <strong>Unlimited Summaries</strong> - Read all 454+ books</div>
                  <div class="benefit-item">✅ <strong>Audio Narrations</strong> - Listen on the go</div>
                  <div class="benefit-item">✅ <strong>Offline Downloads</strong> - Read anytime, anywhere</div>
                  <div class="benefit-item">✅ <strong>Ad-Free Experience</strong> - Focus on learning</div>
                  <div class="benefit-item">✅ <strong>Early Access</strong> - New summaries first</div>
                </div>

                <div class="pricing">
                  <h3 style="margin-top: 0;">Premium Pricing</h3>
                  <p style="font-size: 24px; margin: 10px 0;"><strong>€9.99/month</strong> or <strong>€79.99/year</strong></p>
                  <p style="font-size: 14px; opacity: 0.9;">Save 33% with annual plan!</p>
                </div>

                <p style="text-align: center;">
                  <a href="${SITE_URL}/pricing" class="button">Upgrade to Premium →</a>
                </p>

                <p>Your free summaries will reset next month, or upgrade now for unlimited access!</p>
                
                <p>Happy learning! 📚<br>The BookDigest Team</p>
              </div>
              <div class="footer">
                <p>Questions? <a href="${SITE_URL}/contact">Contact Us</a><br>
                <a href="${SITE_URL}/terms">Terms</a> | <a href="${SITE_URL}/privacy">Privacy</a></p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
      
      console.log(`✅ Free tier limit email sent to ${user.email}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to send free tier limit email:', error);
      return { success: false, error };
    }
  }
}
