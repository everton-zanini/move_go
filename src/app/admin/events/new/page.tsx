import { EventForm } from "../EventForm";
import { createEventAction } from "../actions";

export default function NewEventPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-bold">Novo evento</h1>
      <EventForm action={createEventAction} submitLabel="Criar evento" />
    </div>
  );
}
