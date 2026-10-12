import { notFound } from "next/navigation";
import { formatBR } from "@/lib/datetime";
import { getEventById } from "@/server/services/event.service";
import { requireChurchAdmin } from "@/server/auth/context";
import { NotFoundError } from "@/server/errors";
import { EventForm } from "../EventForm";
import { updateEventAction } from "../actions";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { churchId } = await requireChurchAdmin();

  let event;
  try {
    event = await getEventById(id, churchId);
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    }
    throw error;
  }

  const boundAction = updateEventAction.bind(null, id);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-bold">Editar evento</h1>
      <EventForm
        action={boundAction}
        submitLabel="Salvar alterações"
        confirmMessage="Salvar as alterações?"
        defaultValues={{
          name: event.name,
          description: event.description ?? "",
          date: formatBR(event.date, "yyyy-MM-dd"),
          startTime: formatBR(event.startTime, "HH:mm"),
          endTime: formatBR(event.endTime, "HH:mm"),
          xpReward: event.xpReward,
        }}
      />
    </div>
  );
}
