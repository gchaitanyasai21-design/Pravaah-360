// PRAVAH + LifeLane - System Admin Direct Page
// Direct access to system admin features

"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/store/AuthContext";
import { AppProvider } from "@/store/AppContext";
import { Activity, Users, AlertCircle, MapPin, Clock, Phone, CheckCircle, TrendingUp } from "lucide-react";
import LiveMap from "@/components/LiveMap";

function AdminPageContent() {
  const { login } = useAuth();
  const [currentLocation] = useState({ lat: 28.6139, lng: 77.2090 }); // Delhi location

  useEffect(() => {
    // Auto-login for system admin
    login("admin@parvah.com", "admin123", "admin");
  }, [login]);

  // Admin action handlers
  const manageUsers = () => {
    alert("User Management Panel:\n• Total Users: 1,234\n• Active: 892\n• Inactive: 342\n• New registrations today: 12");
  };

  const emergencyContacts = () => {
    const contacts = `
      Emergency Contacts:
      🚑 Ambulance: 108
      🚓 Police: 100
      🚒 Fire: 101
      🏥 AIIMS Delhi: +91-11-26588500
      🏥 Safdarjung: +91-11-26101234
      🏥 LNJP Hospital: +91-11-23366555
    `;
    alert(contacts.trim());
  };

  const systemAlerts = () => {
    alert("System Alerts:\n• All systems operational\n• 3 active emergencies\n• 15 ambulances available\n• Response time: 8.5 minutes");
  };

  const viewReports = () => {
    const reports = `
      Today's Reports:
      • Emergency calls: 42
      • Average response time: 8.5 min
      • Ambulances dispatched: 28
      • Successful rescues: 26
      • System uptime: 99.8%
    `;
    alert(reports.trim());
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
              <h1 className="text-2xl font-bold text-gray-800">LifeLane Admin</h1>
              <p className="text-gray-600">System Administration Dashboard</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row p-6 gap-6">
        {/* Left Panel - Admin Controls */}
        <div className="lg:w-1/3 space-y-6">
          {/* System Stats */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Activity className="w-6 h-6 text-blue-600" />
              System Statistics
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-gray-700">Active Users</span>
                <span className="font-bold text-blue-600">1,234</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-gray-700">Emergency Services</span>
                <span className="font-bold text-green-600">42 Active</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-gray-700">Ambulances</span>
                <span className="font-bold text-purple-600">15 Available</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="text-gray-700">Response Time</span>
                <span className="font-bold text-orange-600">8.5 min</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button onClick={manageUsers} className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-2">
                <Users className="w-4 h-4" />
                Manage Users
              </button>
              <button onClick={emergencyContacts} className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center justify-center gap-2">
                <Phone className="w-4 h-4" />
                Emergency Contacts
              </button>
              <button onClick={systemAlerts} className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4" />
                System Alerts
              </button>
              <button onClick={viewReports} className="w-full py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 flex items-center justify-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Reports
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Map */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-xl shadow-lg p-4 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                LifeLane System Overview - Delhi
              </h3>
              <span className="text-sm text-gray-600">
                Delhi: {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
              </span>
            </div>
            
            <div className="h-full min-h-[500px] rounded-lg overflow-hidden">
              <LiveMap
                ambulances={[
                  { id: "AMB-001", lat: 28.6200, lng: 77.2100, status: "Available" },
                  { id: "AMB-002", lat: 28.6050, lng: 77.2150, status: "On Duty" },
                  { id: "AMB-003", lat: 28.6180, lng: 77.1950, status: "Available" },
                  { id: "AMB-004", lat: 28.6000, lng: 77.2000, status: "Available" },
                  { id: "AMB-005", lat: 28.6250, lng: 77.2200, status: "On Duty" },
                  { id: "AMB-006", lat: 28.5950, lng: 77.2100, status: "Available" },
                  { id: "AMB-007", lat: 28.6300, lng: 77.2050, status: "On Duty" },
                  { id: "AMB-008", lat: 28.6100, lng: 77.1900, status: "Available" }
                ]}
                deliveryVehicles={[
                  { id: "DEL-001", lat: 28.6070, lng: 77.2120, status: "In Transit" },
                  { id: "DEL-002", lat: 28.6170, lng: 77.1980, status: "Delivered" },
                  { id: "DEL-003", lat: 28.6230, lng: 77.2080, status: "In Transit" },
                  { id: "DEL-004", lat: 28.6080, lng: 77.2250, status: "In Transit" },
                  { id: "DEL-005", lat: 28.6150, lng: 77.1950, status: "Delivered" }
                ]}
                trafficSignals={[
                  { id: "TS-001", lat: 28.6139, lng: 77.2090, name: "Connaught Place", status: "Normal" },
                  { id: "TS-002", lat: 28.6141, lng: 77.2092, name: "India Gate", status: "Busy" },
                  { id: "TS-003", lat: 28.6137, lng: 77.2088, name: "Parliament Street", status: "Normal" },
                  { id: "TS-004", lat: 28.6143, lng: 77.2094, name: "Janpath", status: "Congested" },
                  { id: "TS-005", lat: 28.6100, lng: 77.2150, name: "Karol Bagh", status: "Congested" },
                  { id: "TS-006", lat: 28.6180, lng: 77.1950, name: "Rajiv Chowk", status: "Normal" },
                  { id: "TS-007", lat: 28.6080, lng: 77.2050, name: "Patel Chowk", status: "Busy" },
                  { id: "TS-008", lat: 28.6220, lng: 77.2120, name: "ITO", status: "Normal" },
                  { id: "TS-009", lat: 28.6150, lng: 77.1900, name: "Daryaganj", status: "Congested" },
                  { id: "TS-010", lat: 28.6200, lng: 77.2300, name: "Lajpat Nagar", status: "Normal" },
                  { id: "TS-011", lat: 28.6050, lng: 77.1800, name: "Paharganj", status: "Busy" },
                  { id: "TS-012", lat: 28.6350, lng: 77.2200, name: "Nehru Place", status: "Congested" }
                ]}
                sosVehicles={[
                  { id: "POL-001", lat: 28.6150, lng: 77.2050, type: "police" },
                  { id: "POL-002", lat: 28.6100, lng: 77.2250, type: "police" },
                  { id: "POL-003", lat: 28.6080, lng: 77.1980, type: "police" },
                  { id: "POL-004", lat: 28.6200, lng: 77.1900, type: "police" },
                  { id: "POL-005", lat: 28.6050, lng: 77.2150, type: "police" }
                ]}
                hospitals={[
                  { id: "AIIMS", lat: 28.6069, lng: 77.2090, name: "AIIMS Delhi", status: "Available" },
                  { id: "SJDH", lat: 28.5850, lng: 77.2030, name: "Safdarjung Hospital", status: "Available" },
                  { id: "LNJP", lat: 28.6580, lng: 77.2100, name: "LNJP Hospital", status: "Available" },
                  { id: "GTB", lat: 28.6800, lng: 77.2800, name: "GTB Hospital", status: "Available" },
                  { id: "MAMC", lat: 28.6350, lng: 77.2000, name: "MAMC", status: "Available" }
                ]}
                emergencies={[]}
                center={[currentLocation.lat, currentLocation.lng]}
                zoom={11}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AppProvider>
      <AdminPageContent />
    </AppProvider>
  );
}
