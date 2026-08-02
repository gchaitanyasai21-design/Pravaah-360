"use client";

import { Zap, RotateCcw } from "lucide-react";
import { useTraffic } from "@/store/TrafficContext";

// Simple wait helper
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function JunctionCorridor() {
  const { signals, corridorActive, activateCorridor: setLocalActive, resetCorridor: setLocalReset } = useTraffic();

  const handleActivate = async () => {
    // 1. Mark local state as active
    setLocalActive();

    // 2. Loop through all signals and update the Database via API
    for (const s of signals) {
      try {
        await fetch("/api/junctions", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: s.id,
            status: "preempted", // This matches your backend updateJunctionStatus logic
          }),
        });
      } catch (error) {
        console.error("Failed to update junction:", s.id, error);
      }
      await wait(500); // Sequence delay
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-lg border">
      <div className="flex items-center gap-2 mb-1">
        <Zap className="w-5 h-5 text-red-500" />
        <h2 className="text-lg font-bold text-gray-800">
          Signal Jump – Green Corridor
        </h2>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Forces every junction on your route to switch to GREEN for emergency access.
      </p>

      {/* Corridor Button */}
      {!corridorActive ? (
        <button
          onClick={handleActivate}
          className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-red-500 to-red-700 hover:opacity-90 flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
        >
          <Zap className="w-5 h-5" />
          ACTIVATE EMERGENCY CORRIDOR
        </button>
      ) : (
        <button
          disabled
          className="w-full py-3 rounded-xl font-semibold text-white bg-green-600 flex items-center justify-center gap-2 shadow-md"
        >
          <Zap className="w-5 h-5" />
          CORRIDOR ACTIVE – ALL GREEN
        </button>
      )}

      {/* Junction List */}
      <div className="mt-4 space-y-2">
        {signals.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
          >
            <div className="flex items-center gap-3">
              <TrafficLightIcon state={s.state} />
              <span className="text-sm font-medium text-gray-700">
                {s.name}
              </span>
            </div>
            <span
              className={`text-sm font-bold ${
                s.state === "GREEN"
                  ? "text-green-600"
                  : s.state === "YELLOW"
                  ? "text-yellow-500"
                  : "text-red-500"
              }`}
            >
              ● {s.state}
            </span>
          </div>
        ))}
      </div>

      {/* Reset */}
      <button
        onClick={setLocalReset}
        className="w-full mt-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center gap-2 text-sm font-medium"
      >
        <RotateCcw className="w-4 h-4" />
        Reset Signals to Normal
      </button>
    </div>
  );
}

/* 🚦 Small Traffic Light Icon */
function TrafficLightIcon({ state }: { state: "RED" | "YELLOW" | "GREEN" }) {
  return (
    <div className="flex flex-col items-center bg-gray-900 rounded-md p-1 w-4">
      <div
        className={`w-2 h-2 rounded-full mb-0.5 ${
          state === "RED" ? "bg-red-500 shadow-[0_0_6px_#ef4444]" : "bg-red-900/40"
        }`}
      />
      <div
        className={`w-2 h-2 rounded-full mb-0.5 ${
          state === "YELLOW" ? "bg-yellow-400 shadow-[0_0_6px_#facc15]" : "bg-yellow-900/40"
        }`}
      />
      <div
        className={`w-2 h-2 rounded-full ${
          state === "GREEN" ? "bg-green-500 shadow-[0_0_6px_#22c55e]" : "bg-green-900/40"
        }`}
      />
    </div>
  );
}