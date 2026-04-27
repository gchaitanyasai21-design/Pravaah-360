"use client";

import { useEffect, useRef } from "react";

interface LiveMapProps {
  junctions?: any[];
  ambulances?: any[];
  emergencies?: any[];
  deliveryVehicles?: any[];
  trafficSignals?: any[];
  sosVehicles?: any[];
  userLocation?: { lat: number; lng: number };
  showUserLocation?: boolean;
  center?: [number, number];
  zoom?: number;
}

export default function LiveMapInner({
  junctions = [],
  ambulances = [],
  emergencies = [],
  deliveryVehicles = [],
  trafficSignals = [],
  sosVehicles = [],
  userLocation,
  showUserLocation = false,
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
        attribution: " OpenStreetMap contributors",
      }).addTo(map);

      // Create custom icons
      const ambulanceIcon = L.divIcon({
        html: '<div style="background: #ff4444; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">🚑</div>',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15],
        className: 'custom-marker'
      });

      const policeIcon = L.divIcon({
        html: '<div style="background: #4444ff; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">🚓</div>',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15],
        className: 'custom-marker'
      });

      const deliveryIcon = L.divIcon({
        html: '<div style="background: #ffaa00; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">📦</div>',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15],
        className: 'custom-marker'
      });

      const userIcon = L.divIcon({
        html: '<div style="background: #4CAF50; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4);">👤</div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [0, -10],
        className: 'custom-marker'
      });

      const trafficSignalIcon = L.divIcon({
        html: '<div style="background: #333; color: white; border-radius: 4px; width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid #666; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">🚦</div>',
        iconSize: [25, 25],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12],
        className: 'custom-marker'
      });

      // Add user location marker
      if (showUserLocation && userLocation) {
        L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
          .bindPopup("👤 Your Location")
          .addTo(map);
      }

      // Add SOS vehicles (ambulances and police)
      sosVehicles?.forEach((vehicle) => {
        if (vehicle.lat && vehicle.lng) {
          const icon = vehicle.type === 'police' ? policeIcon : ambulanceIcon;
          L.marker([vehicle.lat, vehicle.lng], { icon })
            .bindPopup(`${vehicle.type === 'police' ? '🚓' : '🚑'} ${vehicle.id || "SOS Vehicle"}`)
            .addTo(map);
        }
      });

      // Add ambulance markers
      ambulances.forEach((ambulance) => {
        if (ambulance.lat && ambulance.lng) {
          L.marker([ambulance.lat, ambulance.lng], { icon: ambulanceIcon })
            .bindPopup(`🚑 ${ambulance.id || "Ambulance"} - ${ambulance.status || "Available"}`)
            .addTo(map);
        }
      });

      // Add delivery vehicle markers
      deliveryVehicles?.forEach((vehicle) => {
        if (vehicle.lat && vehicle.lng) {
          L.marker([vehicle.lat, vehicle.lng], { icon: deliveryIcon })
            .bindPopup(`📦 ${vehicle.id || "Delivery"} - ${vehicle.status || "In Transit"}`)
            .addTo(map);
        }
      });

      // Add traffic signal markers
      trafficSignals?.forEach((signal) => {
        if (signal.lat && signal.lng) {
          L.marker([signal.lat, signal.lng], { icon: trafficSignalIcon })
            .bindPopup(`🚦 ${signal.name || "Traffic Signal"} - ${signal.status || "Normal"}`)
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