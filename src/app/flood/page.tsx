// PRAVAAH 360 - Urban Flood Intelligence Dashboard

"use client";

import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { 
  CloudRain, Droplets, Waves, Users, AlertTriangle, Navigation, 
  Crosshair, Bell, Building2, Phone, ArrowLeft, Radio, Siren 
} from "lucide-react";

// Leaflet Dynamic Import (ssr: false)
const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Circle = dynamic(() => import("react-leaflet").then((m) => m.Circle), { ssr: false });

export default function FloodPage() {
  return (
    <div className="min-h-screen overflow-y-auto pb-12 bg-[#0B0F19] text-white flex flex-col font-sans">
      {/* 1. Header */}
      <header className="p-6 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <CloudRain className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Urban Flood Intelligence</h1>
            <p className="text-sm text-cyan-400 font-medium">0–3 hr Nowcasting & Flood-Safe Routing · Vijayawada 520013</p>
          </div>
        </div>

        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </header>

      {/* 2. Top Stats Row */}
      <div className="px-6 pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#131826] border border-white/5 rounded-2xl p-5">
          <div className="flex justify-between items-center text-xs text-yellow-500 font-bold tracking-wider mb-2">
            <span>ACTIVE ALERTS</span>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="text-4xl font-bold text-yellow-500">7</div>
        </div>

        <div className="bg-[#131826] border border-white/5 rounded-2xl p-5">
          <div className="flex justify-between items-center text-xs text-blue-400 font-bold tracking-wider mb-2">
            <span>RAINFALL</span>
            <Droplets className="w-5 h-5" />
          </div>
          <div className="text-4xl font-bold text-blue-400">42 mm/h</div>
        </div>

        <div className="bg-[#131826] border border-white/5 rounded-2xl p-5">
          <div className="flex justify-between items-center text-xs text-red-400 font-bold tracking-wider mb-2">
            <span>FLOODED ROADS</span>
            <Waves className="w-5 h-5" />
          </div>
          <div className="text-4xl font-bold text-red-400">12</div>
        </div>

        <div className="bg-[#131826] border border-white/5 rounded-2xl p-5">
          <div className="flex justify-between items-center text-xs text-purple-400 font-bold tracking-wider mb-2">
            <span>PEOPLE AT RISK</span>
            <Users className="w-5 h-5" />
          </div>
          <div className="text-4xl font-bold text-purple-400">3,200</div>
        </div>
      </div>

      {/* 3. Main Content Grid */}
      <main className="px-6 pb-32 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* GIS Map */}
          <div className="bg-[#131826] border border-white/5 rounded-2xl overflow-hidden relative h-[500px]">
            <MapContainer
              center={[16.5062, 80.648]}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Circle center={[16.5089, 80.6187]} radius={350} pathOptions={{ color: "#EF4444", fillColor: "#EF4444", fillOpacity: 0.4 }} />
              <Circle center={[16.5075, 80.6422]} radius={250} pathOptions={{ color: "#F97316", fillColor: "#F97316", fillOpacity: 0.4 }} />
              <Circle center={[16.498, 80.618]} radius={400} pathOptions={{ color: "#EF4444", fillColor: "#EF4444", fillOpacity: 0.4 }} />
            </MapContainer>

            <div className="absolute top-4 right-4 z-[1000] flex gap-2">
              <button className="px-3 py-1.5 rounded-full text-xs font-semibold bg-cyan-500 text-white shadow-md">Current</button>
              <button className="px-3 py-1.5 rounded-full text-xs font-semibold bg-black/60 backdrop-blur border border-white/10 text-gray-300 hover:bg-black/80">
                +1 hr
              </button>
              <button className="px-3 py-1.5 rounded-full text-xs font-semibold bg-black/60 backdrop-blur border border-white/10 text-gray-300 hover:bg-black/80">
                +3 hr
              </button>
            </div>

            <div className="absolute bottom-4 left-4 z-[1000] bg-[#131826]/95 border border-white/10 rounded-xl p-3 backdrop-blur text-xs text-white space-y-1.5 shadow-xl">
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">LEGEND</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500"></span> Flooded (HIGH)</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-500"></span> At risk (MED)</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Rain sensors</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500"></span> Shelters</div>
            </div>
          </div>

          {/* Rainfall Nowcast Chart */}
          <div className="bg-[#131826] border border-white/5 rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 text-lg font-bold text-white">
                  <CloudRain className="w-5 h-5 text-cyan-400" />
                  <span>0–3 hr Rainfall Nowcast</span>
                </div>
                <p className="text-sm text-gray-400 mt-1">Peak 62.7 mm/h at minute 79 · risk index 100/100</p>
              </div>
              <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-xs text-cyan-400">
                Doppler + gauge blend
              </span>
            </div>

            <div className="h-44 w-full relative mt-4">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150">
                <defs>
                  <linearGradient id="nowcastGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="30" x2="500" y2="30" stroke="#1F2937" strokeDasharray="4 4" />
                <line x1="0" y1="80" x2="500" y2="80" stroke="#1F2937" strokeDasharray="4 4" />
                <line x1="0" y1="130" x2="500" y2="130" stroke="#1F2937" strokeDasharray="4 4" />

                <path
                  d="M 0 110 Q 120 70 220 20 T 350 70 T 500 120 L 500 150 L 0 150 Z"
                  fill="url(#nowcastGradient)"
                />
                <path
                  d="M 0 110 Q 120 70 220 20 T 350 70 T 500 120"
                  fill="none"
                  stroke="#06B6D4"
                  strokeWidth="3"
                />

                <circle cx="220" cy="20" r="5" fill="#EAB308" />
                <text x="220" y="10" textAnchor="middle" fill="#EAB308" fontSize="11" fontWeight="bold">
                  Peak 62.7 mm/h
                </text>
              </svg>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>0m</span><span>30m</span><span>60m</span><span>90m</span><span>120m</span><span>150m</span><span>180m</span>
            </div>
          </div>

          {/* Deployed Vehicles Table */}
          <div className="bg-[#131826] border border-white/5 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-lg font-bold text-white">
                <Radio className="w-5 h-5 text-cyan-400" />
                <span>Deployed Response Vehicles</span>
              </div>
              <Link href="/login" className="text-sm text-cyan-400 hover:text-cyan-300">
                Service Provider portal →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 border-b border-white/5">
                    <th className="pb-3">CALLSIGN</th>
                    <th className="pb-3">TYPE</th>
                    <th className="pb-3">OPERATOR</th>
                    <th className="pb-3">POSITION</th>
                    <th className="pb-3">STATUS</th>
                    <th className="pb-3 text-right">UPDATED</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300 text-xs">
                  <tr>
                    <td className="py-3 font-bold text-white">AMB-02</td>
                    <td className="py-3">Ambulance</td>
                    <td className="py-3">Lakshmi P.</td>
                    <td className="py-3 font-mono">16.5449, 80.6440</td>
                    <td className="py-3"><span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">EN ROUTE</span></td>
                    <td className="py-3 text-right text-gray-500">1m ago</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-bold text-white">AMB-03</td>
                    <td className="py-3">Ambulance</td>
                    <td className="py-3">Ravi T.</td>
                    <td className="py-3 font-mono">16.5033, 80.6510</td>
                    <td className="py-3"><span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30">ON SCENE</span></td>
                    <td className="py-3 text-right text-gray-500">2m ago</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-bold text-white">NDRF-01</td>
                    <td className="py-3">NDRF Rescue Boat</td>
                    <td className="py-3">Ramesh K.</td>
                    <td className="py-3 font-mono">16.4980, 80.6180</td>
                    <td className="py-3"><span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">EN ROUTE</span></td>
                    <td className="py-3 text-right text-gray-500">56s ago</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-bold text-white">PUMP-01</td>
                    <td className="py-3">Flood Pump Truck</td>
                    <td className="py-3">Mohan L.</td>
                    <td className="py-3 font-mono">16.5089, 80.6187</td>
                    <td className="py-3"><span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30">ON SCENE</span></td>
                    <td className="py-3 text-right text-gray-500">1m ago</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Active Flood Alerts */}
          <div className="bg-[#131826] border border-white/5 rounded-2xl p-5">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-lg font-bold text-white">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span>Active Flood Alerts</span>
              </div>
              <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-xs font-bold">7</span>
            </div>

            <div className="space-y-3">
              <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-red-400 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    MG Road Underpass
                  </span>
                  <span className="text-xs text-red-300">0.8m</span>
                </div>
                <p className="text-xs text-gray-400">Water level 0.8m and rising. Underpass closed to all traffic.</p>
                <p className="text-[10px] text-gray-500 mt-2">Updated 4 min ago</p>
              </div>

              <div className="bg-orange-500/5 border border-orange-500/20 p-4 rounded-xl">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-orange-400 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    Benz Circle
                  </span>
                  <span className="text-xs text-orange-300">0.3m</span>
                </div>
                <p className="text-xs text-gray-400">0.3m waterlogging. Traffic crawling, two-wheelers diverted.</p>
                <p className="text-[10px] text-gray-500 mt-2">Updated 9 min ago</p>
              </div>
            </div>
          </div>

          {/* Emergency Routing */}
          <div className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border border-cyan-500/20 rounded-2xl p-5 relative overflow-hidden">
            <Navigation className="w-16 h-16 absolute -top-2 -right-2 text-cyan-500/10 pointer-events-none" />
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Navigation className="w-5 h-5 text-cyan-400" />
              Emergency Routing
            </h3>
            <p className="text-xs text-gray-400 mb-4">Paths that avoid inundation and climb towards elevated ground.</p>

            <div className="space-y-3 mb-4">
              <div>
                <label className="text-[10px] text-gray-400 font-bold block mb-1">FROM</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value="Current location (not set)"
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-300"
                  />
                  <button className="p-2 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/30">
                    <Crosshair className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-gray-400 font-bold block mb-1">TO</label>
                <input
                  type="text"
                  placeholder="e.g. Municipal Community Hall"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="space-y-2 mb-4 text-xs text-gray-300">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-cyan-500 rounded" />
                <span>Avoid flooded roads</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-cyan-500 rounded" />
                <span>Prefer elevated paths</span>
              </label>
            </div>

            <button className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-xl font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2">
              <Navigation className="w-4 h-4" />
              <span>Calculate Safe Route</span>
            </button>
          </div>

          {/* Active Rescue Vehicles */}
          <div className="bg-[#131826] border border-white/5 rounded-2xl p-5">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-base font-bold text-white">
                <Bell className="w-4 h-4 text-yellow-400" />
                <span>Active Rescue Vehicles</span>
              </div>
              <span className="text-xs text-cyan-400">5 live</span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center font-bold">
                    <Siren className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white">AMB-02</div>
                    <div className="text-[10px] text-gray-400">→ Payakapuram</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 rounded-full text-[10px] font-semibold">EN ROUTE</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white">PUMP-01</div>
                    <div className="text-[10px] text-gray-400">→ MG Road Underpass</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded-full text-[10px] font-semibold">ON SCENE</span>
              </div>
            </div>

            <button className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white rounded-xl text-xs font-bold transition-all">
              Dispatch New Vehicle →
            </button>
          </div>

          {/* Nearest Shelters */}
          <div className="bg-[#131826] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center gap-2 text-base font-bold text-white mb-4">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>Nearest Shelters</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <div>
                  <div className="font-bold text-white">CSI Church Complex</div>
                  <div className="text-[10px] text-gray-400">150 beds available</div>
                </div>
                <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-md text-[10px] font-semibold">0.9 km</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <div>
                  <div className="font-bold text-white">Municipal Community Hall</div>
                  <div className="text-[10px] text-gray-400">500 beds available</div>
                </div>
                <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-md text-[10px] font-semibold">1.4 km</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 4. Floating Action Bar (Fixed Bottom) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl bg-[#131826] p-4 rounded-2xl border border-white/10 shadow-2xl z-50">
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF5A1F] to-orange-500 hover:brightness-110 text-white rounded-xl py-3 font-semibold text-sm transition-all shadow-lg shadow-orange-500/20">
            <AlertTriangle className="w-4 h-4" />
            <span>Report Flooding</span>
          </button>

          <a
            href="tel:1077"
            className="flex-1 flex items-center justify-center gap-2 bg-[#2A151F] hover:bg-[#3A1C24] text-[#FF8A8A] border border-[#3A1C24] rounded-xl py-3 font-semibold text-sm transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span>Call 1077</span>
          </a>

          <button className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#007BFF] to-blue-600 hover:brightness-110 text-white rounded-xl py-3 font-semibold text-sm transition-all shadow-lg shadow-blue-500/20">
            <Crosshair className="w-4 h-4" />
            <span>Share My Location</span>
          </button>
        </div>

        <p className="text-center text-[10px] text-gray-500 mt-2">
          NDRF Vijayawada 0866-2577530 · National Disaster Helpline 1077 · Krishna + Budameru basin watch active
        </p>
      </div>
    </div>
  );
}
