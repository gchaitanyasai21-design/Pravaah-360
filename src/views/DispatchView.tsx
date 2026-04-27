// PRAVAH + LifeLane - Dispatch View (Command Center)
// Global map with fleet and emergency management

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  AlertCircle,
  Activity,
  Clock,
  MapPin,
  Phone,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import LiveMap from "@/components/LiveMapSimple";
import BackToLogin from "@/components/BackToLogin";
import { useApp } from "@/store/AppContext";
import { useAuth } from "@/store/AuthContext";
import type { Emergency, Ambulance } from "@/types";

export default function DispatchView() {
  const {
    ambulances,
    emergencies,
    junctions,
    hospitals,
    assignAmbulance,
    updateEmergencyStatus,
  } = useApp();

  const [selectedEmergency, setSelectedEmergency] = useState<Emergency | null>(null);

  // Calculate metrics
  const availableAmbulances = ambulances.filter((a) => a.status === "available");
  const busyAmbulances = ambulances.filter(
    (a) => a.status === "en-route" || a.status === "to-hospital" || a.status === "busy"
  );
  const activeEmergencies = emergencies.filter((e) => e.status !== "completed");
  const pendingEmergencies = emergencies.filter((e) => e.status === "pending");

  // Auto-assign nearest ambulance
  const handleAutoAssign = (emergency: Emergency) => {
    const available = ambulances.filter((a) => a.status === "available");
    if (available.length === 0) return;

    // Find nearest (simplified distance calculation)
    let nearest: Ambulance = available[0];
    let minDistance = Infinity;

    for (const ambulance of available) {
      if (!ambulance.lat || !ambulance.lng) continue;

      const distance = Math.sqrt(
        Math.pow(parseFloat(ambulance.lat as any) - emergency.pickupLat, 2) +
          Math.pow(parseFloat(ambulance.lng as any) - emergency.pickupLng, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearest = ambulance;
      }
    }

    assignAmbulance(emergency.id, nearest.id);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-gray-900 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BackToLogin />
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Activity className="w-7 h-7 text-green-500" />
                  Dispatch Command Center
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                  Real-time emergency response coordination
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">
                  {availableAmbulances.length}
                </div>
                <div className="text-xs text-gray-400">Available</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500">
                  {busyAmbulances.length}
                </div>
                <div className="text-xs text-gray-400">En Route</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">
                  {activeEmergencies.length}
                </div>
                <div className="text-xs text-gray-400">Active</div>
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
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-lg font-bold">{ambulances.length}</div>
              <div className="text-xs text-gray-600">Total Fleet</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-lg font-bold">{pendingEmergencies.length}</div>
              <div className="text-xs text-gray-600">Pending</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-lg font-bold">
                {emergencies.filter((e) => e.status === "completed").length}
              </div>
              <div className="text-xs text-gray-600">Completed</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-lg font-bold">8.5 min</div>
              <div className="text-xs text-gray-600">Avg Response</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full p-4 gap-4 overflow-hidden">
        {/* Left Panel - Emergency Queue */}
        <div className="lg:w-1/4 flex flex-col space-y-4 overflow-hidden">
          <div className="bg-white rounded-xl shadow-lg p-4 flex-1 overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Emergency Queue</h3>
              <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full">
                {activeEmergencies.length} Active
              </span>
            </div>

            <div className="space-y-3">
              {activeEmergencies.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                  <p>No active emergencies</p>
                </div>
              ) : (
                activeEmergencies.map((emergency) => (
                  <motion.div
                    key={emergency.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setSelectedEmergency(emergency)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedEmergency?.id === emergency.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    } ${emergency.status === "pending" ? "border-l-4 border-l-red-500" : ""}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-bold text-sm capitalize">
                          {emergency.type}
                        </div>
                        <div className="text-xs text-gray-600">
                          {emergency.patientName}
                        </div>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          emergency.status === "pending"
                            ? "bg-red-100 text-red-800"
                            : emergency.status === "dispatched"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {emergency.status}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                      <Clock className="w-3 h-3" />
                      {new Date(emergency.createdAt).toLocaleTimeString()}
                    </div>

                    {emergency.status === "pending" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAutoAssign(emergency);
                        }}
                        className="w-full text-xs bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded transition-colors"
                      >
                        Auto-Assign Nearest
                      </button>
                    )}

                    {emergency.assignedAmbulanceId && (
                      <div className="text-xs text-gray-600">
                        🚑 {ambulances.find((a) => a.id === emergency.assignedAmbulanceId)?.vehicleNumber}
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Fleet Status */}
          <div className="bg-white rounded-xl shadow-lg p-4">
            <h3 className="font-bold text-gray-800 mb-3">Fleet Status</h3>
            <div className="space-y-2 max-h-48 overflow-auto">
              {ambulances.map((ambulance) => (
                <div
                  key={ambulance.id}
                  className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded"
                >
                  <div>
                    <div className="font-medium">{ambulance.vehicleNumber}</div>
                    <div className="text-xs text-gray-500">
                      {ambulance.driverName}
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      ambulance.status === "available"
                        ? "bg-green-100 text-green-800"
                        : ambulance.status === "en-route"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {ambulance.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Map */}
        <div className="lg:w-3/4 bg-white rounded-xl shadow-lg overflow-hidden">
          <LiveMap
            ambulances={ambulances}
            emergencies={activeEmergencies}
            junctions={junctions}
            hospitals={hospitals}
            center={[28.6139, 77.2090]}
            zoom={12}
          />
        </div>
      </div>

      {/* Emergency Detail Modal */}
      {selectedEmergency && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold capitalize">
                  {selectedEmergency.type} Emergency
                </h2>
                <p className="text-gray-600">{selectedEmergency.patientName}</p>
              </div>
              <button
                onClick={() => setSelectedEmergency(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span>
                  {selectedEmergency.pickupLat}, {selectedEmergency.pickupLng}
                </span>
              </div>
              {selectedEmergency.patientPhone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span>{selectedEmergency.patientPhone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-gray-500" />
                <span>
                  {new Date(selectedEmergency.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Activity className="w-4 h-4 text-gray-500" />
                <span className="capitalize">{selectedEmergency.status}</span>
              </div>
            </div>

            {selectedEmergency.assignedAmbulanceId && (
              <div className="bg-blue-50 rounded-lg p-3 mb-4">
                <div className="text-sm font-medium text-blue-800">
                  Assigned Ambulance
                </div>
                <div className="text-lg font-bold text-blue-900">
                  {ambulances.find((a) => a.id === selectedEmergency.assignedAmbulanceId)?.vehicleNumber}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              {selectedEmergency.status === "pending" && (
                <button
                  onClick={() => {
                    handleAutoAssign(selectedEmergency);
                    setSelectedEmergency(null);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors"
                >
                  Assign Ambulance
                </button>
              )}
              {selectedEmergency.status === "dispatched" && (
                <button
                  onClick={() => {
                    updateEmergencyStatus(selectedEmergency.id, "completed");
                    setSelectedEmergency(null);
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition-colors"
                >
                  Mark Complete
                </button>
              )}
              <button
                onClick={() => setSelectedEmergency(null)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
