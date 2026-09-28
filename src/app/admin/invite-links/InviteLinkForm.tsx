"use client";

import { useActionState } from "react";
import type { InviteLinkFormState } from "./actions";

export function InviteLinkForm({
  action,
  submitLabel,
  defaultValues,
}: {
  action: (prevState: InviteLinkFormState, formData: FormData) => Promise<InviteLinkFormState>;
  submitLabel: string;
  defaultValues?: {
    label: string;
    expiresAt: string;
  };
}) {
  const [state, formAction, isPending] = useActionState(action, {});

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="label" className="text-sm text-white/70">
          Identificação (opcional)
        </label>
        <input
          id="label"
          name="label"
          type="text"
          placeholder="Ex.: Culto de domingo"
          defaultValue={defaultValues?.label}
          className="rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-base outline-none focus:border-emerald-400"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="expiresAt" className="text-sm text-white/70">
          Válido até
        </label>
        <input
          id="expiresAt"
          name="expiresAt"
          type="datetime-local"
          required
          defaultValue={defaultValues?.expiresAt}
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
