import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";

type Client = typeof prisma | Prisma.TransactionClient;

export function listChurches(client: Client = prisma) {
  return client.church.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { users: true, events: true } } },
  });
}

export function findChurchById(id: string, client: Client = prisma) {
  return client.church.findUnique({ where: { id } });
}

export function createChurch(data: Prisma.ChurchCreateInput, client: Client = prisma) {
  return client.church.create({ data });
}

export function updateChurch(id: string, data: Prisma.ChurchUpdateInput, client: Client = prisma) {
  return client.church.update({ where: { id }, data });
}
