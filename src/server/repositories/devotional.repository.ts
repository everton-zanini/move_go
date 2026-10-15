import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";

type Client = typeof prisma | Prisma.TransactionClient;

export function findJourneyById(id: string, churchId: string, client: Client = prisma) {
  return client.devotionalJourney.findFirst({
    where: { id, churchId },
    include: {
      rewardItem: true,
      days: {
        orderBy: { dayNumber: "asc" },
      },
    },
  });
}

export function findActiveJourney(churchId: string, client: Client = prisma) {
  return client.devotionalJourney.findFirst({
    where: { churchId, active: true },
    include: {
      rewardItem: true,
      days: {
        orderBy: { dayNumber: "asc" },
      },
    },
    orderBy: { startDate: "desc" },
  });
}

export function listJourneys(churchId: string, client: Client = prisma) {
  return client.devotionalJourney.findMany({
    where: { churchId },
    include: {
      rewardItem: true,
      _count: {
        select: { days: true },
      },
    },
    orderBy: { startDate: "desc" },
  });
}

export function createJourney(data: Prisma.DevotionalJourneyUncheckedCreateInput, client: Client = prisma) {
  return client.devotionalJourney.create({ data });
}

export function updateJourney(id: string, data: Prisma.DevotionalJourneyUncheckedUpdateInput, client: Client = prisma) {
  return client.devotionalJourney.update({ where: { id }, data });
}

export function deleteJourney(id: string, client: Client = prisma) {
  return client.devotionalJourney.delete({ where: { id } });
}

export function findDayById(id: string, client: Client = prisma) {
  return client.devotionalDay.findUnique({
    where: { id },
    include: {
      journey: true,
    },
  });
}

export function findDayByJourneyAndNumber(journeyId: string, dayNumber: number, client: Client = prisma) {
  return client.devotionalDay.findUnique({
    where: {
      journeyId_dayNumber: { journeyId, dayNumber },
    },
    include: {
      journey: true,
    },
  });
}

export function upsertDay(
  data: Prisma.DevotionalDayUncheckedCreateInput,
  client: Client = prisma
) {
  return client.devotionalDay.upsert({
    where: {
      journeyId_dayNumber: {
        journeyId: data.journeyId,
        dayNumber: data.dayNumber,
      },
    },
    update: {
      title: data.title,
      bibleVerse: data.bibleVerse,
      content: data.content,
      taskPrompt: data.taskPrompt,
      xpReward: data.xpReward,
      happinessReward: data.happinessReward,
    },
    create: data,
  });
}

export function findUserCheckInsForJourney(userId: string, journeyId: string, client: Client = prisma) {
  return client.devotionalCheckIn.findMany({
    where: {
      userId,
      devotionalDay: { journeyId },
    },
    include: {
      devotionalDay: true,
    },
  });
}

export function findUserCheckInForDay(userId: string, devotionalDayId: string, client: Client = prisma) {
  return client.devotionalCheckIn.findUnique({
    where: {
      userId_devotionalDayId: { userId, devotionalDayId },
    },
  });
}

export function createDevotionalCheckIn(
  data: Prisma.DevotionalCheckInUncheckedCreateInput,
  client: Client = prisma
) {
  return client.devotionalCheckIn.create({ data });
}

export function countCheckInsForDay(devotionalDayId: string, client: Client = prisma) {
  return client.devotionalCheckIn.count({ where: { devotionalDayId } });
}
