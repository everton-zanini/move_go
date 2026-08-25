"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Pet", icon: "🏠" },
  { href: "/inventory", label: "Itens", icon: "🎒" },
  { href: "/achievements", label: "Conquistas", icon: "🏆" },
  { href: "/profile", label: "Perfil", icon: "👤" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-10 flex border-t border-white/10 bg-[#0f0f1a]/95 backdrop-blur">
      {TABS.map((tab) => {
        const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs ${
              active ? "text-emerald-400" : "text-white/50"
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
