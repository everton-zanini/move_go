import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { ConflictError, NotFoundError } from "@/server/errors";
import {
  createChurch,
  findChurchById,
  listChurches as listChurchesRepo,
  updateChurch as updateChurchRepo,
} from "@/server/repositories/church.repository";
import { createUser, findUserByEmail } from "@/server/repositories/user.repository";
import { hashPassword } from "@/server/auth/password";
import { createInitialPet } from "./pet-evolution.service";
import type { ChurchAdminInput, ChurchFormInput, CreateChurchInput } from "@/server/dto/church.dto";

function isUniqueViolation(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

const SLUG_TAKEN = "Já existe uma igreja com este identificador.";
const EMAIL_TAKEN = "Já existe uma conta com este email.";

export function listChurches() {
  return listChurchesRepo();
}

export async function getChurchById(id: string) {
  const church = await findChurchById(id);
  if (!church) {
    throw new NotFoundError("Igreja não encontrada.");
  }
  return church;
}

async function createAdminInChurch(churchId: string, input: ChurchAdminInput, tx: Prisma.TransactionClient) {
  const user = await createUser(
    {
      name: input.adminName,
      email: input.adminEmail,
      passwordHash: await hashPassword(input.adminPassword),
      churchId,
      role: "ADMIN",
    },
    tx
  );
  // Admin de igreja também joga (tem pet), igual ao admin original.
  await createInitialPet(user.id, tx);
  return user;
}

/** Cria a igreja já com o primeiro admin — uma igreja nunca existe sem quem a administre. */
export async function createChurchWithAdmin(input: CreateChurchInput) {
  if (await findUserByEmail(input.adminEmail)) {
    throw new ConflictError(EMAIL_TAKEN);
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const church = await createChurch({ name: input.name, slug: input.slug }, tx);
      await createAdminInChurch(church.id, input, tx);
      return church;
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      const target = String((error as Prisma.PrismaClientKnownRequestError).meta?.target ?? "");
      throw new ConflictError(target.includes("email") ? EMAIL_TAKEN : SLUG_TAKEN);
    }
    throw error;
  }
}

export async function updateChurch(id: string, input: ChurchFormInput) {
  await getChurchById(id);
  try {
    return await updateChurchRepo(id, { name: input.name, slug: input.slug });
  } catch (error) {
    if (isUniqueViolation(error)) throw new ConflictError(SLUG_TAKEN);
    throw error;
  }
}

/** Desativar bloqueia login, sessões abertas e convites da igreja (ver auth/context.ts e invite-link.service.ts). */
export async function toggleChurchActive(id: string) {
  const church = await getChurchById(id);
  return updateChurchRepo(id, { active: !church.active });
}

export async function addChurchAdmin(churchId: string, input: ChurchAdminInput) {
  await getChurchById(churchId);
  if (await findUserByEmail(input.adminEmail)) {
    throw new ConflictError(EMAIL_TAKEN);
  }
  try {
    return await prisma.$transaction((tx) => createAdminInChurch(churchId, input, tx));
  } catch (error) {
    if (isUniqueViolation(error)) throw new ConflictError(EMAIL_TAKEN);
    throw error;
  }
}
