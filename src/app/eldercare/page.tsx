"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Droplet, Candy, AlarmClock, Activity, Plus } from "lucide-react";

export default function EldercarePage() {
  const [bpReadings, setBpReadings] = useState<{sys: string, dia: string}[]>([]);
  const [sugarReadings, setSugarReadings] = useState<{val: string, type: string}[]>([]);
  
  // Inputs
  const [sys, setSys] = useState("");
  const [dia, setDia] = useState("");
  const [sugar, setSugar] = useState("");
  const [sugarType, setSugarType] = useState("Fasting");

  const addBp = () => {
    if (sys && dia) {
      setBpReadings([{sys, dia}, ...bpReadings]);
      setSys(""); setDia("");
    }
  };

  const addSugar = () => {
    if (sugar) {
      setSugarReadings([{val: sugar, type: sugarType}, ...sugarReadings]);
      setSugar("");
    }
  };

  return (
    <div className="min-h-screen overflow-y-auto pb-12 bg-[#0B0F19] text-white font-sans">
      <header className="p-6 flex items-center justify-between border-b border-white/5 bg-[#131826]">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-xl">👴</div>
          <div>
            <h1 className="text-xl font-bold">Elderly Care</h1>
            <p className="text-xs text-slate-400">Pravaah 360 · Health Dashboard</p>
          </div>
        </div>
        <div className="px-4 py-2 bg-[#1A2235] border border-white/10 rounded-lg text-sm text-purple-400 font-mono">
          ID: elder_001
        </div>
      </header>

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#131826] border-l-4 border-red-500 p-5 rounded-xl border border-white/5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center"><Droplet className="w-6 h-6 text-red-500"/></div>
            <div>
              <p className="text-xs text-gray-400 font-bold tracking-wider">LATEST BP</p>
              <p className="text-2xl font-bold">{bpReadings.length > 0 ? `${bpReadings[0].sys}/${bpReadings[0].dia}` : "—"}</p>
              <p className="text-[10px] text-gray-500">mmHg</p>
            </div>
          </div>
          <div className="bg-[#131826] border-l-4 border-purple-500 p-5 rounded-xl border border-white/5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center"><Candy className="w-6 h-6 text-purple-500"/></div>
            <div>
              <p className="text-xs text-gray-400 font-bold tracking-wider">LATEST SUGAR</p>
              <p className="text-2xl font-bold">{sugarReadings.length > 0 ? sugarReadings[0].val : "—"}</p>
              <p className="text-[10px] text-gray-500">mg/dL</p>
            </div>
          </div>
          <div className="bg-[#131826] border-l-4 border-blue-500 p-5 rounded-xl border border-white/5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center"><AlarmClock className="w-6 h-6 text-blue-500"/></div>
            <div>
              <p className="text-xs text-gray-400 font-bold tracking-wider">ACTIVE REMINDERS</p>
              <p className="text-2xl font-bold">0</p>
              <p className="text-[10px] text-gray-500">pending tasks</p>
            </div>
          </div>
          <div className="bg-[#131826] border-l-4 border-green-500 p-5 rounded-xl border border-white/5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center"><Activity className="w-6 h-6 text-green-500"/></div>
            <div>
              <p className="text-xs text-gray-400 font-bold tracking-wider">TOTAL RECORDS</p>
              <p className="text-2xl font-bold">{bpReadings.length + sugarReadings.length}</p>
              <p className="text-[10px] text-gray-500">health entries</p>
            </div>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Blood Pressure */}
          <div className="bg-[#131826] p-6 rounded-2xl border border-white/5">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg flex items-center gap-2"><Droplet className="w-5 h-5 text-red-500"/> Blood Pressure</h3>
              <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">{bpReadings.length} READINGS</span>
            </div>
            <div className="flex gap-4 mb-4">
              <input type="number" placeholder="Systolic (120)" value={sys} onChange={e => setSys(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm focus:border-red-500 outline-none"/>
              <input type="number" placeholder="Diastolic (80)" value={dia} onChange={e => setDia(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm focus:border-red-500 outline-none"/>
            </div>
            <button onClick={addBp} className="w-full py-3 bg-red-500 hover:bg-red-600 rounded-xl font-bold text-sm transition flex justify-center items-center gap-2"><Plus className="w-4 h-4"/> Add BP Reading</button>
            <div className="mt-4 space-y-2">
              {bpReadings.map((r, i) => (
                <div key={i} className="p-3 bg-white/5 rounded-lg text-sm flex justify-between">
                  <span>{r.sys} / {r.dia} mmHg</span><span className="text-gray-500">Just now</span>
                </div>
              ))}
            </div>
          </div>

          {/* Blood Sugar */}
          <div className="bg-[#131826] p-6 rounded-2xl border border-white/5">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg flex items-center gap-2"><Candy className="w-5 h-5 text-purple-500"/> Blood Sugar</h3>
              <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">{sugarReadings.length} READINGS</span>
            </div>
            <div className="flex gap-4 mb-4">
              <input type="number" placeholder="Value (mg/dL)" value={sugar} onChange={e => setSugar(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm focus:border-purple-500 outline-none"/>
              <select value={sugarType} onChange={e => setSugarType(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm focus:border-purple-500 outline-none text-white">
                <option value="Fasting">Fasting</option>
                <option value="Post-Meal">Post-Meal</option>
                <option value="Random">Random</option>
              </select>
            </div>
            <button onClick={addSugar} className="w-full py-3 bg-purple-500 hover:bg-purple-600 rounded-xl font-bold text-sm transition flex justify-center items-center gap-2"><Plus className="w-4 h-4"/> Add Sugar Reading</button>
            <div className="mt-4 space-y-2">
              {sugarReadings.map((r, i) => (
                <div key={i} className="p-3 bg-white/5 rounded-lg text-sm flex justify-between">
                  <span>{r.val} mg/dL <span className="text-gray-500 ml-2">({r.type})</span></span><span className="text-gray-500">Just now</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reminders */}
          <div className="bg-[#131826] p-6 rounded-2xl border border-white/5">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg flex items-center gap-2"><AlarmClock className="w-5 h-5 text-blue-500"/> Reminders</h3>
            </div>
            <input type="text" placeholder="Medicine name" className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm focus:border-blue-500 outline-none mb-4"/>
            <input type="time" className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm focus:border-blue-500 outline-none mb-4 [&::-webkit-calendar-picker-indicator]:filter-invert"/>
            <button className="w-full py-3 bg-blue-500 hover:bg-blue-600 rounded-xl font-bold text-sm transition flex justify-center items-center gap-2"><Plus className="w-4 h-4"/> Add Reminder</button>
          </div>
        </div>
      </div>
    </div>
  );
}