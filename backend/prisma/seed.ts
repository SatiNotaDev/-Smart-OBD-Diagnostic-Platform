import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    console.log('ADMIN_EMAIL not set in environment. Skipping admin promotion.');
    return;
  }

  const user = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!user) {
    console.log(`User with email ${adminEmail} not found. Register first, then run seed again.`);
    return;
  }

  if (user.role === 'ADMIN') {
    console.log(`${adminEmail} is already ADMIN.`);
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { role: 'ADMIN' },
  });

  console.log(`Promoted ${adminEmail} to ADMIN.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
