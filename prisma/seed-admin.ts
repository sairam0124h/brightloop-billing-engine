import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@brightloop.test";
  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    console.log(`Admin user ${email} already exists.`);
    return;
  }

  const passwordHash = await bcrypt.hash("Admin@12345", 12);
  const admin = await prisma.user.create({
    data: {
      email,
      name: "Admin",
      role: "ADMIN",
      passwordHash,
      mustResetPassword: false,
    },
  });

  console.log(`Created admin user: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
