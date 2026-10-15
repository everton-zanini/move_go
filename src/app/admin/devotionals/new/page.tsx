import { requireChurchAdmin } from "@/server/auth/context";
import { listItems } from "@/server/repositories/item.repository";
import { JourneyForm } from "../JourneyForm";
import { createJourneyAction } from "../actions";

export default async function NewJourneyPage() {
  await requireChurchAdmin();
  const items = await listItems();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-bold">Nova Jornada Devocional</h1>
        <p className="text-xs text-white/60">Configure o período e o objetivo da campanha diária.</p>
      </div>

      <JourneyForm
        action={createJourneyAction}
        submitLabel="Criar jornada e avançar"
        items={items}
      />
    </div>
  );
}
