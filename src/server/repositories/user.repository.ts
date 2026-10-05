import { prisma } from "@/lib/db/prisma";
import type { Prisma, Role } from "@prisma/client";

type Client = typeof prisma | Prisma.TransactionClient;

export function findUserByEmail(email: string, client: Client = prisma) {
  return client.user.findUnique({ where: { email }, include: { church: true } });
}

export function findUserById(id: string) {
  return prisma.user.findUnique({ where: { id }, include: { church: true } });
}

export function findUserInChurch(id: string, churchId: string) {
  return prisma.user.findFirst({ where: { id, churchId } });
}

export function createUser(
  data: { name: string; email: string; passwordHash: string; churchId: string; role?: Role },
  client: Client = prisma
) {
  return client.user.create({ data });
}

export function setUserActive(id: string, active: boolean) {
  return prisma.user.update({ where: { id }, data: { active } });
}

export function setUserRole(id: string, role: Role) {
  return prisma.user.update({ where: { id }, data: { role } });
}

export function countUsers(churchId: string) {
  return prisma.user.count({ where: { churchId } });
}

export function countActiveAdmins(churchId: string) {
  return prisma.user.count({ where: { churchId, role: "ADMIN", active: true } });
}

export function listUsers(churchId: string) {
  return prisma.user.findMany({
    where: { churchId },
    orderBy: { createdAt: "desc" },
    include: {
      pet: { select: { level: true, totalXp: true } },
      _count: { select: { checkIns: true } },
    },
  });
}
