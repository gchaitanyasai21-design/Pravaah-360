"use client";

import { useEffect, useState } from "react";
import { AppProvider } from "@/store/AppContext";
import { useAuth } from "@/store/AuthContext";
import LiveMap from "@/components/LiveMap";
import {
  Bell,
  CheckCircle2,
  Heart,
  HelpCircle,
  Home,
  MapPin,
  Phone,
  Shield,
  Smile,
  Users,
  ArrowLeft,   // ✅ Only new import
} from "lucide-react";
import {
  LatLng,
  VIJAYAWADA,
  VIJAYAWADA_HOSPITALS,
  distanceKm,
  readStoredLocation,
  useLiveLocation,
  useSecondsAgo,
} from "@/lib/realtime";

const CHILD_KEY  = "child_location_child_001";
const PARENT_KEY = "parent_location_parent_001";

const safeZone = {
  id:     "CHILD-SAFE",
  label:  "Home Safe Zone",
  lat:    16.5062,
  lng:    80.648,
  radius: 850,
};

const parentContacts = [
  { name: "Mom", phone: "+91 98765 41021", emoji: "👩" },
  { name: "Dad", phone: "+91 98765 41022", emoji: "👨" },
];

function ChildPageContent() {
  const { login } = useAuth();
  const {
    location,
    accuracy,
    locationStatus,
    lastUpdate,
  } = useLiveLocation(CHILD_KEY);

  const secondsAgo = useSecondsAgo(lastUpdate);

  const [parentLocation, setParentLocation] =
    useState<LatLng>(() =>
      readStoredLocation(PARENT_KEY, {
        lat: 16.5033,
        lng: 80.641,
      })
    );

  const [message, setMessage] = useState(
    "You are safe and connected."
  );
  const [focus, setFocus] = useState<
    "me" | "parent" | "all"
  >("all");

  useEffect(() => {
    void login(
      "child@pravaah360.in",
      "child123",
      "child_user"
    );
  }, [login]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      localStorage.setItem(
        CHILD_KEY,
        JSON.stringify({
          ...location,
          accuracy,
          timestamp: Date.now(),
        })
      );
      setParentLocation(
        readStoredLocation(PARENT_KEY, parentLocation)
      );
    }, 5000);
    return () => window.clearInterval(timer);
  }, [accuracy, location, parentLocation]);

  const isSafe =
    distanceKm(location, safeZone) * 1000 <= safeZone.radius;

  const mapCenter =
    focus === "me"
      ? location
      : focus === "parent"
      ? parentLocation
      : VIJAYAWADA;

  const showWhereAmI = () =>
    setMessage(
      `You are near Vijayawada: ` +
      `${location.lat.toFixed(4)}, ` +
      `${location.lng.toFixed(4)}`
    );

  const showParent = () => {
    setFocus("parent");
    setMessage(
      `Mom/Dad is about ` +
      `${distanceKm(location, parentLocation).toFixed(2)}` +
      ` km away.`
    );
  };

  const sendSafe = () =>
    setMessage(
      "I'm safe message sent to Mom and Dad."
    );

  const needHelp = () =>
    setMessage(
      "Help request sent. Parent and emergency " +
      "contacts were notified."
    );

  // ✅ Back button handler - only new function
  const handleBack = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.error(e);
    }
    window.location.href = "/login";
  };

  return (
    <main className="min-h-screen bg-slate-950
    text-slate-100">

      {/* Background */}
      <div className="fixed inset-0 -z-10
      bg-[radial-gradient(circle_at_top_left,
      rgba(34,197,94,0.18),transparent_32%),
      radial-gradient(circle_at_top_right,
      rgba(168,85,247,0.2),transparent_30%),
      linear-gradient(180deg,#020617,
      #0f172a_45%,#111827)]" />

      {/* ── HEADER ── */}
      <header className="border-b border-white/10
      bg-slate-950/70 px-5 py-4 backdrop-blur-xl">
        <div className="flex flex-col gap-3
        md:flex-row md:items-center
        md:justify-between">

          <div className="flex items-center gap-4">

            {/* ✅ Back Button - only new UI */}
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

            {/* Title - unchanged */}
            <div>
              <p className="text-sm text-slate-400">
                Child Safety · Pravaah 360
              </p>
              <h1 className="mt-1 flex items-center
              gap-3 text-4xl font-black text-white">
                <Smile className="h-9 w-9
                text-yellow-300" />
                Hi Ananya!
              </h1>
            </div>
          </div>

          {/* Safe Zone Badge - unchanged */}
          <span className={`
            inline-flex w-fit items-center gap-2
            rounded-2xl border px-4 py-3
            text-lg font-bold
            ${isSafe
              ? "border-green-400/30 bg-green-500/15 text-green-100"
              : "border-red-400/30 bg-red-500/15 text-red-100"
            }
          `}>
            <span className="h-3 w-3 animate-pulse
            rounded-full bg-current" />
            {isSafe ? "Safe Zone" : "Outside Safe Zone"}
          </span>

        </div>
      </header>

      {/* ── MAIN - completely unchanged ── */}
      <section className="grid gap-6 p-5
      xl:grid-cols-[320px_minmax(0,1fr)_320px]">

        {/* Left Aside - unchanged */}
        <aside className="space-y-5">
          <KidPanel>
            <p className="text-lg font-bold text-white">
              GPS is {locationStatus}
            </p>
            <p className="mt-2 text-slate-400">
              Updated {secondsAgo}s ago · ±{accuracy}m
            </p>
            <p className="mt-3 rounded-2xl bg-white/10
            p-3 text-sm text-slate-200">
              {message}
            </p>
          </KidPanel>

          {/* SOS Button - unchanged */}
          <button
            onClick={() =>
              setMessage(
                "SOS sent to parents and " +
                "emergency services!"
              )
            }
            className="relative flex h-44 w-full
            items-center justify-center
            rounded-[2rem] bg-gradient-to-br
            from-red-500 to-red-800 text-5xl
            font-black text-white shadow-2xl
            shadow-red-500/30 transition
            hover:-translate-y-1"
          >
            <span className="absolute inset-0
            rounded-[2rem] bg-red-500/30
            animate-ping" />
            <span className="relative">SOS</span>
          </button>

          {/* Big Buttons - unchanged */}
          <div className="grid grid-cols-2 gap-3">
            <BigButton
              icon={MapPin}
              label="Where am I?"
              onClick={showWhereAmI}
              color="from-blue-500 to-cyan-500"
            />
            <BigButton
              icon={Users}
              label="Where's Mom/Dad?"
              onClick={showParent}
              color="from-purple-500 to-pink-500"
            />
            <BigButton
              icon={CheckCircle2}
              label="I'm Safe"
              onClick={sendSafe}
              color="from-green-500 to-emerald-500"
            />
            <BigButton
              icon={HelpCircle}
              label="I Need Help"
              onClick={needHelp}
              color="from-orange-500 to-red-500"
            />
          </div>
        </aside>

        {/* Map - completely unchanged */}
        <div className="h-[650px] overflow-hidden
        rounded-[2rem] border border-white/10
        bg-white/[0.07] p-3 shadow-2xl
        shadow-slate-950/30 backdrop-blur-xl">
          <LiveMap
            key={focus}
            center={[mapCenter.lat, mapCenter.lng]}
            zoom={focus === "all" ? 13 : 15}
            autoFitBounds={focus === "all"}
            customMarkers={[
              {
                id:     "child",
                label:  "Me",
                lat:    location.lat,
                lng:    location.lng,
                emoji:  "🧒",
                color:  "#22c55e",
                size:   44,
                pulse:  true,
                popup:  "<b>This is you</b>",
              },
              {
                id:     "parent",
                label:  "Parent",
                lat:    parentLocation.lat,
                lng:    parentLocation.lng,
                emoji:  "👨",
                color:  "#3b82f6",
                size:   38,
                pulse:  true,
                popup:  "<b>Mom/Dad location</b>",
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
            polylines={[{
              id:        "family-line",
              positions: [location, parentLocation],
              color:     "#38bdf8",
              dashed:    true,
            }]}
            hospitals={VIJAYAWADA_HOSPITALS.slice(0, 6)}
          />
        </div>

        {/* Right Aside - completely unchanged */}
        <aside className="space-y-5">
          <KidPanel>
            <h2 className="flex items-center gap-2
            text-2xl font-black text-white">
              <Home className="h-6 w-6 text-green-300" />
              My Safe Place
            </h2>
            <p className="mt-3 text-slate-300">
              {safeZone.label}
            </p>
            <p className="mt-2 text-sm text-slate-400">
              {Math.round(
                distanceKm(location, safeZone) * 1000
              )}m from center
            </p>
          </KidPanel>

          <KidPanel>
            <h2 className="flex items-center gap-2
            text-2xl font-black text-white">
              <Phone className="h-6 w-6 text-blue-300" />
              My People
            </h2>
            <div className="mt-4 space-y-3">
              {parentContacts.map((contact) => (
                <a
                  key={contact.name}
                  href={`tel:${contact.phone}`}
                  className="flex items-center gap-3
                  rounded-2xl border border-white/10
                  bg-white/[0.04] p-3 transition
                  hover:bg-white/10"
                >
                  <span className="text-3xl">
                    {contact.emoji}
                  </span>
                  <span>
                    <span className="block font-bold
                    text-white">
                      {contact.name}
                    </span>
                    <span className="text-sm
                    text-slate-400">
                      {contact.phone}
                    </span>
                  </span>
                </a>
              ))}
            </div>
          </KidPanel>

          <KidPanel>
            <h2 className="flex items-center gap-2
            text-xl font-bold text-white">
              <Shield className="h-5 w-5
              text-purple-300" />
              Nearby Help
            </h2>
            <div className="mt-3 space-y-2
            text-sm text-slate-300">
              <p>
                <Bell className="mr-2 inline h-4 w-4
                text-red-300" />
                Ambulance 108
              </p>
              <p>
                <Heart className="mr-2 inline h-4 w-4
                text-green-300" />
                Hospitals shown on map
              </p>
            </div>
          </KidPanel>
        </aside>

      </section>
    </main>
  );
}

// ── Sub-components - completely unchanged ──────────────
function KidPanel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[2rem] border border-white/10
    bg-white/[0.07] p-5 shadow-2xl
    shadow-slate-950/30 backdrop-blur-xl">
      {children}
    </div>
  );
}

function BigButton({
  icon: Icon,
  label,
  color,
  onClick,
}: {
  icon: typeof MapPin;
  label: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex min-h-28 flex-col items-center
        justify-center gap-2 rounded-[1.5rem]
        bg-gradient-to-br ${color} p-3 text-center
        text-lg font-black text-white shadow-xl
        transition hover:-translate-y-1
      `}
    >
      <Icon className="h-8 w-8" />
      {label}
    </button>
  );
}

export default function ChildPage() {
  return (
    <AppProvider>
      <ChildPageContent />
    </AppProvider>
  );
}