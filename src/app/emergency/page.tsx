"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/store/AuthContext";
import { AppProvider } from "@/store/AppContext";
import {
  AlertTriangle, Phone, MapPin, Clock,
  Activity, Siren, Hospital, Shield,
  Zap, ArrowLeft, Truck, CheckCircle,
  Navigation, Radio, Users, LogOut
} from "lucide-react";

// Dynamic Map Import
const LiveMap = dynamic(
  () => import("@/components/LiveMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-slate-900
      flex items-center justify-center rounded-xl">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-400
          border-t-transparent rounded-full animate-spin" />
          <p className="text-blue-300 text-sm font-medium">
            Loading Map...
          </p>
        </div>
      </div>
    )
  }
);

// ✅ 15 REAL Vijayawada Hospitals
const HOSPITALS = [
  { id: "H1",  name: "Aster Ramesh Hospital",
    lat: 16.5109, lng: 80.6395,
    beds: 15, distance: "1.8 km", time: "6 min",
    type: "Private",    status: "Available" },
  { id: "H2",  name: "Manipal Hospital Vijayawada",
    lat: 16.5449, lng: 80.6440,
    beds: 20, distance: "4.2 km", time: "14 min",
    type: "Private",    status: "Available" },
  { id: "H3",  name: "Andhra Hospitals",
    lat: 16.5033, lng: 80.6510,
    beds: 12, distance: "1.5 km", time: "6 min",
    type: "Private",    status: "Available" },
  { id: "H4",  name: "Government General Hospital",
    lat: 16.5089, lng: 80.6187,
    beds: 30, distance: "2.1 km", time: "8 min",
    type: "Government", status: "Available" },
  { id: "H5",  name: "Nagarjuna Hospital",
    lat: 16.4856, lng: 80.6917,
    beds: 10, distance: "5.5 km", time: "18 min",
    type: "Private",    status: "Available" },
  { id: "H6",  name: "Rainbow Children's Hospital",
    lat: 16.5017, lng: 80.6557,
    beds: 8,  distance: "2.3 km", time: "8 min",
    type: "Private",    status: "Available" },
  { id: "H7",  name: "KIMS Hospital Vijayawada",
    lat: 16.5151, lng: 80.6429,
    beds: 18, distance: "2.5 km", time: "9 min",
    type: "Private",    status: "Available" },
  { id: "H8",  name: "LV Prasad Eye Institute",
    lat: 16.4898, lng: 80.6652,
    beds: 6,  distance: "3.2 km", time: "11 min",
    type: "Private",    status: "Available" },
  { id: "H9",  name: "Capital Hospitals",
    lat: 16.5085, lng: 80.7004,
    beds: 14, distance: "4.8 km", time: "16 min",
    type: "Private",    status: "Available" },
  { id: "H10", name: "Kamineni Hospital",
    lat: 16.4930, lng: 80.6710,
    beds: 11, distance: "3.8 km", time: "13 min",
    type: "Private",    status: "Available" },
  { id: "H11", name: "Sentini Hospitals",
    lat: 16.5175, lng: 80.6318,
    beds: 9,  distance: "2.8 km", time: "10 min",
    type: "Private",    status: "Available" },
  { id: "H12", name: "NRI Medical College",
    lat: 16.4429, lng: 80.6220,
    beds: 25, distance: "8.5 km", time: "22 min",
    type: "Private",    status: "Available" },
  { id: "H13", name: "Ramesh Hospitals",
    lat: 16.5109, lng: 80.6395,
    beds: 15, distance: "1.9 km", time: "7 min",
    type: "Private",    status: "Available" },
  { id: "H14", name: "Lalitha Super Speciality",
    lat: 16.5266, lng: 80.6199,
    beds: 13, distance: "3.1 km", time: "11 min",
    type: "Private",    status: "Available" },
  { id: "H15", name: "Vijaya Super Specialty",
    lat: 16.4972, lng: 80.6467,
    beds: 10, distance: "2.4 km", time: "9 min",
    type: "Private",    status: "Available" },
];

// ✅ Ambulances at hospitals
const INITIAL_AMBULANCES = [
  { id: "AMB-001", lat: 16.5109, lng: 80.6395,
    status: "Available", hospital: "Aster Ramesh" },
  { id: "AMB-002", lat: 16.5449, lng: 80.6440,
    status: "Available", hospital: "Manipal" },
  { id: "AMB-003", lat: 16.5089, lng: 80.6187,
    status: "Available", hospital: "Government General" },
  { id: "AMB-004", lat: 16.5033, lng: 80.6510,
    status: "Available", hospital: "Andhra Hospitals" },
  { id: "AMB-005", lat: 16.5151, lng: 80.6429,
    status: "Available", hospital: "KIMS" },
];

// ✅ Assigned Ambulance Info
const ASSIGNED_AMBULANCE = {
  id: "AMB-SOS",
  driver: {
    name: "Rajesh Kumar",
    phone: "+91-9876543210",
    experience: "5 years",
    license: "DL-2020-12345",
  },
  vehicle: {
    number: "AP-16-AB-1234",
    type: "Advanced Life Support",
    equipment: "Defibrillator, Oxygen, First Aid",
  },
};

// ✅ Signal Type
interface SignalState {
  id: string;
  lat: number;
  lng: number;
  name: string;
  color: "red" | "green";
  crossed: boolean;
}

// ✅ Initial Signals - ALL RED, NOT crossed
const INITIAL_SIGNALS: SignalState[] = [
  { id: "S1", lat: 16.5062, lng: 80.6480,
    name: "Benz Circle",
    color: "red", crossed: false },
  { id: "S2", lat: 16.5121, lng: 80.6339,
    name: "Kanaka Durga Flyover",
    color: "red", crossed: false },
  { id: "S3", lat: 16.5033, lng: 80.6410,
    name: "MG Road Junction",
    color: "red", crossed: false },
  { id: "S4", lat: 16.5089, lng: 80.6520,
    name: "Ramavarappadu Ring",
    color: "red", crossed: false },
  { id: "S5", lat: 16.4989, lng: 80.6431,
    name: "Autonagar Signal",
    color: "red", crossed: false },
];

type Stage = "idle" | "dispatched" | "arrived" | "picked" | "hospital";

// ─── Helper ────────────────────────────────────────────────
function manhattanDist(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
) {
  return Math.abs(a.lat - b.lat) + Math.abs(a.lng - b.lng);
}

// ─── Main Component ────────────────────────────────────────
function EmergencyPageContent() {
  const { login } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ✅ Real GPS Location
  const [userLocation, setUserLocation] = useState({
    lat: 16.5062, lng: 80.6480,
  });
  const [locationStatus, setLocationStatus] = useState<
    "detecting" | "active" | "denied"
  >("detecting");

  // SOS State
  const [sosActive, setSosActive]       = useState(false);
  const [stage, setStage]               = useState<Stage>("idle");
  const [eta, setEta]                   = useState(0);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding]       = useState(false);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ Signal State - with crossed flag
  const [signalStates, setSignalStates] =
    useState<SignalState[]>(INITIAL_SIGNALS);
  const [signalJump, setSignalJump] = useState(false);

  // Ambulance State
  const [ambulancePos, setAmbulancePos] = useState({
    lat: 16.5109, lng: 80.6395,
  });
  const [showResponderAmbulance, setShowResponderAmbulance] =
    useState(false);
  const [selectedHospital, setSelectedHospital] =
    useState(HOSPITALS[3]);
  const [assignedAmbulanceId, setAssignedAmbulanceId] =
    useState<string | null>(null);

  // Refs for animation intervals
  const ambulanceIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const signalTimeoutsRef    = useRef<NodeJS.Timeout[]>([]);

  // ── Auth ────────────────────────────────────────────────
  useEffect(() => {
    login("patient@pravaah360.in", "patient123", "patient");
    setIsAuthenticated(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Real GPS ────────────────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("denied");
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocationStatus("active");
      },
      () => setLocationStatus("denied"),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 3000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // ── Cleanup on unmount ──────────────────────────────────
  useEffect(() => {
    return () => {
      if (ambulanceIntervalRef.current)
        clearInterval(ambulanceIntervalRef.current);
      signalTimeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  // ✅ ONE-BY-ONE Smart Signal Logic
  // Runs every 500ms while SOS is active
  useEffect(() => {
    if (!sosActive) return;

    const interval = setInterval(() => {
      setSignalStates((prev) => {
        // Find which signal is NEAREST to ambulance
        // and NOT yet crossed
        let nearestId: string | null = null;
        let nearestDist = Infinity;

        prev.forEach((signal) => {
          if (signal.crossed) return;
          const dist = manhattanDist(ambulancePos, signal);
          if (dist < nearestDist) {
            nearestDist = dist;
            nearestId = signal.id;
          }
        });

        return prev.map((signal) => {
          // ✅ Already crossed = stay RED
          if (signal.crossed) {
            return { ...signal, color: "red" as const };
          }

          const distToSignal = manhattanDist(
            ambulancePos, signal
          );
          const distAmbToUser = manhattanDist(
            ambulancePos, userLocation
          );

          // ✅ Ambulance has PASSED this signal
          // (ambulance is now closer to destination
          //  than this signal is)
          const hasPassed =
            distAmbToUser < distToSignal - 0.002;

          if (hasPassed) {
            // Mark as crossed → turns RED
            return {
              ...signal,
              color: "red" as const,
              crossed: true,
            };
          }

          // ✅ This is the NEAREST upcoming signal
          // AND ambulance is within 0.012 distance
          if (
            signal.id === nearestId &&
            nearestDist < 0.012
          ) {
            return { ...signal, color: "green" as const };
          }

          // Everything else stays RED
          return { ...signal, color: "red" as const };
        });
      });
    }, 500);

    return () => clearInterval(interval);
  }, [sosActive, ambulancePos, userLocation]);

  // ✅ Signal Jump - ONE BY ONE with delay
  const activateSignalJump = () => {
    // Clear any existing timeouts
    signalTimeoutsRef.current.forEach(clearTimeout);
    signalTimeoutsRef.current = [];

    setSignalJump(true);

    // Reset all signals first
    setSignalStates(
      INITIAL_SIGNALS.map((s) => ({
        ...s,
        color: "red" as const,
        crossed: false,
      }))
    );

    // ✅ Turn each signal GREEN one by one
    // Then RED after 8 seconds (ambulance crossed)
    INITIAL_SIGNALS.forEach((signal, index) => {
      // Turn GREEN after index * 3 seconds
      const greenTimeout = setTimeout(() => {
        setSignalStates((prev) =>
          prev.map((s) =>
            s.id === signal.id
              ? { ...s, color: "green" as const }
              : s
          )
        );
      }, index * 3000);

      // Turn RED after green + 8 seconds (crossed)
      const redTimeout = setTimeout(() => {
        setSignalStates((prev) =>
          prev.map((s) =>
            s.id === signal.id
              ? {
                  ...s,
                  color: "red" as const,
                  crossed: true,
                }
              : s
          )
        );
      }, index * 3000 + 8000);

      signalTimeoutsRef.current.push(greenTimeout, redTimeout);
    });

    // Reset everything after all signals done
    const resetTimeout = setTimeout(() => {
      setSignalJump(false);
      setSignalStates(
        INITIAL_SIGNALS.map((s) => ({
          ...s,
          color: "red" as const,
          crossed: false,
        }))
      );
    }, INITIAL_SIGNALS.length * 3000 + 8000);

    signalTimeoutsRef.current.push(resetTimeout);
  };

  // ✅ Hold SOS Button Logic
  const startHold = () => {
    if (sosActive) return;
    setIsHolding(true);
    let progress = 0;
    holdTimerRef.current = setInterval(() => {
      progress += 4;
      setHoldProgress(progress);
      if (progress >= 100) {
        clearInterval(holdTimerRef.current!);
        setIsHolding(false);
        setHoldProgress(0);
        triggerSOS();
      }
    }, 120);
  };

  const stopHold = () => {
    if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    setIsHolding(false);
    setHoldProgress(0);
  };

  // ✅ Trigger SOS
  const triggerSOS = () => {
    // Find nearest ambulance
    let nearestAmb = INITIAL_AMBULANCES[0];
    let minDist = manhattanDist(userLocation, INITIAL_AMBULANCES[0]);

    INITIAL_AMBULANCES.forEach((amb) => {
      const dist = manhattanDist(userLocation, amb);
      if (dist < minDist) {
        minDist = dist;
        nearestAmb = amb;
      }
    });

    setAssignedAmbulanceId(nearestAmb.id);
    setSosActive(true);
    setStage("dispatched");
    setEta(8);
    setShowResponderAmbulance(true);
    setAmbulancePos({ lat: nearestAmb.lat, lng: nearestAmb.lng });

    // Activate signal jump sequence
    activateSignalJump();

    // Start moving ambulance
    animateAmbulanceToUser(nearestAmb);
  };

  // ✅ Animate Ambulance → User
  const animateAmbulanceToUser = (
    startAmb: typeof INITIAL_AMBULANCES[0]
  ) => {
    const start = { lat: startAmb.lat, lng: startAmb.lng };
    const end   = userLocation;
    const steps = 40;
    let step = 0;

    if (ambulanceIntervalRef.current)
      clearInterval(ambulanceIntervalRef.current);

    ambulanceIntervalRef.current = setInterval(() => {
      step++;
      const p = step / steps;
      setAmbulancePos({
        lat: start.lat + (end.lat - start.lat) * p,
        lng: start.lng + (end.lng - start.lng) * p,
      });
      setEta(Math.max(0, Math.round(8 * (1 - p))));

      if (step >= steps) {
        clearInterval(ambulanceIntervalRef.current!);
        setStage("arrived");
        setEta(0);

        setTimeout(() => {
          setStage("picked");
          setTimeout(() => animateToHospital(), 2000);
        }, 2000);
      }
    }, 300);
  };

  // ✅ Animate Ambulance → Hospital
  const animateToHospital = () => {
    setStage("hospital");
    const start = { ...ambulancePos };
    const end   = {
      lat: selectedHospital.lat,
      lng: selectedHospital.lng,
    };
    const steps = 30;
    let step = 0;
    setEta(6);

    if (ambulanceIntervalRef.current)
      clearInterval(ambulanceIntervalRef.current);

    ambulanceIntervalRef.current = setInterval(() => {
      step++;
      const p = step / steps;
      setAmbulancePos({
        lat: start.lat + (end.lat - start.lat) * p,
        lng: start.lng + (end.lng - start.lng) * p,
      });
      setEta(Math.max(0, Math.round(6 * (1 - p))));

      if (step >= steps) {
        clearInterval(ambulanceIntervalRef.current!);

        setTimeout(() => {
          alert(
            `✅ Emergency Completed!\n\n` +
            `Patient safely delivered to ` +
            `${selectedHospital.name}\n\n` +
            `Driver: ${ASSIGNED_AMBULANCE.driver.name}\n` +
            `Vehicle: ${ASSIGNED_AMBULANCE.vehicle.number}\n\n` +
            `Thank you for using Pravaah 360!`
          );

          // ✅ Full Reset
          setSosActive(false);
          setStage("idle");
          setShowResponderAmbulance(false);
          setAssignedAmbulanceId(null);
          setSignalJump(false);

          // ✅ Reset all signals including crossed
          setSignalStates(
            INITIAL_SIGNALS.map((s) => ({
              ...s,
              color: "red" as const,
              crossed: false,
            }))
          );

          // Clear signal timeouts
          signalTimeoutsRef.current.forEach(clearTimeout);
          signalTimeoutsRef.current = [];

        }, 1000);
      }
    }, 300);
  };

  // ✅ Logout
  const handleBackToLogin = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.error("Error clearing storage:", e);
    }
    window.location.href = "/login";
  };

  // Map ambulances
  const mapAmbulances = [
    ...INITIAL_AMBULANCES.filter(
      (a) => a.id !== assignedAmbulanceId
    ),
    ...(showResponderAmbulance
      ? [{
          id: "AMB-SOS",
          lat: ambulancePos.lat,
          lng: ambulancePos.lng,
          status: "Responding to SOS",
        }]
      : []),
  ];

  // Stage config for status card
  const stageConfig = {
    idle: {
      bg: "bg-blue-900/40",
      border: "border-blue-700",
      text: "Ready for Emergency",
      icon: <Shield size={16} className="text-blue-400" />,
    },
    dispatched: {
      bg: "bg-red-900/40",
      border: "border-red-500",
      text: `🚑 Ambulance Dispatched · ETA ${eta} min`,
      icon: <Truck size={16} className="text-red-400" />,
    },
    arrived: {
      bg: "bg-yellow-900/40",
      border: "border-yellow-500",
      text: "🚑 Ambulance Has Arrived!",
      icon: <CheckCircle size={16} className="text-yellow-400" />,
    },
    picked: {
      bg: "bg-blue-900/40",
      border: "border-blue-500",
      text: "✅ Patient Picked Up",
      icon: <Users size={16} className="text-blue-400" />,
    },
    hospital: {
      bg: "bg-green-900/40",
      border: "border-green-500",
      text: `🏥 En Route to ${selectedHospital.name} · ETA ${eta} min`,
      icon: <Hospital size={16} className="text-green-400" />,
    },
  };

  if (!isAuthenticated) {
    return (
      <div className="h-screen bg-slate-950 flex items-center
      justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-400
          border-t-transparent rounded-full animate-spin
          mx-auto mb-4" />
          <p className="text-blue-200 font-medium">
            Loading Emergency Services...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden
    bg-slate-950 text-white">

      {/* ── HEADER ── */}
      <div className="flex-shrink-0 px-6 py-3 flex items-center
      justify-between border-b border-white/10
      bg-slate-900/70 backdrop-blur-xl">

        <div className="flex items-center gap-4">
          {/* Back Button */}
          <button
            onClick={() => (window.location.href = "/login")}
            className="flex items-center gap-2 px-3 py-1.5
            rounded-lg text-sm font-medium
            bg-blue-500/15 border border-blue-400/30
            text-blue-200 hover:bg-blue-500/25 transition"
          >
            <ArrowLeft size={14} />
            Back
          </button>

          {/* Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center
            justify-center bg-gradient-to-br
            from-red-500 to-orange-500
            shadow-lg shadow-red-500/30">
              <Siren size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-black text-white text-lg
              leading-none">
                Pravaah Emergency
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className={`w-1.5 h-1.5 rounded-full
                animate-pulse ${
                  locationStatus === "active"
                    ? "bg-green-400"
                    : locationStatus === "detecting"
                    ? "bg-yellow-400"
                    : "bg-red-400"
                }`} />
                <p className="text-xs text-blue-300">
                  {locationStatus === "active"
                    ? "Live GPS Active"
                    : locationStatus === "detecting"
                    ? "Detecting Location..."
                    : "Using Vijayawada Default"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Coordinates */}
        <div className="flex items-center gap-2 px-4 py-2
        rounded-xl bg-blue-500/10 border border-blue-400/20">
          <Navigation size={14} className="text-blue-400" />
          <span className="text-xs text-blue-300">
            {userLocation.lat.toFixed(4)},{" "}
            {userLocation.lng.toFixed(4)}
          </span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {sosActive && (
            <div className="flex items-center gap-2 px-3 py-1.5
            rounded-full bg-red-600 animate-pulse">
              <Radio size={12} className="text-white" />
              <span className="text-xs font-bold text-white">
                LIVE SOS
              </span>
            </div>
          )}
          <button
            onClick={() => window.open("tel:108")}
            className="flex items-center gap-2 px-4 py-2
            rounded-xl font-bold text-sm text-white
            bg-gradient-to-r from-red-600 to-red-700
            shadow-lg hover:from-red-700 hover:to-red-800"
          >
            <Phone size={14} />
            Call 108
          </button>
          <button
            onClick={handleBackToLogin}
            className="flex items-center gap-2 px-4 py-2
            rounded-xl bg-gradient-to-r
            from-orange-500 to-red-500 text-white
            font-semibold shadow-lg
            hover:scale-105 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* ── MAIN BODY ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT PANEL ── */}
        <div className="w-72 flex flex-col overflow-y-auto
        flex-shrink-0 border-r border-white/10
        bg-slate-900/70">

          {/* Status Card */}
          <div className="p-4 border-b border-white/10">
            <div className={`rounded-xl p-4 border
            ${stageConfig[stage].bg}
            ${stageConfig[stage].border}`}>
              <div className="flex items-center gap-2 mb-2">
                {stageConfig[stage].icon}
                <span className="text-xs font-bold uppercase
                tracking-wider text-blue-300">
                  Status
                </span>
              </div>
              <p className="text-sm font-bold text-white">
                {stageConfig[stage].text}
              </p>
              {eta > 0 && (
                <div className="flex items-center gap-2 mt-3
                pt-3 border-t border-white/10">
                  <Clock size={14} className="text-yellow-400" />
                  <span className="text-3xl font-black
                  text-yellow-400">
                    {eta}
                  </span>
                  <span className="text-blue-300 text-sm">
                    min ETA
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* SOS Hold Button */}
          <div className="p-5 border-b border-white/10
          flex flex-col items-center gap-3">
            <div className="relative">
              <button
                onMouseDown={startHold}
                onMouseUp={stopHold}
                onMouseLeave={stopHold}
                onTouchStart={startHold}
                onTouchEnd={stopHold}
                disabled={sosActive}
                className="w-32 h-32 rounded-full font-black
                text-white flex flex-col items-center
                justify-center gap-2 transition-all
                select-none relative overflow-hidden"
                style={{
                  background: sosActive
                    ? "rgba(75,85,99,0.5)"
                    : "linear-gradient(135deg,#dc2626,#991b1b)",
                  boxShadow: sosActive
                    ? "none"
                    : "0 0 30px rgba(220,38,38,0.5)," +
                      "0 0 60px rgba(220,38,38,0.2)",
                  cursor: sosActive ? "not-allowed" : "pointer",
                }}
              >
                {isHolding && (
                  <svg
                    className="absolute inset-0 w-full h-full
                    -rotate-90"
                    viewBox="0 0 100 100"
                  >
                    <circle
                      cx="50" cy="50" r="46"
                      fill="none"
                      stroke="rgba(255,255,255,0.9)"
                      strokeWidth="5"
                      strokeDasharray={
                        `${holdProgress * 2.89} 289`
                      }
                      strokeLinecap="round"
                    />
                  </svg>
                )}
                <AlertTriangle size={30} />
                <span className="text-xs font-black
                tracking-wide">
                  {sosActive ? "ACTIVE" : "HOLD SOS"}
                </span>
              </button>

              {sosActive && (
                <div className="absolute inset-0 rounded-full
                border-4 border-red-500 animate-ping
                opacity-40" />
              )}
            </div>
            <p className="text-xs text-blue-400 text-center">
              Hold 3 seconds to activate emergency
            </p>
          </div>

          {/* Signal Jump Button */}
          <div className="p-4 border-b border-white/10">
            <button
              onClick={activateSignalJump}
              className="w-full py-3 rounded-xl font-bold
              text-sm flex items-center justify-center
              gap-2 transition-all text-white"
              style={{
                background: signalJump
                  ? "linear-gradient(135deg,#16a34a,#15803d)"
                  : "linear-gradient(135deg,#d97706,#b45309)",
                boxShadow: "0 4px 15px rgba(217,119,6,0.4)",
              }}
            >
              <Zap size={16} />
              {signalJump
                ? "✅ Sequence Active!"
                : "⚡ Signal Jump Mode"}
            </button>
            <p className="text-xs text-blue-400/70 mt-2
            text-center">
              Clears signals one by one on ambulance route
            </p>
          </div>

          {/* ✅ Traffic Signals - with CROSSED state */}
          <div className="p-4 border-b border-white/10">
            <h3 className="text-xs font-bold text-blue-400
            uppercase tracking-wider mb-3
            flex items-center gap-2">
              <Activity size={12} />
              Traffic Signals
            </h3>
            <div className="space-y-2">
              {signalStates.map((signal, index) => (
                <div
                  key={signal.id}
                  className="flex items-center justify-between
                  rounded-lg px-3 py-2 bg-slate-800/40
                  border border-white/10"
                >
                  {/* Signal number + name */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-blue-400/50
                    font-mono">
                      {index + 1}
                    </span>
                    <span className="text-xs text-blue-200">
                      {signal.name}
                    </span>
                  </div>

                  {/* ✅ Status indicator */}
                  <div className="flex items-center gap-2">
                    {signal.crossed ? (
                      // Crossed = grey checkmark
                      <>
                        <CheckCircle
                          size={12}
                          className="text-gray-500"
                        />
                        <span className="text-xs font-bold
                        text-gray-500">
                          CROSSED
                        </span>
                      </>
                    ) : (
                      // Not crossed = colored dot
                      <>
                        <div
                          className={`w-3 h-3 rounded-full ${
                            signal.color === "green"
                              ? "animate-pulse bg-green-400"
                              : "bg-red-400"
                          }`}
                          style={{
                            boxShadow:
                              signal.color === "green"
                                ? "0 0 8px #4ade80"
                                : "0 0 8px #f87171",
                          }}
                        />
                        <span className={`text-xs font-bold ${
                          signal.color === "green"
                            ? "text-green-400"
                            : "text-red-400"
                        }`}>
                          {signal.color.toUpperCase()}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assigned Ambulance */}
          {sosActive && (
            <div className="p-4 border-b border-white/10">
              <h3 className="text-xs font-bold text-blue-400
              uppercase tracking-wider mb-3
              flex items-center gap-2">
                <Truck size={12} />
                Assigned Ambulance
              </h3>
              <div className="rounded-xl p-3 space-y-2
              bg-slate-800/40 border border-white/10">
                {[
                  ["Vehicle",
                    ASSIGNED_AMBULANCE.vehicle.number],
                  ["Type",
                    ASSIGNED_AMBULANCE.vehicle.type],
                  ["Driver",
                    ASSIGNED_AMBULANCE.driver.name],
                  ["Phone",
                    ASSIGNED_AMBULANCE.driver.phone],
                  ["Experience",
                    ASSIGNED_AMBULANCE.driver.experience],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex justify-between
                    items-center"
                  >
                    <span className="text-xs text-blue-400">
                      {label}
                    </span>
                    <span className="text-xs text-white
                    font-medium">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="p-4 grid grid-cols-2 gap-2">
            {[
              {
                label: "Call 108",
                icon: Phone,
                color: "#f87171",
                action: () => window.open("tel:108"),
              },
              {
                label: "Police 100",
                icon: Shield,
                color: "#60a5fa",
                action: () => window.open("tel:100"),
              },
              {
                label: "Fire 101",
                icon: Siren,
                color: "#fb923c",
                action: () => window.open("tel:101"),
              },
              {
                label: "Share GPS",
                icon: MapPin,
                color: "#4ade80",
                action: () => {
                  navigator.clipboard.writeText(
                    `https://maps.google.com?q=` +
                    `${userLocation.lat},${userLocation.lng}`
                  );
                  alert("📍 Location copied to clipboard!");
                },
              },
            ].map(({ label, icon: Icon, color, action }) => (
              <button
                key={label}
                onClick={action}
                className="flex flex-col items-center gap-1.5
                rounded-xl p-3 transition-all hover:scale-105
                bg-slate-800/40 border border-white/10"
              >
                <Icon size={20} style={{ color }} />
                <span className="text-xs text-blue-200
                font-medium">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── CENTER MAP ── */}
        <div className="flex-1 relative">
          <LiveMap
            ambulances={mapAmbulances}
            hospitals={HOSPITALS}
            trafficSignals={signalStates.map((s) => ({
              ...s,
              status: s.crossed
                ? "Normal"
                : s.color === "green"
                ? "Normal"
                : "Congested",
            }))}
            sosVehicles={[]}
            userLocation={userLocation}
            showUserLocation={true}
            emergencies={[]}
            center={[userLocation.lat, userLocation.lng]}
            zoom={13}
          />

          {/* SOS Status Banner */}
          {sosActive && (
            <div className="absolute top-4 left-1/2
            -translate-x-1/2 flex items-center gap-3
            px-6 py-3 rounded-2xl bg-slate-900/95
            backdrop-blur border border-red-700 shadow-xl">
              <div className="w-3 h-3 bg-red-500
              rounded-full animate-ping" />
              <span className="text-white font-bold text-sm">
                {stage === "dispatched" &&
                  `🚑 Ambulance En Route · ETA ${eta} min`}
                {stage === "arrived" &&
                  "🚑 Ambulance Has Arrived!"}
                {stage === "picked" &&
                  "✅ Patient Picked Up Successfully"}
                {stage === "hospital" &&
                  `🏥 Heading to ${selectedHospital.name}`}
              </span>
            </div>
          )}

          {/* Signal Jump Banner */}
          {signalJump && (
            <div className="absolute bottom-6 left-1/2
            -translate-x-1/2 flex items-center gap-3
            px-6 py-3 rounded-2xl bg-green-900/95
            backdrop-blur border border-green-500 shadow-xl">
              <Zap size={16} className="text-green-400" />
              <span className="text-green-300 font-bold
              text-sm">
                ⚡ Signal Jump Active — Clearing One By One
              </span>
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL - HOSPITALS ── */}
        <div className="w-64 flex flex-col overflow-hidden
        flex-shrink-0 border-l border-white/10
        bg-slate-900/70">
          <div className="p-4 border-b border-white/10
          flex-shrink-0">
            <h2 className="font-bold text-white
            flex items-center gap-2 text-sm">
              <Hospital size={16} className="text-blue-400" />
              Nearby Hospitals
            </h2>
            <p className="text-xs text-blue-400/70 mt-1">
              {HOSPITALS.length} hospitals in Vijayawada
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {HOSPITALS.map((hospital) => (
              <button
                key={hospital.id}
                onClick={() => setSelectedHospital(hospital)}
                className="w-full text-left rounded-xl p-3
                transition-all text-xs"
                style={{
                  background:
                    selectedHospital.id === hospital.id
                      ? "rgba(29,78,216,0.3)"
                      : "rgba(30,58,100,0.3)",
                  border:
                    selectedHospital.id === hospital.id
                      ? "1px solid rgba(59,130,246,0.6)"
                      : "1px solid rgba(59,130,246,0.15)",
                }}
              >
                <p className="font-bold text-white
                leading-tight mb-1">
                  {hospital.name}
                </p>
                <span
                  className="inline-block px-1.5 py-0.5
                  rounded text-xs mb-2"
                  style={{
                    background:
                      hospital.type === "Government"
                        ? "rgba(29,78,216,0.4)"
                        : "rgba(124,58,237,0.4)",
                    color:
                      hospital.type === "Government"
                        ? "#93c5fd"
                        : "#c4b5fd",
                  }}
                >
                  {hospital.type}
                </span>
                <div className="flex items-center
                justify-between text-blue-300/70">
                  <span className="flex items-center gap-1">
                    <MapPin size={9} />
                    {hospital.distance}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={9} />
                    {hospital.time}
                  </span>
                  <span className="text-green-400 font-bold">
                    {hospital.beds} beds
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EmergencyPage() {
  return (
    <AppProvider>
      <EmergencyPageContent />
    </AppProvider>
  );
}