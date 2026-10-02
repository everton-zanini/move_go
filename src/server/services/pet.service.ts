import { prisma } from "@/lib/db/prisma";
import {
  findDefaultSpecies,
  findEvolutionForLevel,
  findPetByUserId,
  listEvolutions,
  updatePet,
} from "@/server/repositories/pet.repository";
import { NotFoundError } from "@/server/errors";
import type { PetNicknameInput } from "@/server/dto/pet.dto";
import { xpRequiredForLevel } from "@/lib/game/level-curve";
import { getLevelCurveParams } from "./config.service";
import { addXp } from "./xp.service";
import { recalculateEvolution } from "./pet-evolution.service";

export async function renamePet(userId: string, input: PetNicknameInput) {
  const pet = await findPetByUserId(userId);
  if (!pet) {
    throw new NotFoundError("Pet não encontrado para este usuário.");
  }

  return updatePet(userId, { nickname: input.nickname });
}

/** XP total necessário para alcançar cada estágio de evolução da espécie padrão. */
export async function listEvolutionXpTable() {
  const species = await findDefaultSpecies();
  if (!species) return [];

  const [evolutions, curve] = await Promise.all([listEvolutions(species.id), getLevelCurveParams()]);
  let previousXp = 0;
  return evolutions.map((evolution) => {
    const totalXp = xpRequiredForLevel(evolution.levelRequired, curve);
    const row = {
      id: evolution.id,
      name: evolution.name,
      levelRequired: evolution.levelRequired,
      totalXp,
      xpFromPrevious: totalXp - previousXp,
    };
    previousXp = totalXp;
    return row;
  });
}

/** DEBUG (admin): soma XP suficiente pra cruzar o próximo estágio de evolução configurado. */
export async function debugAddXpToNextEvolution(userId: string) {
  return prisma.$transaction(async (tx) => {
    const pet = await findPetByUserId(userId, tx);
    if (!pet) {
      throw new NotFoundError("Pet não encontrado para este usuário.");
    }

    const nextEvolution = await tx.petEvolution.findFirst({
      where: { speciesId: pet.speciesId, levelRequired: { gt: pet.level } },
      orderBy: { levelRequired: "asc" },
    });

    const curve = await getLevelCurveParams();
    const targetLevel = nextEvolution?.levelRequired ?? pet.level + 1;
    const xpNeeded = Math.max(1, xpRequiredForLevel(targetLevel, curve) - pet.totalXp);

    await addXp({ userId, amount: xpNeeded, tx });
    return recalculateEvolution({ userId, tx });
  });
}

/** DEBUG (admin): reseta o pet pro estado inicial, pra retestar a evolução do zero. */
export async function debugResetPet(userId: string) {
  return prisma.$transaction(async (tx) => {
    const pet = await findPetByUserId(userId, tx);
    if (!pet) {
      throw new NotFoundError("Pet não encontrado para este usuário.");
    }

    const firstEvolution = await findEvolutionForLevel(pet.speciesId, 1, tx);
    if (!firstEvolution) {
      throw new NotFoundError("Nenhuma evolução configurada para o nível 1.");
    }

    return updatePet(
      userId,
      {
        level: 1,
        totalXp: 0,
        energy: 100,
        happiness: 100,
        currentStreak: 0,
        longestStreak: 0,
        lastCheckInAt: null,
        nickname: null,
        currentEvolutionId: firstEvolution.id,
      },
      tx
    );
  });
}
