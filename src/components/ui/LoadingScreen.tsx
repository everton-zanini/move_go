export function LoadingScreen() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-10">
      <p className="animate-bounce text-4xl">🥚</p>
      <p className="font-pixel text-[10px] text-emerald-400">CARREGANDO...</p>
    </div>
  );
}
