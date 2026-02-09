/**
 * Test email service
 * Run: node test-email.js
 */

require('dotenv').config({ path: '.env.production' });
const { Resend } = require('resend');

console.log('🔍 Testing Email Service...\n');

// Check environment variables
console.log('Environment Variables:');
console.log('  RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Set' : '❌ Missing');
console.log('  FROM_EMAIL:', process.env.FROM_EMAIL || '❌ Missing');

if (!process.env.RESEND_API_KEY) {
  console.error('\n❌ RESEND_API_KEY is not set!');
  console.log('Make sure you added it to Render environment variables.');
  process.exit(1);
}

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'BookDigest <onboarding@resend.dev>';

async function testEmail() {
  try {
    console.log('\n📧 Sending test email...');
    
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: 'banlam@ok.de', // Your verified Resend email
      subject: '✅ Test Email from BookDigest',
      html: `
        <h1>🎉 Email Service is Working!</h1>
        <p>This is a test email from your BookDigest backend.</p>
        <p>If you received this, your email service is configured correctly!</p>
        <p><strong>FROM_EMAIL:</strong> ${FROM_EMAIL}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      `,
    });
    
    console.log('\n✅ SUCCESS! Email sent!');
    console.log('Result:', JSON.stringify(result, null, 2));
    console.log('\n📬 Check your email inbox (and spam folder)');
    
  } catch (error) {
    console.error('\n❌ ERROR sending email:');
    console.error(error);
  }
}

testEmail();
