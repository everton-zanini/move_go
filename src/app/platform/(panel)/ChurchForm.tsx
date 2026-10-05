"use client";

import { useActionState } from "react";
import { ConfirmSubmitButton } from "@/components/ui/ConfirmSubmitButton";
import type { PlatformFormState } from "./actions";

const inputClass =
  "rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-base outline-none focus:border-emerald-400";

function Field({
  name,
  label,
  type = "text",
  defaultValue,
  placeholder,
  autoComplete,
}: {
  name: string;
  label: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm text-white/70">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={inputClass}
      />
    </div>
  );
}

/** Formulário do painel: dados da igreja, dados de um admin, ou ambos (cadastro inicial). */
export function ChurchForm({
  action,
  submitLabel,
  confirmMessage,
  withChurch = false,
  withAdmin = false,
  defaultValues,
}: {
  action: (prevState: PlatformFormState, formData: FormData) => Promise<PlatformFormState>;
  submitLabel: string;
  confirmMessage?: string;
  withChurch?: boolean;
  withAdmin?: boolean;
  defaultValues?: { name: string; slug: string };
}) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      {withChurch && (
        <>
          <Field name="name" label="Nome da igreja" defaultValue={defaultValues?.name} />
          <Field
            name="slug"
            label="Identificador"
            placeholder="ex.: move-santana"
            defaultValue={defaultValues?.slug}
          />
        </>
      )}

      {withChurch && withAdmin && <p className="mt-2 text-sm font-semibold text-white/70">Primeiro admin</p>}

      {withAdmin && (
        <>
          <Field name="adminName" label="Nome" autoComplete="off" />
          <Field name="adminEmail" label="Email" type="email" autoComplete="off" />
          <Field name="adminPassword" label="Senha inicial" type="password" autoComplete="new-password" />
        </>
      )}

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

      <ConfirmSubmitButton
        label={submitLabel}
        pendingLabel="Salvando..."
        confirmMessage={confirmMessage}
        className="mt-2 rounded-lg bg-emerald-500 px-4 py-3 text-sm font-bold text-black disabled:opacity-60"
      />
    </form>
  );
}
