import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const seedAdmin = {
  email: process.env.SEED_SUPER_ADMIN_EMAIL,
  password: process.env.SEED_SUPER_ADMIN_PASSWORD,
}

async function main() {
  if (!seedAdmin.email || !seedAdmin.password) {
    console.error('❌ Missing seed admin credentials');
    process.exit(1);
  }

  const existingAdmin = await prisma.user.findUnique({
    where: { email: seedAdmin.email },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(seedAdmin.password, 12);
    const admin = await prisma.user.create({
      data: {
        email: seedAdmin.email,
        password: hashedPassword,
        name: 'System Admin',
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
