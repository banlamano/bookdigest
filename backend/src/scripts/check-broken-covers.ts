import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const books = await prisma.book.findMany({
    where: {
      title: {
        in: [
          'Die Kraft des positiven Denkens',
          'Die Macht Ihrer Absicht',
          'Die Unsterblichkeit der Henrietta Lacks'
        ]
      }
    },
    select: { title: true, coverImage: true }
  });
  console.log(books);
}
run().finally(() => prisma.$disconnect());
