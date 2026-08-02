"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const DEFAULT_CENTER: [number, number] = [28.6139, 77.209];
const DEFAULT_ZOOM = 13;

export default function LiveMapInner({
  ambulances = [],
  trafficSignals = [],
  hospitals = [],
  sosVehicles = [],
  deliveryVehicles = [],
  emergencies = [],
  movingAmbulance = null,
  pulseLocation = null,
  route = null,
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
}: any) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Separate layer groups so we can update WITHOUT wiping the whole map
  const hospitalLayerRef = useRef<L.LayerGroup | null>(null);
  const ambulanceLayerRef = useRef<L.LayerGroup | null>(null);
  const signalLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const pulseLayerRef = useRef<L.LayerGroup | null>(null);
  const movingAmbLayerRef = useRef<L.LayerGroup | null>(null);

  // ===== INIT MAP (only once) =====
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    if ((mapRef.current as any)._leaflet_id) {
      delete (mapRef.current as any)._leaflet_id;
      mapRef.current.innerHTML = "";
    }

    try {
      const map = L.map(mapRef.current, {
        zoomControl: true,
        attributionControl: true,
      }).setView(center, zoom);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

      // Create layer groups
      hospitalLayerRef.current = L.layerGroup().addTo(map);
      ambulanceLayerRef.current = L.layerGroup().addTo(map);
      signalLayerRef.current = L.layerGroup().addTo(map);
      routeLayerRef.current = L.layerGroup().addTo(map);
      pulseLayerRef.current = L.layerGroup().addTo(map);
      movingAmbLayerRef.current = L.layerGroup().addTo(map);

      setTimeout(() => { try { map.invalidateSize(); } catch {} }, 250);
      setTimeout(() => { try { map.invalidateSize(); } catch {} }, 800);
    } catch (e) {
      console.error("Map init error:", e);
    }

    return () => {
      try {
        mapInstanceRef.current?.remove();
        mapInstanceRef.current = null;
      } catch {}
    };
  }, []); // ← empty deps, run ONCE

  // ===== HOSPITALS =====
  useEffect(() => {
    const layer = hospitalLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    hospitals.forEach((h: any) => {
      if (!h || typeof h.lat !== "number") return;
      L.marker([h.lat, h.lng], {
        icon: L.divIcon({
          html: `<div style="font-size:28px;text-shadow:0 2px 4px rgba(0,0,0,0.5);">🏥</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          className: "",
        }),
      }).bindPopup(`<b>🏥 ${h.name}</b>`).addTo(layer);
    });
  }, [hospitals]);

  // ===== STATIC AMBULANCES =====
  useEffect(() => {
    const layer = ambulanceLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    ambulances.forEach((a: any) => {
      if (!a || typeof a.lat !== "number") return;
      L.marker([a.lat, a.lng], {
        icon: L.divIcon({
          html: `<div style="font-size:24px;text-shadow:0 2px 4px rgba(0,0,0,0.5);">🚑</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 28],
          className: "",
        }),
      }).bindPopup(`<b>🚑 ${a.id}</b>`).addTo(layer);
    });
  }, [ambulances]);

  // ===== TRAFFIC SIGNALS =====
  useEffect(() => {
    const layer = signalLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    trafficSignals.forEach((ts: any) => {
      if (!ts || typeof ts.lat !== "number") return;
      const color = ts.status === "GREEN" ? "#22c55e" : ts.status === "YELLOW" ? "#facc15" : "#ef4444";
      L.circleMarker([ts.lat, ts.lng], {
        radius: 10,
        fillColor: color,
        color: "#fff",
        weight: 2,
        fillOpacity: 1,
      }).bindPopup(`<b>🚦 ${ts.name}</b><br/>Status: <b style="color:${color}">${ts.status}</b>`).addTo(layer);
    });
  }, [trafficSignals]);

  // ===== ROUTE =====
  useEffect(() => {
    const layer = routeLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    if (route && route.length >= 2) {
      L.polyline(route, {
        color: "#ef4444",
        weight: 4,
        opacity: 0.9,
        dashArray: "10, 12",
      }).addTo(layer);
    }
  }, [route]);

  // ===== PULSE LOCATION =====
  useEffect(() => {
    const layer = pulseLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    if (pulseLocation && typeof pulseLocation.lat === "number") {
      L.marker([pulseLocation.lat, pulseLocation.lng], {
        icon: L.divIcon({
          html: `
            <div style="position:relative;width:40px;height:40px;">
              <div style="position:absolute;inset:0;border-radius:50%;background:rgba(239,68,68,0.4);animation:sosPulse 1.4s ease-out infinite;"></div>
              <div style="position:absolute;inset:12px;border-radius:50%;background:#ef4444;box-shadow:0 0 12px #ef4444;"></div>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
          className: "",
        }),
      }).bindPopup("<b>🆘 Patient Location</b>").addTo(layer);
    }
  }, [pulseLocation]);

  // ===== MOVING AMBULANCE (updates ~20fps without flicker) =====
  useEffect(() => {
    const layer = movingAmbLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    if (movingAmbulance && typeof movingAmbulance.lat === "number") {
      L.marker([movingAmbulance.lat, movingAmbulance.lng], {
        icon: L.divIcon({
          html: `<div style="font-size:32px;text-shadow:0 3px 6px rgba(0,0,0,0.6);transform:rotate(-10deg);">🚑</div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
          className: "",
        }),
        zIndexOffset: 1000,
      }).bindPopup("<b>🚑 En Route</b>").addTo(layer);
    }
  }, [movingAmbulance]);

  return <div ref={mapRef} style={{ height: "100%", width: "100%", minHeight: "400px" }} />;
}