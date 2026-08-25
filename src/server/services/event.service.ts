import { nanoid } from "nanoid";
import { ConflictError, EventNotFoundError, NotFoundError } from "@/server/errors";
import {
  countCheckInsForEvent,
  createEvent as createEventRepo,
  deleteEvent as deleteEventRepo,
  findEventById,
  findEventByToken,
  listEvents as listEventsRepo,
  updateEvent as updateEventRepo,
} from "@/server/repositories/event.repository";
import { buildCheckInUrl, generateCheckInQrPng } from "@/lib/qrcode/generate";
import type { EventFormInput } from "@/server/dto/event.dto";

/** Resolve um token opaco de QR Code para o evento associado. Lança se não existir. */
export async function validateToken(token: string) {
  const event = await findEventByToken(token);
  if (!event) {
    throw new EventNotFoundError();
  }
  return event;
}

export function generateQrToken(): string {
  return nanoid(24);
}

function combineDateAndTime(dateStr: string, timeStr: string): Date {
  return new Date(`${dateStr}T${timeStr}:00`);
}

export function listEvents() {
  return listEventsRepo();
}

export async function getEventById(id: string) {
  const event = await findEventById(id);
  if (!event) {
    throw new NotFoundError("Evento não encontrado.");
  }
  return event;
}

export async function createEvent(input: EventFormInput) {
  return createEventRepo({
    name: input.name,
    description: input.description || null,
    date: combineDateAndTime(input.date, "00:00"),
    startTime: combineDateAndTime(input.date, input.startTime),
    endTime: combineDateAndTime(input.date, input.endTime),
    xpReward: input.xpReward,
    qrCodeToken: generateQrToken(),
    active: true,
  });
}

export async function updateEvent(id: string, input: EventFormInput) {
  await getEventById(id);
  return updateEventRepo(id, {
    name: input.name,
    description: input.description || null,
    date: combineDateAndTime(input.date, "00:00"),
    startTime: combineDateAndTime(input.date, input.startTime),
    endTime: combineDateAndTime(input.date, input.endTime),
    xpReward: input.xpReward,
  });
}

export async function toggleEventActive(id: string) {
  const event = await getEventById(id);
  return updateEventRepo(id, { active: !event.active });
}

export async function removeEvent(id: string) {
  await getEventById(id);
  const checkInsCount = await countCheckInsForEvent(id);
  if (checkInsCount > 0) {
    throw new ConflictError(
      "Este evento já tem check-ins registrados e não pode ser excluído. Desative-o em vez disso."
    );
  }
  await deleteEventRepo(id);
}

export async function getQrCodeImage(id: string) {
  const event = await getEventById(id);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const url = buildCheckInUrl(baseUrl, event.qrCodeToken);
  return generateCheckInQrPng(url);
}
