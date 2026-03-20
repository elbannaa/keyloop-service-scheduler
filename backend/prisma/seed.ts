import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@scheduler.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 12);
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'System Admin',
        phone: '+1234567890',
        role: Role.ADMIN,
      },
    });
    console.log(`✅ Admin user created: ${admin.email}`);
  } else {
    console.log(`ℹ️  Admin user already exists: ${existingAdmin.email}`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
