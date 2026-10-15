import { prisma } from "@/lib/db/prisma";
import { addDays, isSameDay, startOfDay } from "date-fns";
import { TZDate } from "@date-fns/tz";
import { APP_TIME_ZONE, parseLocalDateTime, startOfTodayBR } from "@/lib/datetime";
import {
  createDevotionalCheckIn,
  createJourney as createJourneyRepo,
  deleteJourney as deleteJourneyRepo,
  findActiveJourney,
  findDayById,
  findDayByJourneyAndNumber,
  findJourneyById,
  findUserCheckInForDay,
  findUserCheckInsForJourney,
  listJourneys as listJourneysRepo,
  updateJourney as updateJourneyRepo,
  upsertDay,
} from "@/server/repositories/devotional.repository";
import { findPetByUserId, updatePet } from "@/server/repositories/pet.repository";
import { addXp } from "@/server/services/xp.service";
import { recalculateEvolution } from "@/server/services/pet-evolution.service";
import { grantItem } from "@/server/services/inventory.service";
import { ConflictError, NotFoundError, ValidationError } from "@/server/errors";
import type {
  DevotionalCheckInInput,
  DevotionalDayInput,
  DevotionalJourneyInput,
} from "@/server/dto/devotional.dto";

export function listJourneys(churchId: string) {
  return listJourneysRepo(churchId);
}

export async function getJourneyById(id: string, churchId: string) {
  const journey = await findJourneyById(id, churchId);
  if (!journey) {
    throw new NotFoundError("Jornada devocional não encontrada.");
  }
  return journey;
}

export async function createJourney(churchId: string, input: DevotionalJourneyInput) {
  const startDate = parseLocalDateTime(input.startDate, "00:00");
  const endDate = addDays(startDate, input.totalDays - 1);

  return createJourneyRepo({
    churchId,
    title: input.title,
    description: input.description ?? null,
    totalDays: input.totalDays,
    startDate,
    endDate,
    active: true,
    bonusXp: input.bonusXp,
    rewardItemId: input.rewardItemId || null,
  });
}

export async function updateJourney(id: string, churchId: string, input: DevotionalJourneyInput) {
  await getJourneyById(id, churchId);
  const startDate = parseLocalDateTime(input.startDate, "00:00");
  const endDate = addDays(startDate, input.totalDays - 1);

  return updateJourneyRepo(id, {
    title: input.title,
    description: input.description ?? null,
    totalDays: input.totalDays,
    startDate,
    endDate,
    bonusXp: input.bonusXp,
    rewardItemId: input.rewardItemId || null,
  });
}

export async function toggleJourneyActive(id: string, churchId: string) {
  const journey = await getJourneyById(id, churchId);
  return updateJourneyRepo(id, { active: !journey.active });
}

export async function removeJourney(id: string, churchId: string) {
  await getJourneyById(id, churchId);
  return deleteJourneyRepo(id);
}

export async function saveDayContent(journeyId: string, churchId: string, input: DevotionalDayInput) {
  await getJourneyById(journeyId, churchId);
  return upsertDay({
    journeyId,
    dayNumber: input.dayNumber,
    title: input.title,
    bibleVerse: input.bibleVerse ?? null,
    content: input.content,
    taskPrompt: input.taskPrompt ?? null,
    xpReward: input.xpReward,
    happinessReward: input.happinessReward,
  });
}

export async function getDayContent(journeyId: string, dayNumber: number) {
  return findDayByJourneyAndNumber(journeyId, dayNumber);
}

export interface DayStatusInfo {
  dayNumber: number;
  date: Date;
  isUnlocked: boolean;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  completed: boolean;
  checkIn: {
    completedAt: Date;
    earnedXp: number;
    userNote: string | null;
  } | null;
  day: {
    id: string;
    title: string;
    bibleVerse: string | null;
    content: string;
    taskPrompt: string | null;
    xpReward: number;
    happinessReward: number;
  } | null;
}

export interface UserJourneyOverview {
  journey: NonNullable<Awaited<ReturnType<typeof findActiveJourney>>>;
  days: DayStatusInfo[];
  completedCount: number;
  todayDayNumber: number | null;
  isFullyCompleted: boolean;
}

export async function getUserActiveJourney(userId: string, churchId: string): Promise<UserJourneyOverview | null> {
  const journey = await findActiveJourney(churchId);
  if (!journey) return null;

  const userCheckIns = await findUserCheckInsForJourney(userId, journey.id);
  const checkInsByDayId = new Map(userCheckIns.map((c) => [c.devotionalDayId, c]));

  const today = startOfTodayBR();
  const journeyStart = startOfDay(new TZDate(journey.startDate, APP_TIME_ZONE));

  const days: DayStatusInfo[] = [];
  let completedCount = 0;
  let todayDayNumber: number | null = null;

  const daysByNumber = new Map(journey.days.map((d) => [d.dayNumber, d]));

  for (let i = 1; i <= journey.totalDays; i++) {
    const dayDate = addDays(journeyStart, i - 1);
    const isToday = isSameDay(dayDate, today);
    const isPast = dayDate < today;
    const isFuture = dayDate > today;
    const isUnlocked = !isFuture;

    if (isToday) {
      todayDayNumber = i;
    }

    const dayRecord = daysByNumber.get(i) ?? null;
    const checkIn = dayRecord ? checkInsByDayId.get(dayRecord.id) : null;
    if (checkIn) completedCount++;

    days.push({
      dayNumber: i,
      date: dayDate,
      isUnlocked,
      isToday,
      isPast,
      isFuture,
      completed: Boolean(checkIn),
      checkIn: checkIn
        ? {
            completedAt: checkIn.completedAt,
            earnedXp: checkIn.earnedXp,
            userNote: checkIn.userNote,
          }
        : null,
      day: dayRecord
        ? {
            id: dayRecord.id,
            title: dayRecord.title,
            bibleVerse: dayRecord.bibleVerse,
            content: dayRecord.content,
            taskPrompt: dayRecord.taskPrompt,
            xpReward: dayRecord.xpReward,
            happinessReward: dayRecord.happinessReward,
          }
        : null,
    });
  }

  return {
    journey,
    days,
    completedCount,
    todayDayNumber,
    isFullyCompleted: completedCount === journey.totalDays,
  };
}

export interface DevotionalCheckInResult {
  earnedXp: number;
  happinessEarned: number;
  isDelayed: boolean;
  leveledUp: boolean;
  newLevel: number;
  evolved: boolean;
  isJourneyCompleted: boolean;
  bonusXpEarned: number;
  unlockedRewardItem: {
    id: string;
    name: string;
    sprite: string;
  } | null;
}

export async function performDevotionalCheckIn(
  userId: string,
  churchId: string,
  input: DevotionalCheckInInput
): Promise<DevotionalCheckInResult> {
  const day = await findDayById(input.devotionalDayId);
  if (!day || day.journey.churchId !== churchId || !day.journey.active) {
    throw new NotFoundError("Dia devocional não encontrado ou inativo.");
  }

  const today = startOfTodayBR();
  const journeyStart = startOfDay(new TZDate(day.journey.startDate, APP_TIME_ZONE));
  const dayDate = addDays(journeyStart, day.dayNumber - 1);

  if (dayDate > today) {
    throw new ValidationError("Este dia devocional ainda não está liberado.");
  }

  const existing = await findUserCheckInForDay(userId, day.id);
  if (existing) {
    throw new ConflictError("Você já concluiu o devocional deste dia.");
  }

  const isToday = isSameDay(dayDate, today);
  const isDelayed = dayDate < today;

  // Regra confirmada: se estiver atrasado, não ganha XP.
  const xpEarned = isToday ? day.xpReward : 0;
  const happinessEarned = day.happinessReward;

  return prisma.$transaction(async (tx) => {
    // 1. Cria o registro de check-in
    await createDevotionalCheckIn(
      {
        userId,
        devotionalDayId: day.id,
        earnedXp: xpEarned,
        userNote: input.userNote ?? null,
      },
      tx
    );

    // 2. Atualiza pet (felicidade)
    const pet = await findPetByUserId(userId, tx);
    if (!pet) {
      throw new NotFoundError("Pet não encontrado para este usuário.");
    }

    const newHappiness = Math.min(100, pet.happiness + happinessEarned);
    await updatePet(userId, { happiness: newHappiness }, tx);

    // 3. Concede XP se pontual
    let leveledUp = false;
    let newLevel = pet.level;
    let evolved = false;

    if (xpEarned > 0) {
      const xpRes = await addXp({ userId, amount: xpEarned, tx });
      leveledUp = xpRes.leveledUp;
      newLevel = xpRes.newLevel;

      if (leveledUp) {
        const evoRes = await recalculateEvolution({ userId, tx });
        evolved = evoRes.evolved;
      }
    }

    // 4. Verifica se completou a jornada inteira
    const totalDone = await tx.devotionalCheckIn.count({
      where: {
        userId,
        devotionalDay: { journeyId: day.journeyId },
      },
    });

    const isJourneyCompleted = totalDone === day.journey.totalDays;
    let bonusXpEarned = 0;
    let unlockedRewardItem: { id: string; name: string; sprite: string } | null = null;

    if (isJourneyCompleted) {
      if (day.journey.bonusXp > 0) {
        bonusXpEarned = day.journey.bonusXp;
        const bonusRes = await addXp({ userId, amount: bonusXpEarned, tx });
        if (bonusRes.leveledUp) {
          leveledUp = true;
          newLevel = bonusRes.newLevel;
          const evoRes = await recalculateEvolution({ userId, tx });
          if (evoRes.evolved) evolved = true;
        }
      }

      if (day.journey.rewardItemId) {
        const item = await tx.item.findUnique({ where: { id: day.journey.rewardItemId } });
        if (item) {
          await grantItem({ userId, itemId: item.id, tx });
          unlockedRewardItem = {
            id: item.id,
            name: item.name,
            sprite: item.sprite,
          };
        }
      }
    }

    return {
      earnedXp: xpEarned,
      happinessEarned,
      isDelayed,
      leveledUp,
      newLevel,
      evolved,
      isJourneyCompleted,
      bonusXpEarned,
      unlockedRewardItem,
    };
  });
}
