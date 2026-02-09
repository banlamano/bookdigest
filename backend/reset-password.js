/**
 * Reset user password
 * Usage: node reset-password.js <email> <new-password>
 * Example: node reset-password.js mbanla@web.de MyNewPassword123
 */

require('dotenv').config({ path: '.env.production' });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetPassword() {
  const email = process.argv[2];
  const newPassword = process.argv[3];

  if (!email || !newPassword) {
    console.error('❌ Usage: node reset-password.js <email> <new-password>');
    console.log('Example: node reset-password.js mbanla@web.de MyNewPassword123');
    process.exit(1);
  }

  try {
    console.log(`🔍 Looking for user: ${email}...`);

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      process.exit(1);
    }

    console.log(`✅ User found: ${user.firstName} ${user.lastName}`);
    console.log(`📋 Role: ${user.role}`);

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });

    console.log(`\n✅ SUCCESS! Password reset for ${email}`);
    console.log(`\n🔐 New Login Credentials:`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${newPassword}`);
    console.log(`\n🎉 You can now login at: https://book-digest.com/login`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
