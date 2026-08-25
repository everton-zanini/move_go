"use client";

import { useActionState } from "react";
import type { EventFormState } from "./actions";

export function EventForm({
  action,
  submitLabel,
  defaultValues,
}: {
  action: (prevState: EventFormState, formData: FormData) => Promise<EventFormState>;
  submitLabel: string;
  defaultValues?: {
    name: string;
    description: string;
    date: string;
    startTime: string;
    endTime: string;
    xpReward: number;
  };
}) {
  const [state, formAction, isPending] = useActionState(action, {});

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm text-white/70">
          Nome
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={defaultValues?.name}
          className="rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-base outline-none focus:border-emerald-400"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-sm text-white/70">
          Descrição
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={defaultValues?.description}
          className="rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-base outline-none focus:border-emerald-400"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="date" className="text-sm text-white/70">
          Data
        </label>
        <input
          id="date"
          name="date"
          type="date"
          required
          defaultValue={defaultValues?.date}
          className="rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-base outline-none focus:border-emerald-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="startTime" className="text-sm text-white/70">
            Início
          </label>
          <input
            id="startTime"
            name="startTime"
            type="time"
            required
            defaultValue={defaultValues?.startTime}
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-base outline-none focus:border-emerald-400"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="endTime" className="text-sm text-white/70">
            Término
          </label>
          <input
            id="endTime"
            name="endTime"
            type="time"
            required
            defaultValue={defaultValues?.endTime}
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-base outline-none focus:border-emerald-400"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="xpReward" className="text-sm text-white/70">
          XP concedido
        </label>
        <input
          id="xpReward"
          name="xpReward"
          type="number"
          min={1}
          required
          defaultValue={defaultValues?.xpReward}
          className="rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-base outline-none focus:border-emerald-400"
        />
      </div>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 rounded-lg bg-emerald-500 px-4 py-3 text-sm font-bold text-black disabled:opacity-60"
      >
        {isPending ? "Salvando..." : submitLabel}
      </button>
    </form>
  );
}
