"use client";

import dynamic from "next/dynamic";

const AppContent = dynamic(() => import("./app-content"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-800 mb-2">
          PRAVAH + LifeLane
        </div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  ),
});

export default function HomePage() {
  return <AppContent />;
}
