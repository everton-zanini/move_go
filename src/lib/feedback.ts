"use client";

const MUTE_KEY = "movego:muted";

type Note = { freq: number; start: number; duration: number };

const SOUNDS = {
  reward: [
    { freq: 523, start: 0, duration: 0.1 },
    { freq: 659, start: 0.1, duration: 0.1 },
    { freq: 784, start: 0.2, duration: 0.18 },
  ],
  levelUp: [
    { freq: 523, start: 0, duration: 0.1 },
    { freq: 659, start: 0.1, duration: 0.1 },
    { freq: 784, start: 0.2, duration: 0.1 },
    { freq: 1047, start: 0.3, duration: 0.3 },
  ],
} satisfies Record<string, Note[]>;

export type SoundName = keyof typeof SOUNDS;

export function isMuted(): boolean {
  try {
    return window.localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setMuted(muted: boolean) {
  try {
    window.localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  } catch {
    // Storage indisponível (modo privado): o mute só vale nesta sessão da tela.
  }
}

/** Toca um jingle curto (onda quadrada, estilo 8-bit) e vibra, respeitando o mute. */
export function playFeedback(sound: SoundName, vibration: number[] = [40]) {
  if (isMuted()) return;

  if (typeof navigator.vibrate === "function") {
    navigator.vibrate(vibration);
  }

  const AudioContextClass =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;

  try {
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    for (const note of SOUNDS[sound]) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = note.freq;
      gain.gain.setValueAtTime(0.06, now + note.start);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + note.start + note.duration);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + note.start);
      osc.stop(now + note.start + note.duration);
    }
    const total = Math.max(...SOUNDS[sound].map((n) => n.start + n.duration));
    setTimeout(() => void ctx.close(), (total + 0.2) * 1000);
  } catch {
    // Navegador bloqueou o áudio (sem gesto do usuário): o feedback visual basta.
  }
}
