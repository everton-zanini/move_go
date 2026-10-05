import { listUpcomingEvents } from "@/server/services/event.service";
import { requireMember } from "@/server/auth/context";
import { EventBadge } from "@/components/events/EventBadge";

export default async function EventsPage() {
  const { churchId } = await requireMember();
  const events = await listUpcomingEvents(churchId);

  return (
    <div className="flex flex-1 flex-col gap-4 px-6 py-8">
      <h1 className="text-center text-lg font-bold">📅 Agenda</h1>
      <p className="text-center text-xs text-white/50">Próximos eventos pra você se programar</p>

      {events.length === 0 ? (
        <p className="mt-8 text-center text-sm text-white/50">📅 Nenhum evento agendado ainda.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {events.map((event) => (
            <EventBadge
              key={event.id}
              name={event.name}
              description={event.description}
              date={event.date}
              startTime={event.startTime}
              endTime={event.endTime}
            />
          ))}
        </div>
      )}
    </div>
  );
}
