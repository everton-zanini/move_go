"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIOSDevice() {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  // iPadOS 13+ reporta como Mac, mas tem touch — trata como iOS pra fins de instalação.
  const isIPadOS = ua.includes("Macintosh") && "ontouchend" in document;
  return isIOS || isIPadOS;
}

function isStandaloneDisplay() {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

export function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(true);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSHint, setShowIOSHint] = useState(false);

  useEffect(() => {
    // Leitura de window/navigator só é segura após a hidratação — setar aqui
    // (em vez de lazy-init no useState) evita mismatch entre SSR e client.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsInstalled(isStandaloneDisplay());
    setIsIOS(isIOSDevice());

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    }

    function handleAppInstalled() {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  if (isInstalled) return null;
  if (!deferredPrompt && !isIOS) return null;

  async function handleClick() {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      return;
    }
    if (isIOS) {
      setShowIOSHint(true);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="flex items-center gap-1 rounded-full border border-emerald-400/40 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-400/10"
      >
        📲 Instalar
      </button>

      {showIOSHint && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 px-4 pb-6"
          onClick={() => setShowIOSHint(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#15152a] p-5 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm text-white/80">
              Toque em <span className="font-semibold text-white">Compartilhar</span> (⬆️) na barra do
              Safari e depois em <span className="font-semibold text-white">&quot;Adicionar à Tela de Início&quot;</span>.
            </p>
            <button
              type="button"
              onClick={() => setShowIOSHint(false)}
              className="mt-4 rounded-full bg-emerald-500 px-4 py-2 text-sm font-bold text-black"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );
}
