// src/components/FloodMap.tsx
// PRAVAH 360 - GIS flood overlay map
// Inundation zones, rain gauges, shelters, response vehicles and safe routes
// around Vijayawada (16.5062 N, 80.6480 E).

"use client";

import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import {
  Circle,
  CircleMarker,
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
} from "react-leaflet";
import type {
  FloodSeverity,
  FloodZone,
  ForecastHour,
  LatLng,
  RainSensor,
  SafeRoute,
  Shelter,
} from "@/types/flood";
import type { ResponseVehicle } from "@/types/vehicles";
import { VEHICLE_TYPE_META } from "@/types/vehicles";
import { VIJAYAWADA_CENTER } from "@/lib/floodData";

const SEVERITY_COLOR: Record<FloodSeverity, string> = {
  HIGH: "#ef4444",
  MED: "#f97316",
  LOW: "#eab308",
};

const HORIZONS: { id: ForecastHour; label: string; multiplier: number }[] = [
  { id: "now", label: "Current", multiplier: 1 },
  { id: "1hr", label: "+1 hr", multiplier: 1.2 },
  { id: "3hr", label: "+3 hr", multiplier: 1.45 },
];

const SHELTER_COLORS = ["🏫", "🏛️", "⛪", "🎓", "🎓"];

export interface FloodMapProps {
  zones?: FloodZone[];
  shelters?: Shelter[];
  sensors?: RainSensor[];
  vehicles?: ResponseVehicle[];
  route?: SafeRoute | null;
  origin?: LatLng | null;
  destination?: LatLng | null;
  center?: [number, number];
  zoom?: number;
  className?: string;
  /** Called when an operator taps a response vehicle marker. */
  onVehicleSelect?: (vehicleId: string) => void;
}

function makeVehicleIcon(emoji: string, active: boolean): L.DivIcon {
  return L.divIcon({
    html: `<div style="background:${active ? "#f97316" : "#0f172a"};color:#fff;border-radius:10px;padding:4px 7px;font-size:15px;line-height:1;border:2px solid ${
      active ? "#fdba74" : "#f97316"
    };box-shadow:0 3px 10px rgba(0,0,0,0.45);white-space:nowrap;">${emoji}</div>`,
    iconSize: undefined,
    iconAnchor: [14, 14],
    className: "flood-vehicle-icon",
  });
}

function makeStaticIcon(emoji: string, tint: string): L.DivIcon {
  return L.divIcon({
    html: `<div style="background:${tint};color:#fff;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;font-size:15px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4);">${emoji}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    className: "custom-marker",
  });
}

function FloodMapInner({
  zones = [],
  shelters = [],
  sensors = [],
  vehicles = [],
  route = null,
  origin = null,
  destination = null,
  center = [VIJAYAWADA_CENTER.lat, VIJAYAWADA_CENTER.lng],
  zoom = 12,
  className = "",
  onVehicleSelect,
}: FloodMapProps) {
  const [horizon, setHorizon] = useState<ForecastHour>("now");
  const multiplier =
    HORIZONS.find((item) => item.id === horizon)?.multiplier ?? 1;

  const vehicleIcons = useMemo(() => {
    const cache = new Map<string, L.DivIcon>();
    vehicles.forEach((vehicle) => {
      const meta = VEHICLE_TYPE_META[vehicle.type];
      const active = vehicle.status === "en_route" || vehicle.status === "on_scene";
      cache.set(vehicle.id, makeVehicleIcon(meta.emoji, active));
    });
    return cache;
  }, [vehicles]);

  const shelterIcons = useMemo(
    () =>
      shelters.map((shelter, index) =>
        makeStaticIcon(SHELTER_COLORS[index % SHELTER_COLORS.length], "#16a34a")
      ),
    [shelters]
  );

  const originIcon = useMemo(() => makeStaticIcon("📍", "#0ea5e9"), []);
  const destinationIcon = useMemo(() => makeStaticIcon("🚩", "#dc2626"), []);

  return (
    <div className={`relative h-full w-full ${className}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom
        className="h-full w-full rounded-3xl"
        aria-label="Live flood map of Vijayawada"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Inundation zones — radius grows with the forecast horizon */}
        {zones.map((zone) => (
          <Circle
            key={zone.id}
            center={[zone.lat, zone.lng]}
            radius={zone.radius * multiplier}
            pathOptions={{
              color: SEVERITY_COLOR[zone.severity],
              fillColor: SEVERITY_COLOR[zone.severity],
              fillOpacity: 0.32,
              weight: 2,
              dashArray: zone.severity === "LOW" ? "6 6" : undefined,
            }}
          >
            <Popup>
              <div style={{ minWidth: 180 }}>
                <strong>{zone.name}</strong>
                <div>Severity: {zone.severity}</div>
                <div>Depth: {zone.depth.toFixed(1)} m</div>
                <div>
                  Forecast: {horizon === "now" ? "now" : `+${horizon}`}
                </div>
              </div>
            </Popup>
          </Circle>
        ))}

        {/* Rain gauges */}
        {sensors.map((sensor) => (
          <CircleMarker
            key={sensor.id}
            center={[sensor.lat, sensor.lng]}
            radius={9}
            pathOptions={{
              color: "#38bdf8",
              fillColor: "#0ea5e9",
              fillOpacity: 0.9,
              weight: 2,
            }}
          >
            <Popup>
              <div style={{ minWidth: 150 }}>
                <strong>{sensor.name} gauge</strong>
                <div>{sensor.rainfall} mm/hr</div>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Relief shelters */}
        {shelters.map((shelter, index) => (
          <Marker
            key={shelter.id}
            position={[shelter.lat, shelter.lng]}
            icon={shelterIcons[index]}
          >
            <Popup>
              <div style={{ minWidth: 170 }}>
                <strong>{shelter.name}</strong>
                <div>{shelter.beds} beds available</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Response vehicles */}
        {vehicles.map((vehicle) => (
          <Marker
            key={vehicle.id}
            position={[vehicle.lat, vehicle.lng]}
            icon={vehicleIcons.get(vehicle.id)}
            eventHandlers={{
              click: () => onVehicleSelect?.(vehicle.id),
            }}
          >
            <Popup>
              <div style={{ minWidth: 190 }}>
                <strong>{vehicle.callsign}</strong>
                <div>{VEHICLE_TYPE_META[vehicle.type].label}</div>
                <div>Driver: {vehicle.driverName}</div>
                <div>Status: {vehicle.status.replace("_", " ")}</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Flood-safe route */}
        {route && route.points.length > 1 && (
          <Polyline
            positions={route.points.map((point) => [point.lat, point.lng])}
            pathOptions={{
              color: "#facc15",
              weight: 5,
              opacity: 0.95,
              lineJoin: "round",
            }}
          >
            <Popup>
              <div style={{ minWidth: 180 }}>
                <strong>Flood-safe route</strong>
                <div>{route.summary}</div>
              </div>
            </Popup>
          </Polyline>
        )}

        {origin && (
          <Marker position={[origin.lat, origin.lng]} icon={originIcon}>
            <Popup>Origin — your current location</Popup>
          </Marker>
        )}
        {destination && (
          <Marker
            position={[destination.lat, destination.lng]}
            icon={destinationIcon}
          >
            <Popup>Destination</Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Forecast horizon controls */}
      <div className="absolute right-3 top-3 z-[1000] flex items-center gap-1 rounded-full border border-white/10 bg-slate-950/85 p-1 backdrop-blur-md">
        {HORIZONS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setHorizon(item.id)}
            aria-pressed={horizon === item.id}
            aria-label={`Show ${item.label} flood forecast`}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors duration-200 ${
              horizon === item.id
                ? "bg-cyan-500 text-white"
                : "text-slate-300 hover:bg-white/10"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] rounded-2xl border border-white/10 bg-slate-950/85 p-3 text-[11px] text-slate-300 backdrop-blur-md">
        <p className="mb-2 font-semibold uppercase tracking-wider text-slate-400">
          Legend
        </p>
        <ul className="space-y-1.5">
          <li className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-red-500" /> Flooded (HIGH)
          </li>
          <li className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-orange-500" /> At risk (MED)
          </li>
          <li className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-sky-400" /> Rain sensors
          </li>
          <li className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-green-500" /> Shelters
          </li>
          <li className="flex items-center gap-2">
            <span className="h-0.5 w-4 bg-yellow-400" /> Safe route
          </li>
          <li className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-amber-500" /> Rescue vehicles
          </li>
        </ul>
      </div>
    </div>
  );
}

/**
 * Leaflet must never render on the server, so the map is mounted only after
 * the stylesheet has been injected on the client.
 */
export default function FloodMap(props: FloodMapProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    import("leaflet/dist/leaflet.css")
      .catch(() => undefined)
      .then(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center rounded-3xl border border-white/10 bg-slate-900/70 ${
          props.className ?? ""
        }`}
        role="status"
        aria-live="polite"
      >
        <span className="animate-pulse text-sm text-slate-400">
          Loading live flood map…
        </span>
      </div>
    );
  }

  return <FloodMapInner {...props} />;
}
