"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/store/AuthContext";
import { AppProvider } from "@/store/AppContext";
import { getDistanceMeters } from "@/lib/distance";
import { getRoadRoute } from "@/lib/routing";
import {
  INDIA_CITIES,
  DEFAULT_CITY,
  findNearestCity,
  getHospitalsWithDistance,
  getAmbulancesForCity,
  getSignalsForCity,
  type IndianCity,
} from "@/lib/indiaCities";
import {
  AlertTriangle, Phone, MapPin, Clock,
  Activity, Siren, Hospital, Shield,
  Zap, ArrowLeft, Truck, CheckCircle,
  Navigation, Radio, Users, LogOut, ChevronDown
} from "lucide-react";

const LiveMap = dynamic(
  () => import("@/components/LiveMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-slate-900 flex items-center justify-center rounded-xl">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-blue-300 text-sm font-medium">Loading Map...</p>
        </div>
      </div>
    )
  }
);

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

interface SignalState {
  id: string;
  lat: number;
  lng: number;
  name: string;
  color: "red" | "yellow" | "green";
  crossed: boolean;
}

type Stage = "idle" | "dispatched" | "arrived" | "picked" | "hospital";

function manhattanDist(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
) {
  return Math.abs(a.lat - b.lat) + Math.abs(a.lng - b.lng);
}

// ═══════════════════════════════════════════════════════════
// ✅ ROUTE JUNCTION ENGINE (Rapido-style)
// Places 4 junctions ON the ACTUAL ROAD ROUTE returned by OSRM
// → lights ALWAYS change as ambulance passes through them,
//   and junction positions now sit on real roads, not a straight line
// ═══════════════════════════════════════════════════════════
function generateJunctionsOnRoute(
  route: [number, number][]
): SignalState[] {
  if (route.length < 2) return [];

  const fractions = [0.2, 0.4, 0.6, 0.8];
  return fractions.map((f, i) => {
    const idx = Math.min(
      route.length - 1,
      Math.floor(route.length * f)
    );
    const [lat, lng] = route[idx];
    return {
      id: `RJ-${i + 1}`,
      lat,
      lng,
      name: `Junction ${i + 1}`,
      color: "red" as const,
      crossed: false,
    };
  });
}

// ✅ Total road distance (meters) along a route — used for adaptive zones
function getRouteLength(route: [number, number][]): number {
  let total = 0;
  for (let i = 1; i < route.length; i++) {
    total += getDistanceMeters(
      route[i - 1][0], route[i - 1][1],
      route[i][0], route[i][1]
    );
  }
  return total;
}

function EmergencyPageContent() {
  const { login } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 🇮🇳 City state (auto-detected from GPS, or manually selected)
  const [currentCity, setCurrentCity] = useState<IndianCity>(DEFAULT_CITY);
  const [showCitySelector, setShowCitySelector] = useState(false);
  const manualCityOverride = useRef(false);

  const [userLocation, setUserLocation] = useState({
    lat: DEFAULT_CITY.lat, lng: DEFAULT_CITY.lng,
  });
  const [locationStatus, setLocationStatus] = useState<
    "detecting" | "active" | "denied"
  >("detecting");

  const [sosActive, setSosActive]       = useState(false);
  const [stage, setStage]               = useState<Stage>("idle");
  const [eta, setEta]                   = useState(0);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding]       = useState(false);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [signalStates, setSignalStates] =
    useState<SignalState[]>(() => getSignalsForCity(DEFAULT_CITY));
  const [signalJump, setSignalJump] = useState(false);

  const [ambulancePos, setAmbulancePos] = useState({
    lat: 16.5109, lng: 80.6395,
  });

  const [ambulanceDestination, setAmbulanceDestination] = useState({
    lat: DEFAULT_CITY.lat, lng: DEFAULT_CITY.lng,
  });

  // ✅ Adaptive distance zones
  const [greenZone, setGreenZone]   = useState(250);
  const [yellowZone, setYellowZone] = useState(600);

  // ✅ Rapido-style real road route (OSRM), rendered via LiveMap's `polylines` prop
  const [routePath, setRoutePath] = useState<[number, number][]>([]);

  const [showResponderAmbulance, setShowResponderAmbulance] =
    useState(false);

  // ✅ City-derived data
  const HOSPITALS = getHospitalsWithDistance(
    currentCity, userLocation.lat, userLocation.lng
  );
  const CITY_AMBULANCES = getAmbulancesForCity(currentCity);

  const [selectedHospital, setSelectedHospital] = useState(
    () => getHospitalsWithDistance(DEFAULT_CITY, DEFAULT_CITY.lat, DEFAULT_CITY.lng)[0]
  );
  const [assignedAmbulanceId, setAssignedAmbulanceId] =
    useState<string | null>(null);

  const ambulanceIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const signalTimeoutsRef    = useRef<NodeJS.Timeout[]>([]);

  // ═══════════════════════════════════════════════════════════
  // ✅ FIX 1: Always-fresh values for the signal engine
  // (prevents the 300ms interval from being destroyed on every move)
  // ═══════════════════════════════════════════════════════════
  const liveRef = useRef({
    ambulancePos,
    ambulanceDestination,
    greenZone,
    yellowZone,
  });

  useEffect(() => {
    liveRef.current = {
      ambulancePos,
      ambulanceDestination,
      greenZone,
      yellowZone,
    };
  }, [ambulancePos, ambulanceDestination, greenZone, yellowZone]);

  // ── Auth ────────────────────────────────────────────────
  useEffect(() => {
    login("patient@pravaah360.in", "patient123", "patient");
    setIsAuthenticated(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Real GPS + auto city detection ──────────────────────
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("denied");
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const newLoc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserLocation(newLoc);
        setLocationStatus("active");

        if (!manualCityOverride.current) {
          setCurrentCity(findNearestCity(newLoc.lat, newLoc.lng));
        }
      },
      () => setLocationStatus("denied"),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 3000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // ── When city changes: refresh idle signals + hospital ──
  useEffect(() => {
    if (sosActive) return; // never disturb an active emergency
    setSignalStates(getSignalsForCity(currentCity));
    const hosp = getHospitalsWithDistance(
      currentCity, userLocation.lat, userLocation.lng
    );
    if (hosp.length > 0) setSelectedHospital(hosp[0]);
  }, [currentCity]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Cleanup on unmount ──────────────────────────────────
  useEffect(() => {
    return () => {
      if (ambulanceIntervalRef.current)
        clearInterval(ambulanceIntervalRef.current);
      signalTimeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  // ═══════════════════════════════════════════════════════════
  // ✅ FIX 2: SIGNAL ENGINE — stable interval via liveRef
  // 🔴 RED / 🟡 YELLOW / 🟢 GREEN / ✅ CROSSED
  // Depends ONLY on sosActive → never starved by ambulance moves
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (!sosActive) return;

    const interval = setInterval(() => {
      const {
        ambulancePos: amb,
        ambulanceDestination: dest,
        greenZone: gz,
        yellowZone: yz,
      } = liveRef.current;

      setSignalStates((prev) =>
        prev.map((signal) => {
          const distanceMeters = getDistanceMeters(
            amb.lat, amb.lng, signal.lat, signal.lng
          );

          const distAmbToDest = getDistanceMeters(
            amb.lat, amb.lng, dest.lat, dest.lng
          );

          const distSignalToDest = getDistanceMeters(
            signal.lat, signal.lng, dest.lat, dest.lng
          );

          // ✅ Signal is behind ambulance → CROSSED
          const isBehind =
            distAmbToDest < distSignalToDest &&
            distanceMeters > gz;

          if (isBehind) {
            return { ...signal, color: "red" as const, crossed: true };
          }

          // 🟢 Ambulance very close → GREEN
          if (distanceMeters <= gz) {
            return { ...signal, color: "green" as const, crossed: false };
          }

          // 🟡 Ambulance approaching → YELLOW
          if (distanceMeters <= yz) {
            return { ...signal, color: "yellow" as const, crossed: false };
          }

          // 🔴 Far away → RED
          return { ...signal, color: "red" as const, crossed: false };
        })
      );
    }, 300);

    return () => clearInterval(interval);
  }, [sosActive]);

  // ── Signal Jump Mode ────────────────────────────────────
  const activateSignalJump = () => {
    signalTimeoutsRef.current.forEach(clearTimeout);
    signalTimeoutsRef.current = [];

    setSignalJump(true);

    const signalsToAnimate = signalStates.map((s) => ({
      ...s,
      color: "red" as const,
      crossed: false,
    }));
    setSignalStates(signalsToAnimate);

    signalsToAnimate.forEach((signal, index) => {
      const baseDelay = index * 3000;

      const yellowTimeout = setTimeout(() => {
        setSignalStates((prev) =>
          prev.map((s) =>
            s.id === signal.id ? { ...s, color: "yellow" as const } : s
          )
        );
      }, baseDelay);

      const greenTimeout = setTimeout(() => {
        setSignalStates((prev) =>
          prev.map((s) =>
            s.id === signal.id ? { ...s, color: "green" as const } : s
          )
        );
      }, baseDelay + 1500);

      const redTimeout = setTimeout(() => {
        setSignalStates((prev) =>
          prev.map((s) =>
            s.id === signal.id
              ? { ...s, color: "red" as const, crossed: true }
              : s
          )
        );
      }, baseDelay + 8000);

      signalTimeoutsRef.current.push(yellowTimeout, greenTimeout, redTimeout);
    });

    const resetTimeout = setTimeout(() => {
      setSignalJump(false);
      setSignalStates((prev) =>
        prev.map((s) => ({ ...s, color: "red" as const, crossed: false }))
      );
    }, signalsToAnimate.length * 3000 + 8000);

    signalTimeoutsRef.current.push(resetTimeout);
  };

  // ── Hold SOS ────────────────────────────────────────────
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
        void triggerSOS();
      }
    }, 120);
  };

  const stopHold = () => {
    if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    setIsHolding(false);
    setHoldProgress(0);
  };

  // ═══════════════════════════════════════════════════════════
  // ✅ RAPIDO-STYLE ANIMATION ENGINE
  // Moves the ambulance along a real OSRM route (or the
  // straight-line fallback from routing.ts if OSRM is down).
  // Shared by both legs of the trip (pickup + hospital).
  // ═══════════════════════════════════════════════════════════
  const animateAlongRoute = (
    route: [number, number][],
    startEta: number,
    onComplete: () => void
  ) => {
    if (ambulanceIntervalRef.current) {
      clearInterval(ambulanceIntervalRef.current);
    }

    if (route.length < 2) {
      // Nothing to animate — jump straight to completion.
      onComplete();
      return;
    }

    const steps = Math.min(route.length, 150);
    const intervalMs = 20000 / steps;
    let step = 0;

    ambulanceIntervalRef.current = setInterval(() => {
      step++;
      const progress = step / steps;
      const idx = Math.min(
        route.length - 1,
        Math.floor(progress * (route.length - 1))
      );
      const [lat, lng] = route[idx];

      setAmbulancePos({ lat, lng });
      setEta(Math.max(0, Math.round(startEta * (1 - progress))));

      if (step >= steps) {
        clearInterval(ambulanceIntervalRef.current!);
        ambulanceIntervalRef.current = null;
        onComplete();
      }
    }, intervalMs);
  };

  // ── Trigger SOS (now async — fetches real road route) ──
  const triggerSOS = async () => {
    let nearestAmb = CITY_AMBULANCES[0];
    let minDist = manhattanDist(userLocation, CITY_AMBULANCES[0]);

    CITY_AMBULANCES.forEach((amb) => {
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

    setAmbulanceDestination({
      lat: userLocation.lat,
      lng: userLocation.lng,
    });

    // ✅ Fetch the real road route (falls back to a straight line if OSRM fails)
    const route = await getRoadRoute(
      { lat: nearestAmb.lat, lng: nearestAmb.lng },
      { lat: userLocation.lat, lng: userLocation.lng }
    );
    setRoutePath(route);

    // ✅ Junctions + zones based on the ACTUAL road distance
    const routeLen = getRouteLength(route);
    setGreenZone(Math.max(60, Math.min(250, routeLen * 0.10)));
    setYellowZone(Math.max(150, Math.min(600, routeLen * 0.30)));
    setSignalStates(generateJunctionsOnRoute(route));

    animateAlongRoute(route, 8, () => {
      setStage("arrived");
      setEta(0);

      setTimeout(() => {
        setStage("picked");

        // ✅ Hand off the ambulance's ACTUAL last route position
        // (not userLocation — OSRM may have snapped slightly to the road)
        const last = route[route.length - 1] ?? [userLocation.lat, userLocation.lng];

        setTimeout(() => {
          void startHospitalTrip({ lat: last[0], lng: last[1] });
        }, 2000);
      }, 2000);
    });
  };

  // ── Ambulance → Hospital (now async — fetches real road route) ──
  const startHospitalTrip = async (currentPos: { lat: number; lng: number }) => {
    setStage("hospital");

    const hospitalDest = {
      lat: selectedHospital.lat,
      lng: selectedHospital.lng,
    };

    setAmbulanceDestination(hospitalDest);

    const route = await getRoadRoute(currentPos, hospitalDest);
    setRoutePath(route);

    const routeLen = getRouteLength(route);
    setGreenZone(Math.max(60, Math.min(250, routeLen * 0.10)));
    setYellowZone(Math.max(150, Math.min(600, routeLen * 0.30)));
    setSignalStates(generateJunctionsOnRoute(route));
    setEta(6);

    animateAlongRoute(route, 6, () => {
      setTimeout(() => {
        alert(
          `✅ Emergency Completed!\n\n` +
          `Patient safely delivered to ` +
          `${selectedHospital.name}\n\n` +
          `Driver: ${ASSIGNED_AMBULANCE.driver.name}\n` +
          `Vehicle: ${ASSIGNED_AMBULANCE.vehicle.number}\n\n` +
          `Thank you for using Pravaah 360!`
        );

        setSosActive(false);
        setStage("idle");
        setShowResponderAmbulance(false);
        setAssignedAmbulanceId(null);
        setSignalJump(false);

        // ✅ Clear the route line
        setRoutePath([]);

        // ✅ Restore CURRENT CITY's idle signals
        setSignalStates(getSignalsForCity(currentCity));
        setGreenZone(250);
        setYellowZone(600);

        signalTimeoutsRef.current.forEach(clearTimeout);
        signalTimeoutsRef.current = [];

      }, 1000);
    });
  };

  const handleBackToLogin = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.error("Error clearing storage:", e);
    }
    window.location.href = "/login";
  };

  const mapAmbulances = [
    ...CITY_AMBULANCES.filter((a) => a.id !== assignedAmbulanceId),
    ...(showResponderAmbulance
      ? [{
          id: "AMB-SOS",
          lat: ambulancePos.lat,
          lng: ambulancePos.lng,
          status: "Responding to SOS",
        }]
      : []),
  ];

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
      <div className="h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-blue-200 font-medium">
            Loading Emergency Services...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-950 text-white">

      {/* ── HEADER ── */}
            <div className="relative z-[1100] flex-shrink-0 px-6 py-3 flex items-center justify-between border-b border-white/10 bg-slate-900/70 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <button
            onClick={() => (window.location.href = "/login")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-500/15 border border-blue-400/30 text-blue-200 hover:bg-blue-500/25 transition"
          >
            <ArrowLeft size={14} />
            Back
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-red-500 to-orange-500 shadow-lg shadow-red-500/30">
              <Siren size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-black text-white text-lg leading-none">
                Pravaah Emergency
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
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
                    : `Using ${currentCity.name} Default`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 🇮🇳 City Selector + Coordinates */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowCitySelector(!showCitySelector)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/15 border border-purple-400/30 text-purple-200 hover:bg-purple-500/25 transition"
            >
              <MapPin size={14} />
              <span className="text-xs font-bold">🇮🇳 {currentCity.name}</span>
              <ChevronDown size={12} />
            </button>

            {showCitySelector && (
              <div className="absolute top-full mt-2 left-0 w-56 z-50 bg-slate-900 border border-white/10 rounded-xl shadow-2xl max-h-72 overflow-y-auto">
                <div className="p-2 border-b border-white/10">
                  <p className="text-xs text-blue-300 font-bold uppercase px-2">
                    Select City
                  </p>
                </div>
                {INDIA_CITIES.map((city) => (
                  <button
                    key={city.name}
                    onClick={() => {
                      manualCityOverride.current = true;
                      setCurrentCity(city);
                      setUserLocation({ lat: city.lat, lng: city.lng });
                      setShowCitySelector(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 transition hover:bg-blue-500/20 border-b border-white/5 ${
                      currentCity.name === city.name ? "bg-blue-500/20" : ""
                    }`}
                  >
                    <p className="text-sm text-white font-medium">{city.name}</p>
                    <p className="text-xs text-blue-400">{city.state}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-400/20">
            <Navigation size={14} className="text-blue-400" />
            <span className="text-xs text-blue-300">
              {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {sosActive && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600 animate-pulse">
              <Radio size={12} className="text-white" />
              <span className="text-xs font-bold text-white">LIVE SOS</span>
            </div>
          )}
          <button
            onClick={() => window.open("tel:108")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-red-600 to-red-700 shadow-lg hover:from-red-700 hover:to-red-800"
          >
            <Phone size={14} />
            Call 108
          </button>
          <button
            onClick={handleBackToLogin}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold shadow-lg hover:scale-105 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* ── MAIN BODY ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT PANEL ── */}
        <div className="w-72 flex flex-col overflow-y-auto flex-shrink-0 border-r border-white/10 bg-slate-900/70">

          {/* Status Card */}
          <div className="p-4 border-b border-white/10">
            <div className={`rounded-xl p-4 border ${stageConfig[stage].bg} ${stageConfig[stage].border}`}>
              <div className="flex items-center gap-2 mb-2">
                {stageConfig[stage].icon}
                <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
                  Status
                </span>
              </div>
              <p className="text-sm font-bold text-white">
                {stageConfig[stage].text}
              </p>
              {eta > 0 && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
                  <Clock size={14} className="text-yellow-400" />
                  <span className="text-3xl font-black text-yellow-400">{eta}</span>
                  <span className="text-blue-300 text-sm">min ETA</span>
                </div>
              )}
            </div>
          </div>

          {/* SOS Hold Button */}
          <div className="p-5 border-b border-white/10 flex flex-col items-center gap-3">
            <div className="relative">
              <button
                onMouseDown={startHold}
                onMouseUp={stopHold}
                onMouseLeave={stopHold}
                onTouchStart={startHold}
                onTouchEnd={stopHold}
                disabled={sosActive}
                className="w-32 h-32 rounded-full font-black text-white flex flex-col items-center justify-center gap-2 transition-all select-none relative overflow-hidden"
                style={{
                  background: sosActive
                    ? "rgba(75,85,99,0.5)"
                    : "linear-gradient(135deg,#dc2626,#991b1b)",
                  boxShadow: sosActive
                    ? "none"
                    : "0 0 30px rgba(220,38,38,0.5), 0 0 60px rgba(220,38,38,0.2)",
                  cursor: sosActive ? "not-allowed" : "pointer",
                }}
              >
                {isHolding && (
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50" cy="50" r="46"
                      fill="none"
                      stroke="rgba(255,255,255,0.9)"
                      strokeWidth="5"
                      strokeDasharray={`${holdProgress * 2.89} 289`}
                      strokeLinecap="round"
                    />
                  </svg>
                )}
                <AlertTriangle size={30} />
                <span className="text-xs font-black tracking-wide">
                  {sosActive ? "ACTIVE" : "HOLD SOS"}
                </span>
              </button>

              {sosActive && (
                <div className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping opacity-40" />
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
              className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all text-white"
              style={{
                background: signalJump
                  ? "linear-gradient(135deg,#16a34a,#15803d)"
                  : "linear-gradient(135deg,#d97706,#b45309)",
                boxShadow: "0 4px 15px rgba(217,119,6,0.4)",
              }}
            >
              <Zap size={16} />
              {signalJump ? "✅ Sequence Active!" : "⚡ Signal Jump Mode"}
            </button>
            <p className="text-xs text-blue-400/70 mt-2 text-center">
              Clears signals one by one on ambulance route
            </p>
          </div>

          {/* Traffic Signals */}
          <div className="p-4 border-b border-white/10">
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Activity size={12} />
              Traffic Signals
            </h3>
            <div className="space-y-2">
              {signalStates.map((signal, index) => {
                const distMeters = sosActive
                  ? getDistanceMeters(
                      ambulancePos.lat, ambulancePos.lng,
                      signal.lat, signal.lng
                    )
                  : null;

                return (
                  <div
                    key={signal.id}
                    className="flex items-center justify-between rounded-lg px-3 py-2 bg-slate-800/40 border border-white/10"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs text-blue-400/50 font-mono">
                        {index + 1}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs text-blue-200 truncate">
                          {signal.name}
                        </span>
                        {distMeters !== null && !signal.crossed && (
                          <span className="text-[10px] text-blue-400/60 font-mono">
                            {distMeters < 1000
                              ? `${Math.round(distMeters)}m`
                              : `${(distMeters / 1000).toFixed(1)}km`}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {signal.crossed ? (
                        <>
                          <CheckCircle size={12} className="text-gray-500" />
                          <span className="text-xs font-bold text-gray-500">
                            CROSSED
                          </span>
                        </>
                      ) : (
                        <>
                          <div
                            className={`w-3 h-3 rounded-full animate-pulse ${
                              signal.color === "green"
                                ? "bg-green-400"
                                : signal.color === "yellow"
                                ? "bg-yellow-400"
                                : "bg-red-400"
                            }`}
                            style={{
                              boxShadow:
                                signal.color === "green"
                                  ? "0 0 10px #4ade80"
                                  : signal.color === "yellow"
                                  ? "0 0 10px #facc15"
                                  : "0 0 10px #f87171",
                            }}
                          />
                          <span
                            className={`text-xs font-bold ${
                              signal.color === "green"
                                ? "text-green-400"
                                : signal.color === "yellow"
                                ? "text-yellow-400"
                                : "text-red-400"
                            }`}
                          >
                            {signal.color.toUpperCase()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Assigned Ambulance */}
          {sosActive && (
            <div className="p-4 border-b border-white/10">
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Truck size={12} />
                Assigned Ambulance
              </h3>
              <div className="rounded-xl p-3 space-y-2 bg-slate-800/40 border border-white/10">
                {[
                  ["Vehicle", ASSIGNED_AMBULANCE.vehicle.number],
                  ["Type", ASSIGNED_AMBULANCE.vehicle.type],
                  ["Driver", ASSIGNED_AMBULANCE.driver.name],
                  ["Phone", ASSIGNED_AMBULANCE.driver.phone],
                  ["Experience", ASSIGNED_AMBULANCE.driver.experience],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-xs text-blue-400">{label}</span>
                    <span className="text-xs text-white font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="p-4 grid grid-cols-2 gap-2">
            {[
              { label: "Call 108",   icon: Phone,  color: "#f87171", action: () => window.open("tel:108") },
              { label: "Police 100", icon: Shield, color: "#60a5fa", action: () => window.open("tel:100") },
              { label: "Fire 101",   icon: Siren,  color: "#fb923c", action: () => window.open("tel:101") },
              {
                label: "Share GPS",
                icon: MapPin,
                color: "#4ade80",
                action: () => {
                  navigator.clipboard.writeText(
                    `https://maps.google.com?q=${userLocation.lat},${userLocation.lng}`
                  );
                  alert("📍 Location copied to clipboard!");
                },
              },
            ].map(({ label, icon: Icon, color, action }) => (
              <button
                key={label}
                onClick={action}
                className="flex flex-col items-center gap-1.5 rounded-xl p-3 transition-all hover:scale-105 bg-slate-800/40 border border-white/10"
              >
                <Icon size={20} style={{ color }} />
                <span className="text-xs text-blue-200 font-medium">{label}</span>
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
                : s.color === "yellow"
                ? "Warning"
                : "Congested",
            }))}
            sosVehicles={[]}
            userLocation={userLocation}
            showUserLocation={true}
            emergencies={[]}
            center={[userLocation.lat, userLocation.lng]}
            zoom={13}
            polylines={
              routePath.length > 1
                ? [{
                    id: "sos-route",
                    positions: routePath.map(([lat, lng]) => ({ lat, lng })),
                    color: "#3b82f6",
                    weight: 5,
                  }]
                : []
            }
          />

          {sosActive && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-900/95 backdrop-blur border border-red-700 shadow-xl z-[1000]">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
              <span className="text-white font-bold text-sm">
                {stage === "dispatched" && `🚑 Ambulance En Route · ETA ${eta} min`}
                {stage === "arrived"    && "🚑 Ambulance Has Arrived!"}
                {stage === "picked"     && "✅ Patient Picked Up Successfully"}
                {stage === "hospital"   && `🏥 Heading to ${selectedHospital.name}`}
              </span>
            </div>
          )}

          {signalJump && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 rounded-2xl bg-green-900/95 backdrop-blur border border-green-500 shadow-xl z-[1000]">
              <Zap size={16} className="text-green-400" />
              <span className="text-green-300 font-bold text-sm">
                ⚡ Signal Jump Active — Clearing One By One
              </span>
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL - HOSPITALS ── */}
        <div className="w-64 flex flex-col overflow-hidden flex-shrink-0 border-l border-white/10 bg-slate-900/70">
          <div className="p-4 border-b border-white/10 flex-shrink-0">
            <h2 className="font-bold text-white flex items-center gap-2 text-sm">
              <Hospital size={16} className="text-blue-400" />
              Nearby Hospitals
            </h2>
            <p className="text-xs text-blue-400/70 mt-1">
              {HOSPITALS.length} hospitals in {currentCity.name}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {HOSPITALS.map((hospital) => (
              <button
                key={hospital.id}
                onClick={() => setSelectedHospital(hospital)}
                className="w-full text-left rounded-xl p-3 transition-all text-xs"
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
                <p className="font-bold text-white leading-tight mb-1">
                  {hospital.name}
                </p>
                <span
                  className="inline-block px-1.5 py-0.5 rounded text-xs mb-2"
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
                <div className="flex items-center justify-between text-blue-300/70">
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