// PRAVAH + LifeLane - Main Application Entry
// Multi-Service Smart City Platform

"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";

const AppContent = dynamic(() => import("./app-content"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-white text-xl">Loading Platform...</div>
    </div>
  ),
});

export default function HomePage() {
  const searchParams = useSearchParams();
  const service = searchParams.get("service") || "emergency";

  // If no service selected, redirect to login
  if (!searchParams.has("service")) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">PRAVAH + LifeLane</h1>
          <p className="text-gray-300 mb-8">Multi-Service Smart City Platform</p>
          <a 
            href="/login" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            Get Started
          </a>
        </div>
      </div>
    );
  }

  return <AppContent />;
}
