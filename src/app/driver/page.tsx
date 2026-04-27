// PRAVAH + LifeLane - Service Provider Direct Page
// Direct access to service provider features

"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/store/AuthContext";
import { AppProvider } from "@/store/AppContext";
import { Navigation, MapPin, Phone, CheckCircle, Clock, AlertTriangle, Package } from "lucide-react";
import LiveMap from "@/components/LiveMap";

function DriverPageContent() {
  const { login } = useAuth();
  const [currentLocation] = useState({ lat: 28.6139, lng: 77.2090 }); // Delhi location

  useEffect(() => {
    // Auto-login for service provider
    login("driver@parvah.com", "driver123", "driver");
  }, [login]);

  // Driver action handlers
  const markAvailable = () => {
    alert("Status Updated: Available\n• Vehicle: DL-01-AB-1234\n• Location: Connaught Place\n• Ready for emergency dispatch");
  };

  const contactHospital = () => {
    const hospitals = `
      Nearby Hospitals:
      🏥 AIIMS Delhi: +91-11-26588500
      🏥 Safdarjung: +91-11-26101234
      🏥 LNJP Hospital: +91-11-23366555
      🏥 GTB Hospital: +91-11-22093300
      
      Available Beds:
      • AIIMS: 150/1000
      • Safdarjung: 120/800
      • LNJP: 200/1200
      • GTB: 180/900
    `;
    alert(hospitals.trim());
  };

  const emergencyProtocol = () => {
    const protocol = `
      Emergency Protocol:
      1. Verify patient location
      2. Assess medical condition
      3. Contact dispatch center
      4. Prepare medical equipment
      5. Navigate to nearest hospital
      6. Update patient status
      
      Response Time Target: < 8 minutes
    `;
    alert(protocol.trim());
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
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
              <h1 className="text-2xl font-bold text-gray-800">LifeLane Service Provider</h1>
              <p className="text-gray-600">Emergency Response Dashboard</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row p-6 gap-6">
        {/* Left Panel - Driver Controls */}
        <div className="lg:w-1/3 space-y-6">
          {/* Vehicle Status */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Navigation className="w-6 h-6 text-green-600" />
              Vehicle Status
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
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-gray-700">Driver</span>
                <span className="font-bold text-purple-600">Raj Kumar</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="text-gray-700">Response Time</span>
                <span className="font-bold text-orange-600">5 min</span>
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
                  <button className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">
                    Accept
                  </button>
                </div>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-yellow-800">Accident</div>
                    <div className="text-sm text-yellow-600">India Gate</div>
                  </div>
                  <button className="px-3 py-1 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700">
                    View
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button onClick={markAvailable} className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Mark Available
              </button>
              <button onClick={contactHospital} className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-2">
                <Phone className="w-4 h-4" />
                Contact Hospital
              </button>
              <button onClick={emergencyProtocol} className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Emergency Protocol
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Map */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-xl shadow-lg p-4 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" />
                LifeLane Service Area - Delhi
              </h3>
              <span className="text-sm text-gray-600">
                Delhi: {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
              </span>
            </div>
            
            <div className="h-full min-h-[500px] rounded-lg overflow-hidden">
              <LiveMap
                ambulances={[
                  { id: "AMB-001", lat: 28.6140, lng: 77.2091, status: "Available" },
                  { id: "AMB-002", lat: 28.6138, lng: 77.2089, status: "On Duty" },
                  { id: "AMB-003", lat: 28.6142, lng: 77.2093, status: "Available" }
                ]}
                trafficSignals={[
                  { id: "TS-001", lat: 28.6139, lng: 77.2090, name: "Connaught Place", status: "Normal" },
                  { id: "TS-002", lat: 28.6141, lng: 77.2092, name: "India Gate", status: "Busy" }
                ]}
                sosVehicles={[
                  { id: "POL-001", lat: 28.6135, lng: 77.2085, type: "police" }
                ]}
                userLocation={currentLocation}
                showUserLocation={true}
                emergencies={[]}
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
      <DriverPageContent />
    </AppProvider>
  );
}
