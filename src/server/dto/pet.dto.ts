import { z } from "zod";

export const petNicknameSchema = z.object({
  speciesId: z.string().min(1, "Escolha uma linha evolutiva."),
  nickname: z
    .string()
    .trim()
    .min(2, "O nome precisa ter pelo menos 2 caracteres.")
    .max(20, "O nome pode ter no máximo 20 caracteres."),
});

export type PetNicknameInput = z.infer<typeof petNicknameSchema>;
