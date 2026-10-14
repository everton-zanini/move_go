import webpush from "web-push";
import {
  deletePushSubscriptionByEndpoint,
  findSubscriptionsByChurchId,
  upsertPushSubscription,
} from "@/server/repositories/push-subscription.repository";
import type { PushSubscriptionInput } from "@/server/dto/push.dto";

function configureVapid() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:contato@movesantana.com";

  if (!publicKey || !privateKey) {
    return false;
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  return true;
}

export async function registerPushSubscription(userId: string, input: PushSubscriptionInput) {
  return upsertPushSubscription(userId, input);
}

export async function unregisterPushSubscription(endpoint: string) {
  return deletePushSubscriptionByEndpoint(endpoint);
}

export interface NewEventNotificationPayload {
  churchId: string;
  name: string;
  xpReward: number;
}

export async function notifyNewEvent(event: NewEventNotificationPayload): Promise<void> {
  const configured = configureVapid();
  if (!configured) {
    console.warn("[PushNotification] VAPID keys not configured, skipping push notifications.");
    return;
  }

  const subscriptions = await findSubscriptionsByChurchId(event.churchId);
  if (subscriptions.length === 0) {
    return;
  }

  const payload = JSON.stringify({
    title: `Novo Evento: ${event.name}! 🌟`,
    body: `Participe, ganhe +${event.xpReward} XP e evolua seu pet!`,
    url: "/events",
  });

  const sendPromises = subscriptions.map(async (sub) => {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        },
        payload
      );
    } catch (error: unknown) {
      const statusCode = (error as { statusCode?: number })?.statusCode;
      // 404 (Not Found) ou 410 (Gone) significa que a inscrição expirou ou o app foi desinstalado.
      if (statusCode === 404 || statusCode === 410) {
        await deletePushSubscriptionByEndpoint(sub.endpoint);
      } else {
        console.error(`[PushNotification] Erro ao enviar push para ${sub.endpoint}:`, error);
      }
    }
  });

  await Promise.allSettled(sendPromises);
}
