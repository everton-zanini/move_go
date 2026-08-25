"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black print:hidden"
    >
      Imprimir
    </button>
  );
}
