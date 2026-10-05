import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { listInviteLinks } from "@/server/services/invite-link.service";
import { requireChurchAdmin } from "@/server/auth/context";
import { ConfirmSubmitButton } from "@/components/ui/ConfirmSubmitButton";
import { toggleInviteLinkActiveAction, deleteInviteLinkAction } from "./actions";

export default async function AdminInviteLinksPage() {
  const { churchId } = await requireChurchAdmin();
  const links = await listInviteLinks(churchId);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">Links de cadastro</h1>
        <Link
          href="/admin/invite-links/new"
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black"
        >
          + Novo link
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-white/50">
            <tr>
              <th className="px-3 py-2">Identificação</th>
              <th className="px-3 py-2">Válido até</th>
              <th className="px-3 py-2">Cadastros</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {links.map((link) => {
              const statusLabel = !link.active ? "Desativado" : link.expired ? "Expirado" : "Válido";
              const statusColor = !link.active || link.expired ? "text-white/65" : "text-emerald-400";

              return (
                <tr key={link.id} className="border-t border-white/5">
                  <td className="px-3 py-2">{link.label || "—"}</td>
                  <td className="px-3 py-2 text-white/60">
                    {format(link.expiresAt, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </td>
                  <td className="px-3 py-2">{link.usesCount}</td>
                  <td className="px-3 py-2">
                    <span className={statusColor}>{statusLabel}</span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <Link
                        href={`/admin/invite-links/${link.id}`}
                        className="text-emerald-400 underline underline-offset-2"
                      >
                        Editar
                      </Link>
                      <Link
                        href={`/admin/invite-links/${link.id}/qrcode`}
                        className="text-emerald-400 underline underline-offset-2"
                      >
                        QR Code
                      </Link>
                      <form action={toggleInviteLinkActiveAction.bind(null, link.id)}>
                        <ConfirmSubmitButton
                          label={link.active ? "Desativar" : "Ativar"}
                          confirmMessage={`${link.active ? "Desativar" : "Ativar"} este link de cadastro?`}
                          className="text-white/60 underline underline-offset-2"
                        />
                      </form>
                      <form action={deleteInviteLinkAction.bind(null, link.id)}>
                        <ConfirmSubmitButton
                          label="Excluir"
                          pendingLabel="Excluindo..."
                          confirmMessage="Excluir este link de cadastro? Essa ação não pode ser desfeita."
                          confirmLabel="Excluir"
                          className="text-red-400 underline underline-offset-2"
                        />
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
            {links.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-center text-white/65">
                  Nenhum link de cadastro criado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
