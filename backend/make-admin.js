/**
 * Script to set a user as ADMIN
 * Usage: node make-admin.js <email>
 * Example: node make-admin.js admin@bookdigest.com
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function makeAdmin() {
  const email = process.argv[2];

  if (!email) {
    console.error('❌ Error: Email is required');
    console.log('Usage: node make-admin.js <email>');
    console.log('Example: node make-admin.js admin@bookdigest.com');
    process.exit(1);
  }

  try {
    console.log(`🔍 Looking for user: ${email}...`);

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      console.log('\n💡 Make sure the user has registered first.');
      process.exit(1);
    }

    console.log(`✅ User found: ${user.firstName} ${user.lastName} (${user.email})`);
    console.log(`📋 Current role: ${user.role}`);

    if (user.role === 'ADMIN') {
      console.log('✨ User is already an admin!');
      process.exit(0);
    }

    console.log('⚙️  Updating user role to ADMIN...');

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' }
    });

    console.log('✅ SUCCESS! User is now an admin.');
    console.log(`\n📊 Updated User Info:`);
    console.log(`   Name: ${updatedUser.firstName} ${updatedUser.lastName}`);
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   Role: ${updatedUser.role}`);
    console.log(`\n🎉 ${email} can now access the admin panel!`);
    console.log(`   Admin Panel: https://bookdigest-iota.vercel.app/admin/dashboard`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

makeAdmin();
