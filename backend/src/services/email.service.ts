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
