import { listUsers } from "@/server/repositories/user.repository";

export default async function AdminUsersPage() {
  const users = await listUsers();

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
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-center text-white/65">
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
