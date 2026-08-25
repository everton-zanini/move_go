"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="text-4xl">😵</p>
      <h1 className="text-lg font-bold">Algo deu errado</h1>
      <p className="max-w-xs text-sm text-white/60">
        Tivemos um problema inesperado. Tente novamente em instantes.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-3 rounded-full bg-emerald-500 px-6 py-3 text-sm font-bold text-black"
      >
        Tentar de novo
      </button>
    </main>
  );
}
