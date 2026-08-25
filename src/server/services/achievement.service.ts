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

export function listUserAchievements(userId: string) {
  return listUserAchievementsRepo(userId);
}
