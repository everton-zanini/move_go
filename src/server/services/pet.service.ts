import { prisma } from "@/lib/db/prisma";
import {
  claimMissedEventsWindow,
  findDefaultSpecies,
  findEvolutionForLevel,
  findPetByUserId,
  listEvolutions,
  listSpecies,
  updatePet,
} from "@/server/repositories/pet.repository";
import { NotFoundError } from "@/server/errors";
import { listActiveEventsEndedBetween } from "@/server/repositories/event.repository";
import { listCheckedEventIds } from "@/server/repositories/checkin.repository";
import { GAME_RULE_KEYS } from "@/config/game-rules.default";
import type { PetNicknameInput } from "@/server/dto/pet.dto";
import { xpRequiredForLevel } from "@/lib/game/level-curve";
import { getConfigValue, getLevelCurveParams } from "./config.service";
import { addXp } from "./xp.service";
import { recalculateEvolution } from "./pet-evolution.service";

export interface SelectableLine {
  speciesId: string;
  speciesName: string;
  spriteKey: string;
}

/** Linhas evolutivas que já têm um estágio para o nível atual — o ovo (nível 1) é compartilhado. */
export async function listSelectableLines(level: number): Promise<SelectableLine[]> {
  const species = await listSpecies();
  const lines = await Promise.all(
    species.map(async (s) => {
      const evolution = await findEvolutionForLevel(s.id, level);
      return evolution ? { speciesId: s.id, speciesName: s.name, spriteKey: evolution.sprite } : null;
    })
  );
  return lines.filter((line): line is SelectableLine => line !== null);
}

/** Define o nome e a linha evolutiva do pet (troca a espécie e o estágio atual de uma vez). */
export async function renamePet(userId: string, input: PetNicknameInput) {
  const pet = await findPetByUserId(userId);
  if (!pet) {
    throw new NotFoundError("Pet não encontrado para este usuário.");
  }

  const evolution = await findEvolutionForLevel(input.speciesId, pet.level);
  if (!evolution || evolution.speciesId !== input.speciesId) {
    throw new NotFoundError("Linha evolutiva indisponível para este nível.");
  }

  return updatePet(userId, {
    nickname: input.nickname,
    speciesId: input.speciesId,
    currentEvolutionId: evolution.id,
  });
}

export interface MissedEventsResult {
  missedEvents: string[];
  energyLost: number;
  happinessLost: number;
}

/**
 * Cada evento encerrado sem check-in tira energia/felicidade uma única vez. Avaliado ao abrir a home
 * (sem cron): o marcador `missedEventsCheckedAt` impede contar o mesmo evento duas vezes e ignora
 * eventos anteriores ao cadastro.
 */
export async function applyMissedEventPenalties(userId: string): Promise<MissedEventsResult> {
  const none: MissedEventsResult = { missedEvents: [], energyLost: 0, happinessLost: 0 };

  const [graceAfterMinutes, energyLoss, happinessLoss] = await Promise.all([
    getConfigValue<number>(GAME_RULE_KEYS.checkinGraceMinutesAfter, 60),
    getConfigValue<number>(GAME_RULE_KEYS.petEnergyLossPerMissedEvent, 10),
    getConfigValue<number>(GAME_RULE_KEYS.petHappinessLossPerMissedEvent, 10),
  ]);

  return prisma.$transaction(async (tx) => {
    const pet = await findPetByUserId(userId, tx);
    if (!pet) return none;

    const now = new Date();
    // Só conta eventos cuja janela de check-in (endTime + tolerância) já fechou.
    const graceMs = graceAfterMinutes * 60_000;
    const from = new Date(pet.missedEventsCheckedAt.getTime() - graceMs);
    const to = new Date(now.getTime() - graceMs);
    if (to <= from) return none;

    const claimed = await claimMissedEventsWindow(userId, pet.missedEventsCheckedAt, now, tx);
    if (claimed === 0) return none;

    const ended = await listActiveEventsEndedBetween(from, to, tx);
    if (ended.length === 0) return none;

    const attended = new Set(await listCheckedEventIds(userId, ended.map((e) => e.id), tx));
    const missed = ended.filter((e) => !attended.has(e.id));
    if (missed.length === 0) return none;

    const newEnergy = Math.max(0, pet.energy - missed.length * energyLoss);
    const newHappiness = Math.max(0, pet.happiness - missed.length * happinessLoss);
    await updatePet(userId, { energy: newEnergy, happiness: newHappiness }, tx);

    return {
      missedEvents: missed.map((e) => e.name),
      energyLost: pet.energy - newEnergy,
      happinessLost: pet.happiness - newHappiness,
    };
  });
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

    // Volta para a espécie padrão (dona do ovo), já que o ovo não existe nas outras linhas.
    const defaultSpecies = await findDefaultSpecies(tx);
    const firstEvolution = defaultSpecies ? await findEvolutionForLevel(defaultSpecies.id, 1, tx) : null;
    if (!defaultSpecies || !firstEvolution) {
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
        speciesId: defaultSpecies.id,
        currentEvolutionId: firstEvolution.id,
      },
      tx
    );
  });
}

/** DEBUG (admin): limpa nome e linha mantendo o nível, pra retestar a escolha de linha evolutiva. */
export async function debugRedoLineChoice(userId: string) {
  return prisma.$transaction(async (tx) => {
    const pet = await findPetByUserId(userId, tx);
    if (!pet) {
      throw new NotFoundError("Pet não encontrado para este usuário.");
    }

    const defaultSpecies = await findDefaultSpecies(tx);
    const evolution = defaultSpecies ? await findEvolutionForLevel(defaultSpecies.id, pet.level, tx) : null;
    if (!defaultSpecies || !evolution) {
      throw new NotFoundError("Nenhuma evolução configurada para este nível.");
    }

    return updatePet(
      userId,
      { nickname: null, speciesId: defaultSpecies.id, currentEvolutionId: evolution.id },
      tx
    );
  });
}
