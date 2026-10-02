import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";

type Client = typeof prisma | Prisma.TransactionClient;

export function findPetByUserId(userId: string, client: Client = prisma) {
  return client.pet.findUnique({
    where: { userId },
    include: { currentEvolution: true },
  });
}

export function updatePet(userId: string, data: Prisma.PetUncheckedUpdateInput, client: Client = prisma) {
  return client.pet.update({
    where: { userId },
    data,
    include: { currentEvolution: true },
  });
}

/** Avança o marcador de eventos avaliados; retorna 0 se outra requisição já o avançou. */
export async function claimMissedEventsWindow(userId: string, from: Date, to: Date, client: Client = prisma) {
  const result = await client.pet.updateMany({
    where: { userId, missedEventsCheckedAt: from },
    data: { missedEventsCheckedAt: to },
  });
  return result.count;
}

export function createPet(data: Prisma.PetUncheckedCreateInput, client: Client = prisma) {
  return client.pet.create({ data, include: { currentEvolution: true } });
}

export function findEvolutionForLevel(speciesId: string, level: number, client: Client = prisma) {
  return client.petEvolution.findFirst({
    where: { speciesId, levelRequired: { lte: level } },
    orderBy: { levelRequired: "desc" },
  });
}

export function listEvolutions(speciesId: string, client: Client = prisma) {
  return client.petEvolution.findMany({ where: { speciesId }, orderBy: { levelRequired: "asc" } });
}

export function listSpecies(client: Client = prisma) {
  return client.petSpecies.findMany({ orderBy: { createdAt: "asc" } });
}

export function findDefaultSpecies(client: Client = prisma) {
  // A espécie padrão é a dona do ovo (nível 1) — as demais linhas só começam depois dele.
  return client.petSpecies.findFirst({
    where: { evolutions: { some: { levelRequired: 1 } } },
    orderBy: { createdAt: "asc" },
  });
}
