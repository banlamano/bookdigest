import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@bookdigest.com';
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    console.error('❌ ADMIN_PASSWORD environment variable is required. Set it before running this script.');
    process.exit(1);
  }
  
  const hashedPassword = await bcrypt.hash(password, 12);
  
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
      firstName: 'Master',
      lastName: 'Admin'
    },
    create: {
      email,
      password: hashedPassword,
      role: 'ADMIN',
      firstName: 'Master',
      lastName: 'Admin'
    }
  });

  console.log('✅ Admin account configured successfully.');
  console.log(`Email: ${user.email}`);
  console.log(`Password: ${password}`);
  console.log(`Role: ${user.role}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
