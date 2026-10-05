import Link from "next/link";
import { listChurches } from "@/server/services/church.service";
import { requireSuperAdmin } from "@/server/auth/context";

export default async function PlatformChurchesPage() {
  await requireSuperAdmin();
  const churches = await listChurches();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">Igrejas</h1>
        <Link
          href="/platform/churches/new"
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black"
        >
          + Nova igreja
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-white/50">
            <tr>
              <th className="px-3 py-2">Nome</th>
              <th className="px-3 py-2">Identificador</th>
              <th className="px-3 py-2">Usuários</th>
              <th className="px-3 py-2">Eventos</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {churches.map((c) => (
              <tr key={c.id} className="border-t border-white/5">
                <td className="px-3 py-2">
                  <Link href={`/platform/churches/${c.id}`} className="text-emerald-400 underline underline-offset-2">
                    {c.name}
                  </Link>
                </td>
                <td className="px-3 py-2 text-white/60">{c.slug}</td>
                <td className="px-3 py-2">{c._count.users}</td>
                <td className="px-3 py-2">{c._count.events}</td>
                <td className="px-3 py-2">
                  <span className={c.active ? "text-emerald-400" : "text-white/65"}>
                    {c.active ? "Ativa" : "Inativa"}
                  </span>
                </td>
              </tr>
            ))}
            {churches.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-center text-white/65">
                  Nenhuma igreja cadastrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
