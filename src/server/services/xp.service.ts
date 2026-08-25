import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";
import { findPetByUserId, updatePet } from "@/server/repositories/pet.repository";
import { NotFoundError } from "@/server/errors";
import { calculateLevelForXp } from "@/lib/game/level-curve";
import { getLevelCurveParams } from "./config.service";

type PetWithEvolution = NonNullable<Awaited<ReturnType<typeof findPetByUserId>>>;

export interface AddXpResult {
  pet: PetWithEvolution;
  leveledUp: boolean;
  previousLevel: number;
  newLevel: number;
}

export async function addXp(params: {
  userId: string;
  amount: number;
  tx?: Prisma.TransactionClient;
}): Promise<AddXpResult> {
  const client = params.tx ?? prisma;
  const pet = await findPetByUserId(params.userId, client);
  if (!pet) {
    throw new NotFoundError("Pet não encontrado para este usuário.");
  }

  const curve = await getLevelCurveParams();
  const newTotalXp = pet.totalXp + params.amount;
  const newLevel = calculateLevelForXp(newTotalXp, curve);
  const leveledUp = newLevel > pet.level;

  const updatedPet = await updatePet(params.userId, { totalXp: newTotalXp, level: newLevel }, client);

  return { pet: updatedPet, leveledUp, previousLevel: pet.level, newLevel };
}
