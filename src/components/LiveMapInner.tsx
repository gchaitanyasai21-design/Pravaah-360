"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default Leaflet icon paths (removes 404 errors)
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function LiveMapInner({
  ambulances = [],
  trafficSignals = [],
  hospitals = [],
  sosVehicles = [],
  deliveryVehicles = [],
  emergencies = [],
  center,
  zoom,
}: {
  ambulances?: any[];
  trafficSignals?: any[];
  hospitals?: any[];
  sosVehicles?: any[];
  deliveryVehicles?: any[];
  emergencies?: any[];
  center: [number, number];
  zoom: number;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // 1. Initialize the Map
  useEffect(() => {
    if (!mapRef.current) return;

    // Destroy any old map instance
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch (e) {}
      mapInstanceRef.current = null;
    }

    // Extra safety: clear any leftover Leaflet data
    if ((mapRef.current as any)._leaflet_id) {
      delete (mapRef.current as any)._leaflet_id;
      mapRef.current.innerHTML = "";
    }

    try {
      const map = L.map(mapRef.current).setView(center, zoom);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);
    } catch (e) {
      console.log("Map init skipped:", e);
    }

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {}
        mapInstanceRef.current = null;
      }
    };
  }, [center, zoom]);

  // 2. Add / Update Markers (crash-proof)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    const timer = setTimeout(() => {
      try {
        // Clear old markers
        map.eachLayer((layer) => {
          if (!(layer instanceof L.TileLayer)) {
            try {
              map.removeLayer(layer);
            } catch (e) {}
          }
        });

        // Hospitals
        hospitals?.forEach((h) => {
          try {
            L.marker([h.lat, h.lng]).addTo(map).bindPopup(h.name);
          } catch (e) {}
        });

        // Ambulances
        ambulances?.forEach((a) => {
          try {
            L.circleMarker([a.lat, a.lng], {
              radius: 6,
              fillColor: "blue",
              color: "white",
              fillOpacity: 1,
            })
              .addTo(map)
              .bindPopup(a.id);
          } catch (e) {}
        });

        // Police / SOS
        sosVehicles?.forEach((v) => {
          try {
            L.marker([v.lat, v.lng]).addTo(map).bindPopup(v.id);
          } catch (e) {}
        });

        // Delivery
        deliveryVehicles?.forEach((d) => {
          try {
            L.circleMarker([d.lat, d.lng], {
              radius: 6,
              fillColor: "orange",
              color: "white",
              fillOpacity: 1,
            })
              .addTo(map)
              .bindPopup(d.id);
          } catch (e) {}
        });

        // Emergencies
        emergencies?.forEach((e) => {
          try {
            L.marker([e.lat, e.lng]).addTo(map).bindPopup(e.type);
          } catch (err) {}
        });

        // 🚦 Traffic Signals (LIVE COLOR)
        trafficSignals?.forEach((ts) => {
          try {
            const color =
              ts.status === "GREEN"
                ? "#22c55e"
                : ts.status === "YELLOW"
                ? "#facc15"
                : "#ef4444";

            L.circleMarker([ts.lat, ts.lng], {
              radius: 10,
              fillColor: color,
              color: "#fff",
              weight: 2,
              fillOpacity: 1,
            })
              .bindPopup(`<b>${ts.name}</b><br/>Status: <b>${ts.status}</b>`)
              .addTo(map);
          } catch (e) {}
        });
      } catch (e) {
        console.log("Marker update skipped:", e);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [
    trafficSignals,
    hospitals,
    ambulances,
    sosVehicles,
    deliveryVehicles,
    emergencies,
  ]);

  return <div ref={mapRef} style={{ height: "100%", width: "100%" }} />;
}