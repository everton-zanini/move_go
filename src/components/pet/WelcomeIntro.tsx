"use client";

import { useEffect, useState } from "react";
import { PetSprite } from "@/components/pet/PetSprite";
import { useModalA11y } from "@/components/ui/useModalA11y";

const SEEN_KEY = "movego:welcome-seen";

const STEPS = [
  {
    title: "Esse é o seu ovo",
    text: "Ele é só seu. Cuide dele e veja ele crescer junto com você.",
  },
  {
    title: "Faça check-in nos eventos",
    text: "Escaneie o QR Code do evento para ganhar XP, energia e felicidade pro seu pet.",
  },
  {
    title: "Ele vai chocar",
    text: "No nível 2 o ovo choca e você escolhe em quem ele vai se transformar.",
  },
];

function readSeen() {
  try {
    return window.localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

/** Boas-vindas de 3 passos, mostradas uma vez por aparelho enquanto o pet ainda é um ovo. */
export function WelcomeIntro({ userName }: { userName: string }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Lido só no client para não divergir do HTML renderizado no servidor.
    const timer = setTimeout(() => setOpen(!readSeen()), 0);
    return () => clearTimeout(timer);
  }, []);

  function close() {
    try {
      window.localStorage.setItem(SEEN_KEY, "1");
    } catch {
      // Sem storage a tela volta na próxima visita, o que é aceitável.
    }
    setOpen(false);
  }

  const dialogRef = useModalA11y<HTMLDivElement>(open, close);

  if (!open) return null;

  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Boas-vindas ao MoveGO"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 overflow-y-auto bg-black/95 px-6 py-10 text-center"
    >
      <p className="font-pixel text-xs text-emerald-400">BEM-VINDO, {userName.split(" ")[0].toUpperCase()}!</p>

      <PetSprite spriteKey="egg" alt="Seu ovo" />

      <div className="max-w-xs">
        <h2 className="text-lg font-bold">{current.title}</h2>
        <p className="mt-2 text-sm text-white/80">{current.text}</p>
      </div>

      <div className="flex gap-2" aria-hidden="true">
        {STEPS.map((_, index) => (
          <span
            key={index}
            className={`h-2 w-2 rounded-full ${index === step ? "bg-emerald-400" : "bg-white/25"}`}
          />
        ))}
      </div>

      <div className="flex flex-col items-center gap-1">
        <button
          type="button"
          onClick={() => (isLast ? close() : setStep(step + 1))}
          className="min-h-12 rounded-full bg-emerald-500 px-8 py-3 text-sm font-bold text-black"
        >
          {isLast ? "Começar" : "Próximo"}
        </button>
        {!isLast && (
          <button type="button" onClick={close} className="min-h-11 text-xs text-white/70 underline underline-offset-2">
            Pular
          </button>
        )}
      </div>
    </div>
  );
}
