const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clean() {
  try {
    await prisma.report.deleteMany();
    console.log('✅ DATABASE CLEANED: Duplicate reports removed.');
  } catch (err) {
    console.error('❌ CLEANUP FAILED:', err);
  } finally {
    await prisma.$disconnect();
  }
}

clean();
