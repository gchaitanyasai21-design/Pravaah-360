// PRAVAH + LifeLane - Patient View (SOS Interface)
// Emergency request and tracking UI

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ambulance, Phone, MapPin, Clock, Share2, AlertCircle } from "lucide-react";
import LiveMap from "@/components/LiveMap";
import { useApp } from "@/store/AppContext";
import type { EmergencyType } from "@/types";

const emergencyTypes: { type: EmergencyType; label: string; icon: string }[] = [
  { type: "cardiac", label: "Cardiac", icon: "❤️" },
  { type: "accident", label: "Accident", icon: "🚗" },
  { type: "breathing", label: "Breathing", icon: "😮‍💨" },
  { type: "maternity", label: "Maternity", icon: "🤰" },
  { type: "fire", label: "Fire", icon: "🔥" },
  { type: "other", label: "Other", icon: "📋" },
];

export default function PatientView() {
  const { emergencies, createEmergency, hospitals, ambulances } = useApp();
  const [selectedType, setSelectedType] = useState<EmergencyType | null>(null);
  const [sosTriggered, setSosTriggered] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Get user location
  const getUserLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          // Default to Delhi
          setLocation({ lat: 28.6139, lng: 77.2090 });
        }
      );
    } else {
      setLocation({ lat: 28.6139, lng: 77.2090 });
    }
  };

  // Trigger SOS
  const handleSOS = () => {
    if (!selectedType || !patientName) return;

    const currentLocation = location || { lat: 28.6139, lng: 77.2090 };

    createEmergency({
      patientName,
      patientPhone,
      type: selectedType,
      description,
      pickupLat: currentLocation.lat,
      pickupLng: currentLocation.lng,
    });

    setSosTriggered(true);
  };

  // Find nearest ambulance
  const activeEmergency = emergencies[emergencies.length - 1];
  const assignedAmbulance = activeEmergency?.assignedAmbulanceId
    ? ambulances.find((a) => a.id === activeEmergency.assignedAmbulanceId)
    : null;

  const activeEmergencies = emergencies.filter((e) => e.status !== "completed");

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-red-600 text-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <AlertCircle className="w-6 h-6" />
            LifeLane Emergency
          </h1>
          <p className="text-red-100 text-sm mt-1">
            Quick emergency response with green corridor
          </p>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row max-w-6xl mx-auto w-full p-4 gap-4">
        {/* Left Panel - SOS Form */}
        <div className="lg:w-1/3 space-y-4">
          {!sosTriggered ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-6 space-y-4"
            >
              <h2 className="text-xl font-bold text-gray-800">Emergency Request</h2>

              {/* Patient Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient Name *
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter patient name"
                />
              </div>

              {/* Patient Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
              </div>

              {/* Emergency Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Type *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {emergencyTypes.map((item) => (
                    <button
                      key={item.type}
                      onClick={() => setSelectedType(item.type)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedType === item.type
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="text-2xl mb-1">{item.icon}</div>
                      <div className="text-xs font-medium">{item.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows={2}
                  placeholder="Brief description of the emergency"
                />
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>
                  {location
                    ? "Location detected"
                    : "Detecting location..."}
                </span>
              </div>

              {/* SOS Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSOS}
                disabled={!selectedType || !patientName}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-xl text-lg shadow-lg transition-colors"
              >
                <span className="flex items-center justify-center gap-2">
                  <Phone className="w-5 h-5" />
                  SOS - CALL AMBULANCE
                </span>
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-lg p-6 space-y-4"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Ambulance className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  Ambulance Dispatched!
                </h2>
                <p className="text-gray-600 mt-2">
                  Help is on the way to your location
                </p>
              </div>

              {assignedAmbulance && (
                <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Ambulance:</span>
                    <span className="font-medium">{assignedAmbulance.vehicleNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Driver:</span>
                    <span className="font-medium">{assignedAmbulance.driverName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">ETA:</span>
                    <span className="font-medium text-blue-600 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      8-12 min
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  // Share tracking link
                  navigator.clipboard.writeText(window.location.href);
                  alert("Tracking link copied to clipboard!");
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share Tracking Link
              </button>
            </motion.div>
          )}

          {/* Active Emergencies List */}
          {activeEmergencies.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-4">
              <h3 className="font-bold text-gray-800 mb-3">Your Emergencies</h3>
              <div className="space-y-2">
                {activeEmergencies.map((emergency) => (
                  <div
                    key={emergency.id}
                    className="p-3 bg-gray-50 rounded-lg border-l-4 border-red-500"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{emergency.type}</span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          emergency.status === "dispatched"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {emergency.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{emergency.patientName}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Map */}
        <div className="lg:w-2/3 bg-white rounded-xl shadow-lg overflow-hidden">
          <LiveMap
            ambulances={ambulances}
            emergencies={activeEmergencies}
            hospitals={hospitals}
            center={
              location ? [location.lat, location.lng] : [28.6139, 77.2090]
            }
            zoom={14}
          />
        </div>
      </div>
    </div>
  );
}
