import { notFound } from "next/navigation";
import { getChurchById } from "@/server/services/church.service";
import { listUsers } from "@/server/repositories/user.repository";
import { requireSuperAdmin } from "@/server/auth/context";
import { NotFoundError } from "@/server/errors";
import { ConfirmSubmitButton } from "@/components/ui/ConfirmSubmitButton";
import { ChurchForm } from "../../ChurchForm";
import {
  addChurchAdminAction,
  platformSetUserRoleAction,
  platformToggleUserActiveAction,
  toggleChurchActiveAction,
  updateChurchAction,
} from "../../actions";

export default async function ChurchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireSuperAdmin();

  let church;
  try {
    church = await getChurchById(id);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }
  const users = await listUsers(church.id);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold">
          {church.name}{" "}
          <span className={`text-sm ${church.active ? "text-emerald-400" : "text-white/65"}`}>
            · {church.active ? "Ativa" : "Inativa"}
          </span>
        </h1>
        <form action={toggleChurchActiveAction.bind(null, church.id)}>
          <ConfirmSubmitButton
            label={church.active ? "Desativar igreja" : "Ativar igreja"}
            confirmMessage={
              church.active
                ? `Desativar "${church.name}"? Usuários dela perdem o acesso e os convites param de funcionar.`
                : `Reativar "${church.name}"?`
            }
            className={church.active ? "text-red-400 underline underline-offset-2" : "text-emerald-400 underline underline-offset-2"}
          />
        </form>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-white/70">Dados da igreja</h2>
        <ChurchForm
          action={updateChurchAction.bind(null, church.id)}
          submitLabel="Salvar alterações"
          withChurch
          defaultValues={{ name: church.name, slug: church.slug }}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-white/70">Usuários</h2>
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-white/50">
              <tr>
                <th className="px-3 py-2">Nome</th>
                <th className="px-3 py-2">Email</th>
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
                  <td className="px-3 py-2">{u.role === "ADMIN" ? "Admin" : "Jogador"}</td>
                  <td className="px-3 py-2">
                    <span className={u.active ? "text-emerald-400" : "text-white/65"}>
                      {u.active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="flex gap-3 px-3 py-2">
                    <form action={platformToggleUserActiveAction.bind(null, church.id, u.id)}>
                      <ConfirmSubmitButton
                        label={u.active ? "Desativar" : "Ativar"}
                        confirmMessage={`${u.active ? "Desativar" : "Ativar"} o usuário "${u.name}"?`}
                        className="text-white/60 underline underline-offset-2"
                      />
                    </form>
                    <form
                      action={platformSetUserRoleAction.bind(null, church.id, u.id, u.role === "ADMIN" ? "USER" : "ADMIN")}
                    >
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
                  <td colSpan={5} className="px-3 py-4 text-center text-white/65">
                    Nenhum usuário nesta igreja.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-white/70">Adicionar admin</h2>
        <ChurchForm action={addChurchAdminAction.bind(null, church.id)} submitLabel="Adicionar admin" withAdmin />
      </section>
    </div>
  );
}
