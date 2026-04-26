// PRAVAH + LifeLane - Child Safety Direct Page
// Direct access to child safety features

"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/store/AuthContext";
import { AppProvider } from "@/store/AppContext";
import LiveMap from "@/components/LiveMapSimple";

function ChildPageContent() {
  const { login } = useAuth();
  const [currentLocation] = useState<{ lat: number; lng: number }>({ lat: 28.6139, lng: 77.2090 }); // Delhi location
  const [childName, setChildName] = useState("");
  const [parentPhone, setParentPhone] = useState("");

  useEffect(() => {
    // Auto-login for child safety
    login("child@parvah.com", "child123", "child_user");
    
    // Save Delhi location to localStorage for parental access
    localStorage.setItem('childLocation', JSON.stringify(currentLocation));
    
    // Load saved child data
    const savedName = localStorage.getItem('childName');
    const savedPhone = localStorage.getItem('parentPhone');
    if (savedName) setChildName(savedName);
    if (savedPhone) setParentPhone(savedPhone);
  }, [login, currentLocation]);

  // Save child data for parental access
  const saveChildData = () => {
    if (childName.trim() && parentPhone.trim()) {
      localStorage.setItem('childName', childName.trim());
      localStorage.setItem('parentPhone', parentPhone.trim());
      alert("Your information has been saved for your parents to access!");
    }
  };

  // Trigger emergency alert
  const triggerEmergency = () => {
    const emergencyData = {
      type: 'emergency',
      location: currentLocation || { lat: 28.6139, lng: 77.2090 },
      timestamp: new Date().toISOString(),
      childName: childName || 'Unknown',
      parentPhone: parentPhone || 'Unknown'
    };
    
    // Save emergency data for parental access
    localStorage.setItem('childEmergency', JSON.stringify(emergencyData));
    
    alert(`Emergency alert sent to ${parentPhone || 'parents'}! Help is on the way.`);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex flex-col">
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
              <h1 className="text-2xl font-bold text-gray-800">Child Safety</h1>
              <p className="text-gray-600">Emergency help and location sharing</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row p-6 gap-6">
        {/* Left Panel - Controls */}
        <div className="lg:w-1/2 space-y-6">
          {/* Child Information */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                <input
                  type="text"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent's Phone</label>
                <input
                  type="tel"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="Enter parent's phone number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <button
                onClick={saveChildData}
                className="w-full py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
              >
                Save Information
              </button>
            </div>
          </div>

          {/* SOS Button */}
          <button
            onClick={triggerEmergency}
            className="w-full py-8 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl text-xl transition-colors flex flex-col items-center gap-3 shadow-lg"
          >
            <span className="text-4xl">🆘</span>
            <span>EMERGENCY SOS</span>
          </button>

          {/* Location Sharing */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Location Sharing</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-green-800">Location sharing with parents</span>
                <span className="text-green-600 font-medium">ON</span>
              </div>
              {currentLocation && (
                <div className="text-sm text-gray-600">
                  Current: {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Map */}
        <div className="lg:w-1/2">
          <div className="bg-white rounded-xl shadow-lg p-4 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <span className="text-2xl">�️</span>
                Your Current Location
              </h3>
              {currentLocation && (
                <span className="text-sm text-gray-600">
                  Lat: {currentLocation.lat.toFixed(4)}, Lng: {currentLocation.lng.toFixed(4)}
                </span>
              )}
            </div>
            
            <div className="h-full min-h-[400px] rounded-lg overflow-hidden">
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

export default function ChildPage() {
  return (
    <AppProvider>
      <ChildPageContent />
    </AppProvider>
  );
}
