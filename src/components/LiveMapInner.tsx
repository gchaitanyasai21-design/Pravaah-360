"use client";

import { useCallback, useEffect, useRef } from "react";

interface LatLng {
  lat: number;
  lng: number;
}

interface MapMarker extends LatLng {
  id: string;
  label: string;
  emoji: string;
  color?: string;
  popup?: string;
  size?: number;
  pulse?: boolean;
}

interface MapCircle extends LatLng {
  id: string;
  radius: number;
  color?: string;
  fillColor?: string;
  label?: string;
}

interface MapLine {
  id: string;
  positions: LatLng[];
  color?: string;
  dashed?: boolean;
  weight?: number;
}

interface LiveMapProps {
  junctions?: any[];
  ambulances?: any[];
  emergencies?: any[];
  deliveryVehicles?: any[];
  trafficSignals?: any[];
  sosVehicles?: any[];
  hospitals?: any[];
  userLocation?: LatLng;
  showUserLocation?: boolean;
  center?: [number, number];
  zoom?: number;
  customMarkers?: MapMarker[];
  circles?: MapCircle[];
  polylines?: MapLine[];
  route?: [number, number][] | LatLng[] | null;
  movingAmbulance?: LatLng | null;
  pulseLocation?: LatLng | null;
  autoFitBounds?: boolean;
}

function markerHtml(emoji: string, color: string, size = 32, pulse = false) {
  const animation = pulse ? "animation:pulseMarker 1.4s infinite;" : "";
  return `
    <div style="
      background:${color};
      color:white;
      border-radius:9999px;
      width:${size}px;
      height:${size}px;
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:${Math.max(15, size * 0.52)}px;
      border:3px solid white;
      box-shadow:0 0 18px ${color}99;
      ${animation}
    ">${emoji}</div>
  `;
}

function signalColor(status?: string) {
  const normalized = String(status ?? "").toLowerCase();
  if (normalized.includes("green") || normalized.includes("normal")) return "#22c55e";
  if (normalized.includes("yellow") || normalized.includes("busy")) return "#eab308";
  return "#ef4444";
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
  center = [16.5062, 80.648],
  zoom = 13,
  customMarkers = [],
  circles = [],
  polylines = [],
  route = null,
  movingAmbulance = null,
  pulseLocation = null,
  autoFitBounds = false,
}: LiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const isInitializedRef = useRef(false);

  const renderAllMarkers = useCallback(
    (L: any, map: any) => {
      if (!markersLayerRef.current) return;

      markersLayerRef.current.clearLayers();
      const boundsPoints: Array<[number, number]> = [];
      const addBounds = (lat?: number, lng?: number) => {
        if (typeof lat === "number" && typeof lng === "number") boundsPoints.push([lat, lng]);
      };

      const divIcon = (emoji: string, color: string, size = 32, pulse = false) =>
        L.divIcon({
          html: markerHtml(emoji, color, size, pulse),
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
          className: "custom-marker",
        });

      if (showUserLocation && userLocation) {
        L.marker([userLocation.lat, userLocation.lng], { icon: divIcon("👤", "#22c55e", 32, true) })
          .bindPopup("<b>Your Live Location</b>")
          .addTo(markersLayerRef.current);
        L.circle([userLocation.lat, userLocation.lng], {
          radius: 180,
          color: "#22c55e",
          fillColor: "#22c55e",
          fillOpacity: 0.1,
          weight: 2,
        }).addTo(markersLayerRef.current);
        addBounds(userLocation.lat, userLocation.lng);
      }

      if (pulseLocation) {
        L.marker([pulseLocation.lat, pulseLocation.lng], { icon: divIcon("📍", "#22c55e", 36, true) })
          .bindPopup("<b>Emergency Location</b>")
          .addTo(markersLayerRef.current);
        addBounds(pulseLocation.lat, pulseLocation.lng);
      }

      if (movingAmbulance) {
        L.marker([movingAmbulance.lat, movingAmbulance.lng], { icon: divIcon("🚑", "#ef4444", 38, true) })
          .bindPopup("<b>Moving Ambulance</b>")
          .addTo(markersLayerRef.current);
        addBounds(movingAmbulance.lat, movingAmbulance.lng);
      }

      customMarkers.forEach((marker) => {
        L.marker([marker.lat, marker.lng], {
          icon: divIcon(marker.emoji, marker.color ?? "#3b82f6", marker.size ?? 34, marker.pulse),
        })
          .bindPopup(marker.popup ?? `<b>${marker.label}</b>`)
          .addTo(markersLayerRef.current);
        addBounds(marker.lat, marker.lng);
      });

      circles.forEach((circle) => {
        L.circle([circle.lat, circle.lng], {
          radius: circle.radius,
          color: circle.color ?? "#22c55e",
          fillColor: circle.fillColor ?? circle.color ?? "#22c55e",
          fillOpacity: 0.12,
          weight: 2,
        })
          .bindPopup(circle.label ?? "Zone")
          .addTo(markersLayerRef.current);
        addBounds(circle.lat, circle.lng);
      });

      const routePositions = route?.map((point) =>
        Array.isArray(point) ? point : ([point.lat, point.lng] as [number, number])
      );
      if (routePositions && routePositions.length > 1) {
        L.polyline(routePositions, { color: "#ef4444", weight: 5, opacity: 0.85 }).addTo(markersLayerRef.current);
        routePositions.forEach(([lat, lng]) => addBounds(lat, lng));
      }

      polylines.forEach((line) => {
        const positions = line.positions.map((point) => [point.lat, point.lng]);
        L.polyline(positions, {
          color: line.color ?? "#3b82f6",
          weight: line.weight ?? 4,
          opacity: 0.85,
          dashArray: line.dashed ? "8 10" : undefined,
        }).addTo(markersLayerRef.current);
        line.positions.forEach((point) => addBounds(point.lat, point.lng));
      });

      sosVehicles.forEach((vehicle) => {
        if (vehicle.lat && vehicle.lng) {
          const isPolice = vehicle.type === "police";
          L.marker([vehicle.lat, vehicle.lng], {
            icon: divIcon(isPolice ? "🚓" : "🚒", isPolice ? "#3b82f6" : "#ef4444", 32),
          })
            .bindPopup(`<b>${vehicle.id ?? "SOS Unit"}</b><br/>${vehicle.type ?? "response"}`)
            .addTo(markersLayerRef.current);
          addBounds(vehicle.lat, vehicle.lng);
        }
      });

      ambulances.forEach((ambulance) => {
        if (ambulance.lat && ambulance.lng) {
          const status = String(ambulance.status ?? "Available").toLowerCase();
          const color = status.includes("available") ? "#22c55e" : status.includes("busy") ? "#eab308" : "#ef4444";
          L.marker([ambulance.lat, ambulance.lng], { icon: divIcon("🚑", color, 34, status.includes("route")) })
            .bindPopup(`<b>${ambulance.id ?? ambulance.vehicleNumber ?? "Ambulance"}</b><br/>Status: ${ambulance.status ?? "Available"}`)
            .addTo(markersLayerRef.current);
          addBounds(ambulance.lat, ambulance.lng);
        }
      });

      deliveryVehicles.forEach((vehicle) => {
        if (vehicle.lat && vehicle.lng) {
          L.marker([vehicle.lat, vehicle.lng], { icon: divIcon(vehicle.emoji ?? "📦", "#f59e0b", 32) })
            .bindPopup(`<b>${vehicle.id ?? "Delivery"}</b><br/>Status: ${vehicle.status ?? "In Transit"}`)
            .addTo(markersLayerRef.current);
          addBounds(vehicle.lat, vehicle.lng);
        }
      });

      trafficSignals.forEach((signal) => {
        if (signal.lat && signal.lng) {
          const color = signalColor(signal.status ?? signal.state);
          L.marker([signal.lat, signal.lng], { icon: divIcon("🚦", color, 30) })
            .bindPopup(`<b>${signal.name}</b><br/>Status: ${signal.status ?? signal.state ?? "Normal"}`)
            .addTo(markersLayerRef.current);
          addBounds(signal.lat, signal.lng);
        }
      });

      hospitals.forEach((hospital) => {
        if (hospital.lat && hospital.lng) {
          L.marker([hospital.lat, hospital.lng], { icon: divIcon("🏥", "#2563eb", 36) })
            .bindPopup(
              `<b>${hospital.name}</b><br/>${hospital.type ? `Type: ${hospital.type}<br/>` : ""}${hospital.availableBeds ? `Beds: ${hospital.availableBeds}<br/>` : ""}Status: ${hospital.status ?? "Available"}`
            )
            .addTo(markersLayerRef.current);
          addBounds(hospital.lat, hospital.lng);
        }
      });

      emergencies.forEach((emergency) => {
        const lat = emergency.pickupLat ?? emergency.lat;
        const lng = emergency.pickupLng ?? emergency.lng;
        if (lat && lng) {
          L.marker([lat, lng], { icon: divIcon("🆘", "#dc2626", 34, true) })
            .bindPopup(`<b>${emergency.patientName ?? emergency.userName ?? "Emergency"}</b><br/>${emergency.type ?? "SOS"}`)
            .addTo(markersLayerRef.current);
          addBounds(lat, lng);
        }
      });

      junctions.forEach((junction) => {
        if (junction.lat && junction.lng) {
          L.marker([junction.lat, junction.lng], { icon: divIcon("●", "#64748b", 18) })
            .bindPopup(`<b>${junction.name ?? "Junction"}</b>`)
            .addTo(markersLayerRef.current);
          addBounds(junction.lat, junction.lng);
        }
      });

      if (autoFitBounds && boundsPoints.length > 1) {
        map.fitBounds(L.latLngBounds(boundsPoints), { padding: [40, 40], maxZoom: 15 });
      }
    },
    [
      ambulances,
      autoFitBounds,
      circles,
      customMarkers,
      deliveryVehicles,
      emergencies,
      hospitals,
      junctions,
      movingAmbulance,
      polylines,
      pulseLocation,
      route,
      showUserLocation,
      sosVehicles,
      trafficSignals,
      userLocation,
    ]
  );

  useEffect(() => {
    if (isInitializedRef.current || !mapRef.current || (mapRef.current as any)._leaflet_id) return;
    isInitializedRef.current = true;

    const initMap = async () => {
      try {
        const L = (await import("leaflet")).default;
        await import("leaflet/dist/leaflet.css");

        if (!mapRef.current) return;
        const style = document.createElement("style");
        style.innerHTML = "@keyframes pulseMarker{0%,100%{transform:scale(1)}50%{transform:scale(1.18)}}";
        document.head.appendChild(style);

        const map = L.map(mapRef.current, { zoomControl: true, attributionControl: true }).setView(center, zoom);
        mapInstanceRef.current = map;
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap",
        }).addTo(map);
        markersLayerRef.current = L.layerGroup().addTo(map);
        renderAllMarkers(L, map);
      } catch (error) {
        console.error("Map init error:", error);
      }
    };

    void initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
        isInitializedRef.current = false;
      }
    };
  }, [center, renderAllMarkers, zoom]);

  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    const updateMarkers = async () => {
      const L = (await import("leaflet")).default;
      renderAllMarkers(L, mapInstanceRef.current);
    };

    void updateMarkers();
  }, [renderAllMarkers]);

  return <div ref={mapRef} className="h-full min-h-[400px] w-full" style={{ zIndex: 0 }} />;
}
