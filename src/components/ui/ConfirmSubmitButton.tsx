"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";

/** Botão de submit que, com `confirmMessage`, pede confirmação antes de enviar o form. */
export function ConfirmSubmitButton({
  label,
  pendingLabel = "Aguarde...",
  confirmMessage,
  confirmLabel = "Confirmar",
  className,
}: {
  label: string;
  pendingLabel?: string;
  confirmMessage?: string;
  confirmLabel?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  function confirm() {
    setOpen(false);
    buttonRef.current?.form?.requestSubmit();
  }

  return (
    <>
      <button
        ref={buttonRef}
        type={confirmMessage ? "button" : "submit"}
        onClick={confirmMessage ? () => setOpen(true) : undefined}
        disabled={pending}
        className={`${className ?? ""} disabled:opacity-60`}
      >
        {pending ? pendingLabel : label}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
        >
          <div className="w-full max-w-sm rounded-xl border border-white/10 bg-[#1a1a2e] p-5 text-center text-white">
            <p className="text-sm">{confirmMessage}</p>
            <div className="mt-4 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg bg-white/10 px-4 py-2 text-sm"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirm}
                className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-black"
              >
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
