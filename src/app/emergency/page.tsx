"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import {
  Phone, MapPin, User, Heart, Shield, Flame,
  AlertTriangle, Clock, Navigation, Zap
} from "lucide-react";

const LiveMap = dynamic(() => import("@/components/LiveMap"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "600px", width: "100%" }} className="flex items-center justify-center text-white/60">
      Loading map...
    </div>
  ),
});

// ===== STATIC DATA =====
const HOSPITALS = [
  { id: "H1", name: "AIIMS Delhi", lat: 28.5672, lng: 77.2100 },
  { id: "H2", name: "Safdarjung Hospital", lat: 28.5688, lng: 77.2064 },
  { id: "H3", name: "RML Hospital", lat: 28.6250, lng: 77.2050 },
];

const AMBULANCES = [
  { id: "AMB-01", lat: 28.6300, lng: 77.2200 },
  { id: "AMB-02", lat: 28.6100, lng: 77.2300 },
  { id: "AMB-03", lat: 28.6500, lng: 77.1950 },
];

const TRAFFIC_SIGNALS = [
  { name: "Connaught Place", lat: 28.6260, lng: 77.2100, status: "RED" },
  { name: "India Gate", lat: 28.6120, lng: 77.2290, status: "YELLOW" },
  { name: "Karol Bagh", lat: 28.6580, lng: 77.1920, status: "GREEN" },
  { name: "Rajiv Chowk", lat: 28.6350, lng: 77.2080, status: "RED" },
];

// Patient (user) location
const PATIENT = { lat: 28.6280, lng: 77.2180 };

export default function EmergencyPage() {
  const [sosState, setSosState] = useState<"IDLE" | "COUNTDOWN" | "EN_ROUTE" | "ARRIVED">("IDLE");
  const [countdown, setCountdown] = useState(0);
  const [movingAmb, setMovingAmb] = useState<{ lat: number; lng: number } | null>(null);
  const [route, setRoute] = useState<[number, number][] | null>(null);
  const animRef = useRef<NodeJS.Timeout | null>(null);

  // Handle SOS Button Press
  const handleSOS = () => {
    if (sosState !== "IDLE") return;
    setSosState("COUNTDOWN");
    setCountdown(3);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          startAmbulanceDispatch();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Start Ambulance Animation
  const startAmbulanceDispatch = () => {
    setSosState("EN_ROUTE");
    setRoute([[AMBULANCES[0].lat, AMBULANCES[0].lng], [PATIENT.lat, PATIENT.lng]]);
    setMovingAmb({ lat: AMBULANCES[0].lat, lng: AMBULANCES[0].lng });

    // Activate Green Corridor
    const updatedSignals = TRAFFIC_SIGNALS.map(signal => ({
      ...signal,
      status: "GREEN"
    }));

    // Animate ambulance movement (60 steps)
    let step = 0;
    const totalSteps = 60;
    const dLat = (PATIENT.lat - AMBULANCES[0].lat) / totalSteps;
    const dLng = (PATIENT.lng - AMBULANCES[0].lng) / totalSteps;

    animRef.current = setInterval(() => {
      step++;
      if (step >= totalSteps) {
        clearInterval(animRef.current!);
        setMovingAmb({ lat: PATIENT.lat, lng: PATIENT.lng });
        setSosState("ARRIVED");
        return;
      }
      setMovingAmb({
        lat: AMBULANCES[0].lat + dLat * step,
        lng: AMBULANCES[0].lng + dLng * step,
      });
    }, 50);
  };

  const cancelSOS = () => {
    if (animRef.current) clearInterval(animRef.current);
    setSosState("IDLE");
    setCountdown(0);
    setMovingAmb(null);
    setRoute(null);
  };

  useEffect(() => {
    return () => {
      if (animRef.current) clearInterval(animRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen liquid-bg text-white">
      {/* Header */}
      <header className="glass-dark sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center glow-red">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">LifeLane</h1>
            <p className="text-xs text-white/60">Emergency Response</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {sosState !== "IDLE" && (
            <div className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 border border-green-500/50 text-green-300 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5" /> GREEN CORRIDOR ACTIVE
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-white/70">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Connected
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN */}
        <section className="lg:col-span-1 space-y-6">
          {/* SOS Button Card */}
          <div className="glass p-8 flex flex-col items-center text-center">
            <h2 className="text-lg font-semibold mb-2">Emergency SOS</h2>
            <p className="text-sm text-white/60 mb-8">Tap to dispatch nearest ambulance</p>

            <button
              onClick={handleSOS}
              disabled={sosState !== "IDLE"}
              className={`relative w-48 h-48 rounded-full font-bold text-2xl tracking-widest transition-all duration-300 ${
                sosState !== "IDLE"
                  ? "bg-gradient-to-br from-red-700 to-red-900 scale-95 border-2 border-red-500/50"
                  : "bg-gradient-to-br from-red-500 to-red-700 hover:scale-105 active:scale-95 glow-red"
              }`}
            >
              {sosState === "COUNTDOWN" ? (
                <div className="flex flex-col items-center">
                  <span className="text-5xl font-black">{countdown}</span>
                  <span className="text-xs mt-2 font-normal opacity-80">DISPATCHING...</span>
                </div>
              ) : sosState !== "IDLE" ? (
                <div className="flex flex-col items-center">
                  <span className="text-4xl">🚑</span>
                  <span className="text-xs mt-2 font-bold text-red-200">
                    {sosState === "EN_ROUTE" && "EN ROUTE"}
                    {sosState === "ARRIVED" && "ARRIVED"}
                  </span>
                </div>
              ) : (
                <>
                  <span className="absolute inset-0 rounded-full bg-red-500/40 animate-ping" />
                  <span className="relative">SOS</span>
                </>
              )}
            </button>

            {sosState !== "IDLE" && (
              <button
                onClick={cancelSOS}
                className="mt-6 px-6 py-2 rounded-full text-sm border border-white/20 hover:bg-white/10 transition"
              >
                Cancel Request
              </button>
            )}
          </div>

          {/* Quick Actions */}
          <div className="glass p-6">
            <h3 className="text-sm font-semibold text-white/80 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-3 gap-3">
              <QuickAction icon={Heart} label="Medical" color="from-red-500 to-pink-600" />
              <QuickAction icon={Shield} label="Police" color="from-blue-500 to-indigo-600" />
              <QuickAction icon={Flame} label="Fire" color="from-orange-500 to-red-600" />
            </div>
          </div>

          {/* User Profile */}
          <div className="glass p-6">
            <h3 className="text-sm font-semibold text-white/80 mb-4">Your Profile</h3>
            <div className="space-y-3 text-sm">
              <InfoRow icon={User} label="Name" value="Chaitanya Sai" />
              <InfoRow icon={Phone} label="Phone" value="+91 98XXX XXXXX" />
              <InfoRow icon={MapPin} label="Location" value="New Delhi, India" />
              <InfoRow icon={Heart} label="Blood Group" value="O+" />
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN - MAP */}
        <section className="lg:col-span-2 space-y-6">
          <div className="glass relative overflow-hidden rounded-[20px]">
            <div className="absolute top-4 left-4 z-[1000] glass px-4 py-2 flex items-center gap-2 text-xs pointer-events-none">
              <Navigation className="w-4 h-4 text-emerald-400" />
              Live Map
            </div>
            <div style={{ height: "600px", width: "100%" }}>
              <LiveMap
                hospitals={HOSPITALS}
                ambulances={sosState === "IDLE" ? AMBULANCES : []}
                trafficSignals={sosState !== "IDLE" ?
                  TRAFFIC_SIGNALS.map(s => ({...s, status: "GREEN"})) :
                  TRAFFIC_SIGNALS}
                movingAmbulance={movingAmb}
                pulseLocation={sosState !== "IDLE" ? PATIENT : null}
                route={route}
                center={[28.6280, 77.2180]}
                zoom={13}
              />
            </div>
          </div>

          {/* Status Bar */}
          <div className="glass p-6 grid grid-cols-3 gap-4 text-center">
            <StatusItem icon={Clock} label="Avg Response" value="3.8 min" color="text-emerald-400" />
            <StatusItem icon={Shield} label="Units Nearby" value="8 Active" color="text-blue-400" />
            <StatusItem icon={Heart} label="Success Rate" value="98.7%" color="text-pink-400" />
          </div>
        </section>
      </main>
    </div>
  );
}

// ===== SUB-COMPONENTS =====
function QuickAction({ icon: Icon, label, color }: { icon: any; label: string; color: string }) {
  return (
    <button className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition group">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center group-hover:scale-110 transition`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <span className="text-xs text-white/80">{label}</span>
    </button>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
        <Icon className="w-4 h-4 text-white/70" />
      </div>
      <div className="flex-1 flex justify-between">
        <span className="text-white/60">{label}</span>
        <span className="text-white font-medium">{value}</span>
      </div>
    </div>
  );
}

function StatusItem({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <Icon className={`w-5 h-5 ${color}`} />
      <span className={`text-2xl font-bold ${color}`}>{value}</span>
      <span className="text-xs text-white/60">{label}</span>
    </div>
  );
}