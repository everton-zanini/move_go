import { prisma } from "@/lib/db/prisma";
import type { ItemSlot, Prisma } from "@prisma/client";

type Client = typeof prisma | Prisma.TransactionClient;

export function listItems(client: Client = prisma) {
  return client.item.findMany({ orderBy: { createdAt: "asc" } });
}

export function findItemById(id: string, client: Client = prisma) {
  return client.item.findUnique({ where: { id } });
}

export function findItemByName(name: string, client: Client = prisma) {
  return client.item.findFirst({ where: { name } });
}

/** Itens com regra de desbloqueio automático (por nível ou quantidade de check-ins). */
export function listAutoUnlockItems(client: Client = prisma) {
  return client.item.findMany({
    where: {
      OR: [{ unlockLevel: { not: null } }, { unlockCheckInCount: { not: null } }],
    },
  });
}

export function findUserItem(userId: string, itemId: string, client: Client = prisma) {
  return client.userItem.findUnique({ where: { userId_itemId: { userId, itemId } } });
}

export function upsertUserItem(userId: string, itemId: string, client: Client = prisma) {
  return client.userItem.upsert({
    where: { userId_itemId: { userId, itemId } },
    update: {},
    create: { userId, itemId },
    include: { item: true },
  });
}

export function listUserItems(userId: string, client: Client = prisma) {
  return client.userItem.findMany({
    where: { userId },
    include: { item: true },
    orderBy: { unlockedAt: "desc" },
  });
}

export function setEquipped(userId: string, itemId: string, equipped: boolean, client: Client = prisma) {
  return client.userItem.update({ where: { userId_itemId: { userId, itemId } }, data: { equipped } });
}

export function unequipSlot(userId: string, slot: ItemSlot, client: Client = prisma) {
  return client.userItem.updateMany({
    where: { userId, equipped: true, item: { slot } },
    data: { equipped: false },
  });
}
