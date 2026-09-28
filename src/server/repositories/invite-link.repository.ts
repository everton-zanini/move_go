import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";

type Client = typeof prisma | Prisma.TransactionClient;

export function findInviteLinkByToken(token: string, client: Client = prisma) {
  return client.inviteLink.findUnique({ where: { token } });
}

export function findInviteLinkById(id: string, client: Client = prisma) {
  return client.inviteLink.findUnique({ where: { id } });
}

export function listInviteLinks(client: Client = prisma) {
  return client.inviteLink.findMany({ orderBy: { createdAt: "desc" } });
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
