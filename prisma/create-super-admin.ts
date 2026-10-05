/**
 * Cria (ou promove) a conta de super-admin da plataforma, sem rodar o seed completo.
 * Uso: SUPER_ADMIN_EMAIL=... SUPER_ADMIN_PASSWORD=... npx tsx prisma/create-super-admin.ts
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SUPER_ADMIN_EMAIL?.trim();
  const password = process.env.SUPER_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("Defina SUPER_ADMIN_EMAIL e SUPER_ADMIN_PASSWORD.");
  }
  if (password.length < 8) {
    throw new Error("A senha precisa ter pelo menos 8 caracteres.");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  // Super-admin não pertence a nenhuma igreja (churchId null).
  const user = await prisma.user.upsert({
    where: { email },
    update: { role: "SUPER_ADMIN", churchId: null, passwordHash, active: true },
    create: { name: "Super Admin", email, passwordHash, role: "SUPER_ADMIN" },
  });
  console.log(`✓ Super-admin pronto: ${user.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
