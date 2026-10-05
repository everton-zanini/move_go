import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";

type Client = typeof prisma | Prisma.TransactionClient;

export function createCheckIn(data: Prisma.CheckInUncheckedCreateInput, client: Client = prisma) {
  return client.checkIn.create({ data });
}

export function findCheckIn(userId: string, eventId: string, client: Client = prisma) {
  return client.checkIn.findUnique({ where: { userId_eventId: { userId, eventId } } });
}

export async function listCheckedEventIds(userId: string, eventIds: string[], client: Client = prisma) {
  const rows = await client.checkIn.findMany({
    where: { userId, eventId: { in: eventIds } },
    select: { eventId: true },
  });
  return rows.map((r) => r.eventId);
}

export function countCheckIns(churchId: string, client: Client = prisma) {
  return client.checkIn.count({ where: { event: { churchId } } });
}

export function listRecentCheckIns(churchId: string, limit: number, client: Client = prisma) {
  return client.checkIn.findMany({
    where: { event: { churchId } },
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true } },
      event: { select: { name: true } },
    },
  });
}

/** Usuários com pelo menos 1 check-in — proxy simples de "usuários ativos" para o dashboard. */
export async function countDistinctCheckedInUsers(churchId: string, client: Client = prisma) {
  const rows = await client.checkIn.groupBy({ by: ["userId"], where: { event: { churchId } } });
  return rows.length;
}

export function countCheckInsForUser(userId: string, client: Client = prisma) {
  return client.checkIn.count({ where: { userId } });
}

/** Usado pelo critério SPECIAL_EVENT de conquistas: já fez check-in em algum evento com item especial. */
export async function hasCheckInOnSpecialEvent(userId: string, client: Client = prisma) {
  const count = await client.checkIn.count({
    where: { userId, event: { specialItemId: { not: null } } },
  });
  return count > 0;
}
