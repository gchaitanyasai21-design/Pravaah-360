"use client";

import { useEffect, useMemo, useState } from "react";
import { AppProvider } from "@/store/AppContext";
import { useAuth } from "@/store/AuthContext";
import LiveMap from "@/components/LiveMap";
import {
  Bell,
  CheckCircle2,
  Clock,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Radar,
  Shield,
  Smartphone,
  UserCheck,
  ArrowLeft,
} from "lucide-react";
import {
  LatLng,
  VIJAYAWADA,
  distanceKm,
  readStoredLocation,
  useLiveLocation,
  useSecondsAgo,
} from "@/lib/realtime";

interface TimelineItem {
  id: string;
  label: string;
  time: string;
  location: LatLng;
}

const CHILD_KEY  = "child_location_child_001";
const PARENT_KEY = "parent_location_parent_001";

const safeZone = {
  id:     "SAFE-01",
  label:  "Home Safe Zone - Benz Circle",
  lat:    16.5062,
  lng:    80.648,
  radius: 850,
};

const childProfile = {
  name:   "Ananya",
  age:    11,
  phone:  "+91 98765 41003",
  school: "Vijayawada Public School",
};

// ✅ Safe default - same on server and client
const DEFAULT_CHILD_LOCATION: LatLng = {
  lat: 16.5089,
  lng: 80.652,
};

const baseHistory: TimelineItem[] = [
  {
    id: "T1", label: "Benz Circle",
    time: "08:10 AM",
    location: { lat: 16.5062, lng: 80.648 },
  },
  {
    id: "T2", label: "MG Road",
    time: "09:25 AM",
    location: { lat: 16.5033, lng: 80.641 },
  },
  {
    id: "T3", label: "Governorpet",
    time: "11:40 AM",
    location: { lat: 16.518, lng: 80.635 },
  },
  {
    id: "T4", label: "Patamata",
    time: "02:15 PM",
    location: { lat: 16.522, lng: 80.628 },
  },
];

function ParentPageContent() {
  const { login } = useAuth();

  const {
    location: parentLocation,
    accuracy,
    locationStatus,
    lastUpdate,
  } = useLiveLocation(PARENT_KEY);

  const lastSeconds = useSecondsAgo(lastUpdate);

  // ✅ Fix 1: Always start with safe default
  // NEVER read localStorage in useState initializer
  // Server and client must match on first render
  const [childLocation, setChildLocation] =
    useState<LatLng>(DEFAULT_CHILD_LOCATION);

  const [liveTracking, setLiveTracking] = useState(true);
  const [focusedChild, setFocusedChild] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // ✅ Fix 2: Track if component is mounted on client
  const [mounted, setMounted] = useState(false);

  // ── Auth ──────────────────────────────────────────────
  useEffect(() => {
    void login(
      "parent@pravaah360.in",
      "parent123",
      "parent_user"
    );
  }, [login]);

  // ✅ Fix 3: Set mounted + read localStorage
  // only AFTER hydration is complete
  useEffect(() => {
    setMounted(true);
    const stored = readStoredLocation(
      CHILD_KEY,
      DEFAULT_CHILD_LOCATION
    );
    setChildLocation(stored);
  }, []);

  // ── Poll child location every 3s ──────────────────────
  useEffect(() => {
    if (!mounted) return;
    const timer = window.setInterval(() => {
      if (!liveTracking) return;
      setChildLocation(
        readStoredLocation(CHILD_KEY, childLocation)
      );
    }, 3000);
    return () => window.clearInterval(timer);
  }, [childLocation, liveTracking, mounted]);

  // ── Safe zone check ───────────────────────────────────
  const distanceToChild =
    distanceKm(parentLocation, childLocation);
  const distanceToSafeZone =
    distanceKm(childLocation, safeZone);
  const isSafe =
    distanceToSafeZone * 1000 <= safeZone.radius;

  useEffect(() => {
    setAlertMessage(
      isSafe
        ? ""
        : `${childProfile.name} moved outside ${safeZone.label}`
    );
  }, [isSafe]);

  // ✅ Fix 4: Timeline uses mounted flag
  // Server renders with DEFAULT location
  // Client updates after mount
  const timeline = useMemo<TimelineItem[]>(
    () => [
      {
        id:    "LIVE",
        label: "Live child location",
        time:  "Now",
        // ✅ Use default until mounted
        location: mounted
          ? childLocation
          : DEFAULT_CHILD_LOCATION,
      },
      ...baseHistory,
    ],
    [childLocation, mounted]
  );

  // ✅ Back to login
  const handleBack = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.error(e);
    }
    window.location.href = "/login";
  };

  // ── Render ────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-slate-950
    text-slate-100">

      {/* Background gradient */}
      <div className="fixed inset-0 -z-10
      bg-[radial-gradient(circle_at_top_left,
      rgba(59,130,246,0.22),transparent_32%),
      radial-gradient(circle_at_top_right,
      rgba(34,197,94,0.16),transparent_30%),
      linear-gradient(180deg,#020617,
      #0f172a_45%,#111827)]" />

      {/* ── HEADER ── */}
      <header className="border-b border-white/10
      bg-slate-950/70 px-6 py-4 backdrop-blur-xl">
        <div className="flex flex-col gap-3
        lg:flex-row lg:items-center
        lg:justify-between">

          <div className="flex items-center gap-4">

            {/* Back Button */}
            <button
              onClick={handleBack}
              className="
                flex items-center gap-2
                px-4 py-2 rounded-xl
                text-sm font-semibold
                bg-white/10
                border border-white/20
                text-slate-200
                hover:bg-white/20
                transition-all
                hover:-translate-y-0.5
              "
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            {/* Title */}
            <div>
              <p className="text-sm text-slate-400">
                Parent Monitor · Vijayawada AP 520013
              </p>
              <h1 className="mt-1 flex items-center
              gap-3 text-3xl font-bold text-white">
                <UserCheck className="h-8 w-8
                text-blue-300" />
                Welcome, Priya Sharma
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap
          items-center gap-3">
            <LiveBadge
              status={locationStatus}
              seconds={lastSeconds}
              accuracy={accuracy}
            />
            <button
              onClick={() => setLiveTracking((v) => !v)}
              className={`
                rounded-xl px-4 py-2 text-sm
                font-semibold transition
                hover:-translate-y-0.5
                ${liveTracking
                  ? "bg-green-500/20 text-green-100 " +
                    "border border-green-400/30"
                  : "bg-white/10 text-slate-300 " +
                    "border border-white/10"
                }
              `}
            >
              Live location{" "}
              {liveTracking ? "On" : "Off"}
            </button>
          </div>

        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <section className="grid gap-6 p-6
      xl:grid-cols-[minmax(0,1fr)_360px]">

        <div className="space-y-6">

          {/* Alert Banner */}
          {alertMessage && (
            <div className="rounded-3xl border
            border-red-400/30 bg-red-500/15 p-4
            text-red-100 shadow-2xl
            shadow-red-950/30">
              <Bell className="mr-2 inline h-5 w-5" />
              {alertMessage}
            </div>
          )}

          {/* Map */}
          <div className="h-[620px] overflow-hidden
          rounded-3xl border border-white/10
          bg-white/[0.07] p-3 shadow-2xl
          shadow-slate-950/30 backdrop-blur-xl">
            <LiveMap
              key={focusedChild
                ? "child-focus"
                : "family-map"}
              center={focusedChild
                ? [childLocation.lat, childLocation.lng]
                : [VIJAYAWADA.lat, VIJAYAWADA.lng]}
              zoom={focusedChild ? 15 : 13}
              autoFitBounds={!focusedChild}
              customMarkers={[
                {
                  id:    "parent",
                  label: "Parent",
                  lat:   parentLocation.lat,
                  lng:   parentLocation.lng,
                  emoji: "👨",
                  color: "#3b82f6",
                  pulse: true,
                  popup: "<b>Parent live location</b>",
                },
                {
                  id:    "child",
                  label: "Child",
                  lat:   childLocation.lat,
                  lng:   childLocation.lng,
                  emoji: "👧",
                  color: "#22c55e",
                  pulse: true,
                  popup: `<b>${childProfile.name}</b>
                          <br/>Last seen now`,
                },
              ]}
              circles={[{
                id:     safeZone.id,
                lat:    safeZone.lat,
                lng:    safeZone.lng,
                radius: safeZone.radius,
                color:  isSafe ? "#22c55e" : "#ef4444",
                label:  safeZone.label,
              }]}
              polylines={[
                {
                  id:        "family-line",
                  positions: [parentLocation, childLocation],
                  color:     "#38bdf8",
                  dashed:    true,
                },
                {
                  id:       "history",
                  positions: timeline.map((t) => t.location),
                  color:    "#a855f7",
                  dashed:   true,
                  weight:   3,
                },
              ]}
            />
          </div>

          {/* Timeline */}
          <div className="rounded-3xl border
          border-white/10 bg-white/[0.07] p-5
          shadow-2xl shadow-slate-950/30
          backdrop-blur-xl">
            <h2 className="mb-4 flex items-center
            gap-2 text-xl font-bold text-white">
              <Clock className="h-5 w-5
              text-purple-300" />
              Recent Locations · Last 24 Hours
            </h2>
            <div className="grid gap-3 md:grid-cols-5">
              {timeline.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border
                  border-white/10 bg-white/[0.04] p-4"
                >
                  <p className="font-semibold text-white">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm
                  text-slate-400">
                    {item.time}
                  </p>

                  {/* ✅ Fix 5: suppressHydrationWarning
                      on dynamic location values */}
                  <p
                    className="mt-2 text-xs text-slate-500"
                    suppressHydrationWarning
                  >
                    {item.location.lat.toFixed(4)},{" "}
                    {item.location.lng.toFixed(4)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── ASIDE ── */}
        <aside className="space-y-5">

          {/* Child Profile */}
          <Panel>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16
              items-center justify-center
              rounded-3xl bg-green-500/20 text-3xl">
                👧
              </div>
              <div>
                <h2 className="text-xl font-bold
                text-white">
                  {childProfile.name}
                </h2>
                <p className="text-sm text-slate-400">
                  Age {childProfile.age} ·{" "}
                  {childProfile.school}
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              <Metric
                icon={Navigation}
                label="Distance to child"
                value={`${distanceToChild.toFixed(2)} km`}
                suppressHydration
              />
              <Metric
                icon={Shield}
                label="Safe zone"
                value={isSafe
                  ? "Inside safe zone"
                  : "Outside safe zone"}
                tone={isSafe
                  ? "text-green-200"
                  : "text-red-200"}
              />
              <Metric
                icon={Smartphone}
                label="Screen time today"
                value="2h 18m"
                tone="text-orange-200"
              />
            </div>
          </Panel>

          {/* Quick Actions */}
          <Panel>
            <h3 className="mb-4 text-lg font-bold
            text-white">
              Quick Actions
            </h3>
            <div className="grid gap-3">
              <a
                href={`tel:${childProfile.phone}`}
                className="action-btn bg-blue-500/15
                text-blue-100 border-blue-400/30"
              >
                <Phone className="h-4 w-4" />
                Call Child
              </a>
              <a
                href={`sms:${childProfile.phone}`}
                className="action-btn bg-purple-500/15
                text-purple-100 border-purple-400/30"
              >
                <MessageCircle className="h-4 w-4" />
                Message
              </a>
              <button
                onClick={() => setFocusedChild(true)}
                className="action-btn bg-green-500/15
                text-green-100 border-green-400/30"
              >
                <Radar className="h-4 w-4" />
                Find My Child
              </button>
              <button
                onClick={() => setFocusedChild(false)}
                className="action-btn bg-white/10
                text-slate-200 border-white/10"
              >
                <MapPin className="h-4 w-4" />
                Show Family View
              </button>
            </div>
          </Panel>

          {/* Safety Summary */}
          <Panel>
            <h3 className="mb-4 text-lg font-bold
            text-white">
              Safety Summary
            </h3>
            <div className="space-y-3 text-sm
            text-slate-300">
              <p>
                <CheckCircle2 className="mr-2 inline
                h-4 w-4 text-green-300" />
                Geo-fence monitor active
              </p>
              <p>
                <CheckCircle2 className="mr-2 inline
                h-4 w-4 text-green-300" />
                Parent-child sync via local
                device storage
              </p>
              <p>
                <CheckCircle2 className="mr-2 inline
                h-4 w-4 text-green-300" />
                Live GPS fallback set to Vijayawada
              </p>
            </div>
          </Panel>

        </aside>
      </section>
    </main>
  );
}

// ── Sub-components ─────────────────────────────────────

function Panel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-white/10
    bg-white/[0.07] p-5 shadow-2xl
    shadow-slate-950/30 backdrop-blur-xl">
      {children}
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  tone = "text-blue-200",
  suppressHydration = false,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
  tone?: string;
  suppressHydration?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10
    bg-white/[0.04] p-4">
      <p className="flex items-center gap-2
      text-sm text-slate-400">
        <Icon className="h-4 w-4" />
        {label}
      </p>
      {/* ✅ suppressHydrationWarning for dynamic values */}
      <p
        className={`mt-2 text-lg font-bold ${tone}`}
        suppressHydrationWarning={suppressHydration}
      >
        {value}
      </p>
    </div>
  );
}

function LiveBadge({
  status,
  seconds,
  accuracy,
}: {
  status: string;
  seconds: number;
  accuracy: number;
}) {
  return (
    <span
      className="inline-flex items-center gap-2
      rounded-xl border border-green-400/20
      bg-green-500/10 px-3 py-2 text-sm
      text-green-100"
      suppressHydrationWarning  // ✅ seconds changes
    >
      <span className="h-2 w-2 animate-pulse
      rounded-full bg-green-400" />
      {status} · {seconds}s ago · ±{accuracy}m
    </span>
  );
}

export default function ParentPage() {
  return (
    <AppProvider>
      <ParentPageContent />
    </AppProvider>
  );
}