"use client";

import { useEffect, useRef } from "react";

interface LiveMapProps {
  junctions?: any[];
  ambulances?: any[];
  emergencies?: any[];
  center?: [number, number];
  zoom?: number;
}

export default function LiveMapInner({
  junctions = [],
  ambulances = [],
  emergencies = [],
  center = [28.6139, 77.2090],
  zoom = 12,
}: LiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return;
      if (mapInstanceRef.current) return;

      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      // Create map
      const map = L.map(mapRef.current).setView(center, zoom);
      mapInstanceRef.current = map;

      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      // Add ambulance markers
      ambulances.forEach((ambulance) => {
        if (ambulance.lat && ambulance.lng) {
          L.marker([ambulance.lat, ambulance.lng])
            .bindPopup(`🚑 ${ambulance.id || "Ambulance"}`)
            .addTo(map);
        }
      });

      // Add junction markers
      junctions.forEach((junction) => {
        if (junction.lat && junction.lng) {
          L.marker([junction.lat, junction.lng])
            .bindPopup(`🚦 ${junction.name || "Junction"}`)
            .addTo(map);
        }
      });
    };

    initMap();

    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={mapRef}
      style={{ height: "100%", width: "100%", minHeight: "400px" }}
    />
  );
}