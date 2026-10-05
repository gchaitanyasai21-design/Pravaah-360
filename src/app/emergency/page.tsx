"use client";

import { useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowLeft,
  Building2,
  Clock3,
  LogOut,
  MapPin,
  Phone,
  Shield,
  Siren,
  Zap,
} from "lucide-react";
import LiveMap from "@/components/LiveMap";
import { AppProvider } from "@/store/AppContext";
import {
  ambulances as initialAmbulances,
  hospitalCards,
  hospitals,
  sosAlerts,
  trafficSignals as initialSignals,
  vijayawadaCenter,
} from "@/lib/pravaahDashboardData";

function EmergencyPageContent() {
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [emergencyArmed, setEmergencyArmed] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [signalJumpActive, setSignalJumpActive] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);

  // Live map data (mutable so SOS can move ambulances)
  const [mapAmbulances, setMapAmbulances] = useState(initialAmbulances);
  const [mapSignals, setMapSignals] = useState(initialSignals);
  const [mapSos, setMapSos] = useState(sosAlerts);
  const [statusText, setStatusText] = useState("Ready for Emergency");

  // Clear hold timer safely
  const clearHold = () => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    setIsHolding(false);
    setHoldProgress(0);
  };

  // START HOLD SOS (mouse + touch)
  const startSosHold = () => {
    if (emergencyArmed) return;
    setIsHolding(true);
    setHoldProgress(10);

    // visual progress while holding
    const start = Date.now();
    const tick = () => {
      const p = Math.min(100, ((Date.now() - start) / 2000) * 100);
      setHoldProgress(p);
      if (p < 100 && holdTimer.current) {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);

    // arm after 2 seconds (reliable on desktop + mobile)
    holdTimer.current = setTimeout(() => {
      triggerSos();
      holdTimer.current = null;
      setIsHolding(false);
      setHoldProgress(100);
    }, 2000);
  };

  const cancelSosHold = () => {
    if (emergencyArmed) return;
    clearHold();
  };

  // WHAT HAPPENS WHEN SOS TRIGGERS
  const triggerSos = () => {
    setEmergencyArmed(true);
    setStatusText("🚨 EMERGENCY ARMED — Dispatch notified");

    // 1) Add/update SOS marker near user (Vijayawada center for demo)
    const sosPoint = {
      id: `SOS-${Date.now()}`,
      lat: vijayawadaCenter[0] + 0.002,
      lng: vijayawadaCenter[1] + 0.002,
      type: "sos",
      status: "active",
      label: "Patient SOS",
    };
    setMapSos((prev: any[]) => [sosPoint, ...prev]);

    // 2) Move nearest ambulances toward SOS (simulate response)
    setMapAmbulances((prev: any[]) =>
      prev.map((amb: any, i: number) => {
        if (i > 2) return amb; // only first 3 respond
        return {
          ...amb,
          status: i === 0 ? "en-route" : amb.status || "en-route",
          // nudge toward center/SOS
          lat: (amb.lat ?? vijayawadaCenter[0]) + (vijayawadaCenter[0] - (amb.lat ?? vijayawadaCenter[0])) * 0.25,
          lng: (amb.lng ?? vijayawadaCenter[1]) + (vijayawadaCenter[1] - (amb.lng ?? vijayawadaCenter[1])) * 0.25,
        };
      })
    );

    // 3) Auto-enable signal jump for corridor
    setSignalJumpActive(true);
    setMapSignals((prev: any[]) =>
      prev.map((s: any) => ({
        ...s,
        state: "green",
        status: "preempted",
      }))
    );

    alert(
      "🚨 EMERGENCY ARMED!\n\n• SOS sent with Vijayawada location\n• Nearest ambulances dispatched\n• Signal Jump activated on route"
    );
  };

  // SIGNAL JUMP TOGGLE (manual)
  const toggleSignalJump = () => {
    const next = !signalJumpActive;
    setSignalJumpActive(next);

    setMapSignals((prev: any[]) =>
      prev.map((s: any) => ({
        ...s,
        state: next ? "green" : "red",
        status: next ? "preempted" : "normal",
      }))
    );

    if (next) {
      setStatusText("⚡ Signal Jump ACTIVE — corridor cleared");
    } else if (!emergencyArmed) {
      setStatusText("Ready for Emergency");
    } else {
      setStatusText("🚨 EMERGENCY ARMED — Dispatch notified");
    }
  };

  // Keep ambulances slowly moving while emergency is armed (map “working”)
  useEffect(() => {
    if (!emergencyArmed) return;

    const id = setInterval(() => {
      setMapAmbulances((prev: any[]) =>
        prev.map((amb: any, i: number) => {
          if (i > 2) return amb;
          const jitter = (Math.random() - 0.45) * 0.0006;
          return {
            ...amb,
            lat: (amb.lat ?? vijayawadaCenter[0]) + jitter,
            lng: (amb.lng ?? vijayawadaCenter[1]) + jitter * 0.8,
            status: "en-route",
          };
        })
      );
    }, 2000);

    return () => clearInterval(id);
  }, [emergencyArmed]);

  // cleanup timer on unmount
  useEffect(() => {
    return () => clearHold();
  }, []);

  return (
    <main className="flex min-h-screen flex-col overflow-y-auto pb-12 bg-[#0B0F19] text-white">
      {/* HEADER — unchanged structure */}
      <header className="flex h-[62px] shrink-0 items-center justify-between border-b border-white/5 bg-[#0B0F19] px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => (window.location.href = "/login")}
            className="flex items-center gap-2 rounded-lg border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-600 shadow-[0_0_22px_rgba(249,115,22,.35)]">
            <Siren className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight">Pravaah Emergency</h1>
            <p className="flex items-center gap-2 text-xs font-semibold text-blue-300">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
              Using Vijayawada Default
            </p>
          </div>
        </div>

        <div className="hidden rounded-full border border-blue-400/25 bg-blue-500/10 px-5 py-2 text-sm font-semibold text-blue-300 md:block">
          16.5062, 80.6480
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.open("tel:108")}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-black text-white shadow-lg"
          >
            <Phone className="h-4 w-4" />
            Call 108
          </button>
          <button
            onClick={() => (window.location.href = "/login")}
            className="flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-black text-white shadow-lg"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </header>

      <section className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[272px_1fr_240px]">
        {/* LEFT PANEL */}
        <aside className="min-h-0 overflow-y-auto border-r border-white/5 bg-[#0B0F19] p-4">
          <div className="rounded-xl border border-blue-500/40 bg-blue-950/45 p-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-400">
              <Shield className="h-4 w-4" />
              Status
            </div>
            <p className={`font-black ${emergencyArmed ? "text-red-400" : "text-white"}`}>
              {statusText}
            </p>
          </div>

          {/* HOLD SOS */}
          <div className="my-9 flex flex-col items-center">
            <button
              type="button"
              onMouseDown={startSosHold}
              onMouseUp={cancelSosHold}
              onMouseLeave={cancelSosHold}
              onTouchStart={(e) => {
                e.preventDefault();
                startSosHold();
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                cancelSosHold();
              }}
              onClick={() => {
                // also allow quick click arm if already holding failed
                if (!emergencyArmed && !isHolding) {
                  // optional: single click does nothing; hold only
                }
              }}
              className={`flex h-32 w-32 flex-col items-center justify-center rounded-full font-black shadow-[0_0_45px_rgba(239,68,68,.55)] ring-[34px] ring-red-950/30 select-none transition-transform ${
                emergencyArmed
                  ? "bg-red-500 animate-pulse scale-105"
                  : isHolding
                  ? "bg-red-600 scale-95"
                  : "bg-red-700 hover:bg-red-600"
              }`}
              style={{
                boxShadow: isHolding
                  ? `0 0 ${20 + holdProgress / 2}px rgba(239,68,68,.8)`
                  : undefined,
              }}
            >
              <Siren className="mb-4 h-9 w-9" />
              {emergencyArmed ? "SOS SENT" : isHolding ? "HOLDING..." : "HOLD SOS"}
            </button>

            {/* tiny progress bar while holding */}
            {isHolding && !emergencyArmed && (
              <div className="mt-4 h-1.5 w-32 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-red-400 transition-all"
                  style={{ width: `${holdProgress}%` }}
                />
              </div>
            )}

            <p className="mt-6 text-center text-sm font-medium text-blue-400">
              {emergencyArmed
                ? "Dispatch notified • Ambulances en-route on map"
                : "Hold 2 seconds to activate emergency"}
            </p>

            {emergencyArmed && (
              <button
                type="button"
                onClick={() => {
                  setEmergencyArmed(false);
                  setStatusText("Ready for Emergency");
                  setMapAmbulances(initialAmbulances);
                  setMapSos(sosAlerts);
                  setHoldProgress(0);
                }}
                className="mt-4 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/10"
              >
                Reset SOS
              </button>
            )}
          </div>

          {/* SIGNAL JUMP */}
          <button
            type="button"
            onClick={toggleSignalJump}
            className={`flex w-full items-center justify-center gap-3 rounded-xl py-4 text-sm font-black shadow-[0_12px_28px_rgba(249,115,22,.28)] ${
              signalJumpActive
                ? "bg-gradient-to-r from-emerald-500 to-green-600"
                : "bg-gradient-to-r from-orange-500 to-orange-700"
            }`}
          >
            <Zap className="h-5 w-5" />
            {signalJumpActive ? "Signal Jump Active" : "Signal Jump Mode"}
          </button>
          <p className="mt-2 text-center text-xs font-medium text-blue-400">
            Clears signals one by one on ambulance route
          </p>

          {/* TRAFFIC SIGNALS LIST */}
          <div className="mt-9 border-t border-white/5 pt-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-wider text-blue-400">
              <Activity className="h-4 w-4" />
              Traffic Signals
            </h2>
            <div className="space-y-2">
              {mapSignals.slice(0, 5).map((signal: any, index: number) => {
                const isGreen =
                  signalJumpActive ||
                  signal.state === "green" ||
                  signal.status === "preempted";
                return (
                  <div
                    key={signal.id || index}
                    className="flex items-center justify-between rounded-lg border border-white/5 bg-[#131826] px-3 py-2"
                  >
                    <span className="text-sm text-blue-200">
                      <span className="mr-3 text-xs text-blue-500">{index + 1}</span>
                      {signal.name}
                    </span>
                    <span
                      className={`flex items-center gap-2 text-xs font-black ${
                        isGreen ? "text-emerald-300" : "text-red-300"
                      }`}
                    >
                      <span
                        className={`h-3 w-3 rounded-full ${
                          isGreen
                            ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.9)]"
                            : "bg-red-400 shadow-[0_0_10px_rgba(248,113,113,.9)]"
                        }`}
                      />
                      {isGreen ? "GREEN" : "RED"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* CENTER MAP */}
        <div className="min-h-[420px] bg-[#101522]">
          <LiveMap
            center={vijayawadaCenter}
            zoom={13}
            ambulances={mapAmbulances}
            hospitals={hospitals}
            trafficSignals={mapSignals}
            sosVehicles={mapSos}
          />
        </div>

        {/* RIGHT HOSPITALS */}
        <aside className="min-h-0 overflow-y-auto border-l border-white/5 bg-[#0B0F19] p-4">
          <h2 className="flex items-center gap-2 text-base font-black">
            <Building2 className="h-5 w-5 text-blue-400" />
            Nearby Hospitals
          </h2>
          <p className="mb-5 mt-1 text-xs font-medium text-blue-400">
            15 hospitals in Vijayawada
          </p>
          <div className="space-y-3">
            {hospitalCards.map((hospital: any) => (
              <article
                key={hospital.name}
                className="rounded-xl border border-blue-400/15 bg-blue-950/35 p-3"
              >
                <h3 className="text-sm font-black">{hospital.name}</h3>
                <span className="mt-1 inline-flex rounded-md bg-violet-600 px-2 py-1 text-xs font-bold">
                  {hospital.type}
                </span>
                <div className="mt-3 flex items-center justify-between text-xs font-semibold text-blue-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {hospital.distance}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock3 className="h-3 w-3" />
                    {hospital.eta}
                  </span>
                  <span className="font-black text-emerald-400">{hospital.beds}</span>
                </div>
              </article>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}

export default function EmergencyPage() {
  return (
    <AppProvider>
      <EmergencyPageContent />
    </AppProvider>
  );
}