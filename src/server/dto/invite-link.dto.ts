import { z } from "zod";

export const inviteLinkFormSchema = z.object({
  label: z.string().trim().max(120).optional(),
  expiresAt: z.string().min(1, "Informe a validade do link."),
});

export type InviteLinkFormInput = z.infer<typeof inviteLinkFormSchema>;
