import { notFound } from "next/navigation";
import Link from "next/link";
import { addDays } from "date-fns";
import { formatBR } from "@/lib/datetime";
import { ptBR } from "date-fns/locale";
import { getDayContent, getJourneyById } from "@/server/services/devotional.service";
import { requireChurchAdmin } from "@/server/auth/context";
import { NotFoundError } from "@/server/errors";
import { DayForm } from "../../DayForm";
import { saveDayAction } from "../../../actions";

export default async function EditDayPage({
  params,
}: {
  params: Promise<{ id: string; dayNumber: string }>;
}) {
  const { id, dayNumber: dayNumberStr } = await params;
  const dayNumber = parseInt(dayNumberStr, 10);
  if (isNaN(dayNumber) || dayNumber < 1) notFound();

  const { churchId } = await requireChurchAdmin();

  let journey;
  try {
    journey = await getJourneyById(id, churchId);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }

  if (dayNumber > journey.totalDays) notFound();

  const dayRecord = await getDayContent(id, dayNumber);
  const dayDate = addDays(journey.startDate, dayNumber - 1);
  const boundSaveAction = saveDayAction.bind(null, id);

  const registeredDaysSet = new Set(journey.days.map((d) => d.dayNumber));

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-400">
              Dia {dayNumber} de {journey.totalDays}
            </span>
            <span className="text-xs text-white/50">
              {formatBR(dayDate, "dd/MM/yyyy (EEEE)", { locale: ptBR })}
            </span>
          </div>
          <h1 className="mt-1 text-xl font-bold">{journey.title}</h1>
        </div>
        <Link
          href={`/admin/devotionals/${id}`}
          className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/70 hover:bg-white/5"
        >
          ← Voltar para a jornada
        </Link>
      </div>

      {/* Navegador Rápido de Dias */}
      <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white/70">
            Navegar entre os dias da jornada ({journey.days.length} de {journey.totalDays} preenchidos):
          </span>
          <div className="flex items-center gap-2 text-xs">
            {dayNumber > 1 && (
              <Link
                href={`/admin/devotionals/${id}/days/${dayNumber - 1}`}
                className="text-white/60 hover:text-white"
              >
                ← Dia {dayNumber - 1}
              </Link>
            )}
            {dayNumber < journey.totalDays && (
              <Link
                href={`/admin/devotionals/${id}/days/${dayNumber + 1}`}
                className="text-emerald-400 hover:text-emerald-300"
              >
                Dia {dayNumber + 1} →
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {Array.from({ length: journey.totalDays }, (_, i) => i + 1).map((num) => {
            const isCurrent = num === dayNumber;
            const isFilled = registeredDaysSet.has(num);
            return (
              <Link
                key={num}
                href={`/admin/devotionals/${id}/days/${num}`}
                className={`flex items-center gap-1 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  isCurrent
                    ? "bg-emerald-500 text-black ring-2 ring-emerald-400"
                    : isFilled
                    ? "bg-white/10 text-white hover:bg-white/20"
                    : "border border-dashed border-white/20 bg-transparent text-white/50 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span>Dia {num}</span>
                {isFilled && <span className={isCurrent ? "text-black" : "text-emerald-400"}>✓</span>}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <DayForm
          action={boundSaveAction}
          dayNumber={dayNumber}
          hasNextDay={dayNumber < journey.totalDays}
          defaultValues={
            dayRecord
              ? {
                  title: dayRecord.title,
                  bibleVerse: dayRecord.bibleVerse ?? "",
                  content: dayRecord.content,
                  taskPrompt: dayRecord.taskPrompt ?? "",
                  xpReward: dayRecord.xpReward,
                  happinessReward: dayRecord.happinessReward,
                }
              : undefined
          }
        />
      </div>
    </div>
  );
}
