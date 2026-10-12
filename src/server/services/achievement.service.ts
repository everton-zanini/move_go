import { prisma } from "@/lib/db/prisma";
import type { Achievement, AchievementCriteriaType, Prisma } from "@prisma/client";
import {
  createUserAchievement,
  listAchievements,
  listUnlockedAchievementIds,
  listUserAchievements as listUserAchievementsRepo,
} from "@/server/repositories/achievement.repository";
import { countCheckInsForUser, hasCheckInOnSpecialEvent } from "@/server/repositories/checkin.repository";
import { findPetByUserId } from "@/server/repositories/pet.repository";
import { NotFoundError } from "@/server/errors";

interface UserStats {
  checkInCount: number;
  level: number;
  longestStreak: number;
  hasSpecialEventCheckIn: boolean;
}

function meetsCriteria(
  achievement: Pick<Achievement, "criteriaType" | "criteriaValue">,
  stats: UserStats
): boolean {
  switch (achievement.criteriaType satisfies AchievementCriteriaType) {
    case "CHECKIN_COUNT":
      return achievement.criteriaValue !== null && stats.checkInCount >= achievement.criteriaValue;
    case "STREAK":
      return achievement.criteriaValue !== null && stats.longestStreak >= achievement.criteriaValue;
    case "LEVEL":
      return achievement.criteriaValue !== null && stats.level >= achievement.criteriaValue;
    case "SPECIAL_EVENT":
      return stats.hasSpecialEventCheckIn;
    default:
      return false;
  }
}

/** Avalia todas as conquistas ainda não desbloqueadas e concede as que o usuário já cumpriu. Idempotente. */
export async function evaluate(params: {
  userId: string;
  tx?: Prisma.TransactionClient;
}): Promise<Achievement[]> {
  const client = params.tx ?? prisma;

  const [allAchievements, unlockedRows, pet, checkInCount, hasSpecialEventCheckIn] = await Promise.all([
    listAchievements(client),
    listUnlockedAchievementIds(params.userId, client),
    findPetByUserId(params.userId, client),
    countCheckInsForUser(params.userId, client),
    hasCheckInOnSpecialEvent(params.userId, client),
  ]);

  if (!pet) {
    throw new NotFoundError("Pet não encontrado para este usuário.");
  }

  const unlockedIds = new Set(unlockedRows.map((row) => row.achievementId));
  const stats: UserStats = {
    checkInCount,
    level: pet.level,
    longestStreak: pet.longestStreak,
    hasSpecialEventCheckIn,
  };

  const newlyUnlocked: Achievement[] = [];
  for (const achievement of allAchievements) {
    if (unlockedIds.has(achievement.id)) continue;
    if (meetsCriteria(achievement, stats)) {
      await createUserAchievement(params.userId, achievement.id, client);
      newlyUnlocked.push(achievement);
    }
  }

  return newlyUnlocked;
}

export interface AchievementProgress {
  achievement: Achievement;
  unlockedAt: Date | null;
  /** Só existe para critérios numéricos (check-ins, sequência, nível). */
  progress: { current: number; target: number } | null;
}

function progressFor(achievement: Achievement, stats: UserStats): AchievementProgress["progress"] {
  if (achievement.criteriaValue === null) return null;
  const current =
    achievement.criteriaType === "CHECKIN_COUNT"
      ? stats.checkInCount
      : achievement.criteriaType === "STREAK"
        ? stats.longestStreak
        : achievement.criteriaType === "LEVEL"
          ? stats.level
          : null;
  if (current === null) return null;
  return { current: Math.min(current, achievement.criteriaValue), target: achievement.criteriaValue };
}

/** Todas as conquistas com data de desbloqueio e progresso atual do usuário. */
export async function listAchievementsWithProgress(userId: string): Promise<AchievementProgress[]> {
  const [allAchievements, unlocked, pet, checkInCount] = await Promise.all([
    listAchievements(),
    listUserAchievementsRepo(userId),
    findPetByUserId(userId),
    countCheckInsForUser(userId),
  ]);
  const stats: UserStats = {
    checkInCount,
    level: pet?.level ?? 1,
    longestStreak: pet?.longestStreak ?? 0,
    hasSpecialEventCheckIn: false,
  };
  const unlockedAtById = new Map(unlocked.map((row) => [row.achievementId, row.unlockedAt]));

  return allAchievements.map((achievement) => ({
    achievement,
    unlockedAt: unlockedAtById.get(achievement.id) ?? null,
    progress: progressFor(achievement, stats),
  }));
}

export function listUserAchievements(userId: string) {
  return listUserAchievementsRepo(userId);
}
