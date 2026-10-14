"use server";

import { auth } from "@/server/auth/auth";
import { pushSubscriptionSchema } from "@/server/dto/push.dto";
import {
  registerPushSubscription,
  unregisterPushSubscription,
} from "@/server/services/push-notification.service";
import { prisma } from "@/lib/db/prisma";
import { UnauthenticatedError } from "@/server/errors";

export async function subscribePushAction(rawSubscription: unknown) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new UnauthenticatedError();
  }

  const parsed = pushSubscriptionSchema.safeParse(rawSubscription);
  if (!parsed.success) {
    return { success: false, error: "Dados de inscrição inválidos." };
  }

  try {
    await registerPushSubscription(session.user.id, parsed.data);
    return { success: true };
  } catch (err) {
    console.error("[subscribePushAction] Erro:", err);
    return { success: false, error: "Não foi possível ativar as notificações." };
  }
}

export async function unsubscribePushAction(endpoint: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new UnauthenticatedError();
  }

  try {
    await unregisterPushSubscription(endpoint);
    return { success: true };
  } catch (err) {
    console.error("[unsubscribePushAction] Erro:", err);
    return { success: false, error: "Não foi possível desativar as notificações." };
  }
}

export async function checkPushSubscriptionAction(endpoint: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { subscribed: false };
  }

  const found = await prisma.pushSubscription.findFirst({
    where: {
      userId: session.user.id,
      endpoint,
    },
  });

  return { subscribed: Boolean(found) };
}
