"use client";

import { useEffect, useRef, memo } from "react";

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

function markerHtml(
  emoji: string,
  color: string,
  size = 32,
  pulse = false
) {
  const animation = pulse
    ? "animation:pulseMarker 1.4s infinite;"
    : "";
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
  const s = String(status ?? "").toLowerCase();
  if (s.includes("green") || s.includes("normal")) 
    return "#22c55e";
  if (s.includes("yellow") || s.includes("busy"))  
    return "#eab308";
  return "#ef4444";
}

// ✅ Use ref to store latest props
// This avoids re-running useEffect on prop changes
function LiveMapInner({
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
  const LRef = useRef<any>(null);
  const isInitializedRef = useRef(false);

  // ✅ Store ALL props in a ref
  // So marker updates don't cause map reinit
  const propsRef = useRef({
    junctions,
    ambulances,
    emergencies,
    deliveryVehicles,
    trafficSignals,
    sosVehicles,
    hospitals,
    userLocation,
    showUserLocation,
    customMarkers,
    circles,
    polylines,
    route,
    movingAmbulance,
    pulseLocation,
    autoFitBounds,
  });

  // ✅ Always update ref with latest props
  // Without triggering re-render
  propsRef.current = {
    junctions,
    ambulances,
    emergencies,
    deliveryVehicles,
    trafficSignals,
    sosVehicles,
    hospitals,
    userLocation,
    showUserLocation,
    customMarkers,
    circles,
    polylines,
    route,
    movingAmbulance,
    pulseLocation,
    autoFitBounds,
  };

  // ✅ Render markers using ref (no deps needed)
  const renderMarkers = () => {
    const L = LRef.current;
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;

    if (!L || !map || !layer) return;

    layer.clearLayers();

    const p = propsRef.current;
    const boundsPoints: Array<[number, number]> = [];

    const addBounds = (lat?: number, lng?: number) => {
      if (
        typeof lat === "number" && 
        typeof lng === "number"
      ) {
        boundsPoints.push([lat, lng]);
      }
    };

    const divIcon = (
      emoji: string,
      color: string,
      size = 32,
      pulse = false
    ) =>
      L.divIcon({
        html: markerHtml(emoji, color, size, pulse),
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        className: "custom-marker",
      });

    // User location
    if (p.showUserLocation && p.userLocation) {
      L.marker(
        [p.userLocation.lat, p.userLocation.lng],
        { icon: divIcon("👤", "#22c55e", 32, true) }
      )
        .bindPopup("<b>Your Live Location</b>")
        .addTo(layer);

      L.circle(
        [p.userLocation.lat, p.userLocation.lng],
        {
          radius: 180,
          color: "#22c55e",
          fillColor: "#22c55e",
          fillOpacity: 0.1,
          weight: 2,
        }
      ).addTo(layer);

      addBounds(p.userLocation.lat, p.userLocation.lng);
    }

    // Pulse location
    if (p.pulseLocation) {
      L.marker(
        [p.pulseLocation.lat, p.pulseLocation.lng],
        { icon: divIcon("📍", "#22c55e", 36, true) }
      )
        .bindPopup("<b>Emergency Location</b>")
        .addTo(layer);
      addBounds(p.pulseLocation.lat, p.pulseLocation.lng);
    }

    // Moving ambulance
    if (p.movingAmbulance) {
      L.marker(
        [p.movingAmbulance.lat, p.movingAmbulance.lng],
        { icon: divIcon("🚑", "#ef4444", 38, true) }
      )
        .bindPopup("<b>Moving Ambulance</b>")
        .addTo(layer);
      addBounds(
        p.movingAmbulance.lat, 
        p.movingAmbulance.lng
      );
    }

    // Custom markers
    p.customMarkers.forEach((marker) => {
      L.marker([marker.lat, marker.lng], {
        icon: divIcon(
          marker.emoji,
          marker.color ?? "#3b82f6",
          marker.size ?? 34,
          marker.pulse
        ),
      })
        .bindPopup(marker.popup ?? `<b>${marker.label}</b>`)
        .addTo(layer);
      addBounds(marker.lat, marker.lng);
    });

    // Circles
    p.circles.forEach((circle) => {
      L.circle([circle.lat, circle.lng], {
        radius: circle.radius,
        color: circle.color ?? "#22c55e",
        fillColor: circle.fillColor ?? "#22c55e",
        fillOpacity: 0.12,
        weight: 2,
      })
        .bindPopup(circle.label ?? "Zone")
        .addTo(layer);
      addBounds(circle.lat, circle.lng);
    });

    // Route
    const routePositions = p.route?.map((point) =>
      Array.isArray(point)
        ? point
        : ([point.lat, point.lng] as [number, number])
    );
    if (routePositions && routePositions.length > 1) {
      L.polyline(routePositions, {
        color: "#ef4444",
        weight: 5,
        opacity: 0.85,
      }).addTo(layer);
      routePositions.forEach(([lat, lng]) => 
        addBounds(lat, lng)
      );
    }

    // Polylines
    p.polylines.forEach((line) => {
      L.polyline(
        line.positions.map((pt) => [pt.lat, pt.lng]),
        {
          color: line.color ?? "#3b82f6",
          weight: line.weight ?? 4,
          opacity: 0.85,
          dashArray: line.dashed ? "8 10" : undefined,
        }
      ).addTo(layer);
      line.positions.forEach((pt) => 
        addBounds(pt.lat, pt.lng)
      );
    });

    // SOS vehicles
    p.sosVehicles.forEach((vehicle) => {
      if (!vehicle.lat || !vehicle.lng) return;
      const isPolice = vehicle.type === "police";
      L.marker([vehicle.lat, vehicle.lng], {
        icon: divIcon(
          isPolice ? "🚓" : "🚒",
          isPolice ? "#3b82f6" : "#ef4444",
          32
        ),
      })
        .bindPopup(
          `<b>${vehicle.id ?? "SOS Unit"}</b>
           <br/>${vehicle.type ?? "response"}`
        )
        .addTo(layer);
      addBounds(vehicle.lat, vehicle.lng);
    });

    // Ambulances
    p.ambulances.forEach((amb) => {
      if (!amb.lat || !amb.lng) return;
      const status = String(amb.status ?? "").toLowerCase();
      const color = status.includes("available")
        ? "#22c55e"
        : status.includes("busy")
        ? "#eab308"
        : "#ef4444";
      L.marker([amb.lat, amb.lng], {
        icon: divIcon(
          "🚑", color, 34,
          status.includes("route")
        ),
      })
        .bindPopup(
          `<b>${amb.id ?? amb.vehicleNumber ?? "Ambulance"}</b>
           <br/>Status: ${amb.status ?? "Available"}`
        )
        .addTo(layer);
      addBounds(amb.lat, amb.lng);
    });

    // Delivery vehicles
    p.deliveryVehicles.forEach((vehicle) => {
      if (!vehicle.lat || !vehicle.lng) return;
      L.marker([vehicle.lat, vehicle.lng], {
        icon: divIcon(
          vehicle.emoji ?? "📦", 
          "#f59e0b", 32
        ),
      })
        .bindPopup(
          `<b>${vehicle.id ?? "Delivery"}</b>
           <br/>Status: ${vehicle.status ?? "In Transit"}`
        )
        .addTo(layer);
      addBounds(vehicle.lat, vehicle.lng);
    });

    // Traffic signals
    p.trafficSignals.forEach((signal) => {
      if (!signal.lat || !signal.lng) return;
      const color = signalColor(
        signal.status ?? signal.state
      );
      L.marker([signal.lat, signal.lng], {
        icon: divIcon("🚦", color, 30),
      })
        .bindPopup(
          `<b>${signal.name}</b>
           <br/>Status: ${signal.status ?? "Normal"}`
        )
        .addTo(layer);
      addBounds(signal.lat, signal.lng);
    });

    // Hospitals
    p.hospitals.forEach((hospital) => {
      if (!hospital.lat || !hospital.lng) return;
      L.marker([hospital.lat, hospital.lng], {
        icon: divIcon("🏥", "#2563eb", 36),
      })
        .bindPopup(
          `<b>${hospital.name}</b>
           <br/>Status: ${hospital.status ?? "Available"}`
        )
        .addTo(layer);
      addBounds(hospital.lat, hospital.lng);
    });

    // Emergencies
    p.emergencies.forEach((emergency) => {
      const lat = emergency.pickupLat ?? emergency.lat;
      const lng = emergency.pickupLng ?? emergency.lng;
      if (!lat || !lng) return;
      L.marker([lat, lng], {
        icon: divIcon("🆘", "#dc2626", 34, true),
      })
        .bindPopup(
          `<b>${
            emergency.patientName ?? 
            emergency.userName ?? 
            "Emergency"
          }</b>
           <br/>${emergency.type ?? "SOS"}`
        )
        .addTo(layer);
      addBounds(lat, lng);
    });

    // Junctions
    p.junctions.forEach((junction) => {
      if (!junction.lat || !junction.lng) return;
      L.marker([junction.lat, junction.lng], {
        icon: divIcon("●", "#64748b", 18),
      })
        .bindPopup(`<b>${junction.name ?? "Junction"}</b>`)
        .addTo(layer);
      addBounds(junction.lat, junction.lng);
    });

    // Auto fit bounds
    if (p.autoFitBounds && boundsPoints.length > 1) {
      map.fitBounds(
        L.latLngBounds(boundsPoints),
        { padding: [40, 40], maxZoom: 15 }
      );
    }
  };

  // ✅ Map init - runs ONCE only
  // center and zoom NOT in deps array
  useEffect(() => {
    if (
      isInitializedRef.current || 
      !mapRef.current || 
      (mapRef.current as any)._leaflet_id
    ) return;

    isInitializedRef.current = true;

    const initMap = async () => {
      try {
        const L = (await import("leaflet")).default;
        await import("leaflet/dist/leaflet.css");

        if (!mapRef.current) return;

        // Pulse animation style
        const style = document.createElement("style");
        style.innerHTML = `
          @keyframes pulseMarker {
            0%,100% { transform: scale(1); }
            50%      { transform: scale(1.18); }
          }
        `;
        document.head.appendChild(style);

        LRef.current = L;

        const map = L.map(mapRef.current, {
          zoomControl: true,
          attributionControl: true,
        }).setView(center, zoom);

        mapInstanceRef.current = map;

        L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          { attribution: "© OpenStreetMap" }
        ).addTo(map);

        markersLayerRef.current = L.layerGroup().addTo(map);

        // Initial marker render
        renderMarkers();

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
        LRef.current = null;
        isInitializedRef.current = false;
      }
    };
  }, []); // ✅ Empty deps = init ONCE, no blink!

  // ✅ Update markers when props change
  // WITHOUT reinitializing the map
  useEffect(() => {
    renderMarkers();
  }, [
    ambulances,
    emergencies,
    hospitals,
    junctions,
    trafficSignals,
    sosVehicles,
    deliveryVehicles,
    customMarkers,
    circles,
    polylines,
    route,
    movingAmbulance,
    pulseLocation,
    userLocation,
    showUserLocation,
    autoFitBounds,
  ]);

  return (
    <div
      ref={mapRef}
      className="h-full min-h-[400px] w-full"
      style={{ zIndex: 0 }}
    />
  );
}

// ✅ memo prevents re-render if props unchanged
export default memo(LiveMapInner);