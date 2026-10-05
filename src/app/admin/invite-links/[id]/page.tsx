import { notFound } from "next/navigation";
import { format } from "date-fns";
import { getInviteLinkById } from "@/server/services/invite-link.service";
import { requireChurchAdmin } from "@/server/auth/context";
import { NotFoundError } from "@/server/errors";
import { InviteLinkForm } from "../InviteLinkForm";
import { updateInviteLinkAction } from "../actions";

export default async function EditInviteLinkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { churchId } = await requireChurchAdmin();

  let link;
  try {
    link = await getInviteLinkById(id, churchId);
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    }
    throw error;
  }

  const boundAction = updateInviteLinkAction.bind(null, id);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-bold">Editar link de cadastro</h1>
      <InviteLinkForm
        action={boundAction}
        submitLabel="Salvar alterações"
        confirmMessage="Salvar as alterações?"
        defaultValues={{
          label: link.label ?? "",
          expiresAt: format(link.expiresAt, "yyyy-MM-dd'T'HH:mm"),
        }}
      />
    </div>
  );
}
