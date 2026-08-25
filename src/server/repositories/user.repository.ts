import { prisma } from "@/lib/db/prisma";

export function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export function findUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export function createUser(data: { name: string; email: string; passwordHash: string }) {
  return prisma.user.create({ data });
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
