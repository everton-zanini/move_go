"use client";

import { useFormStatus } from "react-dom";

export function EquipButton({ equipped }: { equipped: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-full px-3 py-1 text-xs font-semibold disabled:opacity-60 ${
        equipped ? "bg-emerald-500 text-black" : "bg-white/10 text-white/70"
      }`}
    >
      {pending ? "..." : equipped ? "Equipado" : "Equipar"}
    </button>
  );
}
