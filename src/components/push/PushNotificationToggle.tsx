"use client";

import { useEffect, useState } from "react";
import { urlBase64ToUint8Array } from "@/lib/push";
import {
  checkPushSubscriptionAction,
  subscribePushAction,
  unsubscribePushAction,
} from "@/app/(app)/push-actions";

function isIOSDevice() {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isIPadOS = ua.includes("Macintosh") && "ontouchend" in document;
  return isIOS || isIPadOS;
}

function isStandaloneDisplay() {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

export function PushNotificationToggle() {
  const [mounted, setMounted] = useState(false);
  const [supported, setSupported] = useState(true);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    // Leitura de window/navigator só é segura após a hidratação — setar aqui evita mismatch SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    const ios = isIOSDevice();
    const standalone = isStandaloneDisplay();
    setIsIOS(ios);
    setIsStandalone(standalone);

    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      !("Notification" in window)
    ) {
      setSupported(false);
      return;
    }

    // Se for iOS e não estiver instalado, push não é suportado pelo Safari
    if (ios && !standalone) {
      return;
    }

    navigator.serviceWorker.ready
      .then(async (registration) => {
        const sub = await registration.pushManager.getSubscription();
        if (sub) {
          const res = await checkPushSubscriptionAction(sub.endpoint);
          setIsSubscribed(res.subscribed);
        } else {
          setIsSubscribed(false);
        }
      })
      .catch((err) => {
        console.error("Erro ao verificar push subscription:", err);
      });
  }, []);

  if (!mounted) {
    return null;
  }

  // Se o dispositivo for iOS e não estiver instalado como PWA na tela inicial
  if (isIOS && !isStandalone) {
    return (
      <div className="w-full max-w-xs rounded-xl border border-white/10 bg-white/5 p-4 text-left text-xs text-white/70">
        <p className="font-semibold text-white">🔔 Notificações no iPhone</p>
        <p className="mt-1">
          Para receber avisos de novos eventos, adicione o app à sua tela inicial: toque em{" "}
          <strong className="text-white">Compartilhar</strong> e depois em{" "}
          <strong className="text-white">Adicionar à Tela de Início</strong>.
        </p>
      </div>
    );
  }

  if (!supported) {
    return (
      <div className="w-full max-w-xs rounded-xl border border-white/10 bg-white/5 p-4 text-left text-xs text-white/50">
        Notificações push não são suportadas neste navegador.
      </div>
    );
  }

  async function handleToggle() {
    setLoading(true);
    setStatusMessage(null);

    try {
      const registration = await navigator.serviceWorker.ready;

      if (isSubscribed) {
        // Desinscrever
        const sub = await registration.pushManager.getSubscription();
        if (sub) {
          await unsubscribePushAction(sub.endpoint);
          await sub.unsubscribe();
        }
        setIsSubscribed(false);
        setStatusMessage("Notificações desativadas.");
      } else {
        // Pedir permissão e inscrever
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          setStatusMessage("Permissão negada no navegador.");
          setLoading(false);
          return;
        }

        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidPublicKey) {
          setStatusMessage("Chave de notificação não configurada.");
          setLoading(false);
          return;
        }

        const sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
        });

        const res = await subscribePushAction(JSON.parse(JSON.stringify(sub)));
        if (res.success) {
          setIsSubscribed(true);
          setStatusMessage("Notificações ativadas com sucesso! 🚀");
        } else {
          setStatusMessage(res.error ?? "Erro ao ativar notificações.");
        }
      }
    } catch (err) {
      console.error("Falha ao alternar push notifications:", err);
      setStatusMessage("Erro ao configurar notificações.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-xs rounded-xl border border-white/10 bg-white/5 p-4 text-left">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">Notificações de Eventos</p>
          <p className="text-xs text-white/50">
            {isSubscribed
              ? "Você será avisado quando novos cultos e eventos forem criados."
              : "Ative para não perder nenhum culto ou evento."}
          </p>
        </div>
        <button
          type="button"
          onClick={handleToggle}
          disabled={loading}
          aria-label={isSubscribed ? "Desativar notificações" : "Ativar notificações"}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            isSubscribed ? "bg-emerald-500" : "bg-white/20"
          } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              isSubscribed ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {statusMessage && (
        <p className="mt-2 text-xs font-medium text-emerald-400">{statusMessage}</p>
      )}
    </div>
  );
}
