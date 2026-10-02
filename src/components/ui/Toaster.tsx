"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { FlashType } from "@/lib/flash";

type ToastItem = { id: number; message: string; type: FlashType };

const DURATION_MS = 4000;
let nextId = 1;
const listeners = new Set<(item: ToastItem) => void>();

export function toast(message: string, type: FlashType = "success") {
  const item = { id: nextId++, message, type };
  listeners.forEach((l) => l(item));
}

function FlashReader() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const message = searchParams.get("flash");
    if (!message) return;
    toast(message, searchParams.get("flashType") === "error" ? "error" : "success");

    const params = new URLSearchParams(searchParams.toString());
    params.delete("flash");
    params.delete("flashType");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [searchParams, pathname, router]);

  return null;
}

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const listener = (item: ToastItem) => {
      setItems((prev) => [...prev, item]);
      setTimeout(() => setItems((prev) => prev.filter((i) => i.id !== item.id)), DURATION_MS);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return (
    <>
      <Suspense>
        <FlashReader />
      </Suspense>
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-3 z-50 flex flex-col items-center gap-2 px-4"
      >
        {items.map((item) => (
          <div
            key={item.id}
            role="status"
            className={`pointer-events-auto w-full max-w-sm rounded-lg px-4 py-3 text-sm font-medium shadow-lg ${
              item.type === "error" ? "bg-red-500 text-white" : "bg-emerald-500 text-black"
            }`}
          >
            {item.message}
          </div>
        ))}
      </div>
    </>
  );
}
