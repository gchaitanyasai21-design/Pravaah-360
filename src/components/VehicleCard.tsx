// src/components/VehicleCard.tsx
// PRAVAH 360 - Response vehicle card for the Service Provider portal
// Works for ambulance, fire truck, NDRF boat, flood pump and rescue 4x4

"use client";

import type { ResponseVehicle } from "@/types/vehicles";
import {
  VEHICLE_STATUS_META,
  VEHICLE_TYPE_META,
} from "@/types/vehicles";
import { MapPin, Phone, Users, Clock } from "lucide-react";

interface VehicleCardProps {
  vehicle: ResponseVehicle;
  /** Highlights the card as the operator's assigned unit. */
  isActive?: boolean;
  /** Renders as a compact list row (fleet table) instead of a full card. */
  compact?: boolean;
  onClick?: () => void;
}

function formatUpdated(date: Date): string {
  const seconds = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.round(minutes / 60)}h ago`;
}

export default function VehicleCard({
  vehicle,
  isActive = false,
  compact = false,
  onClick,
}: VehicleCardProps) {
  const meta = VEHICLE_TYPE_META[vehicle.type];
  const status = VEHICLE_STATUS_META[vehicle.status];

  if (compact) {
    return (
      <tr
        onClick={onClick}
        className={`border-b border-white/5 transition-colors duration-200 ${
          onClick ? "cursor-pointer hover:bg-white/5" : ""
        } ${isActive ? "bg-amber-500/10" : ""}`}
      >
        <td className="px-3 py-3">
          <span className="mr-2" aria-hidden="true">
            {meta.emoji}
          </span>
          <span className="font-mono text-sm font-semibold text-slate-100">
            {vehicle.callsign}
          </span>
        </td>
        <td className="px-3 py-3 text-sm text-slate-300">{meta.label}</td>
        <td className="px-3 py-3 text-sm text-slate-300">{vehicle.driverName}</td>
        <td className="px-3 py-3 text-sm text-slate-400">
          {vehicle.lat.toFixed(4)}, {vehicle.lng.toFixed(4)}
        </td>
        <td className="px-3 py-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold ${status.textClass}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${status.dotClass}`} />
            {status.label}
          </span>
        </td>
        <td className="px-3 py-3 text-right text-xs text-slate-500">
          {formatUpdated(vehicle.lastUpdated)}
        </td>
      </tr>
    );
  }

  return (
    <article
      onClick={onClick}
      className={`rounded-3xl border p-5 transition-all duration-300 ${
        isActive
          ? "border-amber-400/50 bg-slate-900/90 shadow-[0_0_28px_rgba(251,191,36,0.15)]"
          : "border-white/10 bg-slate-900/70 hover:border-white/20"
      } ${onClick ? "cursor-pointer" : ""}`}
      aria-label={`${vehicle.callsign} ${meta.label}, status ${status.label}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br text-xl ${meta.gradient}`}
            aria-hidden="true"
          >
            {meta.emoji}
          </div>
          <div>
            <p className="font-mono text-lg font-bold leading-tight text-slate-100">
              {vehicle.callsign}
            </p>
            <p className="text-xs text-slate-400">{meta.unit}</p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold ${status.textClass}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${status.dotClass}`} />
          {status.label}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 text-slate-300">
          <Users className="h-4 w-4 text-slate-500" aria-hidden="true" />
          <span className="truncate">{vehicle.driverName}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <Phone className="h-4 w-4 text-slate-500" aria-hidden="true" />
          <a
            href={`tel:${vehicle.driverPhone}`}
            className="truncate hover:text-cyan-300"
            onClick={(event) => event.stopPropagation()}
          >
            {vehicle.driverPhone}
          </a>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <MapPin className="h-4 w-4 text-slate-500" aria-hidden="true" />
          <span className="truncate">
            {vehicle.lat.toFixed(4)}, {vehicle.lng.toFixed(4)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <Clock className="h-4 w-4 text-slate-500" aria-hidden="true" />
          <span>{formatUpdated(vehicle.lastUpdated)}</span>
        </div>
      </dl>

      {typeof vehicle.capacity === "number" && (
        <p className="mt-4 rounded-2xl bg-white/5 px-3 py-2 text-xs text-slate-400">
          Capacity:{" "}
          <span className="font-semibold text-slate-200">
            {vehicle.type === "pump_truck"
              ? `${vehicle.capacity} L/min dewatering`
              : vehicle.type === "ambulance"
              ? `${vehicle.capacity} stretchers`
              : `${vehicle.capacity} persons`}
          </span>
        </p>
      )}
    </article>
  );
}
