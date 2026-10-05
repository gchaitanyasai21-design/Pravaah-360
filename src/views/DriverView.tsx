// src/views/DriverView.tsx
// PRAVAH 360 - Service Provider Portal (multi-vehicle)
// Ambulance · Fire truck · NDRF rescue boat · Flood pump · Rescue 4x4
// Emergency response vehicles only.

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Fuel,
  MapPin,
  Navigation,
  Phone,
  Radio,
  Shield,
  Siren,
  Truck,
  Wifi,
  WifiOff,
  XCircle,
} from "lucide-react";
import dynamic from "next/dynamic";
import VehicleCard from "@/components/VehicleCard";
import { floodZones, shelters } from "@/lib/floodData";
import { responseVehicles } from "@/lib/vehicleFleet";
import { computeSafeRoute, haversineKm } from "@/utils/routing";
import type { SafeRoute } from "@/types/flood";
import type {
  DispatchAssignment,
  MissionRecord,
  ResponseVehicle,
} from "@/types/vehicles";
import { VEHICLE_TYPE_META } from "@/types/vehicles";

const FloodMap = dynamic(() => import("@/components/FloodMap"), {
  ssr: false,
  loading: () => (
    <div
      className="flex h-full w-full items-center justify-center rounded-3xl border border-white/10 bg-slate-900/70"
      role="status"
    >
      <span className="animate-pulse text-sm text-slate-400">
        Loading operations map…
      </span>
    </div>
  ),
});

type MissionState = "offered" | "accepted" | "arrived" | "completed" | "idle";

/** Incident type shown for each vehicle class. */
function incidentFor(vehicle: ResponseVehicle): DispatchAssignment {
  const nearest = floodZones
    .map((zone) => ({
      zone,
      distance: haversineKm(vehicle, zone),
    }))
    .sort((a, b) => a.distance - b.distance)[0];

  const priority =
    nearest.zone.severity === "HIGH"
      ? "HIGH"
      : nearest.zone.severity === "MED"
      ? "MEDIUM"
      : "LOW";

  const incidentByType: Record<string, string> = {
    ambulance: "Medical Evacuation",
    fire_truck: "Fire & Rescue",
    ndrf_boat: "Flood Rescue 🌊",
    pump_truck: "Dewatering Ops 🌊",
    rescue_4x4: "Flood Evacuation 🌊",
  };

  return {
    id: `INC-${2300 + vehicle.id.charCodeAt(2)}`,
    incidentType: incidentByType[vehicle.type],
    incidentIcon: VEHICLE_TYPE_META[vehicle.type].emoji,
    location: nearest.zone.name,
    priority,
    etaMinutes: Math.max(3, Math.round(nearest.distance * 6) + 4),
    contact: "+91-9849010777",
    distanceKm: Number(nearest.distance.toFixed(2)),
  };
}

function clockTime(): string {
  return new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

const INITIAL_HISTORY: MissionRecord[] = [
  {
    id: "M-1",
    time: "09:12",
    location: "Krishna canal breach",
    type: "ndrf_boat",
    status: "completed",
  },
  {
    id: "M-2",
    time: "11:45",
    location: "Bhavanipuram underpass",
    type: "rescue_4x4",
    status: "completed",
  },
  {
    id: "M-3",
    time: "14:20",
    location: "Patamata rescue",
    type: "ndrf_boat",
    status: "completed",
  },
];

export default function DriverView() {
  const [vehicles, setVehicles] = useState<ResponseVehicle[]>(responseVehicles);
  const [selectedId, setSelectedId] = useState<string>("V06"); // NDRF-01
  const [isOnline, setIsOnline] = useState(true);
  const [missionState, setMissionState] = useState<MissionState>("offered");
  const [history, setHistory] = useState<MissionRecord[]>(INITIAL_HISTORY);
  const [note, setNote] = useState<string | null>(null);
  const [shiftMinutes, setShiftMinutes] = useState(6 * 60 + 42);

  const vehicle =
    vehicles.find((item) => item.id === selectedId) ?? vehicles[0];
  const meta = VEHICLE_TYPE_META[vehicle.type];
  const assignment = useMemo(() => incidentFor(vehicle), [vehicle]);

  const destination = useMemo(() => {
    const zone =
      floodZones.find((item) => item.name === assignment.location) ??
      floodZones[0];
    return { lat: zone.lat, lng: zone.lng, name: zone.name };
  }, [assignment.location]);

  const route: SafeRoute = useMemo(
    () =>
      computeSafeRoute(
        { lat: vehicle.lat, lng: vehicle.lng },
        destination,
        floodZones,
        { avoidFlooded: true, preferElevated: true }
      ),
    [destination, vehicle.lat, vehicle.lng]
  );

  /** Live shift clock, one tick per minute. */
  useEffect(() => {
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      const elapsed = (Date.now() - startedAt) / 60000;
      setShiftMinutes(Math.floor(6 * 60 + 42 + elapsed));
    }, 30000);
    return () => window.clearInterval(timer);
  }, []);

  const updateVehicle = useCallback(
    (patch: Partial<ResponseVehicle>) => {
      setVehicles((current) =>
        current.map((item) =>
          item.id === vehicle.id
            ? { ...item, ...patch, lastUpdated: new Date() }
            : item
        )
      );
    },
    [vehicle.id]
  );

  const nearestShelter = useMemo(() => {
    let best = shelters[0];
    let bestDistance = Number.POSITIVE_INFINITY;
    for (const shelter of shelters) {
      const distance = haversineKm(vehicle, shelter);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = shelter;
      }
    }
    return { ...best, distance: bestDistance };
  }, [vehicle]);

  const handleAccept = () => {
    setMissionState("accepted");
    updateVehicle({ status: "en_route", assignedIncidentId: assignment.id });
    setNote(`${vehicle.callsign} accepted ${assignment.id} → ${assignment.location}`);
  };

  const handleReject = () => {
    setMissionState("idle");
    updateVehicle({ status: "available", assignedIncidentId: undefined });
    setNote(`${vehicle.callsign} declined ${assignment.id}. Waiting for dispatch.`);
  };

  const handleArrived = () => {
    setMissionState("arrived");
    updateVehicle({ status: "on_scene" });
    setNote(`Arrived at ${assignment.location}. Scene reporting started.`);
  };

  const handleComplete = () => {
    setMissionState("completed");
    updateVehicle({
      status: "available",
      assignedIncidentId: undefined,
      lat: destination.lat,
      lng: destination.lng,
    });
    setHistory((current) => [
      ...current,
      {
        id: `M-${current.length + 1}`,
        time: clockTime(),
        location: assignment.location,
        type: vehicle.type,
        status: "completed",
      },
    ]);
    setNote(`${assignment.incidentType} at ${assignment.location} completed.`);
  };

  const handleNextAssignment = () => {
    setMissionState("offered");
    setNote("New dispatch received.");
  };

  const toggleOnline = () => {
    const next = !isOnline;
    setIsOnline(next);
    updateVehicle({ status: next ? "available" : "offline" });
    if (!next) {
      setMissionState("idle");
      setNote(`${vehicle.callsign} set to OFFLINE — dispatch paused.`);
    } else {
      setNote(`${vehicle.callsign} is ONLINE and accepting dispatches.`);
    }
  };

  const fuelPercent = 62 + (parseInt(vehicle.id.slice(1), 10) * 7) % 37;
  const statusLabel = isOnline
    ? missionState === "accepted"
      ? "EN ROUTE"
      : missionState === "arrived"
      ? "ON SCENE"
      : "ONLINE"
    : "OFFLINE";

  const actionsDisabled = !isOnline;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* ── Header ─────────────────────────────────────────────── */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="border-b border-white/10 bg-slate-900/60 px-4 py-4 backdrop-blur-xl sm:px-6"
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 p-3">
              <Truck className="h-6 w-6 text-white" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100 sm:text-2xl">
                Service Provider Portal
              </h1>
              <p className="text-sm text-slate-400">
                Vehicle:{" "}
                <span className="font-mono font-semibold text-amber-400">
                  {vehicle.callsign}
                </span>{" "}
                · Driver:{" "}
                <span className="font-semibold text-slate-200">
                  {vehicle.driverName}
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              aria-label="Back to dashboard"
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Dashboard
            </Link>
            <button
              type="button"
              onClick={toggleOnline}
              aria-pressed={isOnline}
              aria-label={isOnline ? "Go offline" : "Go online"}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-300 ${
                isOnline
                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25"
                  : "bg-slate-800 text-slate-400 border border-white/10 hover:bg-slate-700"
              }`}
            >
              {isOnline ? (
                <Wifi className="h-4 w-4" aria-hidden="true" />
              ) : (
                <WifiOff className="h-4 w-4" aria-hidden="true" />
              )}
              {isOnline ? "Online" : "Offline"}
            </button>
          </div>
        </div>
      </motion.header>

      {/* ── Status bar ─────────────────────────────────────────── */}
      <div className="border-b border-white/5 bg-slate-950/80 px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <span className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isOnline ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
              }`}
            />
            <span
              className={`font-bold ${
                isOnline ? "text-emerald-400" : "text-slate-500"
              }`}
            >
              {statusLabel}
            </span>
          </span>
          <span className="flex items-center gap-2 text-slate-400">
            <MapPin className="h-4 w-4 text-amber-400" aria-hidden="true" />
            {vehicle.lat.toFixed(4)}, {vehicle.lng.toFixed(4)} ·{" "}
            {destination.name}
          </span>
          <span className="flex items-center gap-2 text-slate-400">
            <Clock className="h-4 w-4 text-cyan-400" aria-hidden="true" />
            Shift: {Math.floor(shiftMinutes / 60)}h {shiftMinutes % 60}m
          </span>
          <span className="flex items-center gap-2 text-slate-400">
            <Radio className="h-4 w-4 text-purple-400" aria-hidden="true" />
            {history.filter((entry) => entry.status === "completed").length}{" "}
            missions today
          </span>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-3">
        {/* ── LEFT: map + vehicle ──────────────────────────────── */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <section
            aria-label="Live operations map"
            className="h-[460px] overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70"
          >
            <FloodMap
              zones={floodZones}
              vehicles={[vehicle]}
              route={missionState === "accepted" || missionState === "arrived" ? route : null}
              origin={{ lat: vehicle.lat, lng: vehicle.lng }}
              destination={destination}
              onVehicleSelect={() => setNote(`${vehicle.callsign} is here.`)}
            />
          </section>

          {/* Vehicle switcher — all 5 response vehicle classes */}
          <section
            aria-label="Choose a response vehicle"
            className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 backdrop-blur-xl"
          >
            <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-100">
              <Siren className="h-5 w-5 text-amber-400" aria-hidden="true" />
              Fleet Units
            </h2>
            <div className="flex flex-wrap gap-2">
              {vehicles.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(item.id);
                    setMissionState(
                      item.status === "en_route"
                        ? "accepted"
                        : item.status === "on_scene"
                        ? "arrived"
                        : "offered"
                    );
                    setNote(`Switched to ${item.callsign}.`);
                  }}
                  aria-pressed={item.id === vehicle.id}
                  aria-label={`Select ${item.callsign}, ${VEHICLE_TYPE_META[item.type].label}`}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-all duration-300 ${
                    item.id === vehicle.id
                      ? "border-amber-400/60 bg-amber-500/15 text-amber-200"
                      : "border-white/10 bg-white/5 text-slate-300 hover:border-white/25 hover:bg-white/10"
                  }`}
                >
                  <span aria-hidden="true">
                    {VEHICLE_TYPE_META[item.type].emoji}
                  </span>
                  <span className="font-mono font-semibold">{item.callsign}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Vehicle info */}
          <section
            aria-label="Vehicle information"
            className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 backdrop-blur-xl"
          >
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-100">
              <Shield className="h-5 w-5 text-cyan-400" aria-hidden="true" />
              Vehicle Info
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-3 rounded-xl bg-white/5 px-3 py-2.5">
                  <dt className="text-slate-400">Callsign</dt>
                  <dd className="font-mono font-bold text-slate-100">
                    {vehicle.callsign}
                  </dd>
                </div>
                <div className="flex justify-between gap-3 rounded-xl bg-white/5 px-3 py-2.5">
                  <dt className="text-slate-400">Type</dt>
                  <dd className="font-semibold text-slate-100">{meta.label}</dd>
                </div>
                <div className="flex justify-between gap-3 rounded-xl bg-white/5 px-3 py-2.5">
                  <dt className="text-slate-400">Capacity</dt>
                  <dd className="font-semibold text-slate-100">
                    {vehicle.type === "pump_truck"
                      ? `${vehicle.capacity} L/min`
                      : vehicle.type === "ambulance"
                      ? `${vehicle.capacity} stretchers`
                      : `${vehicle.capacity} persons`}
                  </dd>
                </div>
                <div className="flex justify-between gap-3 rounded-xl bg-white/5 px-3 py-2.5">
                  <dt className="text-slate-400">Operator</dt>
                  <dd className="font-semibold text-slate-100">
                    {vehicle.driverName}
                  </dd>
                </div>
              </dl>

              <div className="space-y-3">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-400">
                      <Fuel className="h-4 w-4 text-amber-400" aria-hidden="true" />
                      Fuel
                    </span>
                    <span className="font-bold text-amber-300">{fuelPercent}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={`h-full rounded-full ${
                        fuelPercent > 35
                          ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                          : "bg-gradient-to-r from-red-500 to-orange-500"
                      }`}
                      style={{ width: `${fuelPercent}%` }}
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
                  <p className="text-slate-400">Last service</p>
                  <p className="font-semibold text-slate-100">
                    {(parseInt(vehicle.id.slice(1), 10) % 5) + 1} days ago ·
                    Vijayawada Depot
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
                  <p className="text-slate-400">Nearest shelter</p>
                  <p className="font-semibold text-slate-100">
                    {nearestShelter.name} · {nearestShelter.distance.toFixed(1)} km
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* ── RIGHT: assignment + history ──────────────────────── */}
        <div className="flex flex-col gap-6">
          <section
            aria-label="Current assignment"
            className="rounded-3xl border border-amber-400/30 bg-slate-900/80 p-5 backdrop-blur-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-100">
                <Activity className="h-5 w-5 text-amber-400" aria-hidden="true" />
                Current Assignment
              </h2>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                  missionState === "offered"
                    ? "bg-amber-500/15 text-amber-300"
                    : missionState === "accepted"
                    ? "bg-cyan-500/15 text-cyan-300"
                    : missionState === "arrived"
                    ? "bg-red-500/15 text-red-300"
                    : "bg-emerald-500/15 text-emerald-300"
                }`}
              >
                {missionState === "offered"
                  ? "OFFERED"
                  : missionState === "accepted"
                  ? "ACCEPTED"
                  : missionState === "arrived"
                  ? "AT SCENE"
                  : missionState === "completed"
                  ? "COMPLETED"
                  : "IDLE"}
              </span>
            </div>

            {missionState === "idle" ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
                <Radio
                  className="mx-auto mb-2 h-8 w-8 text-slate-500"
                  aria-hidden="true"
                />
                <p className="text-sm text-slate-300">
                  No active assignment. Waiting for the next dispatch from the
                  control room.
                </p>
                <button
                  type="button"
                  onClick={handleNextAssignment}
                  disabled={actionsDisabled}
                  className="mt-4 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Request Next Assignment
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/70 to-slate-900/70 p-4">
                  <p className="text-lg font-bold text-slate-100">
                    {assignment.incidentIcon} {assignment.incidentType}
                  </p>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-slate-400">Location</dt>
                      <dd className="font-semibold text-slate-100">
                        {assignment.location}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-slate-400">Priority</dt>
                      <dd
                        className={`font-bold ${
                          assignment.priority === "HIGH"
                            ? "text-red-400"
                            : assignment.priority === "MEDIUM"
                            ? "text-amber-400"
                            : "text-emerald-400"
                        }`}
                      >
                        {assignment.priority}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-slate-400">ETA</dt>
                      <dd className="font-semibold text-cyan-300">
                        {assignment.etaMinutes} min · {assignment.distanceKm} km
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-slate-400">Contact</dt>
                      <dd>
                        <a
                          href={`tel:${assignment.contact.replace(/-/g, "")}`}
                          className="flex items-center gap-1.5 font-semibold text-slate-100 hover:text-cyan-300"
                        >
                          <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                          {assignment.contact}
                        </a>
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {missionState === "offered" && (
                    <>
                      <button
                        type="button"
                        onClick={handleAccept}
                        disabled={actionsDisabled}
                        className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500/90 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={handleReject}
                        disabled={actionsDisabled}
                        className="flex items-center justify-center gap-2 rounded-xl bg-red-500/80 py-3 text-sm font-bold text-white transition-colors hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <XCircle className="h-4 w-4" aria-hidden="true" />
                        Reject
                      </button>
                    </>
                  )}

                  {missionState === "accepted" && (
                    <button
                      type="button"
                      onClick={handleArrived}
                      disabled={actionsDisabled}
                      className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-sm font-bold text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <MapPin className="h-4 w-4" aria-hidden="true" />
                      Arrived at Scene
                    </button>
                  )}

                  {missionState === "arrived" && (
                    <button
                      type="button"
                      onClick={handleComplete}
                      disabled={actionsDisabled}
                      className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-3 text-sm font-bold text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      Mission Complete
                    </button>
                  )}

                  {missionState === "completed" && (
                    <button
                      type="button"
                      onClick={handleNextAssignment}
                      disabled={actionsDisabled}
                      className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-sm font-bold text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Navigation className="h-4 w-4" aria-hidden="true" />
                      Request Next Assignment
                    </button>
                  )}
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Safe route:</span>{" "}
                  {route.summary}
                </div>
              </div>
            )}

            {note && (
              <p
                role="status"
                aria-live="polite"
                className="mt-4 rounded-xl border border-cyan-500/25 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-100"
              >
                {note}
              </p>
            )}
          </section>

          {/* Mission history */}
          <section
            aria-label="Mission history"
            className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 backdrop-blur-xl"
          >
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-100">
              <Clock className="h-5 w-5 text-emerald-400" aria-hidden="true" />
              Mission History (today)
            </h2>
            <ol className="space-y-3">
              {history.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3"
                >
                  <CheckCircle2
                    className="h-5 w-5 shrink-0 text-emerald-400"
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-200">
                      {entry.location}
                    </p>
                    <p className="text-xs text-slate-500">
                      {VEHICLE_TYPE_META[entry.type === "medical" ? "ambulance" : entry.type]
                        .label ?? "Medical"}{" "}
                      · status {entry.status}
                    </p>
                  </div>
                  <span className="ml-auto font-mono text-xs text-slate-400">
                    {entry.time}
                  </span>
                </li>
              ))}
            </ol>
          </section>

          {/* Fleet roster */}
          <section
            aria-label="Fleet roster"
            className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 backdrop-blur-xl"
          >
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-100">
              <Truck className="h-5 w-5 text-orange-400" aria-hidden="true" />
              Fleet Roster
            </h2>
            <div className="space-y-3">
              {vehicles
                .filter((item) => item.id !== vehicle.id)
                .slice(0, 4)
                .map((item) => (
                  <VehicleCard
                    key={item.id}
                    vehicle={item}
                    compact={false}
                    onClick={() => {
                      setSelectedId(item.id);
                      setMissionState(
                        item.status === "en_route"
                          ? "accepted"
                          : item.status === "on_scene"
                          ? "arrived"
                          : "offered"
                      );
                      setNote(`Switched to ${item.callsign}.`);
                    }}
                  />
                ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
