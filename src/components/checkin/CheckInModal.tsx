"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import QrScanner from "qr-scanner";
import { useModalA11y } from "@/components/ui/useModalA11y";
import { resolveCheckInCodeAction, type CheckInCodeState } from "@/app/(app)/actions";

type Mode = "closed" | "camera" | "code";

const initialCodeState: CheckInCodeState = {};

export function CheckInModal() {
  const [mode, setMode] = useState<Mode>("closed");

  const close = () => setMode("closed");
  const dialogRef = useModalA11y<HTMLDivElement>(mode !== "closed", close);

  return (
    <>
      <button
        type="button"
        onClick={() => setMode("camera")}
        className="min-h-12 rounded-full bg-[color:var(--accent,#10b981)] px-6 py-3 text-sm font-bold text-black"
      >
        📷 Fazer Check-in
      </button>

      {mode !== "closed" && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Fazer check-in"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 overflow-y-auto bg-black px-6 pb-6 pt-20"
        >
          {mode === "camera" && <CameraStep onPickCode={() => setMode("code")} />}
          {mode === "code" && <CodeStep onPickCamera={() => setMode("camera")} />}

          {/* Fixo no topo: com a câmera ocupando a tela, um botão no fluxo sai da área visível. */}
          <button
            type="button"
            onClick={close}
            className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] min-h-11 rounded-full bg-white/15 px-5 py-2 text-sm font-semibold text-white"
          >
            ✕ Fechar
          </button>
        </div>
      )}
    </>
  );
}

function CameraStep({ onPickCode }: { onPickCode: () => void }) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!videoRef.current) {
      return;
    }

    const handleResult = (data: string) => {
      let url: URL;
      try {
        url = new URL(data, window.location.origin);
      } catch {
        setError("QR Code inválido.");
        return;
      }
      if (url.origin !== window.location.origin || !url.pathname.startsWith("/checkin/")) {
        setError("Este QR Code não é de um check-in do MoveGO.");
        return;
      }
      scannerRef.current?.stop();
      // auto=1: o QR foi lido dentro do app, então a tela de check-in confirma sozinha.
      router.push(`${url.pathname}?auto=1`);
    };

    const scanner = new QrScanner(
      videoRef.current,
      (result) => handleResult(result.data),
      {
        onDecodeError: (err) => {
          if (err !== QrScanner.NO_QR_CODE_FOUND) {
            setError("Não foi possível ler o QR Code.");
          }
        },
        preferredCamera: "environment",
        returnDetailedScanResult: true,
        highlightCodeOutline: true,
      },
    );
    scannerRef.current = scanner;

    scanner
      .start()
      .then(() => setReady(true))
      .catch(() => setError("Não foi possível acessar a câmera. Verifique a permissão."));

    return () => {
      scanner.destroy();
      scannerRef.current = null;
    };
  }, [router]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full max-w-xs">
        <video ref={videoRef} className="max-h-[60dvh] w-full rounded-xl bg-white/5 object-cover" muted playsInline />
        {!ready && !error && (
          <p className="absolute inset-0 flex items-center justify-center text-sm text-white/70">
            Abrindo a câmera...
          </p>
        )}
      </div>
      {error && <p role="alert" className="max-w-xs text-center text-sm text-red-400">{error}</p>}
      <p className="text-center text-xs text-white/70">Aponte a câmera para o QR Code do evento</p>
      <button
        type="button"
        onClick={onPickCode}
        className="min-h-11 text-sm text-white/70 underline underline-offset-2"
      >
        Digitar código em vez disso
      </button>
    </div>
  );
}

function CodeStep({ onPickCamera }: { onPickCamera: () => void }) {
  const [state, formAction, isPending] = useActionState(resolveCheckInCodeAction, initialCodeState);

  return (
    <form action={formAction} className="flex flex-col items-center gap-3">
      <p className="text-sm text-white/70">Digite o código do evento</p>
      <input
        name="code"
        type="text"
        required
        maxLength={6}
        autoCapitalize="characters"
        autoComplete="off"
        placeholder="EX: 4KZ7QM"
        className="w-48 rounded-lg border border-white/15 bg-white/5 px-3 py-3 text-center text-lg font-bold uppercase tracking-widest outline-none focus:border-emerald-400"
      />
      {state?.error && (
        <p role="alert" className="text-sm text-red-400">{state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="w-48 rounded-full bg-emerald-500 px-6 py-3 text-sm font-bold text-black disabled:opacity-60"
      >
        {isPending ? "Verificando..." : "Confirmar"}
      </button>
      <button
        type="button"
        onClick={onPickCamera}
        className="min-h-11 text-sm text-white/70 underline underline-offset-2"
      >
        Escanear QR Code em vez disso
      </button>
    </form>
  );
}
