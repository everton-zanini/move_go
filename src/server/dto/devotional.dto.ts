import { z } from "zod";

export const devotionalJourneySchema = z.object({
  title: z.string().trim().min(3, "Informe o título da jornada.").max(120),
  description: z.string().trim().max(500).optional(),
  totalDays: z.coerce.number().int().min(1, "A jornada deve ter pelo menos 1 dia.").max(365),
  startDate: z.string().min(1, "Informe a data de início (AAAA-MM-DD)."),
  bonusXp: z.coerce.number().int().min(0, "O bônus de XP não pode ser negativo.").default(100),
  rewardItemId: z.string().optional().nullable(),
});

export type DevotionalJourneyInput = z.infer<typeof devotionalJourneySchema>;

export const devotionalDaySchema = z.object({
  dayNumber: z.coerce.number().int().min(1),
  title: z.string().trim().min(2, "Informe o título do dia.").max(120),
  bibleVerse: z.string().trim().max(120).optional(),
  content: z.string().trim().min(5, "O conteúdo do devocional é obrigatório."),
  taskPrompt: z.string().trim().max(250).optional(),
  xpReward: z.coerce.number().int().min(0).default(20),
  happinessReward: z.coerce.number().int().min(0).default(10),
});

export type DevotionalDayInput = z.infer<typeof devotionalDaySchema>;

export const devotionalCheckInSchema = z.object({
  devotionalDayId: z.string().min(1),
  userNote: z.string().trim().max(1000).optional(),
});

export type DevotionalCheckInInput = z.infer<typeof devotionalCheckInSchema>;
