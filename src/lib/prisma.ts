import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  transactionOptions: {
    maxWait: 30000, // 15 seconds
    timeout: 30000, // 15 seconds
  },
});

export default prisma;
