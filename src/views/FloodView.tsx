// src/views/FloodView.tsx
// PRAVAH 360 - Urban Flood Intelligence dashboard
// 0-3 hr nowcasting, GIS inundation map, flood-safe routing, shelter ranking
// and live dispatch of NDRF / pump / 4x4 response vehicles.

"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Building2,
  CloudRain,
  Crosshair,
  Droplets,
  Navigation,
  Phone,
  Radio,
  Route,
  Siren,
  Users,
} from "lucide-react";
import AnimatedCounter from "@/components/AnimatedCounter";
import VehicleCard from "@/components/VehicleCard";
import {
  FALLBACK_LOCATION,
  FLOOD_HELPLINE,
  FLOOD_STATS,
  NDRF_VIJAYAWADA,
  VIJAYAWADA_CENTER,
  floodAlerts,
  floodZones,
  generateNowcast,
  rainSensors,
  shelters,
} from "@/lib/floodData";
import { responseVehicles } from "@/lib/vehicleFleet";
import { computeSafeRoute, haversineKm } from "@/utils/routing";
import type { FloodAlert, LatLng, SafeRoute } from "@/types/flood";
import type { ResponseVehicle } from "@/types/vehicles";

const FloodMap = dynamic(() => import("@/components/FloodMap"), {
  ssr: false,
  loading: () => (
    <div
      className="flex h-full w-full items-center justify-center rounded-3xl border border-white/10 bg-slate-900/70"
      role="status"
    >
      <span className="animate-pulse text-sm text-slate-400">
        Loading live flood map…
      </span>
    </div>
  ),
});

/** Named places the routing engine can resolve without a geocoder. */
const DESTINATIONS: { name: string; lat: number; lng: number }[] = [
  ...shelters.map((shelter) => ({
    name: shelter.name,
    lat: shelter.lat,
    lng: shelter.lng,
  })),
  ...floodZones.map((zone) => ({ name: zone.name, lat: zone.lat, lng: zone.lng })),
  { name: "Vijayawada Railway Station", lat: 16.5195, lng: 80.6301 },
  { name: "PNBS Bus Station", lat: 16.5205, lng: 80.6418 },
  { name: "Kanaka Durga Temple", lat: 16.5107, lng: 80.6305 },
  { name: "Benz Circle", lat: 16.5075, lng: 80.6422 },
  { name: "Autonagar", lat: 16.53, lng: 80.655 },
  { name: "Governorpet", lat: 16.51, lng: 80.6333 },
  { name: "Patamata", lat: 16.5155, lng: 80.67 },
  { name: "Bhavanipuram", lat: 16.5244, lng: 80.6089 },
  { name: "Payakapuram", lat: 16.533, lng: 80.6412 },
  { name: "Prakasam Barrage", lat: 16.497, lng: 80.6085 },
  { name: "Siddhartha Nagar", lat: 16.4986, lng: 80.6587 },
  { name: "Gunadala", lat: 16.5361, lng: 80.6285 },
  { name: "Poranki", lat: 16.4806, lng: 80.6576 },
  { name: "Mangalagiri Road", lat: 16.4305, lng: 80.5585 },
];

const ALERT_TONE: Record<string, { bg: string; border: string; text: string }> = {
  HIGH: {
    bg: "bg-red-500/10",
    border: "border-red-500/25",
    text: "text-red-400",
  },
  MED: {
    bg: "bg-orange-500/10",
    border: "border-orange-500/25",
    text: "text-orange-400",
  },
  LOW: {
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/25",
    text: "text-yellow-400",
  },
};

function requestLocation(onResolve: (point: LatLng) => void): void {
  if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
    onResolve(FALLBACK_LOCATION);
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (position) =>
      onResolve({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      }),
    () => onResolve(FALLBACK_LOCATION),
    { enableHighAccuracy: true, timeout: 8000 }
  );
}

function nearestZone(point: LatLng): string {
  let best = floodZones[0];
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const zone of floodZones) {
    const distance = haversineKm(point, zone);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = zone;
    }
  }
  return best.name;
}

export default function FloodView() {
  const [vehicles, setVehicles] = useState<ResponseVehicle[]>(responseVehicles);
  const [alerts, setAlerts] = useState<FloodAlert[]>(floodAlerts);
  const [showAllAlerts, setShowAllAlerts] = useState(false);
  const [origin, setOrigin] = useState<LatLng | null>(null);
  const [destination, setDestination] = useState("");
  const [avoidFlooded, setAvoidFlooded] = useState(true);
  const [preferElevated, setPreferElevated] = useState(true);
  const [route, setRoute] = useState<SafeRoute | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [dispatchOpen, setDispatchOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const nowcast = useMemo(() => generateNowcast(), []);
  const peak = useMemo(
    () =>
      nowcast.reduce((max, point) =>
        point.rainfall > max.rainfall ? point : max
      ),
    [nowcast]
  );

  const sortedShelters = useMemo(() => {
    const reference = origin ?? FALLBACK_LOCATION;
    return [...shelters]
      .map((shelter) => ({
        ...shelter,
        distance: haversineKm(reference, shelter),
      }))
      .sort((a, b) => a.distance - b.distance);
  }, [origin]);

  const activeVehicles = useMemo(
    () =>
      vehicles.filter(
        (vehicle) =>
          vehicle.status === "en_route" ||
          vehicle.status === "on_scene" ||
          vehicle.status === "returning"
      ),
    [vehicles]
  );

  const availableVehicles = useMemo(
    () => vehicles.filter((vehicle) => vehicle.status === "available"),
    [vehicles]
  );

  const visibleAlerts = showAllAlerts ? alerts : alerts.slice(0, 4);

  const handleUseMyLocation = useCallback(() => {
    requestLocation((point) => {
      setOrigin(point);
      setStatusMessage(`Location locked: ${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}`);
    });
  }, []);

  const handleShareLocation = useCallback(() => {
    requestLocation((point) => {
      setOrigin(point);
      const link = `https://www.google.com/maps?q=${point.lat},${point.lng}`;
      setStatusMessage(
        `Shared ${point.lat.toFixed(4)}, ${point.lng.toFixed(4)} — ${link}`
      );
      if (typeof window !== "undefined") {
        navigator.clipboard?.writeText(link).catch(() => undefined);
      }
    });
  }, []);

  const handleReportFlooding = useCallback(() => {
    requestLocation((point) => {
      const zoneName = nearestZone(point);
      const report: FloodAlert = {
        id: `USER-${Date.now()}`,
        zoneId: "USER",
        title: `Citizen report near ${zoneName}`,
        message: `Reported via dashboard at ${point.lat.toFixed(
          4
        )}, ${point.lng.toFixed(4)}. Verification team notified.`,
        severity: "MED",
        updatedAt: "just now",
      };
      setAlerts((current) => [report, ...current]);
      setStatusMessage(
        `Flood report submitted near ${zoneName} · helpline ${FLOOD_HELPLINE}`
      );
    });
  }, []);

  const handleCalculateRoute = useCallback(() => {
    setRouteError(null);
    const match = DESTINATIONS.find(
      (item) => item.name.toLowerCase() === destination.trim().toLowerCase()
    );
    if (!match) {
      setRoute(
        null
      );
      setRouteError(
        "Pick a destination from the suggested list (landmarks, shelters or flood zones)."
      );
      return;
    }
    const start = origin ?? VIJAYAWADA_CENTER;
    const result = computeSafeRoute(
      start,
      { lat: match.lat, lng: match.lng },
      floodZones,
      { avoidFlooded, preferElevated }
    );
    setRoute(result);
    setStatusMessage(`Safe route to ${match.name}: ${result.summary}`);
  }, [avoidFlooded, destination, origin, preferElevated]);

  const handleDispatch = useCallback((vehicleId: string) => {
    setVehicles((current) =>
      current.map((vehicle) =>
        vehicle.id === vehicleId
          ? {
              ...vehicle,
              status: "en_route",
              lastUpdated: new Date(),
            }
          : vehicle
      )
    );
    const vehicle = vehicles.find((item) => item.id === vehicleId);
    if (vehicle) {
      setStatusMessage(
        `${vehicle.callsign} dispatched — operator ${vehicle.driverName} notified.`
      );
    }
    setDispatchOpen(false);
  }, [vehicles]);

  const stats = [
    {
      label: "Active Alerts",
      value: alerts.length,
      decimals: 0,
      suffix: "",
      icon: AlertTriangle,
      accent: "text-amber-400",
      box: "from-amber-500/15 to-orange-500/5",
    },
    {
      label: "Rainfall",
      value: FLOOD_STATS.rainfallMm,
      decimals: 0,
      suffix: " mm/h",
      icon: Droplets,
      accent: "text-sky-400",
      box: "from-sky-500/15 to-blue-500/5",
    },
    {
      label: "Flooded Roads",
      value: FLOOD_STATS.floodedRoads,
      decimals: 0,
      suffix: "",
      icon: Route,
      accent: "text-red-400",
      box: "from-red-500/15 to-rose-500/5",
    },
    {
      label: "People At Risk",
      value: FLOOD_STATS.peopleAtRisk,
      decimals: 0,
      suffix: "",
      icon: Users,
      accent: "text-purple-400",
      box: "from-purple-500/15 to-indigo-500/5",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* ── Header ─────────────────────────────────────────────── */}
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 p-3">
              <CloudRain className="h-7 w-7 text-white" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100 sm:text-3xl">
                Urban Flood Intelligence
              </h1>
              <p className="text-sm font-medium text-cyan-400">
                0–3 hr Nowcasting &amp; Flood-Safe Routing · Vijayawada 520013
              </p>
            </div>
          </div>
          <Link
            href="/"
            aria-label="Back to dashboard"
            className="flex w-fit items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition-colors duration-300 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Dashboard
          </Link>
        </motion.header>

        {/* ── Live stats ─────────────────────────────────────────── */}
        <section
          aria-label="Live flood statistics"
          className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`rounded-3xl border border-white/10 bg-gradient-to-br ${stat.box} p-4 backdrop-blur-xl sm:p-5`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  {stat.label}
                </p>
                <stat.icon
                  className={`h-4 w-4 ${stat.accent}`}
                  aria-hidden="true"
                />
              </div>
              <p
                className={`mt-2 text-3xl font-black ${stat.accent}`}
                aria-live="polite"
              >
                <AnimatedCounter
                  value={stat.value}
                  decimals={stat.decimals}
                  suffix={stat.suffix}
                  ariaLabel={`${stat.value}${stat.suffix}`}
                />
              </p>
            </div>
          ))}
        </section>

        {/* ── Main grid ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            {/* GIS flood map */}
            <section
              aria-label="Live GIS flood map"
              className="h-[520px] overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70"
            >
              <FloodMap
                zones={floodZones}
                shelters={shelters}
                sensors={rainSensors}
                vehicles={activeVehicles}
                route={route}
                origin={origin}
                destination={
                  route ? route.points[route.points.length - 1] ?? null : null
                }
                onVehicleSelect={(vehicleId) => {
                  const vehicle = vehicles.find((item) => item.id === vehicleId);
                  if (vehicle) {
                    setStatusMessage(
                      `${vehicle.callsign} · ${vehicle.driverName} · ${vehicle.status.replace(
                        "_",
                        " "
                      )}`
                    );
                  }
                }}
              />
            </section>

            {/* 0-3 hr nowcast */}
            <section
              aria-label="0 to 3 hour rainfall nowcast"
              className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 backdrop-blur-xl"
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="flex items-center gap-2 text-lg font-bold text-slate-100">
                    <CloudRain className="h-5 w-5 text-cyan-400" aria-hidden="true" />
                    0–3 hr Rainfall Nowcast
                  </h2>
                  <p className="text-sm text-slate-400">
                    Peak {peak.rainfall} mm/h at minute {peak.minute} · risk index{" "}
                    {peak.risk}/100
                  </p>
                </div>
                <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                  Doppler + gauge blend
                </span>
              </div>

              <NowcastChart points={nowcast} />
            </section>

            {/* Deployed response vehicles */}
            <section
              aria-label="Deployed response vehicles"
              className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 backdrop-blur-xl"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-100">
                  <Radio className="h-5 w-5 text-amber-400" aria-hidden="true" />
                  Deployed Response Vehicles
                </h2>
                <Link
                  href="/driver"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-cyan-400 transition-colors hover:text-cyan-300"
                >
                  Service Provider portal
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left">
                  <thead>
                    <tr className="text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-3 py-2 font-semibold">Callsign</th>
                      <th className="px-3 py-2 font-semibold">Type</th>
                      <th className="px-3 py-2 font-semibold">Operator</th>
                      <th className="px-3 py-2 font-semibold">Position</th>
                      <th className="px-3 py-2 font-semibold">Status</th>
                      <th className="px-3 py-2 text-right font-semibold">Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeVehicles.map((vehicle) => (
                      <VehicleCard key={vehicle.id} vehicle={vehicle} compact />
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-6">
            {/* Active flood alerts */}
            <section
              aria-label="Active flood alerts"
              className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 backdrop-blur-xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-100">
                  <AlertTriangle className="h-5 w-5 text-rose-500" aria-hidden="true" />
                  Active Flood Alerts
                </h2>
                <span className="rounded-full bg-rose-500/15 px-2.5 py-1 text-xs font-bold text-rose-400">
                  {alerts.length}
                </span>
              </div>

              <ul className="space-y-3">
                {visibleAlerts.map((alert) => {
                  const tone = ALERT_TONE[alert.severity];
                  return (
                    <li
                      key={alert.id}
                      className={`rounded-2xl border ${tone.bg} ${tone.border} p-3.5`}
                    >
                      <div className="flex items-start gap-3">
                        <span aria-hidden="true">
                          {alert.severity === "HIGH" ? "🔴" : alert.severity === "MED" ? "🟠" : "🟡"}
                        </span>
                        <div>
                          <p className={`font-semibold ${tone.text}`}>
                            {alert.title}
                            {typeof alert.depth === "number" && (
                              <span className="ml-2 text-xs font-medium text-slate-400">
                                {alert.depth.toFixed(1)}m
                              </span>
                            )}
                          </p>
                          <p className="mt-1 text-sm leading-relaxed text-slate-300">
                            {alert.message}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Updated {alert.updatedAt}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <button
                type="button"
                onClick={() => setShowAllAlerts((value) => !value)}
                aria-expanded={showAllAlerts}
                className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/10"
              >
                {showAllAlerts ? "Show fewer alerts" : "View All →"}
              </button>
            </section>

            {/* Emergency routing */}
            <section
              aria-label="Emergency flood-safe routing"
              className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-900/40 to-blue-900/40 p-5 backdrop-blur-xl"
            >
              <Navigation
                className="absolute -right-6 -top-6 h-24 w-24 text-cyan-400/10"
                aria-hidden="true"
              />
              <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                <Route className="h-5 w-5 text-cyan-300" aria-hidden="true" />
                Emergency Routing
              </h2>
              <p className="mt-1 text-sm text-cyan-200/70">
                Paths that avoid inundation and climb towards elevated ground.
              </p>

              <div className="mt-4 space-y-3">
                <div>
                  <label
                    htmlFor="route-origin"
                    className="mb-1 block text-xs font-semibold uppercase tracking-wide text-cyan-200/70"
                  >
                    From
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="route-origin"
                      readOnly
                      value={
                        origin
                          ? `Current location (${origin.lat.toFixed(4)}, ${origin.lng.toFixed(4)})`
                          : "Current location (not set)"
                      }
                      className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-slate-200"
                    />
                    <button
                      type="button"
                      onClick={handleUseMyLocation}
                      aria-label="Use my current location"
                      className="rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 text-cyan-200 transition-colors hover:bg-white/20"
                    >
                      <Crosshair className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="route-destination"
                    className="mb-1 block text-xs font-semibold uppercase tracking-wide text-cyan-200/70"
                  >
                    To
                  </label>
                  <input
                    id="route-destination"
                    list="flood-destinations"
                    value={destination}
                    onChange={(event) => setDestination(event.target.value)}
                    placeholder="e.g. Municipal Community Hall"
                    className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-500"
                  />
                  <datalist id="flood-destinations">
                    {DESTINATIONS.map((item) => (
                      <option key={item.name} value={item.name} />
                    ))}
                  </datalist>
                </div>

                <div className="space-y-2 pt-1">
                  <label className="flex items-center gap-2 text-sm text-cyan-100/90">
                    <input
                      type="checkbox"
                      checked={avoidFlooded}
                      onChange={(event) => setAvoidFlooded(event.target.checked)}
                      className="h-4 w-4 rounded border-cyan-300/40 bg-slate-950/60 accent-cyan-500"
                    />
                    Avoid flooded roads
                  </label>
                  <label className="flex items-center gap-2 text-sm text-cyan-100/90">
                    <input
                      type="checkbox"
                      checked={preferElevated}
                      onChange={(event) => setPreferElevated(event.target.checked)}
                      className="h-4 w-4 rounded border-cyan-300/40 bg-slate-950/60 accent-cyan-500"
                    />
                    Prefer elevated paths
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleCalculateRoute}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-sm font-bold text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-300 hover:from-cyan-400 hover:to-blue-500"
                >
                  <Navigation className="h-4 w-4" aria-hidden="true" />
                  Calculate Safe Route
                </button>

                {routeError && (
                  <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                    {routeError}
                  </p>
                )}

                {route && (
                  <div className="rounded-xl border border-yellow-400/30 bg-yellow-400/10 px-3 py-2.5 text-xs text-yellow-100">
                    <p className="flex items-center gap-1.5 font-semibold text-yellow-300">
                      <Route className="h-3.5 w-3.5" aria-hidden="true" />
                      Route calculated
                    </p>
                    <p className="mt-1">{route.summary}</p>
                  </div>
                )}
              </div>
            </section>

            {/* Active rescue vehicles */}
            <section
              aria-label="Active rescue vehicles"
              className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 backdrop-blur-xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-100">
                  <Siren className="h-5 w-5 text-amber-400" aria-hidden="true" />
                  Active Rescue Vehicles
                </h2>
                <span className="text-xs font-semibold text-slate-400">
                  {activeVehicles.length} live
                </span>
              </div>

              <ul className="space-y-3">
                {activeVehicles.slice(0, 6).map((vehicle) => (
                  <li
                    key={vehicle.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg" aria-hidden="true">
                        {vehicle.type === "ndrf_boat"
                          ? "⛵"
                          : vehicle.type === "pump_truck"
                          ? "💧"
                          : vehicle.type === "rescue_4x4"
                          ? "🚐"
                          : vehicle.type === "fire_truck"
                          ? "🚒"
                          : "🚑"}
                      </span>
                      <div>
                        <p className="font-mono text-sm font-bold text-slate-100">
                          {vehicle.callsign}
                        </p>
                        <p className="text-xs text-slate-400">
                          → {nearestZone(vehicle)}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold uppercase text-amber-400">
                      {vehicle.status.replace("_", " ")}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => setDispatchOpen((value) => !value)}
                aria-expanded={dispatchOpen}
                className="mt-4 w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:brightness-110"
              >
                Dispatch New Vehicle →
              </button>

              {dispatchOpen && (
                <ul className="mt-3 space-y-2">
                  {availableVehicles.length === 0 && (
                    <li className="rounded-xl bg-white/5 px-3 py-2 text-xs text-slate-400">
                      Every vehicle is already deployed.
                    </li>
                  )}
                  {availableVehicles.map((vehicle) => (
                    <li
                      key={vehicle.id}
                      className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2"
                    >
                      <span className="font-mono text-xs font-semibold text-slate-200">
                        {vehicle.callsign}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDispatch(vehicle.id)}
                        className="rounded-lg bg-cyan-500/90 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-cyan-400"
                      >
                        Assign
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Nearest shelters */}
            <section
              aria-label="Nearest shelters"
              className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 backdrop-blur-xl"
            >
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-100">
                <Building2 className="h-5 w-5 text-green-400" aria-hidden="true" />
                Nearest Shelters
              </h2>
              <ul className="space-y-3">
                {sortedShelters.map((shelter) => (
                  <li
                    key={shelter.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-200">
                        {shelter.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {shelter.beds} beds available
                      </p>
                    </div>
                    <span className="whitespace-nowrap rounded-lg bg-green-500/15 px-2.5 py-1 text-xs font-bold text-green-400">
                      {shelter.distance.toFixed(1)} km
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        {/* ── Status ticker ──────────────────────────────────────── */}
        {statusMessage && (
          <p
            role="status"
            aria-live="polite"
            className="mt-6 rounded-2xl border border-cyan-500/25 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100"
          >
            {statusMessage}
          </p>
        )}

        {/* ── Emergency action bar ───────────────────────────────── */}
        <section
          aria-label="Flood emergency actions"
          className="sticky bottom-4 z-40 mt-6 rounded-3xl border border-white/10 bg-slate-900/90 p-4 backdrop-blur-xl"
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleReportFlooding}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 px-4 py-3.5 text-sm font-bold text-white transition-all duration-300 hover:brightness-110"
            >
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              Report Flooding
            </button>
            <a
              href={`tel:${FLOOD_HELPLINE}`}
              aria-label={`Call the flood helpline ${FLOOD_HELPLINE}`}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3.5 text-sm font-bold text-red-300 transition-colors duration-300 hover:bg-red-500/20"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              Call {FLOOD_HELPLINE}
            </a>
            <button
              type="button"
              onClick={handleShareLocation}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3.5 text-sm font-bold text-white transition-all duration-300 hover:brightness-110"
            >
              <Crosshair className="h-4 w-4" aria-hidden="true" />
              Share My Location
            </button>
          </div>
          <p className="mt-3 text-center text-xs text-slate-500">
            NDRF Vijayawada {NDRF_VIJAYAWADA} · National Disaster Helpline{" "}
            {FLOOD_HELPLINE} · Krishna + Budameru basin watch active
          </p>
        </section>
      </div>
    </main>
  );
}

/** Hand-rolled SVG line chart for the 180-minute rainfall nowcast. */
function NowcastChart({ points }: { points: { minute: number; rainfall: number }[] }) {
  const width = 720;
  const height = 240;
  const padLeft = 46;
  const padRight = 16;
  const padTop = 18;
  const padBottom = 34;

  const maxRain = Math.max(...points.map((point) => point.rainfall)) * 1.1;
  const chartWidth = width - padLeft - padRight;
  const chartHeight = height - padTop - padBottom;

  const toX = (minute: number) =>
    padLeft + (minute / 180) * chartWidth;
  const toY = (rainfall: number) =>
    padTop + chartHeight - (rainfall / maxRain) * chartHeight;

  const linePath = points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${toX(point.minute).toFixed(2)} ${toY(
          point.rainfall
        ).toFixed(2)}`
    )
    .join(" ");

  const areaPath = `${linePath} L ${toX(180).toFixed(2)} ${(
    padTop + chartHeight
  ).toFixed(2)} L ${toX(0).toFixed(2)} ${(padTop + chartHeight).toFixed(2)} Z`;

  const yTicks = [0, 20, 40, 60, 80].filter((tick) => tick <= maxRain);
  const xTicks = [0, 30, 60, 90, 120, 150, 180];
  const peakPoint = points.reduce((max, point) =>
    point.rainfall > max.rainfall ? point : max
  );

  return (
    <figure>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Rainfall nowcast for the next 180 minutes in millimetres per hour"
        className="h-56 w-full"
      >
        <defs>
          <linearGradient id="floodArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* grid */}
        {yTicks.map((tick) => (
          <g key={tick}>
            <line
              x1={padLeft}
              x2={width - padRight}
              y1={toY(tick)}
              y2={toY(tick)}
              stroke="rgba(148,163,184,0.15)"
              strokeDasharray="4 6"
            />
            <text
              x={padLeft - 8}
              y={toY(tick) + 4}
              textAnchor="end"
              fontSize="11"
              fill="#64748b"
            >
              {tick}
            </text>
          </g>
        ))}

        {xTicks.map((tick) => (
          <text
            key={tick}
            x={toX(tick)}
            y={height - 12}
            textAnchor="middle"
            fontSize="11"
            fill="#64748b"
          >
            {tick}m
          </text>
        ))}

        {/* threshold line at 60 mm/h (extreme cloudburst) */}
        {maxRain > 60 && (
          <line
            x1={padLeft}
            x2={width - padRight}
            y1={toY(60)}
            y2={toY(60)}
            stroke="rgba(248,113,113,0.55)"
            strokeDasharray="6 6"
          />
        )}

        <path d={areaPath} fill="url(#floodArea)" />
        <path
          d={linePath}
          fill="none"
          stroke="#22d3ee"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        <circle
          cx={toX(peakPoint.minute)}
          cy={toY(peakPoint.rainfall)}
          r="4.5"
          fill="#facc15"
          stroke="#0f172a"
          strokeWidth="2"
        />
        <text
          x={Math.min(toX(peakPoint.minute) + 10, width - 120)}
          y={toY(peakPoint.rainfall) - 8}
          fontSize="11"
          fill="#facc15"
        >
          Peak {peakPoint.rainfall} mm/h
        </text>
      </svg>
      <figcaption className="mt-2 text-xs text-slate-500">
        Y-axis: rainfall intensity (mm/hr) · X-axis: minutes from now · red dashed
        line marks the 60 mm/hr cloudburst threshold
      </figcaption>
    </figure>
  );
}
