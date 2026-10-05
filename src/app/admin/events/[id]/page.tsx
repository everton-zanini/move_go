import { notFound } from "next/navigation";
import { format } from "date-fns";
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
          date: format(event.date, "yyyy-MM-dd"),
          startTime: format(event.startTime, "HH:mm"),
          endTime: format(event.endTime, "HH:mm"),
          xpReward: event.xpReward,
        }}
      />
    </div>
  );
}
