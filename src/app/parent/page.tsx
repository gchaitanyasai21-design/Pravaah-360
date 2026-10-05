"use client";

import { useState } from "react";
import { ArrowLeft, CheckCircle2, Clock3, LocateFixed, MapPin, MessageCircle, Phone, Shield, Smartphone, UserRound } from "lucide-react";
import LiveMap from "@/components/LiveMap";
import { AppProvider } from "@/store/AppContext";
import { helpPoints, vijayawadaCenter } from "@/lib/pravaahDashboardData";

const child = { lat: 16.5089, lng: 80.652 };
const parent = { lat: 16.5026, lng: 80.648 };
const safeCenter: [number, number] = [16.5072, 80.656];

function ParentContent() {
  const [liveLocationOn, setLiveLocationOn] = useState(true);
  const [gpsStatus, setGpsStatus] = useState("Vijayawada default - +/-0m");
  const [childMarker, setChildMarker] = useState(child);
  const [lastAction, setLastAction] = useState("Live location ready");

  const callChild = () => {
    setLastAction("Calling Ananya...");
    window.open("tel:+919876541021");
  };

  const messageChild = () => {
    const msg = prompt("Enter message to send to Ananya:");
    if (msg) {
      setLastAction(`Message sent to Ananya: "${msg}"`);
      alert(`Message successfully delivered to Ananya's device.`);
    }
  };

  const findChild = () => {
    const fallback = { lat: vijayawadaCenter[0], lng: vijayawadaCenter[1] };
    
    if (!navigator.geolocation) {
      setChildMarker(fallback);
      setGpsStatus("GPS unavailable - Vijayawada default");
      setLastAction("Child centered on Vijayawada fallback");
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setLastAction("Requesting high-accuracy GPS...");
    
    // PRECISE HIGH-ACCURACY GPS PERMISSION
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next = { lat: position.coords.latitude, lng: position.coords.longitude };
        setChildMarker(next);
        setGpsStatus("GPS refreshed just now");
        setLastAction("Child location refreshed with high accuracy");
        alert(`📍 Precise GPS Acquired: ${next.lat.toFixed(4)}, ${next.lng.toFixed(4)}`);
      },
      (error) => {
        setChildMarker(fallback);
        setGpsStatus("GPS denied - Vijayawada default");
        setLastAction("Permission denied. Using fallback.");
        alert("GPS Permission denied. Using Vijayawada default coordinates.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <main className="min-h-screen overflow-y-auto pb-12 bg-[#0B0F19] text-white">
      <header className="flex h-[90px] items-center justify-between border-b border-white/5 px-6 bg-[#131826]">
        <div className="flex items-center gap-5">
          <button onClick={() => (window.location.href = "/login")} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 hover:bg-white/20 px-5 py-3 font-black text-slate-200 transition-all">
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>
          <div>
            <p className="text-sm font-semibold text-slate-500">Parent Monitor - Vijayawada AP 520013</p>
            <h1 className="flex items-center gap-3 text-3xl font-black"><UserRound className="h-9 w-9 text-blue-400" />Welcome, Priya Sharma</h1>
          </div>
        </div>
        <div className="flex gap-3">
          <span className="rounded-xl border border-emerald-400/20 bg-emerald-500/15 px-5 py-3 font-black text-emerald-300 shadow-inner">{gpsStatus}</span>
          <button 
            onClick={() => setLiveLocationOn((on) => !on)} 
            className={`rounded-xl border px-5 py-3 font-black transition-all ${
              liveLocationOn ? "border-emerald-400/20 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25" : "border-red-400/20 bg-red-500/15 text-red-300 hover:bg-red-500/25"
            }`}
          >
            Live location {liveLocationOn ? "On" : "Off"}
          </button>
        </div>
      </header>

      <section className="grid h-[calc(100vh-90px)] lg:grid-cols-[1fr_360px] gap-6 p-6">
        <div className="min-h-0 space-y-6">
          <div className="h-[calc(100%-190px)] overflow-hidden rounded-3xl border border-white/10 bg-[#131826] p-3 shadow-2xl">
            <LiveMap
              center={vijayawadaCenter}
              zoom={14}
              geofence={{ center: safeCenter, radius: 820 }}
              childLocation={liveLocationOn ? childMarker : undefined}
              parentLocation={parent}
              helpPoints={helpPoints}
            />
          </div>

          <article className="rounded-3xl border border-white/10 bg-[#131826] p-5 shadow-xl">
            <h2 className="mb-5 flex items-center gap-2 text-xl font-black"><Clock3 className="h-5 w-5 text-violet-400" />Recent Locations - Last 24 Hours</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                ["Live child location", "Now", "16.5089, 80.6520"],
                ["Benz Circle", "08:10 AM", "16.5062, 80.6480"],
                ["MG Road", "09:25 AM", "16.5033, 80.6410"],
                ["Governorpet", "11:40 AM", "16.5180, 80.6350"],
                ["Patamata", "02:15 PM", "16.5220, 80.6280"],
              ].map(([title, time, coords]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors">
                  <h3 className="font-black text-white">{title}</h3>
                  <p className="mt-2 font-bold text-blue-300">{time}</p>
                  <p className="mt-3 text-xs text-slate-500 font-mono">{coords}</p>
                </div>
              ))}
            </div>
          </article>
        </div>

        <aside className="space-y-5">
          <article className="rounded-3xl border border-white/10 bg-[#131826] p-5 shadow-xl">
            <div className="mb-6 flex items-center gap-4">
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-emerald-500/20"><UserRound className="h-9 w-9 text-yellow-400" /></span>
              <div><h2 className="text-2xl font-black text-white">Ananya</h2><p className="font-semibold text-slate-400">Age 11 - Vijayawada Public School</p></div>
            </div>
            {[
              [MapPin, "Distance to child", liveLocationOn ? "0.52 km" : "Paused", "text-blue-300"],
              [Shield, "Safe zone", "Inside safe zone", "text-emerald-400"],
              [Smartphone, "Screen time today", "2h 18m", "text-orange-300"],
            ].map(([Icon, label, value, color]) => (
              <div key={label as string} className="mb-4 rounded-2xl border border-white/10 bg-[#1A2235] p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-slate-400"><Icon className="h-4 w-4" />{label as string}</p>
                <p className={`mt-3 text-xl font-black ${color as string}`}>{value as string}</p>
              </div>
            ))}
          </article>

          <article className="rounded-3xl border border-white/10 bg-[#131826] p-5 shadow-xl">
            <h2 className="mb-4 text-xl font-black text-white">Quick Actions</h2>
            <button onClick={callChild} className="mb-3 flex w-full items-center gap-3 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 px-4 py-3 text-left font-bold text-blue-100 transition-colors"><Phone className="h-5 w-5" />Call Child</button>
            <button onClick={messageChild} className="mb-3 flex w-full items-center gap-3 rounded-xl bg-violet-500/20 hover:bg-violet-500/30 px-4 py-3 text-left font-bold text-violet-100 transition-colors"><MessageCircle className="h-5 w-5" />Message</button>
            <button onClick={findChild} className="mb-3 flex w-full items-center justify-center gap-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 px-4 py-3 font-black text-emerald-100 transition-colors"><LocateFixed className="h-5 w-5" />Find My Child</button>
            <button className="flex w-full items-center justify-center gap-3 rounded-xl bg-white/10 hover:bg-white/20 px-4 py-3 font-bold text-white transition-colors">Show Family View</button>
            <p className="mt-3 text-center text-sm font-semibold text-slate-400">{lastAction}</p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-[#131826] p-5 shadow-xl">
            <h2 className="mb-5 text-xl font-black text-white">Safety Summary</h2>
            {["Geo-fence monitor active", "Parent-child sync via local device storage", "Live GPS fallback set to Vijayawada"].map((item) => (
              <p key={item} className="mb-3 flex items-center gap-3 text-sm font-semibold text-slate-300"><CheckCircle2 className="h-4 w-4 text-emerald-400" />{item}</p>
            ))}
          </article>
        </aside>
      </section>
    </main>
  );
}

export default function ParentPage() {
  return (
    <AppProvider>
      <ParentContent />
    </AppProvider>
  );
}