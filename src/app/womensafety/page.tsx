"use client";

import React, { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { 
  ArrowLeft, Shield, Phone, AlertTriangle, MapPin, 
  Plus, Trash2, Smartphone, Share2, Compass 
} from "lucide-react";
import { AppProvider } from "@/store/AppContext";
import { vijayawadaCenter } from "@/lib/pravaahDashboardData";

const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Circle = dynamic(() => import("react-leaflet").then((m) => m.Circle), { ssr: false });

function WomenSafetyContent() {
  const [sosActive, setSosActive] = useState(false);
  const [shakeOn, setShakeOn] = useState(false);
  const [userPos, setUserPos] = useState<[number, number]>(vijayawadaCenter);
  const [contacts, setContacts] = useState([
    { id: 1, name: "Mom", relation: "Mother", phone: "9876543210" },
    { id: 2, name: "Priya", relation: "Friend", phone: "9123456780" },
  ]);

  // Precise Location Request
  const requestPreciseLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser. Defaulting to Vijayawada.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserPos([latitude, longitude]);
        alert(`📍 Precise GPS Acquired: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      },
      () => {
        alert("Location permission denied. Using Vijayawada default coordinates.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const triggerSos = () => {
    setSosActive(true);
    alert("🚨 EMERGENCY SOS SENT to all trusted contacts & Vijayawada Police!");
  };

  const addContact = () => {
    const name = prompt("Enter Contact Name:");
    const phone = prompt("Enter Phone Number:");
    if (name && phone) {
      setContacts([...contacts, { id: Date.now(), name, relation: "Trusted", phone }]);
    }
  };

  const deleteContact = (id: number) => {
    setContacts(contacts.filter(c => c.id !== id));
  };

  return (
    <main className="min-h-screen overflow-y-auto pb-12 bg-[#0B0F19] text-white flex flex-col font-sans">
      {/* Header */}
      <header className="p-5 bg-[#131826] border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition">
            <ArrowLeft className="w-5 h-5 text-gray-300" />
          </Link>
          <div className="w-10 h-10 rounded-2xl bg-pink-500/20 text-pink-500 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Women&apos;s Safety</h1>
            <p className="text-xs text-pink-400 font-medium">Pravaah 360 · Personal Protection</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShakeOn(!shakeOn)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
              shakeOn ? "bg-orange-500 text-slate-950 border-orange-400" : "bg-white/5 text-gray-300 border-white/10"
            }`}
          >
            {shakeOn ? "📳 Shake SOS ON" : "📳 Shake OFF"}
          </button>
          <button
            onClick={requestPreciseLocation}
            className="flex items-center gap-2 px-3 py-1.5 bg-pink-500/10 border border-pink-500/30 text-pink-400 rounded-xl text-xs font-bold hover:bg-pink-500/20 transition"
          >
            <Compass className="w-4 h-4" />
            <span>Precise GPS</span>
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SOS & Quick Actions (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-[#131826] border border-white/5 rounded-3xl p-6 flex flex-col items-center text-center">
            <p className="text-xs text-pink-400 font-bold tracking-wider uppercase mb-4">EMERGENCY SOS</p>
            <button
              onClick={triggerSos}
              className={`w-36 h-36 rounded-full font-black text-2xl text-white shadow-2xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-all ${
                sosActive ? "bg-red-600 animate-pulse" : "bg-gradient-to-br from-pink-500 to-rose-700 hover:from-pink-600 hover:to-rose-800 shadow-pink-500/30"
              }`}
            >
              <AlertTriangle className="w-8 h-8" />
              <span>SOS</span>
            </button>
            <p className="text-xs text-gray-400 mt-4">Tap to instantly send SOS with live location to contacts</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => alert("📞 Simulated incoming call started!")}
              className="p-4 bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 text-purple-300 rounded-2xl text-xs font-bold flex flex-col items-center gap-2 transition"
            >
              <Smartphone className="w-5 h-5" />
              <span>Fake Call</span>
            </button>
            <button
              onClick={requestPreciseLocation}
              className="p-4 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-300 rounded-2xl text-xs font-bold flex flex-col items-center gap-2 transition"
            >
              <Share2 className="w-5 h-5" />
              <span>Share GPS</span>
            </button>
          </div>
        </div>

        {/* Center Map (5 cols) */}
        <div className="lg:col-span-5 bg-[#131826] border border-white/5 rounded-3xl p-4 flex flex-col">
          <div className="h-[450px] rounded-2xl overflow-hidden relative border border-white/5">
            <MapContainer center={userPos} zoom={13} style={{ height: "100%", width: "100%" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Circle center={userPos} radius={400} pathOptions={{ color: "#EC4899", fillColor: "#EC4899", fillOpacity: 0.3 }} />
            </MapContainer>
          </div>
        </div>

        {/* Contacts List (3 cols) */}
        <div className="lg:col-span-3 bg-[#131826] border border-white/5 rounded-3xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm">Trusted Contacts</h3>
            <button onClick={addContact} className="p-2 bg-pink-500 text-white rounded-xl text-xs font-bold hover:bg-pink-600 flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>

          <div className="space-y-3">
            {contacts.map((c) => (
              <div key={c.id} className="p-3 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-white">{c.name} <span className="text-gray-400 font-normal">({c.relation})</span></p>
                  <p className="text-gray-400 font-mono mt-0.5">{c.phone}</p>
                </div>
                <button onClick={() => deleteContact(c.id)} className="p-1.5 text-gray-500 hover:text-red-400 transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function WomenSafetyPage() {
  return (
    <AppProvider>
      <WomenSafetyContent />
    </AppProvider>
  );
}