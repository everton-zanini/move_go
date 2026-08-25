import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";
import {
  findItemById,
  findUserItem,
  listAutoUnlockItems,
  listUserItems,
  setEquipped,
  unequipSlot,
  upsertUserItem,
} from "@/server/repositories/item.repository";
import { findPetByUserId } from "@/server/repositories/pet.repository";
import { countCheckInsForUser } from "@/server/repositories/checkin.repository";
import { NotFoundError } from "@/server/errors";

/** Concede um item ao usuário. Idempotente — chamar de novo não duplica nem dá erro. */
export async function grantItem(params: { userId: string; itemId: string; tx?: Prisma.TransactionClient }) {
  const client = params.tx ?? prisma;
  return upsertUserItem(params.userId, params.itemId, client);
}

/** Verifica itens com regra de desbloqueio automático (nível/quantidade de check-ins) e concede os que faltam. */
export async function checkAutoUnlocks(params: { userId: string; tx?: Prisma.TransactionClient }) {
  const client = params.tx ?? prisma;

  const [pet, checkInCount, autoUnlockItems] = await Promise.all([
    findPetByUserId(params.userId, client),
    countCheckInsForUser(params.userId, client),
    listAutoUnlockItems(client),
  ]);

  if (!pet) {
    throw new NotFoundError("Pet não encontrado para este usuário.");
  }

  const newlyUnlocked = [];
  for (const item of autoUnlockItems) {
    const meetsLevel = item.unlockLevel !== null && pet.level >= item.unlockLevel;
    const meetsCheckIns = item.unlockCheckInCount !== null && checkInCount >= item.unlockCheckInCount;
    if (!meetsLevel && !meetsCheckIns) continue;

    const existing = await findUserItem(params.userId, item.id, client);
    if (!existing) {
      await upsertUserItem(params.userId, item.id, client);
      newlyUnlocked.push(item);
    }
  }

  return newlyUnlocked;
}

export function listInventory(userId: string) {
  return listUserItems(userId);
}

export async function equipItem(userId: string, itemId: string) {
  const item = await findItemById(itemId);
  if (!item) {
    throw new NotFoundError("Item não encontrado.");
  }

  const userItem = await findUserItem(userId, itemId);
  if (!userItem) {
    throw new NotFoundError("Você ainda não desbloqueou este item.");
  }

  await unequipSlot(userId, item.slot);
  return setEquipped(userId, itemId, true);
}

export async function unequipItem(userId: string, itemId: string) {
  return setEquipped(userId, itemId, false);
}
