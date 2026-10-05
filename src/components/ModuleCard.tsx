// src/components/ModuleCard.tsx
// PRAVAH 360 - Reusable module card for the landing page grid

"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";

interface ModuleCardProps {
  title: string;
  description: string;
  /** Route this card opens. */
  href: string;
  /** Lucide icon component, e.g. CloudRain. */
  icon: LucideIcon;
  /** Sacred module gradient, e.g. "from-cyan-500 to-blue-600". */
  gradient: string;
  /** Short accent colour used for the glow shadow. */
  glow: string;
  /** Optional index badge, e.g. 7. */
  index?: number;
}

export default function ModuleCard({
  title,
  description,
  href,
  icon: Icon,
  gradient,
  glow,
  index,
}: ModuleCardProps) {
  return (
    <Link
      href={href}
      aria-label={`Open ${title} module`}
      className={`group relative block h-full rounded-3xl border border-white/10 bg-slate-900/70 p-6 backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-2 hover:border-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${glow}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} shadow-lg transition-transform duration-300 group-hover:scale-110`}
        >
          <Icon className="h-7 w-7 text-white" aria-hidden="true" />
        </div>
        {typeof index === "number" && (
          <span className="font-mono text-xs text-slate-500">
            {String(index).padStart(2, "0")}
          </span>
        )}
      </div>

      <h3 className="mt-5 text-xl font-bold text-slate-100">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">{description}</p>

      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-300 transition-colors duration-300 group-hover:text-white">
        Open
        <ArrowRight
          className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
          aria-hidden="true"
        />
      </span>
    </Link>
  );
}
