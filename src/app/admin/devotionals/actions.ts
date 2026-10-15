"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireChurchAdmin } from "@/server/auth/context";
import {
  devotionalDaySchema,
  devotionalJourneySchema,
} from "@/server/dto/devotional.dto";
import {
  createJourney,
  removeJourney,
  saveDayContent,
  toggleJourneyActive,
  updateJourney,
} from "@/server/services/devotional.service";
import { withFlash } from "@/lib/flash";
import { DomainError } from "@/server/errors";

export type JourneyFormState = { error?: string };

export async function createJourneyAction(
  _prevState: JourneyFormState,
  formData: FormData
): Promise<JourneyFormState> {
  const { churchId } = await requireChurchAdmin();

  const parsed = devotionalJourneySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  let journey;
  try {
    journey = await createJourney(churchId, parsed.data);
  } catch (error) {
    if (error instanceof DomainError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/admin/devotionals");
  redirect(withFlash(`/admin/devotionals/${journey.id}`, "Jornada criada com sucesso. Agora cadastre os dias!"));
}

export async function updateJourneyAction(
  id: string,
  _prevState: JourneyFormState,
  formData: FormData
): Promise<JourneyFormState> {
  const { churchId } = await requireChurchAdmin();

  const parsed = devotionalJourneySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  try {
    await updateJourney(id, churchId, parsed.data);
  } catch (error) {
    if (error instanceof DomainError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/admin/devotionals");
  revalidatePath(`/admin/devotionals/${id}`);
  redirect(withFlash(`/admin/devotionals/${id}`, "Jornada atualizada com sucesso."));
}

export async function toggleJourneyActiveAction(id: string) {
  const { churchId } = await requireChurchAdmin();
  await toggleJourneyActive(id, churchId);
  revalidatePath("/admin/devotionals");
  redirect(withFlash("/admin/devotionals", "Status da jornada alterado."));
}

export async function deleteJourneyAction(id: string) {
  const { churchId } = await requireChurchAdmin();
  try {
    await removeJourney(id, churchId);
  } catch (error) {
    if (error instanceof DomainError) {
      redirect(withFlash("/admin/devotionals", error.message, "error"));
    }
    throw error;
  }

  revalidatePath("/admin/devotionals");
  redirect(withFlash("/admin/devotionals", "Jornada excluída com sucesso."));
}

export type DayFormState = { error?: string };

export async function saveDayAction(
  journeyId: string,
  _prevState: DayFormState,
  formData: FormData
): Promise<DayFormState> {
  const { churchId } = await requireChurchAdmin();

  const parsed = devotionalDaySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  try {
    await saveDayContent(journeyId, churchId, parsed.data);
  } catch (error) {
    if (error instanceof DomainError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath(`/admin/devotionals/${journeyId}`);
  redirect(withFlash(`/admin/devotionals/${journeyId}`, `Conteúdo do Dia ${parsed.data.dayNumber} salvo com sucesso.`));
}
