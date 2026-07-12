import dotenv from 'dotenv';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

dotenv.config();

const prisma = new PrismaClient();

const seedAdmin = {
  email: process.env.SEED_SUPER_ADMIN_EMAIL,
  password: process.env.SEED_SUPER_ADMIN_PASSWORD,
  name: process.env.SEED_SUPER_ADMIN_NAME,
};

async function main() {
  if (!seedAdmin.email || !seedAdmin.password || !seedAdmin.name) {
    console.error('❌ Missing seed administrator email, password, or name');
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
        name: seedAdmin.name,
        role: Role.ADMIN,
      },
    });
    console.log(`✅ Administrator created: ${admin.email}`);
  } else {
    console.log(`ℹ️  Administrator already exists: ${existingAdmin.email}`);
  }
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
