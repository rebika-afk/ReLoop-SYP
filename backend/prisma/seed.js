import bcrypt from 'bcryptjs';
import prisma from '../src/config/prisma.js';
import { env } from '../src/config/env.js';

export async function runSeed() {
  console.log('[Seed] Starting database seed...');

  const adminEmail = env.ADMIN_EMAIL;
  const adminPassword = env.ADMIN_PASSWORD;
  const adminName = env.ADMIN_NAME;

  if (!adminPassword) {
    throw new Error('ADMIN_PASSWORD environment variable is required to seed the admin account.');
  }

  if (!adminEmail) {
    throw new Error('ADMIN_EMAIL environment variable is required.');
  }

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    if (existingAdmin.role !== 'ADMIN') {
      throw new Error(
        `A user with email '${adminEmail}' already exists with role '${existingAdmin.role}'. Refusing to promote existing non-admin user to ADMIN.`
      );
    }
    console.log(`[Seed] Admin user already exists with email: ${adminEmail} (Role: ADMIN)`);
    return existingAdmin;
  } else {
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    const admin = await prisma.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        passwordHash,
        role: 'ADMIN',
        isActive: true,
      },
    });

    console.log(`[Seed] Admin account created successfully:`);
    console.log(`       ID: ${admin.id}`);
    console.log(`       Email: ${admin.email}`);
    console.log(`       Role: ${admin.role}`);
    return admin;
  }
}

// If executed directly from CLI
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  runSeed()
    .then(() => {
      console.log('[Seed] Database seed completed successfully.');
    })
    .catch((err) => {
      console.error('[Seed Error]', err.message);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
