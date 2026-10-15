"use client";

import { useActionState } from "react";
import { ConfirmSubmitButton } from "@/components/ui/ConfirmSubmitButton";
import type { JourneyFormState } from "./actions";
import type { Item } from "@prisma/client";

export function JourneyForm({
  action,
  submitLabel,
  confirmMessage,
  items,
  defaultValues,
}: {
  action: (prevState: JourneyFormState, formData: FormData) => Promise<JourneyFormState>;
  submitLabel: string;
  confirmMessage?: string;
  items: Item[];
  defaultValues?: {
    title: string;
    description: string;
    totalDays: number;
    startDate: string;
    bonusXp: number;
    rewardItemId?: string | null;
  };
}) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="text-sm text-white/70">
          Título da Jornada
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          placeholder="ex: 21 Dias de Oração e Avivamento"
          defaultValue={defaultValues?.title}
          className="rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-base outline-none focus:border-emerald-400"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-sm text-white/70">
          Descrição / Propósito
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          placeholder="Sobre o que é esse propósito diário..."
          defaultValue={defaultValues?.description}
          className="rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-base outline-none focus:border-emerald-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="totalDays" className="text-sm text-white/70">
            Duração (Dias)
          </label>
          <input
            id="totalDays"
            name="totalDays"
            type="number"
            min={1}
            max={365}
            required
            defaultValue={defaultValues?.totalDays ?? 21}
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-base outline-none focus:border-emerald-400"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="startDate" className="text-sm text-white/70">
            Data de Início
          </label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            required
            defaultValue={defaultValues?.startDate}
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-base outline-none focus:border-emerald-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="bonusXp" className="text-sm text-white/70">
            Bônus de Conclusão (XP)
          </label>
          <input
            id="bonusXp"
            name="bonusXp"
            type="number"
            min={0}
            defaultValue={defaultValues?.bonusXp ?? 100}
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-base outline-none focus:border-emerald-400"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="rewardItemId" className="text-sm text-white/70">
            Fundo / Item de Recompensa
          </label>
          <select
            id="rewardItemId"
            name="rewardItemId"
            defaultValue={defaultValues?.rewardItemId ?? ""}
            className="rounded-lg border border-white/15 bg-[#1a1a2e] px-3 py-2.5 text-base text-white outline-none focus:border-emerald-400"
          >
            <option value="">Nenhum</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} ({item.slot})
              </option>
            ))}
          </select>
        </div>
      </div>

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}

      <ConfirmSubmitButton
        label={submitLabel}
        pendingLabel="Salvando..."
        confirmMessage={confirmMessage}
        className="mt-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-base font-semibold text-black hover:bg-emerald-400"
      />
    </form>
  );
}
