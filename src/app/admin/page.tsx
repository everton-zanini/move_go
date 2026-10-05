import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { countUsers } from "@/server/repositories/user.repository";
import {
  countCheckIns,
  countDistinctCheckedInUsers,
  listRecentCheckIns,
} from "@/server/repositories/checkin.repository";
import { findCurrentOrNextEvent } from "@/server/repositories/event.repository";
import { listEvolutionXpTable } from "@/server/services/pet.service";
import { requireChurchAdmin } from "@/server/auth/context";

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-white/50">{label}</p>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const { churchId } = await requireChurchAdmin();
  const now = new Date();
  const [totalUsers, totalCheckIns, activeUsers, currentEvent, recentCheckIns, evolutionTable] = await Promise.all([
    countUsers(churchId),
    countCheckIns(churchId),
    countDistinctCheckedInUsers(churchId),
    findCurrentOrNextEvent(churchId, now),
    listRecentCheckIns(churchId, 10),
    listEvolutionXpTable(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard label="Usuários" value={totalUsers} />
        <MetricCard label="Check-ins" value={totalCheckIns} />
        <MetricCard label="Usuários ativos" value={activeUsers} />
        <MetricCard label="Evento atual" value={currentEvent?.name ?? "—"} />
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-white/70">XP por fase de evolução</h2>
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-white/50">
              <tr>
                <th className="px-3 py-2">Fase</th>
                <th className="px-3 py-2">Nível</th>
                <th className="px-3 py-2">XP total</th>
                <th className="px-3 py-2">XP desde a fase anterior</th>
              </tr>
            </thead>
            <tbody>
              {evolutionTable.map((row) => (
                <tr key={row.id} className="border-t border-white/5">
                  <td className="px-3 py-2">{row.name}</td>
                  <td className="px-3 py-2">{row.levelRequired}</td>
                  <td className="px-3 py-2">{row.totalXp}</td>
                  <td className="px-3 py-2 text-white/60">{row.xpFromPrevious}</td>
                </tr>
              ))}
              {evolutionTable.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-4 text-center text-white/65">
                    Nenhuma fase configurada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-white/70">Últimos check-ins</h2>
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-white/50">
              <tr>
                <th className="px-3 py-2">Usuário</th>
                <th className="px-3 py-2">Evento</th>
                <th className="px-3 py-2">Quando</th>
              </tr>
            </thead>
            <tbody>
              {recentCheckIns.map((c) => (
                <tr key={c.id} className="border-t border-white/5">
                  <td className="px-3 py-2">{c.user.name}</td>
                  <td className="px-3 py-2">{c.event.name}</td>
                  <td className="px-3 py-2 text-white/50">
                    {format(c.createdAt, "dd/MM HH:mm", { locale: ptBR })}
                  </td>
                </tr>
              ))}
              {recentCheckIns.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-3 py-4 text-center text-white/65">
                    Nenhum check-in ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
