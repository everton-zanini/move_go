import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";
import {
  createPet,
  findDefaultSpecies,
  findEvolutionForLevel,
  findPetByUserId,
  updatePet,
} from "@/server/repositories/pet.repository";
import { NotFoundError } from "@/server/errors";

type PetWithEvolution = NonNullable<Awaited<ReturnType<typeof findPetByUserId>>>;

export interface RecalculateEvolutionResult {
  pet: PetWithEvolution;
  previousEvolution: PetWithEvolution["currentEvolution"];
  newEvolution: NonNullable<PetWithEvolution["currentEvolution"]>;
  evolved: boolean;
}

/** Recalcula o estágio de evolução do pet a partir do nível atual (data-driven via PetEvolution). */
export async function recalculateEvolution(params: {
  userId: string;
  tx?: Prisma.TransactionClient;
}): Promise<RecalculateEvolutionResult> {
  const client = params.tx ?? prisma;
  const pet = await findPetByUserId(params.userId, client);
  if (!pet) {
    throw new NotFoundError("Pet não encontrado para este usuário.");
  }

  const newEvolution = await findEvolutionForLevel(pet.speciesId, pet.level, client);
  if (!newEvolution) {
    throw new NotFoundError("Nenhuma evolução configurada para este nível.");
  }

  const evolved = newEvolution.id !== pet.currentEvolutionId;
  const updatedPet = evolved
    ? await updatePet(params.userId, { currentEvolutionId: newEvolution.id }, client)
    : pet;

  return {
    pet: updatedPet,
    previousEvolution: pet.currentEvolution,
    newEvolution,
    evolved,
  };
}

/** Cria o pet inicial (nível 1, estágio "Ovo") de um usuário recém-cadastrado. */
export async function createInitialPet(userId: string) {
  const species = await findDefaultSpecies();
  if (!species) {
    throw new NotFoundError("Nenhuma espécie de pet configurada.");
  }

  const firstEvolution = await findEvolutionForLevel(species.id, 1);
  if (!firstEvolution) {
    throw new NotFoundError("Nenhuma evolução configurada para o nível 1.");
  }

  return createPet({
    userId,
    speciesId: species.id,
    currentEvolutionId: firstEvolution.id,
    level: 1,
    totalXp: 0,
    energy: 100,
    happiness: 100,
  });
}
