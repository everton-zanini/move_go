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

  return (
    <div className="flex flex-col gap-4 pb-12">
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

      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <DayForm
          action={boundSaveAction}
          dayNumber={dayNumber}
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
