// PRAVAH + LifeLane - Emergency Services Direct Page
// Direct access to emergency medical features

"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/store/AuthContext";
import { AppProvider } from "@/store/AppContext";
import { AlertTriangle, MapPin, Phone, Clock, Activity } from "lucide-react";
import LiveMap from "@/components/LiveMapSimple";

function EmergencyPageContent() {
  const { login, user } = useAuth();
  const [currentLocation] = useState<{ lat: number; lng: number }>({ lat: 28.6139, lng: 77.2090 }); // Delhi location

  useEffect(() => {
    // Auto-login for emergency services
    login("patient@parvah.com", "patient123", "patient");
  }, [login]);

  // Trigger emergency
  const triggerEmergency = () => {
    alert("Emergency alert sent! Help is on the way.");
  };

  return (
    <div className="h-screen bg-gradient-to-br from-red-50 to-orange-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.location.href = '/login'}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <span className="text-lg">←</span>
              <span className="text-sm font-medium">Back to Login</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Emergency Services</h1>
              <p className="text-gray-600">Immediate medical assistance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row p-6 gap-6">
        {/* Left Panel - Emergency Actions */}
        <div className="lg:w-1/3 space-y-6">
          {/* Emergency SOS Button */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              Emergency SOS
            </h2>
            <button
              onClick={triggerEmergency}
              className="w-full py-8 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl text-xl transition-colors flex flex-col items-center gap-3 shadow-lg"
            >
              <span className="text-4xl">🆘</span>
              <span>TRIGGER EMERGENCY</span>
            </button>
            <p className="text-center text-sm text-gray-600 mt-4">
              Press for immediate medical assistance
            </p>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-2">
                <Phone className="w-4 h-4" />
                Call Ambulance
              </button>
              <button className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center justify-center gap-2">
                <MapPin className="w-4 h-4" />
                Share Location
              </button>
              <button className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 flex items-center justify-center gap-2">
                <Activity className="w-4 h-4" />
                Medical History
              </button>
            </div>
          </div>

          {/* Emergency Info */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{user?.name || "Patient"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Blood Group:</span>
                <span className="font-medium">O+</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Emergency Contact:</span>
                <span className="font-medium">+91-XXXXXXXXXX</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Map */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-xl shadow-lg p-4 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-600" />
                Your Current Location
              </h3>
              {currentLocation && (
                <span className="text-sm text-gray-600">
                  Lat: {currentLocation.lat.toFixed(4)}, Lng: {currentLocation.lng.toFixed(4)}
                </span>
              )}
            </div>
            
            <div className="h-full min-h-[500px] rounded-lg overflow-hidden">
              <LiveMap
                ambulances={[]}
                emergencies={[]}
                center={currentLocation ? [currentLocation.lat, currentLocation.lng] : [28.6139, 77.2090]}
                zoom={15}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EmergencyPage() {
  return (
    <AppProvider>
      <EmergencyPageContent />
    </AppProvider>
  );
}
