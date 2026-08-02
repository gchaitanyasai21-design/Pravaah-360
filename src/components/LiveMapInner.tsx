"use client";

import { useEffect, useRef } from "react";

interface LiveMapProps {
  junctions?: any[];
  ambulances?: any[];
  emergencies?: any[];
  deliveryVehicles?: any[];
  trafficSignals?: any[];
  sosVehicles?: any[];
  hospitals?: any[];
  userLocation?: { lat: number; lng: number };
  showUserLocation?: boolean;
  center?: [number, number];
  zoom?: number;
  simulationActive?: boolean;
  onSimulationUpdate?: (data: any) => void;
}

export default function LiveMapInner({
  junctions = [],
  ambulances = [],
  emergencies = [],
  deliveryVehicles = [],
  trafficSignals = [],
  sosVehicles = [],
  hospitals = [],
  userLocation,
  showUserLocation = false,
  center = [16.5062, 80.6480],
  zoom = 13,
}: LiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const isInitializedRef = useRef(false);

  // Initialize map ONCE only
  useEffect(() => {
    // Prevent double initialization
    if (isInitializedRef.current) return;
    if (!mapRef.current) return;

    // Check container isn't already a map
    if ((mapRef.current as any)._leaflet_id) {
      return;
    }

    isInitializedRef.current = true;

    const initMap = async () => {
      try {
        const L = (await import("leaflet")).default;
        await import("leaflet/dist/leaflet.css");

        if (!mapRef.current) return;

        // Create map
        const map = L.map(mapRef.current, {
          zoomControl: true,
          attributionControl: true,
        }).setView(center, zoom);

        mapInstanceRef.current = map;

        // Add tile layer
        L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          { attribution: "© OpenStreetMap" }
        ).addTo(map);

        // Create markers layer
        markersLayerRef.current = L.layerGroup().addTo(map);

        // Render markers
        renderAllMarkers(L, map);
      } catch (error) {
        console.error("Map init error:", error);
      }
    };

    initMap();

    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          // ignore
        }
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
        isInitializedRef.current = false;
      }
    };
  }, []);

  // Update markers when data changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    const updateMarkers = async () => {
      const L = (await import("leaflet")).default;
      renderAllMarkers(L, mapInstanceRef.current);
    };

    updateMarkers();
  }, [
    ambulances, sosVehicles, deliveryVehicles,
    trafficSignals, hospitals, userLocation, showUserLocation,
  ]);

  const renderAllMarkers = (L: any, map: any) => {
    if (!markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    const ambulanceIcon = L.divIcon({
      html: `<div style="background:#ef4444;color:white;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;font-size:16px;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4)">🚑</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      className: "custom-marker",
    });

    const policeIcon = L.divIcon({
      html: `<div style="background:#3b82f6;color:white;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;font-size:14px;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4)">🚓</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      className: "custom-marker",
    });

    const deliveryIcon = L.divIcon({
      html: `<div style="background:#f59e0b;color:white;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;font-size:14px;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4)">📦</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      className: "custom-marker",
    });

    const userIcon = L.divIcon({
      html: `<div style="background:#22c55e;color:white;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:12px;border:3px solid white;box-shadow:0 0 15px rgba(34,197,94,0.8)">👤</div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      className: "custom-marker",
    });

    const trafficSignalIcon = L.divIcon({
      html: `<div style="background:#1f2937;color:white;border-radius:6px;padding:4px;display:flex;align-items:center;justify-content:center;border:2px solid #6b7280">🚦</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      className: "custom-marker",
    });

    const hospitalIcon = L.divIcon({
      html: `<div style="background:#e11d48;color:white;border-radius:8px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:18px;border:3px solid white;box-shadow:0 2px 10px rgba(225,29,72,0.5)">🏥</div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      className: "custom-marker",
    });

    // User Location
    if (showUserLocation && userLocation) {
      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .bindPopup("<b>👤 Your Location</b>")
        .addTo(markersLayerRef.current);

      L.circle([userLocation.lat, userLocation.lng], {
        radius: 200,
        color: "#22c55e",
        fillColor: "#22c55e",
        fillOpacity: 0.1,
        weight: 2,
      }).addTo(markersLayerRef.current);
    }

    // SOS Vehicles
    sosVehicles?.forEach((v) => {
      if (v.lat && v.lng) {
        const icon = v.type === "police" ? policeIcon : ambulanceIcon;
        L.marker([v.lat, v.lng], { icon })
          .bindPopup(`<b>${v.type === "police" ? "🚓" : "🚑"} ${v.id || "SOS"}</b>`)
          .addTo(markersLayerRef.current);
      }
    });

    // Ambulances
    ambulances?.forEach((a) => {
      if (a.lat && a.lng) {
        L.marker([a.lat, a.lng], { icon: ambulanceIcon })
          .bindPopup(`<b>🚑 ${a.id}</b><br/>Status: ${a.status || "Available"}`)
          .addTo(markersLayerRef.current);
      }
    });

    // Delivery Vehicles
    deliveryVehicles?.forEach((v) => {
      if (v.lat && v.lng) {
        L.marker([v.lat, v.lng], { icon: deliveryIcon })
          .bindPopup(`<b>📦 ${v.id}</b><br/>Status: ${v.status || "In Transit"}`)
          .addTo(markersLayerRef.current);
      }
    });

    // Traffic Signals
    trafficSignals?.forEach((s) => {
      if (s.lat && s.lng) {
        L.marker([s.lat, s.lng], { icon: trafficSignalIcon })
          .bindPopup(`<b>🚦 ${s.name}</b><br/>Status: ${s.status || "Normal"}`)
          .addTo(markersLayerRef.current);
      }
    });

    // Hospitals
    hospitals?.forEach((h) => {
      if (h.lat && h.lng) {
        L.marker([h.lat, h.lng], { icon: hospitalIcon })
          .bindPopup(`<b>🏥 ${h.name}</b><br/>Status: ${h.status || "Available"}`)
          .addTo(markersLayerRef.current);
      }
    });

    // Junctions
    junctions?.forEach((j) => {
      if (j.lat && j.lng) {
        L.marker([j.lat, j.lng])
          .bindPopup(`<b>${j.name || "Junction"}</b>`)
          .addTo(markersLayerRef.current);
      }
    });
  };

  return (
    <div
      ref={mapRef}
      style={{
        height: "100%",
        width: "100%",
        minHeight: "400px",
        zIndex: 0,
      }}
    />
  );
}
