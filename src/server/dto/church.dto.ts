import { z } from "zod";

export const churchFormSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome da igreja.").max(80),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, "Informe o identificador.")
    .max(60)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use só letras minúsculas, números e hífens (ex.: move-santana)."),
});

export const churchAdminSchema = z.object({
  adminName: z.string().trim().min(2, "Informe o nome do admin.").max(80),
  adminEmail: z.string().trim().email("Informe um email válido."),
  adminPassword: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres."),
});

export const createChurchSchema = churchFormSchema.extend(churchAdminSchema.shape);

export type ChurchFormInput = z.infer<typeof churchFormSchema>;
export type ChurchAdminInput = z.infer<typeof churchAdminSchema>;
export type CreateChurchInput = z.infer<typeof createChurchSchema>;
