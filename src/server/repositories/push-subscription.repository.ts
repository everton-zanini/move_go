import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";
import type { PushSubscriptionInput } from "@/server/dto/push.dto";

type Client = typeof prisma | Prisma.TransactionClient;

export function upsertPushSubscription(
  userId: string,
  input: PushSubscriptionInput,
  client: Client = prisma
) {
  return client.pushSubscription.upsert({
    where: { endpoint: input.endpoint },
    update: {
      userId,
      p256dh: input.keys.p256dh,
      auth: input.keys.auth,
    },
    create: {
      userId,
      endpoint: input.endpoint,
      p256dh: input.keys.p256dh,
      auth: input.keys.auth,
    },
  });
}

export function findSubscriptionsByChurchId(churchId: string, client: Client = prisma) {
  return client.pushSubscription.findMany({
    where: {
      user: {
        churchId,
        active: true,
      },
    },
    select: {
      id: true,
      endpoint: true,
      p256dh: true,
      auth: true,
      userId: true,
    },
  });
}

export function findSubscriptionsByUserId(userId: string, client: Client = prisma) {
  return client.pushSubscription.findMany({
    where: { userId },
  });
}

export function deletePushSubscriptionByEndpoint(endpoint: string, client: Client = prisma) {
  return client.pushSubscription.deleteMany({
    where: { endpoint },
  });
}

export function deletePushSubscriptionById(id: string, client: Client = prisma) {
  return client.pushSubscription.delete({
    where: { id },
  });
}
