// PRAVAH + LifeLane - Interactive Live Map Component
// Using Leaflet for map rendering

"use client";

import React, { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

import L from "leaflet";
import type { Ambulance, Emergency, TrafficJunction, Hospital } from "@/types";

// Fix for default Leaflet marker icons in Next.js
const ambulanceIcon = L.divIcon({
  html: `<div style="background-color: #E53935; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
  className: "ambulance-marker",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const emergencyIcon = L.divIcon({
  html: `<div style="background-color: #FF5722; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); animation: pulse 1s infinite;"></div>`,
  className: "emergency-marker",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const hospitalIcon = L.divIcon({
  html: `<div style="background-color: #1565C0; width: 18px; height: 18px; border-radius: 3px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
  className: "hospital-marker",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const junctionNormalIcon = L.divIcon({
  html: `<div style="background-color: #2E7D32; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white;"></div>`,
  className: "junction-marker",
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const junctionPreemptedIcon = L.divIcon({
  html: `<div style="background-color: #4CAF50; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px #4CAF50;"></div>`,
  className: "junction-preempted-marker",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

interface LiveMapProps {
  ambulances?: Ambulance[];
  emergencies?: Emergency[];
  junctions?: TrafficJunction[];
  hospitals?: Hospital[];
  center?: [number, number];
  zoom?: number;
  showControls?: boolean;
  onMarkerClick?: (type: string, id: string) => void;
}

export default function LiveMap({
  ambulances = [],
  emergencies = [],
  junctions = [],
  hospitals = [],
  center = [28.6139, 77.2090] as [number, number], // Delhi coordinates
  zoom = 13,
  showControls = true,
  onMarkerClick,
}: LiveMapProps) {
  const [mapReady, setMapReady] = useState(false);
  const [mapCenter, setMapCenter] = useState(center);

  // Auto-center map on active content (only when there are active ambulances/emergencies)
  useEffect(() => {
    const activePoints = [
      ...ambulances.filter(a => a.lat && a.lng && (a.status === 'en-route' || a.status === 'to-hospital')).map(a => [Number(a.lat), Number(a.lng)]),
      ...emergencies.map(e => [e.pickupLat, e.pickupLng]),
    ];

    if (activePoints.length > 0) {
      const centerLat = activePoints.reduce((sum, [lat]) => sum + lat, 0) / activePoints.length;
      const centerLng = activePoints.reduce((sum, [, lng]) => sum + lng, 0) / activePoints.length;
      setMapCenter([centerLat, centerLng]);
    }
  }, [ambulances, emergencies]);

  useEffect(() => {
    setMapReady(true);
  }, []);

  if (!mapReady) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full"
        style={{ minHeight: "400px" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Ambulance Markers */}
        {ambulances.filter(amb => amb.lat && amb.lng).map((ambulance) => (
          <Marker
            key={ambulance.id}
            position={[Number(ambulance.lat), Number(ambulance.lng)]}
            icon={ambulanceIcon}
            eventHandlers={{
              click: () => onMarkerClick?.("ambulance", ambulance.id),
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-sm">{ambulance.vehicleNumber}</h3>
                <p className="text-xs text-gray-600">Driver: {ambulance.driverName}</p>
                <p className="text-xs">
                  Status:{" "}
                  <span
                    className={`px-2 py-0.5 rounded-full text-white text-xs ${
                      ambulance.status === "available"
                        ? "bg-green-500"
                        : ambulance.status === "en-route"
                        ? "bg-yellow-500"
                        : ambulance.status === "busy"
                        ? "bg-red-500"
                        : "bg-gray-500"
                    }`}
                  >
                    {ambulance.status}
                  </span>
                </p>
                {ambulance.speed && (
                  <p className="text-xs text-gray-600">Speed: {ambulance.speed} km/h</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Emergency Markers */}
        {emergencies.map((emergency) => (
          <Marker
            key={emergency.id}
            position={[Number(emergency.pickupLat), Number(emergency.pickupLng)]}
            icon={emergencyIcon}
            eventHandlers={{
              click: () => onMarkerClick?.("emergency", emergency.id),
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-sm text-red-600">Emergency!</h3>
                <p className="text-xs">Type: {emergency.type}</p>
                <p className="text-xs">Patient: {emergency.patientName}</p>
                <p className="text-xs">
                  Status:{" "}
                  <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs">
                    {emergency.status}
                  </span>
                </p>
                {emergency.assignedAmbulanceId && (
                  <p className="text-xs text-gray-600">
                    Ambulance: {emergency.assignedAmbulanceId}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Hospital Markers */}
        {hospitals.map((hospital) => (
          <Marker
            key={hospital.id}
            position={[Number(hospital.lat), Number(hospital.lng)]}
            icon={hospitalIcon}
            eventHandlers={{
              click: () => onMarkerClick?.("hospital", hospital.id),
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-sm text-blue-600">{hospital.name}</h3>
                <p className="text-xs text-gray-600">{hospital.address}</p>
                <p className="text-xs">Phone: {hospital.phone}</p>
                {hospital.availableBeds && (
                  <p className="text-xs">
                    Available Beds: {hospital.availableBeds}/{hospital.capacity}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Junction Markers */}
        {junctions.map((junction) => (
          <Marker
            key={junction.id}
            position={[Number(junction.lat), Number(junction.lng)]}
            icon={junction.status === "preempted" ? junctionPreemptedIcon : junctionNormalIcon}
            eventHandlers={{
              click: () => onMarkerClick?.("junction", junction.id),
            }}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-bold text-sm">{junction.name}</h3>
                <p className="text-xs">
                  Status:{" "}
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      junction.status === "preempted"
                        ? "bg-green-100 text-green-800"
                        : junction.status === "preparing"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {junction.status.toUpperCase()}
                  </span>
                </p>
                <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-red-500"></div>
                    <span>N: {junction.northState}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-green-500"></div>
                    <span>S: {junction.southState}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-red-500"></div>
                    <span>E: {junction.eastState}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-red-500"></div>
                    <span>W: {junction.westState}</span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  <p>Density: {junction.trafficDensity}%</p>
                  <p>Wait Time: {junction.averageWaitTime}s</p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Legend */}
      {showControls && (
        <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
          <h4 className="font-bold text-xs mb-2">Legend</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Ambulance</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span>Emergency</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500"></div>
              <span>Hospital</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Junction (Green)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-500"></div>
              <span>Junction (Normal)</span>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
}
