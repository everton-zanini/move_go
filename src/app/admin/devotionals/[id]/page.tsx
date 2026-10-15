import { notFound } from "next/navigation";
import Link from "next/link";
import { addDays } from "date-fns";
import { formatBR } from "@/lib/datetime";
import { ptBR } from "date-fns/locale";
import { getJourneyById } from "@/server/services/devotional.service";
import { requireChurchAdmin } from "@/server/auth/context";
import { listItems } from "@/server/repositories/item.repository";
import { NotFoundError } from "@/server/errors";
import { JourneyForm } from "../JourneyForm";
import { updateJourneyAction } from "../actions";

export default async function EditJourneyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { churchId } = await requireChurchAdmin();

  let journey;
  try {
    journey = await getJourneyById(id, churchId);
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    }
    throw error;
  }

  const items = await listItems();
  const boundUpdateAction = updateJourneyAction.bind(null, id);

  const daysMap = new Map(journey.days.map((d) => [d.dayNumber, d]));
  const allDaysList = Array.from({ length: journey.totalDays }, (_, i) => {
    const dayNumber = i + 1;
    const dayDate = addDays(journey.startDate, i);
    const dayRecord = daysMap.get(dayNumber);
    return {
      dayNumber,
      date: dayDate,
      record: dayRecord,
    };
  });

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{journey.title}</h1>
          <p className="text-xs text-white/60">
            {journey.totalDays} dias • Início em {formatBR(journey.startDate, "dd/MM/yyyy", { locale: ptBR })}
          </p>
        </div>
        <Link
          href="/admin/devotionals"
          className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/70 hover:bg-white/5"
        >
          ← Voltar para jornadas
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Lado Esquerdo: Configurações da Jornada */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <h2 className="mb-4 text-base font-bold text-white">Configurações da Jornada</h2>
          <JourneyForm
            action={boundUpdateAction}
            submitLabel="Salvar alterações"
            confirmMessage="Deseja salvar as alterações da jornada?"
            items={items}
            defaultValues={{
              title: journey.title,
              description: journey.description ?? "",
              totalDays: journey.totalDays,
              startDate: formatBR(journey.startDate, "yyyy-MM-dd"),
              bonusXp: journey.bonusXp,
              rewardItemId: journey.rewardItemId,
            }}
          />
        </div>

        {/* Lado Direito: Grade dos Dias */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Dias do Devocional</h2>
            <span className="text-xs text-emerald-400">
              {journey.days.length} de {journey.totalDays} dias cadastrados
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {allDaysList.map(({ dayNumber, date, record }) => (
              <div
                key={dayNumber}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-xs font-bold text-emerald-400">
                      Dia {dayNumber}
                    </span>
                    <span className="text-xs text-white/50">
                      {formatBR(date, "dd/MM/yyyy (EEE)", { locale: ptBR })}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {record ? record.title : "Sem conteúdo cadastrado"}
                  </p>
                  {record?.bibleVerse && (
                    <p className="text-xs text-emerald-300">📖 {record.bibleVerse}</p>
                  )}
                </div>

                <Link
                  href={`/admin/devotionals/${journey.id}/days/${dayNumber}`}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    record
                      ? "bg-white/10 text-white hover:bg-white/20"
                      : "bg-emerald-500 text-black hover:bg-emerald-400"
                  }`}
                >
                  {record ? "Editar conteúdo" : "Cadastrar conteúdo"}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
