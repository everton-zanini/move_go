import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { auth } from "@/server/auth/auth";
import { validateToken } from "@/server/services/event.service";
import { findCheckIn } from "@/server/repositories/checkin.repository";
import { EventNotFoundError } from "@/server/errors";
import { CheckInScreen } from "./CheckInScreen";

export default async function CheckInPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  let event;
  try {
    event = await validateToken(token);
  } catch (error) {
    if (error instanceof EventNotFoundError) {
      return (
        <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="text-4xl">❓</p>
          <h1 className="text-lg font-bold">QR Code não encontrado</h1>
          <p className="max-w-xs text-sm text-white/60">{error.message}</p>
        </main>
      );
    }
    throw error;
  }

  if (!event.active) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-4xl">🚫</p>
        <h1 className="text-lg font-bold">{event.name}</h1>
        <p className="max-w-xs text-sm text-white/60">Este evento não está mais ativo para check-in.</p>
      </main>
    );
  }

  const session = await auth();
  const existingCheckIn = session?.user ? await findCheckIn(session.user.id, event.id) : null;

  return (
    <main className="flex flex-1 flex-col">
      <CheckInScreen
        token={token}
        eventName={event.name}
        eventDate={format(event.date, "dd/MM/yyyy", { locale: ptBR })}
        eventTime={format(event.startTime, "HH:mm")}
        alreadyCheckedIn={!!existingCheckIn}
        userName={session?.user?.name ?? "Jovem"}
      />
    </main>
  );
}
