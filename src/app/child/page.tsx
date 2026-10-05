"use client";

import React, { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { 
  ArrowLeft, MapPin, ShieldCheck, Phone, 
  HelpCircle, AlertOctagon, CheckCircle2, UserCheck 
} from "lucide-react";
import { AppProvider } from "@/store/AppContext";
import { vijayawadaCenter } from "@/lib/pravaahDashboardData";

// Leaflet Dynamic Imports (ssr: false to prevent Next.js hydration errors)
const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Circle = dynamic(() => import("react-leaflet").then((m) => m.Circle), { ssr: false });

function ChildPageContent() {
  const [status, setStatus] = useState<"safe" | "sos" | "help">("safe");
  const [gpsText, setGpsText] = useState("Vijayawada default location active");
  const [userPos, setUserPos] = useState<[number, number]>(vijayawadaCenter);

  // 1. High-Accuracy GPS Request
  const requestPreciseLocation = () => {
    if (!navigator.geolocation) {
      alert("GPS not available on this device. Staying on Vijayawada default.");
      return;
    }
    
    setGpsText("Requesting precise GPS...");
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos([pos.coords.latitude, pos.coords.longitude]);
        setGpsText(`Live GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        alert(`📍 Precise Location Found: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
      },
      (err) => {
        setGpsText("GPS denied - Vijayawada default");
        alert("GPS permission denied. Using Vijayawada default location.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // 2. Interactive SOS & Status Handlers
  const handleSos = () => {
    setStatus("sos");
    alert("🚨 EMERGENCY SOS SENT! Mom, Dad, and local authorities have been notified of your location.");
  };

  const handleSafe = () => {
    setStatus("safe");
    alert("✅ Marked as Safe! Mom and Dad have been updated.");
  };

  const handleHelp = () => {
    setStatus("help");
    alert("⚠️ 'I Need Help' alert sent to parents. They will call you shortly.");
  };

  return (
    <main className="min-h-screen overflow-y-auto pb-12 bg-[#0B0F19] text-white flex flex-col font-sans">
      {/* Header */}
      <header className="p-6 border-b border-white/5 bg-[#131826] flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 p-2 px-4 bg-white/5 hover:bg-white/10 rounded-xl transition text-sm font-bold text-gray-300">
            <ArrowLeft className="w-5 h-5" /> Back
          </Link>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-2xl shadow-inner">
            🧒
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Hi Ananya!</h1>
            <p className="text-xs text-purple-400 font-bold uppercase tracking-wider mt-0.5">Child Safety App · Pravaah 360</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-4 py-2 rounded-xl text-sm font-black shadow-lg transition-colors duration-300 ${
            status === "safe" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
            status === "sos" ? "bg-red-600 text-white border border-red-500 animate-pulse" :
            "bg-orange-500/20 text-orange-400 border border-orange-500/30"
          }`}>
            {status === "safe" ? "● Safe Zone Active" : status === "sos" ? "🚨 SOS ACTIVE" : "⚠️ Help Requested"}
          </span>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Actions (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-[#131826] border border-white/5 rounded-3xl p-5 shadow-xl">
            <p className="text-xs text-gray-400 font-bold tracking-wider uppercase mb-1">LOCATION STATUS</p>
            <p className="text-sm font-mono text-blue-300">{gpsText}</p>
          </div>

          {/* Huge SOS Button */}
          <div className="bg-[#131826] border border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-xl">
            <button
              onClick={handleSos}
              className={`w-48 h-48 rounded-full font-black text-5xl text-white shadow-2xl flex flex-col items-center justify-center gap-2 active:scale-95 transition-all duration-300 ${
                status === "sos" 
                  ? "bg-red-600 ring-[20px] ring-red-900/50 animate-pulse" 
                  : "bg-gradient-to-br from-red-500 to-rose-700 hover:from-red-600 hover:to-rose-800 shadow-[0_0_50px_rgba(239,68,68,0.4)] ring-[20px] ring-red-950/30"
              }`}
            >
              <AlertOctagon className="w-14 h-14" />
              <span>SOS</span>
            </button>
            <p className="text-sm font-medium text-red-200/70 mt-8">Tap once for Immediate Emergency Alert</p>
          </div>

          {/* Quick Action Grid */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={requestPreciseLocation}
              className="p-6 bg-[#102B4E] hover:bg-[#1A3B6E] border border-blue-500/30 rounded-3xl text-blue-300 font-bold text-sm flex flex-col items-center gap-3 transition-colors shadow-lg"
            >
              <div className="p-3 bg-blue-500/20 rounded-full"><MapPin className="w-6 h-6" /></div>
              <span>Where am I?</span>
            </button>

            <button
              onClick={() => alert("📍 Mom is currently at work (2.4 km away). Dad is at home (0.5 km away).")}
              className="p-6 bg-[#2D1B4E] hover:bg-[#3D2B5E] border border-purple-500/30 rounded-3xl text-purple-300 font-bold text-sm flex flex-col items-center gap-3 transition-colors shadow-lg"
            >
              <div className="p-3 bg-purple-500/20 rounded-full"><UserCheck className="w-6 h-6" /></div>
              <span>Where's Mom/Dad?</span>
            </button>

            <button
              onClick={handleSafe}
              className="p-6 bg-[#113A2B] hover:bg-[#1A4A3B] border border-emerald-500/30 rounded-3xl text-emerald-400 font-bold text-sm flex flex-col items-center gap-3 transition-colors shadow-lg"
            >
              <div className="p-3 bg-emerald-500/20 rounded-full"><CheckCircle2 className="w-6 h-6" /></div>
              <span>I'm Safe</span>
            </button>

            <button
              onClick={handleHelp}
              className="p-6 bg-[#4A2511] hover:bg-[#5A3521] border border-orange-500/30 rounded-3xl text-orange-400 font-bold text-sm flex flex-col items-center gap-3 transition-colors shadow-lg"
            >
              <div className="p-3 bg-orange-500/20 rounded-full"><HelpCircle className="w-6 h-6" /></div>
              <span>I Need Help</span>
            </button>
          </div>
        </div>

        {/* Center Map & Info (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-[#131826] border border-white/5 rounded-3xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-400" /> My Live Map
              </h3>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold">
                Safe Zone Active
              </span>
            </div>
            
            <div className="h-[480px] rounded-2xl overflow-hidden relative border border-white/5">
              <MapContainer center={userPos} zoom={14} style={{ height: "100%", width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {/* Geofence Safe Zone */}
                <Circle center={vijayawadaCenter} radius={800} pathOptions={{ color: "#10B981", fillColor: "#10B981", fillOpacity: 0.15 }} />
                {/* Child Location Dot */}
                <Circle center={userPos} radius={60} pathOptions={{ color: "#3B82F6", fillColor: "#3B82F6", fillOpacity: 0.9 }} />
              </MapContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-[#131826] rounded-3xl border border-white/5 shadow-xl">
              <h4 className="font-black text-white flex items-center gap-2 mb-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400" /> My Safe Place
              </h4>
              <p className="text-sm text-gray-400">Home Safe Zone · Vijayawada</p>
              <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <p className="text-sm text-emerald-400 font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Inside safe area
                </p>
              </div>
            </div>

            <div className="p-6 bg-[#131826] rounded-3xl border border-white/5 shadow-xl">
              <h4 className="font-black text-white flex items-center gap-2 mb-4">
                <Phone className="w-5 h-5 text-blue-400" /> My People
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between p-3 bg-[#1A2235] border border-white/5 rounded-xl">
                  <span className="font-bold flex items-center gap-2">👩 Mom</span>
                  <span className="text-blue-300 font-mono">+91 98765 41021</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#1A2235] border border-white/5 rounded-xl">
                  <span className="font-bold flex items-center gap-2">👨 Dad</span>
                  <span className="text-blue-300 font-mono">+91 98765 41022</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}

export default function ChildPage() {
  return (
    <AppProvider>
      <ChildPageContent />
    </AppProvider>
  );
}