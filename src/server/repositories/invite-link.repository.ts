import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";

type Client = typeof prisma | Prisma.TransactionClient;

export function findInviteLinkByToken(token: string, client: Client = prisma) {
  return client.inviteLink.findUnique({ where: { token }, include: { church: true } });
}

export function findInviteLinkById(id: string, churchId: string, client: Client = prisma) {
  return client.inviteLink.findFirst({ where: { id, churchId } });
}

export function listInviteLinks(churchId: string, client: Client = prisma) {
  return client.inviteLink.findMany({ where: { churchId }, orderBy: { createdAt: "desc" } });
}

export function createInviteLink(data: Prisma.InviteLinkUncheckedCreateInput, client: Client = prisma) {
  return client.inviteLink.create({ data });
}

export function updateInviteLink(id: string, data: Prisma.InviteLinkUncheckedUpdateInput, client: Client = prisma) {
  return client.inviteLink.update({ where: { id }, data });
}

export function deleteInviteLink(id: string, client: Client = prisma) {
  return client.inviteLink.delete({ where: { id } });
}

export function incrementInviteLinkUses(id: string, client: Client = prisma) {
  return client.inviteLink.update({ where: { id }, data: { usesCount: { increment: 1 } } });
}
