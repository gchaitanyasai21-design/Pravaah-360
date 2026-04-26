// PRAVAH + LifeLane - Simple Map Component
// Basic map without Leaflet to avoid SSR issues

"use client";

import { useState, useEffect } from "react";

interface LiveMapProps {
  ambulances?: any[];
  emergencies?: any[];
  hospitals?: any[];
  junctions?: any[];
  center?: [number, number];
  zoom?: number;
  showControls?: boolean;
}

export default function LiveMap({
  ambulances = [],
  emergencies = [],
  hospitals = [],
  junctions = [],
  center = [28.6139, 77.2090],
  zoom = 12,
  showControls = false,
}: LiveMapProps) {
  const [mapUrl, setMapUrl] = useState("");

  // Generate OpenStreetMap URL
  useEffect(() => {
    const markers: string[] = [];
    
    // Add markers for each item
    [...ambulances, ...emergencies, ...hospitals, ...junctions].forEach((item, index) => {
      const lat = typeof item.lat === 'string' ? parseFloat(item.lat) : item.lat;
      const lng = typeof item.lng === 'string' ? parseFloat(item.lng) : item.lng;
      if (lat && lng) {
        markers.push(`${lat},${lng}`);
      }
    });

    const baseUrl = "https://www.openstreetmap.org/export";
    const params = new URLSearchParams({
      format: "png",
      layers: "mapnik",
      scale: "1",
      lat: center[0].toString(),
      lon: center[1].toString(),
      zoom: zoom.toString(),
      width: "800",
      height: "600",
      markers: markers.join("|")
    });

    setMapUrl(`${baseUrl}?${params.toString()}`);
  }, [ambulances, emergencies, hospitals, junctions, center, zoom]);

  return (
    <div className="w-full h-full bg-gray-200 flex flex-col">
      <div className="flex-1 relative">
        {mapUrl ? (
          <img
            src={mapUrl}
            alt="Map"
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to static map
              e.currentTarget.src = `https://picsum.photos/seed/map-${Date.now()}/800/600.jpg`;
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-300 flex items-center justify-center">
            <div className="text-gray-600">Loading map...</div>
          </div>
        )}
        
        {/* Simple marker overlays */}
        <div className="absolute inset-0 pointer-events-none">
          {ambulances.map((ambulance) => {
            const lat = typeof ambulance.lat === 'string' ? parseFloat(ambulance.lat) : ambulance.lat;
            const lng = typeof ambulance.lng === 'string' ? parseFloat(ambulance.lng) : ambulance.lng;
            if (!lat || !lng) return null;

            // Simple positioning (this is approximate)
            const x = ((lng - center[1]) / 0.01) * 50 + 400; // Rough conversion
            const y = ((center[0] - lat) / 0.01) * 50 + 300; // Rough conversion

            return (
              <div
                key={ambulance.id}
                className="absolute w-4 h-4 bg-red-600 rounded-full border-2 border-white shadow-lg"
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  transform: 'translate(-50%, -50%)'
                }}
                title={ambulance.name}
              />
            );
          })}

          {emergencies.map((emergency) => {
            const lat = typeof emergency.pickupLat === 'string' ? parseFloat(emergency.pickupLat) : emergency.pickupLat;
            const lng = typeof emergency.pickupLng === 'string' ? parseFloat(emergency.pickupLng) : emergency.pickupLng;
            if (!lat || !lng) return null;

            const x = ((lng - center[1]) / 0.01) * 50 + 400;
            const y = ((center[0] - lat) / 0.01) * 50 + 300;

            return (
              <div
                key={emergency.id}
                className="absolute w-6 h-6 bg-orange-600 rounded-full border-2 border-white shadow-lg animate-pulse"
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  transform: 'translate(-50%, -50%)'
                }}
                title={emergency.patientName}
              />
            );
          })}
        </div>
      </div>

      {showControls && (
        <div className="p-4 bg-white border-t">
          <div className="text-sm text-gray-600">
            <div>Ambulances: {ambulances.length}</div>
            <div>Emergencies: {emergencies.length}</div>
            <div>Hospitals: {hospitals.length}</div>
            <div>Junctions: {junctions.length}</div>
          </div>
        </div>
      )}
    </div>
  );
}
