"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/store/AuthContext";
import { AppProvider } from "@/store/AppContext";
import { TrafficProvider, useTraffic } from "@/store/TrafficContext";
import { Navigation, MapPin, Phone, CheckCircle, AlertTriangle } from "lucide-react";
import LiveMap from "@/components/LiveMap";
import JunctionCorridor from "@/components/traffic/JunctionCorridor";

function DriverPageContent() {
  const { login } = useAuth();
  const { signals } = useTraffic();
  const [currentLocation] = useState({ lat: 28.6139, lng: 77.209 });

  useEffect(() => {
    login("driver@parvah.com", "driver123", "driver");
  }, [login]);

  const markAvailable = () => alert("Status Updated: Available");
  const contactHospital = () => alert("Calling AIIMS Delhi Hospital...");
  const emergencyProtocol = () => alert("Emergency Protocol Activated.");

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => window.location.href = "/login"} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm">← Back</button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">LifeLane Service Provider</h1>
            <p className="text-gray-600 text-sm">Emergency Response Dashboard</p>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex flex-col lg:flex-row p-6 gap-6 overflow-auto">
        {/* LEFT PANEL - ALL CARDS */}
        <div className="lg:w-1/3 space-y-6">
          {/* Vehicle Status */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Navigation className="w-6 h-6 text-green-600" /> Vehicle Status
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-gray-700">Status</span>
                <span className="font-bold text-green-600">Available</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-gray-700">Vehicle Number</span>
                <span className="font-bold text-blue-600">DL-01-AB-1234</span>
              </div>
            </div>
          </div>

          {/* Active Requests */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Active Requests</h3>
            <div className="space-y-3">
              <div className="p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-red-800">Emergency - Cardiac</div>
                    <div className="text-sm text-red-600">Connaught Place</div>
                  </div>
                  <button className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm">Accept</button>
                </div>
              </div>
            </div>
          </div>

          {/* 🚦 GREEN CORRIDOR PANEL */}
          <JunctionCorridor />

          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button onClick={markAvailable} className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">Mark Available</button>
              <button onClick={contactHospital} className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">Contact Hospital</button>
              <button onClick={emergencyProtocol} className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700">Emergency Protocol</button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - MAP */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-xl shadow-lg p-4 h-full">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-600" /> LifeLane Service Area - Delhi
            </h3>
            <div className="h-[550px] rounded-lg overflow-hidden">
              <LiveMap
                ambulances={[{ id: "AMB-001", lat: 28.62, lng: 77.21, status: "Available" }]}
                trafficSignals={signals.map(s => ({
                  id: s.id,
                  lat: s.lat,
                  lng: s.lng,
                  name: s.name,
                  status: s.state
                }))}
                hospitals={[{ id: "AIIMS", lat: 28.6069, lng: 77.209, name: "AIIMS Delhi", status: "Available" }]}
                emergencies={[]}
                sosVehicles={[]}
                deliveryVehicles={[]}
                userLocation={currentLocation}
                showUserLocation={true}
                center={[currentLocation.lat, currentLocation.lng]}
                zoom={12}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DriverPage() {
  return (
    <AppProvider>
      <TrafficProvider>
        <DriverPageContent />
      </TrafficProvider>
    </AppProvider>
  );
}