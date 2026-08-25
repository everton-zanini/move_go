import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { listEvents } from "@/server/services/event.service";
import { toggleEventActiveAction, deleteEventAction } from "./actions";

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const events = await listEvents();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">Eventos</h1>
        <Link
          href="/admin/events/new"
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black"
        >
          + Novo evento
        </Link>
      </div>

      {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}

      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-white/50">
            <tr>
              <th className="px-3 py-2">Nome</th>
              <th className="px-3 py-2">Data</th>
              <th className="px-3 py-2">Horário</th>
              <th className="px-3 py-2">XP</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id} className="border-t border-white/5">
                <td className="px-3 py-2">{e.name}</td>
                <td className="px-3 py-2 text-white/60">{format(e.date, "dd/MM/yyyy", { locale: ptBR })}</td>
                <td className="px-3 py-2 text-white/60">
                  {format(e.startTime, "HH:mm")}–{format(e.endTime, "HH:mm")}
                </td>
                <td className="px-3 py-2">{e.xpReward}</td>
                <td className="px-3 py-2">
                  <span className={e.active ? "text-emerald-400" : "text-white/65"}>
                    {e.active ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <Link href={`/admin/events/${e.id}`} className="text-emerald-400 underline underline-offset-2">
                      Editar
                    </Link>
                    <Link
                      href={`/admin/events/${e.id}/qrcode`}
                      className="text-emerald-400 underline underline-offset-2"
                    >
                      QR Code
                    </Link>
                    <form action={toggleEventActiveAction.bind(null, e.id)}>
                      <button type="submit" className="text-white/60 underline underline-offset-2">
                        {e.active ? "Desativar" : "Ativar"}
                      </button>
                    </form>
                    <form action={deleteEventAction.bind(null, e.id)}>
                      <button type="submit" className="text-red-400 underline underline-offset-2">
                        Excluir
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-4 text-center text-white/65">
                  Nenhum evento cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
