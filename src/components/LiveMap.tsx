"use client";

import dynamic from "next/dynamic";

const LiveMapInner = dynamic(() => import("./LiveMapInner"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <p className="text-gray-500">Loading map...</p>
    </div>
  )
});

interface LiveMapProps {
  junctions?: any[];
  ambulances?: any[];
  emergencies?: any[];
  center?: [number, number];
  zoom?: number;
}

export default function LiveMap(props: LiveMapProps) {
  return <LiveMapInner {...props} />;
}