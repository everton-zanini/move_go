"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/server/auth/auth";
import { eventFormSchema } from "@/server/dto/event.dto";
import {
  createEvent,
  removeEvent,
  toggleEventActive,
  updateEvent,
} from "@/server/services/event.service";
import { withFlash } from "@/lib/flash";
import { DomainError } from "@/server/errors";

export type EventFormState = { error?: string };

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new DomainError("Acesso não autorizado.", "FORBIDDEN");
  }
}

export async function createEventAction(
  _prevState: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  await requireAdmin();

  const parsed = eventFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  let event;
  try {
    event = await createEvent(parsed.data);
  } catch (error) {
    if (error instanceof DomainError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/admin/events");
  redirect(withFlash(`/admin/events/${event.id}/qrcode`, "Evento criado com sucesso."));
}

export async function updateEventAction(
  id: string,
  _prevState: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  await requireAdmin();

  const parsed = eventFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  try {
    await updateEvent(id, parsed.data);
  } catch (error) {
    if (error instanceof DomainError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/admin/events");
  revalidatePath(`/admin/events/${id}`);
  redirect(withFlash("/admin/events", "Evento atualizado com sucesso."));
}

export async function toggleEventActiveAction(id: string) {
  await requireAdmin();
  await toggleEventActive(id);
  revalidatePath("/admin/events");
  redirect(withFlash("/admin/events", "Status do evento alterado."));
}

export async function deleteEventAction(id: string) {
  await requireAdmin();

  try {
    await removeEvent(id);
  } catch (error) {
    if (error instanceof DomainError) {
      redirect(withFlash("/admin/events", error.message, "error"));
    }
    throw error;
  }

  revalidatePath("/admin/events");
  redirect(withFlash("/admin/events", "Evento excluído com sucesso."));
}
