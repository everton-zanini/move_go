"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import QrScanner from "qr-scanner";
import { resolveCheckInCodeAction, type CheckInCodeState } from "@/app/(app)/actions";

type Mode = "closed" | "choice" | "camera" | "code";

const initialCodeState: CheckInCodeState = {};

export function CheckInModal() {
  const [mode, setMode] = useState<Mode>("closed");

  const close = () => setMode("closed");

  return (
    <>
      <button
        type="button"
        onClick={() => setMode("choice")}
        className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-bold text-black"
      >
        📷 Fazer Check-in
      </button>

      {mode !== "closed" && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black px-6">
          {mode === "choice" && <ChoiceStep onPickCamera={() => setMode("camera")} onPickCode={() => setMode("code")} />}
          {mode === "camera" && <CameraStep onBack={() => setMode("choice")} />}
          {mode === "code" && <CodeStep onBack={() => setMode("choice")} />}

          <button
            type="button"
            onClick={close}
            className="rounded-full bg-white/10 px-6 py-3 text-sm font-semibold text-white"
          >
            ✕ Fechar
          </button>
        </div>
      )}
    </>
  );
}

function ChoiceStep({ onPickCamera, onPickCode }: { onPickCamera: () => void; onPickCode: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <p className="text-sm text-white/70">Como você quer fazer o check-in?</p>
      <button
        type="button"
        onClick={onPickCamera}
        className="w-64 rounded-full bg-emerald-500 px-6 py-3 text-sm font-bold text-black"
      >
        📷 Escanear QR Code
      </button>
      <button
        type="button"
        onClick={onPickCode}
        className="w-64 rounded-full bg-white/10 px-6 py-3 text-sm font-semibold text-white"
      >
        🔢 Digitar código
      </button>
    </div>
  );
}

function CameraStep({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      router.push(url.pathname);
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
      .catch(() => setError("Não foi possível acessar a câmera. Verifique a permissão."));

    return () => {
      scanner.destroy();
      scannerRef.current = null;
    };
  }, [router]);

  return (
    <div className="flex flex-col items-center gap-4">
      <video ref={videoRef} className="w-full max-w-xs rounded-xl" muted playsInline />
      {error && <p className="max-w-xs text-center text-sm text-red-400">{error}</p>}
      <p className="text-center text-xs text-white/50">Aponte a câmera para o QR Code do evento</p>
      <button type="button" onClick={onBack} className="text-sm text-white/50 underline underline-offset-2">
        Digitar código em vez disso
      </button>
    </div>
  );
}

function CodeStep({ onBack }: { onBack: () => void }) {
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
      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="w-48 rounded-full bg-emerald-500 px-6 py-3 text-sm font-bold text-black disabled:opacity-60"
      >
        {isPending ? "Verificando..." : "Confirmar"}
      </button>
      <button type="button" onClick={onBack} className="text-sm text-white/50 underline underline-offset-2">
        Escanear QR Code em vez disso
      </button>
    </form>
  );
}
