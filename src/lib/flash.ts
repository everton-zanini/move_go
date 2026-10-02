export type FlashType = "success" | "error";

/** Anexa uma mensagem à URL; o <Toaster /> a exibe e remove o parâmetro após o redirect. */
export function withFlash(path: string, message: string, type: FlashType = "success"): string {
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}flash=${encodeURIComponent(message)}&flashType=${type}`;
}
