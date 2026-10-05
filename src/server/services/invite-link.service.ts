import { nanoid } from "nanoid";
import { Prisma } from "@prisma/client";
import {
  InviteLinkExpiredError,
  InviteLinkInactiveError,
  InviteLinkNotFoundError,
  NotFoundError,
} from "@/server/errors";
import {
  createInviteLink as createInviteLinkRepo,
  deleteInviteLink as deleteInviteLinkRepo,
  findInviteLinkById,
  findInviteLinkByToken,
  listInviteLinks as listInviteLinksRepo,
  updateInviteLink as updateInviteLinkRepo,
} from "@/server/repositories/invite-link.repository";
import { buildInviteUrl, generateQrPng } from "@/lib/qrcode/generate";
import { getAppBaseUrl } from "@/lib/app-url";
import type { InviteLinkFormInput } from "@/server/dto/invite-link.dto";

export async function listInviteLinks(churchId: string) {
  const links = await listInviteLinksRepo(churchId);
  const now = Date.now();
  return links.map((link) => ({ ...link, expired: link.expiresAt.getTime() <= now }));
}

export async function getInviteLinkById(id: string, churchId: string) {
  const link = await findInviteLinkById(id, churchId);
  if (!link) {
    throw new NotFoundError("Link de cadastro não encontrado.");
  }
  return link;
}

export async function createInviteLink(
  churchId: string,
  input: InviteLinkFormInput,
  attempt = 0
): Promise<Awaited<ReturnType<typeof createInviteLinkRepo>>> {
  try {
    return await createInviteLinkRepo({
      churchId,
      label: input.label || null,
      expiresAt: new Date(input.expiresAt),
      token: nanoid(24),
      active: true,
    });
  } catch (error) {
    // token tem 24 caracteres — colisão é praticamente impossível, mas tenta de novo por segurança.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002" && attempt < 5) {
      return createInviteLink(churchId, input, attempt + 1);
    }
    throw error;
  }
}

export async function updateInviteLink(id: string, churchId: string, input: InviteLinkFormInput) {
  await getInviteLinkById(id, churchId);
  return updateInviteLinkRepo(id, {
    label: input.label || null,
    expiresAt: new Date(input.expiresAt),
  });
}

export async function toggleInviteLinkActive(id: string, churchId: string) {
  const link = await getInviteLinkById(id, churchId);
  return updateInviteLinkRepo(id, { active: !link.active });
}

export async function removeInviteLink(id: string, churchId: string) {
  await getInviteLinkById(id, churchId);
  await deleteInviteLinkRepo(id);
}

/** Resolve e valida um token de convite — usado pela página pública /invite/[token] e no cadastro. */
export async function validateInviteToken(token: string) {
  const link = await findInviteLinkByToken(token);
  if (!link) {
    throw new InviteLinkNotFoundError();
  }
  // Igreja desativada invalida todos os convites dela.
  if (!link.active || !link.church.active) {
    throw new InviteLinkInactiveError();
  }
  if (link.expiresAt.getTime() <= Date.now()) {
    throw new InviteLinkExpiredError();
  }
  return link;
}

export async function getInviteQrCodeImage(id: string, churchId: string) {
  const link = await getInviteLinkById(id, churchId);
  const baseUrl = await getAppBaseUrl();
  return generateQrPng(buildInviteUrl(baseUrl, link.token));
}
