import { nanoid, customAlphabet } from "nanoid";
import { Prisma } from "@prisma/client";
import { startOfDay } from "date-fns";
import { ConflictError, EventNotFoundError, NotFoundError } from "@/server/errors";
import {
  countCheckInsForEvent,
  createEvent as createEventRepo,
  deleteEvent as deleteEventRepo,
  findEventById,
  findEventByShortCode,
  findEventByToken,
  listEvents as listEventsRepo,
  listUpcomingActiveEvents,
  updateEvent as updateEventRepo,
} from "@/server/repositories/event.repository";
import { buildCheckInUrl, generateQrPng } from "@/lib/qrcode/generate";
import type { EventFormInput } from "@/server/dto/event.dto";

/** Resolve um token opaco de QR Code para o evento associado. Lança se não existir. */
export async function validateToken(token: string) {
  const event = await findEventByToken(token);
  if (!event) {
    throw new EventNotFoundError();
  }
  return event;
}

/** Resolve um código curto digitado manualmente (fallback quando não dá pra escanear o QR). */
export async function resolveShortCode(code: string, churchId: string) {
  const event = await findEventByShortCode(code.trim().toUpperCase());
  if (!event || event.churchId !== churchId) {
    throw new EventNotFoundError();
  }
  return event;
}

export function generateQrToken(): string {
  return nanoid(24);
}

// Alfabeto sem caracteres ambíguos (sem 0/O, 1/I/L) — pra digitar de ouvido/à mão sem erro.
const SHORT_CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const generateShortCodeCandidate = customAlphabet(SHORT_CODE_ALPHABET, 6);

/** Gerado pelo sistema, nunca escolhido pelo admin — ver skill qr-checkin. */
export function generateShortCode(): string {
  return generateShortCodeCandidate();
}

function combineDateAndTime(dateStr: string, timeStr: string): Date {
  return new Date(`${dateStr}T${timeStr}:00`);
}

export function listEvents(churchId: string) {
  return listEventsRepo(churchId);
}

/** Agenda pública: próximos eventos ativos da igreja, do mais próximo pro mais distante. */
export function listUpcomingEvents(churchId: string) {
  return listUpcomingActiveEvents(churchId, startOfDay(new Date()));
}

export async function getEventById(id: string, churchId: string) {
  const event = await findEventById(id, churchId);
  if (!event) {
    throw new NotFoundError("Evento não encontrado.");
  }
  return event;
}

export async function createEvent(
  churchId: string,
  input: EventFormInput,
  attempt = 0
): Promise<Awaited<ReturnType<typeof createEventRepo>>> {
  try {
    return await createEventRepo({
      churchId,
      name: input.name,
      description: input.description || null,
      date: combineDateAndTime(input.date, "00:00"),
      startTime: combineDateAndTime(input.date, input.startTime),
      endTime: combineDateAndTime(input.date, input.endTime),
      xpReward: input.xpReward,
      qrCodeToken: generateQrToken(),
      shortCode: generateShortCode(),
      active: true,
    });
  } catch (error) {
    // shortCode tem só 6 caracteres — colisão é improvável mas não impossível, tenta de novo.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002" && attempt < 5) {
      return createEvent(churchId, input, attempt + 1);
    }
    throw error;
  }
}

export async function updateEvent(id: string, churchId: string, input: EventFormInput) {
  await getEventById(id, churchId);
  return updateEventRepo(id, {
    name: input.name,
    description: input.description || null,
    date: combineDateAndTime(input.date, "00:00"),
    startTime: combineDateAndTime(input.date, input.startTime),
    endTime: combineDateAndTime(input.date, input.endTime),
    xpReward: input.xpReward,
  });
}

export async function toggleEventActive(id: string, churchId: string) {
  const event = await getEventById(id, churchId);
  return updateEventRepo(id, { active: !event.active });
}

export async function removeEvent(id: string, churchId: string) {
  await getEventById(id, churchId);
  const checkInsCount = await countCheckInsForEvent(id);
  if (checkInsCount > 0) {
    throw new ConflictError(
      "Este evento já tem check-ins registrados e não pode ser excluído. Desative-o em vez disso."
    );
  }
  await deleteEventRepo(id);
}

export async function getQrCodeImage(id: string, churchId: string) {
  const event = await getEventById(id, churchId);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const url = buildCheckInUrl(baseUrl, event.qrCodeToken);
  return generateQrPng(url);
}
