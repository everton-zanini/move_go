import { z } from "zod";

export const pushSubscriptionSchema = z.object({
  endpoint: z.string().url("Endpoint de notificação inválido."),
  keys: z.object({
    p256dh: z.string().min(1, "Chave p256dh é obrigatória."),
    auth: z.string().min(1, "Chave auth é obrigatória."),
  }),
});

export type PushSubscriptionInput = z.infer<typeof pushSubscriptionSchema>;
