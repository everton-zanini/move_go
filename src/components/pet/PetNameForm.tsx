"use client";

import { useActionState } from "react";
import { renamePetAction, type PetNameState } from "@/app/(app)/actions";

const initialState: PetNameState = {};

export function PetNameForm() {
  const [state, formAction, isPending] = useActionState(renamePetAction, initialState);

  return (
    <div className="w-full max-w-xs rounded-xl border border-emerald-400/30 bg-emerald-400/5 p-4 text-center">
      <p className="text-sm font-semibold">Seu pet já tem forma própria! 🎉</p>
      <p className="mt-1 text-xs text-white/60">Dê um nome pra ele.</p>

      <form action={formAction} className="mt-3 flex flex-col gap-2">
        <input
          name="nickname"
          type="text"
          required
          maxLength={20}
          placeholder="Nome do seu pet"
          className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-center text-sm outline-none focus:border-emerald-400"
        />
        {state?.error && <p className="text-xs text-red-400">{state.error}</p>}
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-black disabled:opacity-60"
        >
          {isPending ? "Salvando..." : "Salvar nome"}
        </button>
      </form>
    </div>
  );
}
