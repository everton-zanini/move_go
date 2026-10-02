import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";

type Client = typeof prisma | Prisma.TransactionClient;

export function findUserByEmail(email: string, client: Client = prisma) {
  return client.user.findUnique({ where: { email } });
}

export function findUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export function createUser(
  data: { name: string; email: string; passwordHash: string },
  client: Client = prisma
) {
  return client.user.create({ data });
}

export function setUserActive(id: string, active: boolean) {
  return prisma.user.update({ where: { id }, data: { active } });
}

export function countUsers() {
  return prisma.user.count();
}

export function listUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      pet: { select: { level: true, totalXp: true } },
      _count: { select: { checkIns: true } },
    },
  });
}
