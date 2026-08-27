import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";

type Client = typeof prisma | Prisma.TransactionClient;

export function findEventByToken(token: string, client: Client = prisma) {
  return client.event.findUnique({ where: { qrCodeToken: token } });
}

export function findEventByShortCode(shortCode: string, client: Client = prisma) {
  return client.event.findUnique({ where: { shortCode } });
}

export function findEventById(id: string, client: Client = prisma) {
  return client.event.findUnique({ where: { id } });
}

export function listEvents(client: Client = prisma) {
  return client.event.findMany({ orderBy: { date: "desc" } });
}

/** Eventos ativos ainda por vir, para a agenda pública do jovem. */
export function listUpcomingActiveEvents(startOfToday: Date, client: Client = prisma) {
  return client.event.findMany({
    where: { active: true, date: { gte: startOfToday } },
    orderBy: { date: "asc" },
  });
}

export function createEvent(data: Prisma.EventUncheckedCreateInput, client: Client = prisma) {
  return client.event.create({ data });
}

export function updateEvent(id: string, data: Prisma.EventUncheckedUpdateInput, client: Client = prisma) {
  return client.event.update({ where: { id }, data });
}

export function deleteEvent(id: string, client: Client = prisma) {
  return client.event.delete({ where: { id } });
}

export function countCheckInsForEvent(eventId: string, client: Client = prisma) {
  return client.checkIn.count({ where: { eventId } });
}

/** Evento acontecendo agora, ou o próximo ativo a começar, para o card "evento atual" do dashboard. */
export async function findCurrentOrNextEvent(now: Date, client: Client = prisma) {
  const current = await client.event.findFirst({
    where: { active: true, startTime: { lte: now }, endTime: { gte: now } },
    orderBy: { startTime: "asc" },
  });
  if (current) return current;

  return client.event.findFirst({
    where: { active: true, startTime: { gt: now } },
    orderBy: { startTime: "asc" },
  });
}
