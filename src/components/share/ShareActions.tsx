"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { ShareCard, type ShareCardProps } from "./ShareCard";

async function generateImageFile(node: HTMLElement): Promise<File> {
  const dataUrl = await toPng(node, { pixelRatio: 3, cacheBust: true });
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], "move-pet.png", { type: "image/png" });
}

function downloadFile(file: File) {
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  a.click();
  URL.revokeObjectURL(url);
}

interface ShareActionsProps extends ShareCardProps {
  title?: string;
}

export function ShareActions({ title = "COMPARTILHE SUA CONQUISTA", ...cardProps }: ShareActionsProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleShare() {
    if (!cardRef.current) return;
    setIsGenerating(true);
    setError(null);

    try {
      const file = await generateImageFile(cardRef.current);
      const shareData = {
        files: [file],
        title: "MoveGO",
        text: `${cardProps.headline} ${cardProps.subline} #MoveGO #MoveSantana`,
      };

      if (typeof navigator.share === "function" && (!navigator.canShare || navigator.canShare(shareData))) {
        await navigator.share(shareData);
      } else {
        downloadFile(file);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      setError("Não foi possível gerar a imagem. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="font-pixel text-xs text-emerald-400">{title}</p>
      <ShareCard ref={cardRef} {...cardProps} />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="button"
        onClick={handleShare}
        disabled={isGenerating}
        className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-bold text-black disabled:opacity-60"
      >
        {isGenerating ? "Gerando..." : "Compartilhar"}
      </button>
    </div>
  );
}
