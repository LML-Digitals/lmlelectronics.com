import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await cleanDatabase();

  await addStaff();
}

async function cleanDatabase() {
  await prisma.staff.deleteMany();
}

async function addStaff() {
  console.log('Starting staff seed...');

  const hashedPassword = await bcrypt.hash('test', 10);
  await prisma.staff.create({
    data: {
      email: 'test@gmail.com',
      firstName: 'Test',
      lastName: 'User',
      phone: '1234567890',
      role: 'admin',
      password: hashedPassword,
      jobTitle: 'technician',
      isActive: true,
      availability: 'Full-time',
    },
  });
  console.log('Staff seed completed successfully');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
