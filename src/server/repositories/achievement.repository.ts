import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";

type Client = typeof prisma | Prisma.TransactionClient;

export function listAchievements(client: Client = prisma) {
  return client.achievement.findMany({ orderBy: { createdAt: "asc" } });
}

export function listUnlockedAchievementIds(userId: string, client: Client = prisma) {
  return client.userAchievement.findMany({ where: { userId }, select: { achievementId: true } });
}

export function createUserAchievement(userId: string, achievementId: string, client: Client = prisma) {
  return client.userAchievement.create({ data: { userId, achievementId } });
}

export function listUserAchievements(userId: string, client: Client = prisma) {
  return client.userAchievement.findMany({
    where: { userId },
    include: { achievement: true },
    orderBy: { unlockedAt: "desc" },
  });
}
