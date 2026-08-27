"use client";

import { useState } from "react";
import { ShareActions } from "@/components/share/ShareActions";
import type { ShareCardProps } from "@/components/share/ShareCard";

export function PetShareToggle(props: ShareCardProps) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 hover:bg-white/5"
      >
        📤 Compartilhar meu Spark
      </button>
    );
  }

  return <ShareActions title="COMPARTILHE SEU SPARK" {...props} />;
}
