"use client";

import dynamic from "next/dynamic";

const LiveMapInner = dynamic(() => import("./LiveMapInner"), { 
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[360px] w-full items-center justify-center bg-[#131826]">
      <p className="text-sm font-medium text-slate-400">Loading live map...</p>
    </div>
  )
});

interface LiveMapProps {
  junctions?: any[];
  ambulances?: any[];
  emergencies?: any[];
  hospitals?: any[];
  responseVehicles?: any[];
  trafficSignals?: any[];
  sosVehicles?: any[];
  userLocation?: { lat: number; lng: number };
  showUserLocation?: boolean;
  center?: [number, number];
  zoom?: number;
  showControls?: boolean;
  simulationActive?: boolean;
  onSimulationUpdate?: (data: any) => void;
  geofence?: { center: [number, number]; radius: number };
  parentLocation?: { lat: number; lng: number };
  childLocation?: { lat: number; lng: number };
  helpPoints?: any[];
}

export default function LiveMap(props: LiveMapProps) {
  return <LiveMapInner {...props} />;
}
