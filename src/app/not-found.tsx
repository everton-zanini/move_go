import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="text-4xl">🥚</p>
      <h1 className="text-lg font-bold">Página não encontrada</h1>
      <p className="max-w-xs text-sm text-white/60">Essa página não existe ou foi movida.</p>
      <Link
        href="/"
        className="mt-3 rounded-full bg-emerald-500 px-6 py-3 text-sm font-bold text-black"
      >
        Voltar para o pet
      </Link>
    </main>
  );
}
