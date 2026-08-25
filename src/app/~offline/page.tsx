export default function OfflinePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="text-4xl">📡</p>
      <h1 className="text-lg font-bold">Sem conexão</h1>
      <p className="max-w-xs text-sm text-white/60">
        Parece que você está offline. Conecte-se à internet para ver seu pet e fazer check-in.
      </p>
    </main>
  );
}
