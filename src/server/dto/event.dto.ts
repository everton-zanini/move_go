import { z } from "zod";

export const eventFormSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do evento.").max(120),
  description: z.string().trim().max(500).optional(),
  date: z.string().min(1, "Informe a data."),
  startTime: z.string().min(1, "Informe o horário de início."),
  endTime: z.string().min(1, "Informe o horário de término."),
  xpReward: z.coerce.number().int().min(1, "XP deve ser maior que zero.").max(10000),
});

export type EventFormInput = z.infer<typeof eventFormSchema>;
