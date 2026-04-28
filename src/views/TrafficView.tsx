// PRAVAH + LifeLane - Traffic Control View
// Junction management and preemption logs

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  TrafficCone,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Zap,
} from "lucide-react";
import LiveMap from "@/components/LiveMap";
import { useApp } from "@/store/AppContext";
import type { TrafficJunction, JunctionStatus } from "@/types";

export default function TrafficView() {
  const { junctions, ambulances, emergencies, updateJunctionStatus } = useApp();
  const [selectedJunction, setSelectedJunction] = useState<TrafficJunction | null>(null);

  // Calculate metrics
  const normalJunctions = junctions.filter((j) => j.status === "normal");
  const preemptedJunctions = junctions.filter((j) => j.status === "preempted");
  const preparingJunctions = junctions.filter((j) => j.status === "preparing");

  // Manual override
  const handleManualOverride = (
    junctionId: string,
    status: JunctionStatus
  ) => {
    updateJunctionStatus(junctionId, status);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-gray-800 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <TrafficCone className="w-7 h-7 text-yellow-500" />
                Traffic Control Center
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Junction management and signal preemption
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">
                  {normalJunctions.length}
                </div>
                <div className="text-xs text-gray-400">Normal</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500">
                  {preparingJunctions.length}
                </div>
                <div className="text-xs text-gray-400">Preparing</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {preemptedJunctions.length}
                </div>
                <div className="text-xs text-gray-400">Preempted</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Metrics Bar */}
      <div className="bg-white border-b px-4 py-3">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-lg font-bold">
                {junctions.reduce((sum, j) => sum + j.trafficDensity, 0) /
                  junctions.length || 0}
                %
              </div>
              <div className="text-xs text-gray-600">Avg Density</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-lg font-bold">
                {Math.round(
                  junctions.reduce((sum, j) => sum + j.averageWaitTime, 0) /
                    junctions.length
                )}
                s
              </div>
              <div className="text-xs text-gray-600">Avg Wait Time</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-lg font-bold">
                {junctions.reduce((sum, j) => sum + j.vehiclesPerMinute, 0)}
              </div>
              <div className="text-xs text-gray-600">Vehicles/min</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-lg font-bold">12</div>
              <div className="text-xs text-gray-600">Preemptions Today</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full p-4 gap-4 overflow-hidden">
        {/* Left Panel - Junction List */}
        <div className="lg:w-1/4 flex flex-col space-y-4 overflow-hidden">
          <div className="bg-white rounded-xl shadow-lg p-4 flex-1 overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">All Junctions</h3>
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                {junctions.length} Total
              </span>
            </div>

            <div className="space-y-3">
              {junctions.map((junction) => (
                <motion.div
                  key={junction.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelectedJunction(junction)}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedJunction?.id === junction.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  } ${
                    junction.status === "preempted"
                      ? "border-l-4 border-l-green-500"
                      : junction.status === "preparing"
                      ? "border-l-4 border-l-yellow-500"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-bold text-sm">{junction.name}</div>
                      <div className="text-xs text-gray-500">
                        Density: {junction.trafficDensity}%
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        junction.status === "preempted"
                          ? "bg-green-100 text-green-800"
                          : junction.status === "preparing"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {junction.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Signal States */}
                  <div className="grid grid-cols-4 gap-1 text-xs mb-2">
                    <div
                      className={`text-center py-1 rounded ${
                        junction.northState === "green"
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      N
                    </div>
                    <div
                      className={`text-center py-1 rounded ${
                        junction.southState === "green"
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      S
                    </div>
                    <div
                      className={`text-center py-1 rounded ${
                        junction.eastState === "green"
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      E
                    </div>
                    <div
                      className={`text-center py-1 rounded ${
                        junction.westState === "green"
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      W
                    </div>
                  </div>

                  {junction.activeAmbulanceId && (
                    <div className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>
                        Ambulance: {junction.activeAmbulanceId}
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Manual Override Controls */}
          {selectedJunction && (
            <div className="bg-white rounded-xl shadow-lg p-4">
              <h3 className="font-bold text-gray-800 mb-3">
                Manual Override
              </h3>
              <div className="text-sm text-gray-600 mb-3">
                {selectedJunction.name}
              </div>
              <div className="space-y-2">
                <button
                  onClick={() =>
                    handleManualOverride(selectedJunction.id, "preempted")
                  }
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 rounded-lg transition-colors"
                >
                  Force GREEN (Emergency)
                </button>
                <button
                  onClick={() =>
                    handleManualOverride(selectedJunction.id, "normal")
                  }
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium py-2 rounded-lg transition-colors"
                >
                  Reset to NORMAL
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Map */}
        <div className="lg:w-3/4 bg-white rounded-xl shadow-lg overflow-hidden">
          <LiveMap
            junctions={junctions}
            ambulances={ambulances}
            deliveryVehicles={[
              { id: "DEL-001", lat: 28.6070, lng: 77.2120, status: "In Transit" },
              { id: "DEL-002", lat: 28.6170, lng: 77.1980, status: "Delivered" },
              { id: "DEL-003", lat: 28.6230, lng: 77.2080, status: "In Transit" }
            ]}
            sosVehicles={[
              { id: "POL-001", lat: 28.6150, lng: 77.2050, type: "police" },
              { id: "POL-002", lat: 28.6100, lng: 77.2250, type: "police" }
            ]}
            trafficSignals={[
              { id: "TS-001", lat: 28.6139, lng: 77.2090, name: "Connaught Place", status: "Normal" },
              { id: "TS-002", lat: 28.6141, lng: 77.2092, name: "India Gate", status: "Busy" },
              { id: "TS-003", lat: 28.6100, lng: 77.2150, name: "Karol Bagh", status: "Congested" }
            ]}
            hospitals={[
              { id: "AIIMS", lat: 28.6069, lng: 77.2090, name: "AIIMS Delhi", status: "Available" },
              { id: "SJDH", lat: 28.5850, lng: 77.2030, name: "Safdarjung Hospital", status: "Available" }
            ]}
            emergencies={emergencies.filter((e) => e.status !== "completed")}
            center={[28.6139, 77.2090]}
            zoom={12}
          />
        </div>
      </div>

      {/* Junction Detail Modal */}
      {selectedJunction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 max-h-[80vh] overflow-auto"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">{selectedJunction.name}</h2>
                <p className="text-gray-600 text-sm">
                  {selectedJunction.lat}, {selectedJunction.lng}
                </p>
              </div>
              <button
                onClick={() => setSelectedJunction(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Status */}
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-1">Current Status</div>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                  selectedJunction.status === "preempted"
                    ? "bg-green-100 text-green-800"
                    : selectedJunction.status === "preparing"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {selectedJunction.status.toUpperCase()}
              </span>
            </div>

            {/* Signal States */}
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">Signal States</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span>North</span>
                  <div
                    className={`w-8 h-8 rounded-full ${
                      selectedJunction.northState === "green"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  ></div>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span>South</span>
                  <div
                    className={`w-8 h-8 rounded-full ${
                      selectedJunction.southState === "green"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  ></div>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span>East</span>
                  <div
                    className={`w-8 h-8 rounded-full ${
                      selectedJunction.eastState === "green"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  ></div>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span>West</span>
                  <div
                    className={`w-8 h-8 rounded-full ${
                      selectedJunction.westState === "green"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  ></div>
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">Traffic Metrics</div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 bg-blue-50 rounded">
                  <div className="text-lg font-bold text-blue-600">
                    {selectedJunction.trafficDensity}%
                  </div>
                  <div className="text-xs text-gray-600">Density</div>
                </div>
                <div className="text-center p-2 bg-yellow-50 rounded">
                  <div className="text-lg font-bold text-yellow-600">
                    {selectedJunction.averageWaitTime}s
                  </div>
                  <div className="text-xs text-gray-600">Wait Time</div>
                </div>
                <div className="text-center p-2 bg-green-50 rounded">
                  <div className="text-lg font-bold text-green-600">
                    {selectedJunction.vehiclesPerMinute}
                  </div>
                  <div className="text-xs text-gray-600">Veh/min</div>
                </div>
              </div>
            </div>

            {/* Active Ambulance */}
            {selectedJunction.activeAmbulanceId && (
              <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-green-600" />
                  <span className="font-bold text-green-800">
                    Active Preemption
                  </span>
                </div>
                <div className="text-sm text-green-700">
                  Ambulance: {selectedJunction.activeAmbulanceId}
                </div>
                <div className="text-xs text-green-600">
                  Signal Mode: {selectedJunction.signalMode}
                </div>
              </div>
            )}

            {/* Manual Override */}
            <div>
              <div className="text-sm text-gray-600 mb-2">Manual Override</div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    handleManualOverride(selectedJunction.id, "preempted")
                  }
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 rounded-lg transition-colors"
                >
                  Force GREEN
                </button>
                <button
                  onClick={() =>
                    handleManualOverride(selectedJunction.id, "normal")
                  }
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium py-2 rounded-lg transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
