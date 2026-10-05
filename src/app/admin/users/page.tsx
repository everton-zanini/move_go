import { ConfirmSubmitButton } from "@/components/ui/ConfirmSubmitButton";
import { setUserRoleAction, toggleUserActiveAction } from "./actions";
import { listUsers } from "@/server/repositories/user.repository";
import { requireChurchAdmin } from "@/server/auth/context";

export default async function AdminUsersPage() {
  const { churchId } = await requireChurchAdmin();
  const users = await listUsers(churchId);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-bold">Usuários</h1>
      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-white/50">
            <tr>
              <th className="px-3 py-2">Nome</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Nível</th>
              <th className="px-3 py-2">XP</th>
              <th className="px-3 py-2">Check-ins</th>
              <th className="px-3 py-2">Papel</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-white/5">
                <td className="px-3 py-2">{u.name}</td>
                <td className="px-3 py-2 text-white/60">{u.email}</td>
                <td className="px-3 py-2">{u.pet?.level ?? "—"}</td>
                <td className="px-3 py-2">{u.pet?.totalXp ?? "—"}</td>
                <td className="px-3 py-2">{u._count.checkIns}</td>
                <td className="px-3 py-2">{u.role === "ADMIN" ? "Admin" : "Jogador"}</td>
                <td className="px-3 py-2">
                  <span className={u.active ? "text-emerald-400" : "text-white/65"}>
                    {u.active ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="flex gap-3 px-3 py-2">
                  <form action={toggleUserActiveAction.bind(null, u.id)}>
                    <ConfirmSubmitButton
                      label={u.active ? "Desativar" : "Ativar"}
                      confirmMessage={`${u.active ? "Desativar" : "Ativar"} o usuário "${u.name}"?`}
                      className="text-white/60 underline underline-offset-2"
                    />
                  </form>
                  <form action={setUserRoleAction.bind(null, u.id, u.role === "ADMIN" ? "USER" : "ADMIN")}>
                    <ConfirmSubmitButton
                      label={u.role === "ADMIN" ? "Remover admin" : "Tornar admin"}
                      confirmMessage={
                        u.role === "ADMIN" ? `Remover "${u.name}" de admin?` : `Tornar "${u.name}" admin desta igreja?`
                      }
                      className="text-white/60 underline underline-offset-2"
                    />
                  </form>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-4 text-center text-white/65">
                  Nenhum usuário cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
