"use server";

import { revalidatePath } from "next/cache";
import { requireMember } from "@/server/auth/context";
import { devotionalCheckInSchema } from "@/server/dto/devotional.dto";
import { performDevotionalCheckIn } from "@/server/services/devotional.service";
import { DomainError } from "@/server/errors";

export async function completeDevotionalAction(input: {
  devotionalDayId: string;
  userNote?: string;
}) {
  const user = await requireMember();

  const parsed = devotionalCheckInSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  try {
    const result = await performDevotionalCheckIn(user.userId, user.churchId, parsed.data);
    revalidatePath("/");
    revalidatePath("/devotional");
    revalidatePath("/inventory");
    revalidatePath("/profile");
    return { success: true, result };
  } catch (error) {
    if (error instanceof DomainError) {
      return { success: false, error: error.message };
    }
    console.error("[completeDevotionalAction] Erro inesperado:", error);
    return { success: false, error: "Não foi possível registrar o devocional." };
  }
}
