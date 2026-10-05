import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";

type Client = typeof prisma | Prisma.TransactionClient;

// Token e shortCode são únicos globalmente; o chamador valida se o evento é da igreja do usuário.
export function findEventByToken(token: string, client: Client = prisma) {
  return client.event.findUnique({ where: { qrCodeToken: token } });
}

export function findEventByShortCode(shortCode: string, client: Client = prisma) {
  return client.event.findUnique({ where: { shortCode } });
}

export function findEventById(id: string, churchId: string, client: Client = prisma) {
  return client.event.findFirst({ where: { id, churchId } });
}

export function listEvents(churchId: string, client: Client = prisma) {
  return client.event.findMany({ where: { churchId }, orderBy: { date: "desc" } });
}

/** Eventos ativos ainda por vir, para a agenda pública do jovem. */
export function listUpcomingActiveEvents(churchId: string, startOfToday: Date, client: Client = prisma) {
  return client.event.findMany({
    where: { churchId, active: true, date: { gte: startOfToday } },
    orderBy: { date: "asc" },
  });
}

/** Eventos ativos cujo `endTime` caiu em (from, to] — usado para detectar eventos perdidos. */
export function listActiveEventsEndedBetween(churchId: string, from: Date, to: Date, client: Client = prisma) {
  return client.event.findMany({
    where: { churchId, active: true, endTime: { gt: from, lte: to } },
    select: { id: true, name: true },
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
export async function findCurrentOrNextEvent(churchId: string, now: Date, client: Client = prisma) {
  const current = await client.event.findFirst({
    where: { churchId, active: true, startTime: { lte: now }, endTime: { gte: now } },
    orderBy: { startTime: "asc" },
  });
  if (current) return current;

  return client.event.findFirst({
    where: { churchId, active: true, startTime: { gt: now } },
    orderBy: { startTime: "asc" },
  });
}
