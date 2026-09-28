import { InviteLinkForm } from "../InviteLinkForm";
import { createInviteLinkAction } from "../actions";

export default function NewInviteLinkPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-bold">Novo link de cadastro</h1>
      <InviteLinkForm action={createInviteLinkAction} submitLabel="Criar link" />
    </div>
  );
}
