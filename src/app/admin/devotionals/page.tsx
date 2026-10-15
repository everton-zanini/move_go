import Link from "next/link";
import { formatBR } from "@/lib/datetime";
import { ptBR } from "date-fns/locale";
import { listJourneys } from "@/server/services/devotional.service";
import { requireChurchAdmin } from "@/server/auth/context";
import { ConfirmSubmitButton } from "@/components/ui/ConfirmSubmitButton";
import { deleteJourneyAction, toggleJourneyActiveAction } from "./actions";

export default async function AdminDevotionalsPage() {
  const { churchId } = await requireChurchAdmin();
  const journeys = await listJourneys(churchId);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Devocionais / Campanhas Diárias</h1>
          <p className="text-xs text-white/60">Crie desafios de leitura e oração diária com ganho de XP e recompensas.</p>
        </div>
        <Link
          href="/admin/devotionals/new"
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400"
        >
          + Nova jornada
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-white/50">
            <tr>
              <th className="px-3 py-2">Título</th>
              <th className="px-3 py-2">Início</th>
              <th className="px-3 py-2">Duração</th>
              <th className="px-3 py-2">Recompensa</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {journeys.map((j) => (
              <tr key={j.id} className="border-t border-white/5">
                <td className="px-3 py-2">
                  <div className="font-semibold text-white">{j.title}</div>
                  <div className="text-xs text-white/50">
                    {j._count.days}/{j.totalDays} dias configurados
                  </div>
                </td>
                <td className="px-3 py-2 text-white/60">
                  {formatBR(j.startDate, "dd/MM/yyyy", { locale: ptBR })}
                </td>
                <td className="px-3 py-2 text-white/60">{j.totalDays} dias</td>
                <td className="px-3 py-2 text-white/60">
                  +{j.bonusXp} XP {j.rewardItem ? `+ 🎁 ${j.rewardItem.name}` : ""}
                </td>
                <td className="px-3 py-2">
                  <span className={j.active ? "text-emerald-400" : "text-white/40"}>
                    {j.active ? "Ativa" : "Inativa"}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={`/admin/devotionals/${j.id}`}
                      className="text-emerald-400 underline underline-offset-2"
                    >
                      Gerenciar dias
                    </Link>
                    <form action={toggleJourneyActiveAction.bind(null, j.id)}>
                      <ConfirmSubmitButton
                        label={j.active ? "Desativar" : "Ativar"}
                        confirmMessage={`${j.active ? "Desativar" : "Ativar"} a jornada "${j.title}"?`}
                        className="text-white/60 underline underline-offset-2"
                      />
                    </form>
                    <form action={deleteJourneyAction.bind(null, j.id)}>
                      <ConfirmSubmitButton
                        label="Excluir"
                        pendingLabel="Excluindo..."
                        confirmMessage={`Excluir a jornada "${j.title}"? Todos os conteúdos e check-ins serão removidos.`}
                        confirmLabel="Excluir"
                        className="text-red-400 underline underline-offset-2"
                      />
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {journeys.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-white/60">
                  Nenhuma jornada devocional cadastrada. Clique em &quot;+ Nova jornada&quot; para começar!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
