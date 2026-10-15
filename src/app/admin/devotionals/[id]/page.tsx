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

  const nextUnfilledDay = allDaysList.find((d) => !d.record)?.dayNumber ?? 1;

  return (
    <div className="flex flex-col gap-6 pb-12">
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

      {/* Banner de Ação Rápida */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-emerald-200">
            📝 Onde cadastrar as tarefas, versículos e textos base?
          </h2>
          <p className="text-xs text-emerald-100/80 leading-relaxed max-w-xl">
            Cada dia do devocional tem seus próprios <b>versículos de leitura</b>, <b>texto base/reflexão</b> e a <b>tarefa prática</b>.
            Você pode preenchê-los dia a dia clicando abaixo ou selecionando qualquer dia na lista ao lado.
          </p>
        </div>
        <Link
          href={`/admin/devotionals/${journey.id}/days/${nextUnfilledDay}`}
          className="whitespace-nowrap rounded-lg bg-emerald-500 px-5 py-2.5 text-xs font-bold text-black shadow-lg hover:bg-emerald-400 transition-all"
        >
          {journey.days.length === 0
            ? "Começar pelo Dia 1 ➔"
            : journey.days.length < journey.totalDays
            ? `Cadastrar Dia ${nextUnfilledDay} ➔`
            : "Revisar Todos os Dias ➔"}
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Lado Esquerdo: Configurações da Jornada */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <h2 className="mb-4 text-base font-bold text-white">Configurações Gerais da Jornada</h2>
          <JourneyForm
            action={boundUpdateAction}
            submitLabel="Salvar alterações gerais"
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
            <div>
              <h2 className="text-base font-bold text-white">Tarefas e Leituras Diárias</h2>
              <p className="text-[11px] text-white/50">Clique em qualquer dia para editar seus versículos e tarefas</p>
            </div>
            <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
              {journey.days.length} / {journey.totalDays} cadastrados
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {allDaysList.map(({ dayNumber, date, record }) => (
              <div
                key={dayNumber}
                className={`flex flex-col gap-3 rounded-lg border p-4 transition-all sm:flex-row sm:items-center sm:justify-between ${
                  record
                    ? "border-white/10 bg-white/5"
                    : "border-dashed border-amber-500/30 bg-amber-500/5"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-1.5 py-0.5 text-xs font-bold ${
                        record
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-amber-500/20 text-amber-400"
                      }`}
                    >
                      Dia {dayNumber}
                    </span>
                    <span className="text-xs text-white/50">
                      {formatBR(date, "dd/MM/yyyy (EEE)", { locale: ptBR })}
                    </span>
                    {record ? (
                      <span className="text-[10px] text-emerald-400">✓ Preenchido</span>
                    ) : (
                      <span className="text-[10px] text-amber-300">⚠️ Pendente</span>
                    )}
                  </div>

                  <p className="text-sm font-semibold text-white">
                    {record ? record.title : "Nenhum conteúdo cadastrado ainda"}
                  </p>

                  {record?.bibleVerse && (
                    <p className="text-xs text-emerald-300">
                      📖 <b>Leitura:</b> {record.bibleVerse}
                    </p>
                  )}

                  {record?.taskPrompt && (
                    <p className="text-xs text-yellow-300">
                      🎯 <b>Tarefa:</b> {record.taskPrompt}
                    </p>
                  )}
                </div>

                <Link
                  href={`/admin/devotionals/${journey.id}/days/${dayNumber}`}
                  className={`self-start whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold sm:self-center ${
                    record
                      ? "bg-white/10 text-white hover:bg-white/20"
                      : "bg-emerald-500 text-black hover:bg-emerald-400"
                  }`}
                >
                  {record ? "Editar Conteúdo" : "Cadastrar Tarefa & Texto"}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
