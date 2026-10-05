"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), { ssr: false });
const Circle = dynamic(() => import("react-leaflet").then((m) => m.Circle), { ssr: false });

type Point = {
  id?: string;
  name?: string;
  lat: number;
  lng: number;
  status?: string;
  type?: string;
};

interface LiveMapProps {
  junctions?: Point[];
  ambulances?: Point[];
  emergencies?: Point[];
  responseVehicles?: Point[];
  trafficSignals?: Point[];
  sosVehicles?: Point[];
  hospitals?: Point[];
  helpPoints?: Point[];
  userLocation?: { lat: number; lng: number };
  parentLocation?: { lat: number; lng: number };
  childLocation?: { lat: number; lng: number };
  showUserLocation?: boolean;
  center?: [number, number];
  zoom?: number;
  geofence?: { center: [number, number]; radius: number };
}

const palette = {
  red: { bg: "#ef4444", ring: "rgba(239,68,68,.22)", text: "#fff", glow: "rgba(239,68,68,.55)" },
  orange: { bg: "#f97316", ring: "rgba(249,115,22,.22)", text: "#fff", glow: "rgba(249,115,22,.55)" },
  blue: { bg: "#3b82f6", ring: "rgba(59,130,246,.22)", text: "#fff", glow: "rgba(59,130,246,.55)" },
  green: { bg: "#22c55e", ring: "rgba(34,197,94,.22)", text: "#062513", glow: "rgba(34,197,94,.55)" },
} as const;

function badgeIcon(color: keyof typeof palette, label: string, size = 42) {
  const p = palette[color];
  return L.divIcon({
    className: "custom-icon",
    html: `<div style="width:${size}px;height:${size}px;border-radius:999px;background:${p.ring};border:2px solid ${p.bg};display:flex;align-items:center;justify-content:center;box-shadow:0 0 18px ${p.glow};">
      <div style="min-width:${Math.max(24, size - 12)}px;height:${Math.max(24, size - 12)}px;border-radius:999px;background:${p.bg};color:${p.text};display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:900;letter-spacing:.02em;border:2px solid rgba(255,255,255,.82);">${label}</div>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

function pulseIcon(color: keyof typeof palette, label = "", size = 30) {
  const p = palette[color];
  return L.divIcon({
    className: "custom-icon",
    html: `<div style="position:relative;width:${size}px;height:${size}px;border-radius:999px;background:${p.ring};border:2px solid ${p.bg};display:flex;align-items:center;justify-content:center;box-shadow:0 0 16px ${p.glow};">
      <span style="position:absolute;width:100%;height:100%;border-radius:999px;background:${p.bg};opacity:.34;animation:pulse 1.4s infinite;"></span>
      <div style="position:relative;width:${size - 14}px;height:${size - 14}px;border-radius:999px;background:${p.bg};color:${p.text};display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:900;">${label}</div>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

function signalIcon(status = "red") {
  const normalized = status.toLowerCase();
  return pulseIcon(normalized.includes("green") || normalized.includes("normal") ? "green" : "red", "", 22);
}

export default function LiveMapInner({
  junctions = [],
  ambulances = [],
  emergencies = [],
  responseVehicles = [],
  trafficSignals = [],
  sosVehicles = [],
  hospitals = [],
  helpPoints = [],
  userLocation,
  parentLocation,
  childLocation,
  showUserLocation = false,
  center = [16.5062, 80.648],
  zoom = 13,
  geofence,
}: LiveMapProps) {
  const icons = useMemo(
    () => ({
      ambulance: badgeIcon("orange", "AMB"),
      response: badgeIcon("red", "SOS"),
      hospital: badgeIcon("blue", "H"),
      sos: badgeIcon("red", "SOS", 46),
      user: pulseIcon("green", ""),
      parent: badgeIcon("blue", "P", 40),
      child: badgeIcon("green", "C", 40),
      help: badgeIcon("red", "+", 24),
    }),
    []
  );

  return (
    <MapContainer center={center} zoom={zoom} scrollWheelZoom className="h-full min-h-[360px] w-full bg-[#131826]">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {geofence && (
        <Circle
          center={geofence.center}
          radius={geofence.radius}
          pathOptions={{ color: "#22c55e", fillColor: "#22c55e", fillOpacity: 0.2, weight: 2 }}
        />
      )}

      {showUserLocation && userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={icons.user}>
          <Popup>User location</Popup>
        </Marker>
      )}

      {parentLocation && (
        <Marker position={[parentLocation.lat, parentLocation.lng]} icon={icons.parent}>
          <Popup>Parent location</Popup>
        </Marker>
      )}

      {childLocation && (
        <Marker position={[childLocation.lat, childLocation.lng]} icon={icons.child}>
          <Popup>Child location</Popup>
        </Marker>
      )}

      {ambulances.map((item) => (
        <Marker key={`amb-${item.id ?? item.lat}`} position={[item.lat, item.lng]} icon={icons.ambulance}>
          <Popup>{item.id ?? "Ambulance"} - {item.status ?? "Available"}</Popup>
        </Marker>
      ))}

      {[...emergencies, ...sosVehicles].map((item) => (
        <Marker key={`sos-${item.id ?? item.lat}`} position={[item.lat, item.lng]} icon={icons.sos}>
          <Popup>{item.name ?? item.id ?? "Active SOS"} - {item.status ?? "Active"}</Popup>
        </Marker>
      ))}

      {responseVehicles.map((item) => (
        <Marker key={`response-${item.id ?? item.lat}`} position={[item.lat, item.lng]} icon={icons.response}>
          <Popup>{item.id ?? "Response unit"} - {item.status ?? "Responding"}</Popup>
        </Marker>
      ))}

      {hospitals.map((item) => (
        <Marker key={`hospital-${item.id ?? item.lat}`} position={[item.lat, item.lng]} icon={icons.hospital}>
          <Popup>{item.name ?? "Hospital"} - {item.status ?? "Available"}</Popup>
        </Marker>
      ))}

      {trafficSignals.map((item) => (
        <Marker key={`signal-${item.id ?? item.lat}`} position={[item.lat, item.lng]} icon={signalIcon(item.status)}>
          <Popup>{item.name ?? "Traffic Signal"} - {item.status ?? "Red"}</Popup>
        </Marker>
      ))}

      {[...junctions, ...helpPoints].map((item) => (
        <Marker key={`help-${item.id ?? item.lat}`} position={[item.lat, item.lng]} icon={icons.help}>
          <Popup>{item.name ?? "Help point"}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
