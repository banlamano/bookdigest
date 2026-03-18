import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@bookdigest.com';
  const password = 'AdminPassword123!';
  
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
