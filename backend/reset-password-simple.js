/**
 * Reset user password - Simple version
 * Set DATABASE_URL manually before running
 * 
 * Usage:
 * $env:DATABASE_URL="your-db-url-here"; node reset-password-simple.js mbanla@web.de NewPassword123
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetPassword() {
  const email = process.argv[2];
  const newPassword = process.argv[3];

  if (!email || !newPassword) {
    console.error('❌ Usage: node reset-password-simple.js <email> <new-password>');
    console.log('\nExample:');
    console.log('  $env:DATABASE_URL="postgresql://..."; node reset-password-simple.js mbanla@web.de Admin2026!');
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not set!');
    console.log('\nRun this way:');
    console.log('  $env:DATABASE_URL="your-database-url"; node reset-password-simple.js mbanla@web.de Admin2026!');
    process.exit(1);
  }

  try {
    console.log(`🔍 Looking for user: ${email}...`);

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      console.log('\nMake sure you registered with this email!');
      process.exit(1);
    }

    console.log(`✅ User found: ${user.firstName} ${user.lastName}`);
    console.log(`📋 Role: ${user.role}`);

    // Hash the new password
    console.log('🔐 Hashing new password...');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    console.log('💾 Updating database...');
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });

    console.log(`\n✅ SUCCESS! Password reset complete!`);
    console.log(`\n🔐 New Login Credentials:`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${newPassword}`);
    console.log(`\n🎉 Login at: https://book-digest.com/login`);
    console.log(`   Or admin: https://book-digest.com/admin/dashboard`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
