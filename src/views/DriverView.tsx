// PRAVAH + LifeLane - Driver View (Ambulance Navigation)
// Navigation dashboard with signal status

"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Navigation,
  Gauge,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MapPin,
  Clock,
} from "lucide-react";
import LiveMap from "@/components/LiveMap";
import { useApp } from "@/store/AppContext";
import type { Emergency, Ambulance } from "@/types";

export default function DriverView() {
  const { ambulances, emergencies, junctions, assignAmbulance, updateEmergencyStatus } =
    useApp();

  const availableAmbulance = ambulances.find((a) => a.status === "available");
  const [currentAmbulance, setCurrentAmbulance] = useState<Ambulance | null>(
    availableAmbulance || null
  );

  const pendingEmergencies = emergencies.filter((e) => e.status === "pending");
  const activeEmergency = emergencies.find(
    (e) => e.assignedAmbulanceId === currentAmbulance?.id && e.status !== "completed"
  );

  // Get upcoming junction signal status
  const getUpcomingSignalStatus = () => {
    if (!currentAmbulance || !currentAmbulance.lat || !currentAmbulance.lng) {
      return null;
    }

    const ambulanceLat = parseFloat(currentAmbulance.lat as any);
    const ambulanceLng = parseFloat(currentAmbulance.lng as any);

    // Find nearest junction
    let nearestJunction = null;
    let minDistance = Infinity;

    for (const junction of junctions) {
      const distance = Math.sqrt(
        Math.pow(parseFloat(junction.lat as any) - ambulanceLat, 2) +
          Math.pow(parseFloat(junction.lng as any) - ambulanceLng, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestJunction = junction;
      }
    }

    if (nearestJunction && minDistance < 0.01) {
      // Within ~1km
      return {
        junction: nearestJunction,
        distance: Math.round(minDistance * 111000), // Convert to meters
        status: nearestJunction.status,
      };
    }

    return null;
  };

  const signalStatus = getUpcomingSignalStatus();

  // Accept emergency
  const handleAccept = (emergency: Emergency) => {
    if (currentAmbulance) {
      assignAmbulance(emergency.id, currentAmbulance.id);
    }
  };

  // Reject emergency
  const handleReject = (emergency: Emergency) => {
    console.log(`Rejected emergency ${emergency.id}`);
  };

  // Complete emergency
  const handleComplete = () => {
    if (activeEmergency) {
      updateEmergencyStatus(activeEmergency.id, "completed");
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Navigation className="w-6 h-6 text-green-500" />
              Driver Dashboard
            </h1>
            <p className="text-gray-400 text-sm">
              {currentAmbulance?.vehicleNumber || "Select a vehicle"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {currentAmbulance && (
              <div className="text-right">
                <div className="text-sm text-gray-400">Status</div>
                <div
                  className={`font-bold ${
                    currentAmbulance.status === "available"
                      ? "text-green-500"
                      : currentAmbulance.status === "en-route"
                      ? "text-yellow-500"
                      : "text-red-500"
                  }`}
                >
                  {currentAmbulance.status.toUpperCase()}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row max-w-6xl mx-auto w-full p-4 gap-4">
        {/* Left Panel - Emergency & Signal Info */}
        <div className="lg:w-1/3 space-y-4">
          {/* Signal Status Badge */}
          {signalStatus && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl p-4 ${
                signalStatus.status === "preempted"
                  ? "bg-green-600"
                  : signalStatus.status === "preparing"
                  ? "bg-yellow-600"
                  : "bg-gray-700"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Upcoming Signal</span>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="text-lg font-bold">{signalStatus.junction.name}</div>
              <div className="text-sm opacity-80">
                {signalStatus.distance}m away
              </div>
              <div
                className={`mt-2 inline-block px-3 py-1 rounded-full text-sm font-bold ${
                  signalStatus.status === "preempted"
                    ? "bg-green-500 text-white"
                    : signalStatus.status === "preparing"
                    ? "bg-yellow-500 text-black"
                    : "bg-gray-500 text-white"
                }`}
              >
                {signalStatus.status === "preempted"
                  ? "🟢 GREEN - Safe to Pass"
                  : signalStatus.status === "preparing"
                  ? "🟡 PREPARING - Slow Down"
                  : "🔴 NORMAL - Caution"}
              </div>
            </motion.div>
          )}

          {/* Speedometer */}
          {currentAmbulance && (
            <div className="bg-gray-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Gauge className="w-5 h-5 text-blue-500" />
                <span className="font-medium">Current Speed</span>
              </div>
              <div className="text-4xl font-bold text-center">
                {currentAmbulance.speed || 0}{" "}
                <span className="text-lg text-gray-400">km/h</span>
              </div>
            </div>
          )}

          {/* Emergency Request Card */}
          {!activeEmergency && pendingEmergencies.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold text-lg">Emergency Requests</h3>
              {pendingEmergencies.map((emergency) => (
                <motion.div
                  key={emergency.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-gray-800 rounded-xl p-4 border-l-4 border-red-500"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-bold text-red-500">
                        {emergency.type.toUpperCase()}
                      </div>
                      <div className="text-sm text-gray-400">
                        {emergency.patientName}
                      </div>
                    </div>
                    <Clock className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {emergency.pickupLat}, {emergency.pickupLng}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAccept(emergency)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Accept
                    </button>
                    <button
                      onClick={() => handleReject(emergency)}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Active Emergency Card */}
          {activeEmergency && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-800 rounded-xl p-4 border-l-4 border-green-500"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg text-green-500">Active Emergency</h3>
                <span className="text-xs px-2 py-1 bg-yellow-600 rounded-full">
                  {activeEmergency.status}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Patient:</span>
                  <span>{activeEmergency.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Type:</span>
                  <span className="capitalize">{activeEmergency.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Pickup:</span>
                  <span>
                    {activeEmergency.pickupLat}, {activeEmergency.pickupLng}
                  </span>
                </div>
              </div>

              {activeEmergency.status === "dispatched" && (
                <button
                  onClick={() =>
                    updateEmergencyStatus(activeEmergency.id, "arrived")
                  }
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors"
                >
                  Mark Arrived at Pickup
                </button>
              )}

              {activeEmergency.status === "arrived" && (
                <button
                  onClick={() =>
                    updateEmergencyStatus(activeEmergency.id, "en-route-to-hospital")
                  }
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors"
                >
                  Mark En-route to Hospital
                </button>
              )}

              {(activeEmergency.status === "en-route-to-hospital" ||
                activeEmergency.status === "arrived") && (
                <button
                  onClick={handleComplete}
                  className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Complete Case
                </button>
              )}
            </motion.div>
          )}

          {/* No Vehicle Selected */}
          {!currentAmbulance && (
            <div className="bg-yellow-900 rounded-xl p-4 border-l-4 border-yellow-500">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <span className="font-bold">No Vehicle Selected</span>
              </div>
              <p className="text-sm text-yellow-200">
                Please select an available ambulance to start receiving requests
              </p>
            </div>
          )}
        </div>

        {/* Right Panel - Map */}
        <div className="lg:w-2/3 bg-gray-800 rounded-xl overflow-hidden">
          <LiveMap
            ambulances={ambulances}
            emergencies={emergencies.filter((e) => e.status !== "completed")}
            junctions={junctions}
            center={
              currentAmbulance?.lat && currentAmbulance.lng
                ? [parseFloat(currentAmbulance.lat as any), parseFloat(currentAmbulance.lng as any)]
                : [28.6139, 77.2090]
            }
            zoom={14}
          />
        </div>
      </div>
    </div>
  );
}
