import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";
import { GAME_RULE_KEYS } from "@/config/game-rules.default";
import { EventInactiveError, EventOutsideWindowError, NotFoundError } from "@/server/errors";
import { createCheckIn } from "@/server/repositories/checkin.repository";
import { findPetByUserId, updatePet } from "@/server/repositories/pet.repository";
import { getConfigValue } from "./config.service";
import { validateToken } from "./event.service";
import { recalculateEvolution } from "./pet-evolution.service";
import { addXp } from "./xp.service";
import { evaluate as evaluateAchievements } from "./achievement.service";
import { checkAutoUnlocks, grantItem } from "./inventory.service";

export interface UnlockedItem {
  id: string;
  name: string;
  sprite: string;
}

export interface UnlockedAchievement {
  id: string;
  name: string;
  icon: string;
}

export interface CheckInResult {
  alreadyCheckedIn: boolean;
  eventName: string;
  xpEarned: number;
  leveledUp: boolean;
  previousLevel: number;
  newLevel: number;
  evolved: boolean;
  evolutionName: string;
  spriteKey: string;
  streak: number;
  streakBonusXp: number;
  energy: number;
  happiness: number;
  energyGained: number;
  happinessGained: number;
  newItems: UnlockedItem[];
  newAchievements: UnlockedAchievement[];
}

/**
 * Orquestrador central do check-in. Toda a validação de negócio é revalidada
 * aqui no servidor — nunca confiar em estado vindo do client (ver skill qr-checkin).
 */
export async function performCheckIn(params: { userId: string; token: string }): Promise<CheckInResult> {
  const event = await validateToken(params.token);

  if (!event.active) {
    throw new EventInactiveError();
  }

  const [graceBeforeMinutes, graceAfterMinutes] = await Promise.all([
    getConfigValue<number>(GAME_RULE_KEYS.checkinGraceMinutesBefore, 30),
    getConfigValue<number>(GAME_RULE_KEYS.checkinGraceMinutesAfter, 60),
  ]);

  const now = new Date();
  const windowStart = new Date(event.startTime.getTime() - graceBeforeMinutes * 60_000);
  const windowEnd = new Date(event.endTime.getTime() + graceAfterMinutes * 60_000);

  if (now < windowStart || now > windowEnd) {
    throw new EventOutsideWindowError();
  }

  return prisma.$transaction(async (tx) => {
    let isNewCheckIn = true;
    try {
      await createCheckIn({ userId: params.userId, eventId: event.id, xpEarned: event.xpReward }, tx);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        isNewCheckIn = false;
      } else {
        throw error;
      }
    }

    const petBefore = await findPetByUserId(params.userId, tx);
    if (!petBefore) {
      throw new NotFoundError("Pet não encontrado para este usuário.");
    }

    if (!isNewCheckIn) {
      return {
        alreadyCheckedIn: true,
        eventName: event.name,
        xpEarned: 0,
        leveledUp: false,
        previousLevel: petBefore.level,
        newLevel: petBefore.level,
        evolved: false,
        evolutionName: petBefore.currentEvolution?.name ?? "Spark",
        spriteKey: petBefore.currentEvolution?.sprite ?? "egg",
        streak: petBefore.currentStreak,
        streakBonusXp: 0,
        energy: petBefore.energy,
        happiness: petBefore.happiness,
        energyGained: 0,
        happinessGained: 0,
        newItems: [],
        newAchievements: [],
      };
    }

    const [streakWindowHours, streakBonusThreshold, streakBonusXpAmount] = await Promise.all([
      getConfigValue<number>(GAME_RULE_KEYS.streakWindowHours, 240),
      getConfigValue<number>(GAME_RULE_KEYS.streakBonusThreshold, 3),
      getConfigValue<number>(GAME_RULE_KEYS.streakBonusXp, 50),
    ]);

    const withinStreakWindow =
      petBefore.lastCheckInAt !== null &&
      now.getTime() - petBefore.lastCheckInAt.getTime() <= streakWindowHours * 60 * 60_000;

    const newStreak = withinStreakWindow ? petBefore.currentStreak + 1 : 1;
    const newLongestStreak = Math.max(petBefore.longestStreak, newStreak);
    const streakBonusEarned = newStreak % streakBonusThreshold === 0;
    const streakBonusXp = streakBonusEarned ? streakBonusXpAmount : 0;

    const xpResult = await addXp({ userId: params.userId, amount: event.xpReward + streakBonusXp, tx });

    const [maxEnergy, maxHappiness, energyPerCheckIn, happinessPerCheckIn] = await Promise.all([
      getConfigValue<number>(GAME_RULE_KEYS.petMaxEnergy, 100),
      getConfigValue<number>(GAME_RULE_KEYS.petMaxHappiness, 100),
      getConfigValue<number>(GAME_RULE_KEYS.petEnergyPerCheckIn, 20),
      getConfigValue<number>(GAME_RULE_KEYS.petHappinessPerCheckIn, 15),
    ]);

    const newEnergy = Math.min(maxEnergy, petBefore.energy + energyPerCheckIn);
    const newHappiness = Math.min(maxHappiness, petBefore.happiness + happinessPerCheckIn);

    await updatePet(
      params.userId,
      {
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        lastCheckInAt: now,
        energy: newEnergy,
        happiness: newHappiness,
      },
      tx
    );

    const evoResult = await recalculateEvolution({ userId: params.userId, tx });

    const newItems: UnlockedItem[] = [];
    if (event.specialItemId) {
      const { item } = await grantItem({ userId: params.userId, itemId: event.specialItemId, tx });
      newItems.push({ id: item.id, name: item.name, sprite: item.sprite });
    }

    const autoUnlockedItems = await checkAutoUnlocks({ userId: params.userId, tx });
    for (const item of autoUnlockedItems) {
      newItems.push({ id: item.id, name: item.name, sprite: item.sprite });
    }

    const newAchievementRows = await evaluateAchievements({ userId: params.userId, tx });
    const newAchievements: UnlockedAchievement[] = newAchievementRows.map((a) => ({
      id: a.id,
      name: a.name,
      icon: a.icon,
    }));

    return {
      alreadyCheckedIn: false,
      eventName: event.name,
      xpEarned: event.xpReward + streakBonusXp,
      leveledUp: xpResult.leveledUp,
      previousLevel: xpResult.previousLevel,
      newLevel: xpResult.newLevel,
      evolved: evoResult.evolved,
      evolutionName: evoResult.newEvolution.name,
      spriteKey: evoResult.newEvolution.sprite,
      streak: newStreak,
      streakBonusXp,
      energy: newEnergy,
      happiness: newHappiness,
      energyGained: newEnergy - petBefore.energy,
      happinessGained: newHappiness - petBefore.happiness,
      newItems,
      newAchievements,
    };
  });
}
