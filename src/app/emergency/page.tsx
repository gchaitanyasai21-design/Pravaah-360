// PRAVAH + LifeLane - Emergency Services Direct Page
// Direct access to emergency medical features

"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/store/AuthContext";
import { AppProvider } from "@/store/AppContext";
import { AlertTriangle, MapPin, Phone, Clock, Activity } from "lucide-react";
import LiveMap from "@/components/LiveMap";

function EmergencyPageContent() {
  const { login, user } = useAuth();
  const [currentLocation] = useState<{ lat: number; lng: number }>({ lat: 28.6139, lng: 77.2090 }); // Delhi location
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [simulationActive, setSimulationActive] = useState(false);
  const [ambulancePosition, setAmbulancePosition] = useState<{ lat: number; lng: number } | null>(null);
  const [eta, setEta] = useState<number>(0);
  const [simulationStage, setSimulationStage] = useState<'idle' | 'dispatched' | 'arrived' | 'picked' | 'hospital'>('idle');
  const [assignedAmbulance, setAssignedAmbulance] = useState<any>(null);

  useEffect(() => {
    // Auto-login for emergency services
    const loginSuccess = login("patient@parvah.com", "patient123", "patient");
    setIsAuthenticated(true);
  }, [login]);

  // Show loading if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-gray-800">Loading Emergency Services...</div>
        </div>
      </div>
    );
  }

  // Trigger emergency
  const triggerEmergency = () => {
    alert("Emergency alert sent! Help is on the way.");
  };

  // Update ambulance markers to include moving ambulance
  const allAmbulances = [
    { id: "AMB-001", lat: 28.6200, lng: 77.2100, status: "Available" },
    { id: "AMB-002", lat: 28.6050, lng: 77.2150, status: "On Duty" },
    { id: "AMB-003", lat: 28.6180, lng: 77.1950, status: "Available" },
    { id: "AMB-004", lat: 28.6000, lng: 77.2000, status: "Available" },
    { id: "AMB-005", lat: 28.6250, lng: 77.2200, status: "On Duty" }
  ];

  if (ambulancePosition && simulationActive) {
    allAmbulances.unshift({
      id: "AMB-SOS", 
      lat: ambulancePosition.lat, 
      lng: ambulancePosition.lng, 
      status: "Responding to SOS"
    });
  }

  // Call ambulance
  const callAmbulance = () => {
    alert("Calling ambulance... Emergency services will contact you shortly!");
    // In real app, this would make an actual phone call or open dialer
    window.open("tel:108"); // India's emergency ambulance number
  };

  // Share location
  const shareLocation = () => {
    const location = currentLocation || { lat: 28.6139, lng: 77.2090 };
    const locationText = `My current location: https://www.google.com/maps?q=${location.lat},${location.lng}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(locationText).then(() => {
      alert("Location copied to clipboard! Share with emergency services.");
    }).catch(() => {
      alert(`Location: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`);
    });
  };

  // Show medical history
  const showMedicalHistory = () => {
    const medicalInfo = `
      Medical Information:
      Name: ${user?.name || "Patient"}
      Blood Group: O+
      Allergies: None
      Medications: None
      Emergency Contact: +91-XXXXXXXXXX
      Last Updated: ${new Date().toLocaleDateString()}
    `;
    alert(medicalInfo.trim());
  };

  // SOS Simulation Functions
  const startSOSSimulation = () => {
    if (simulationActive) return;
    
    setSimulationActive(true);
    setSimulationStage('dispatched');
    setEta(8); // 8 minutes initial ETA
    
    // Find nearest ambulance with details
    const nearestAmbulance = { 
      id: "AMB-SOS", 
      lat: 28.6200, 
      lng: 77.2100,
      driver: {
        name: "Rajesh Kumar",
        phone: "+91-9876543210",
        experience: "5 years",
        license: "DL-2020-DEL-12345"
      },
      vehicle: {
        number: "DL-01-AB-1234",
        type: "Advanced Life Support",
        equipment: "Defibrillator, Oxygen, First Aid Kit",
        status: "Responding to Emergency"
      }
    };
    
    setAssignedAmbulance(nearestAmbulance);
    setAmbulancePosition({ lat: nearestAmbulance.lat, lng: nearestAmbulance.lng });
    
    // Start ambulance movement
    animateAmbulanceToUser(nearestAmbulance);
  };

  const animateAmbulanceToUser = (startPos: { lat: number; lng: number }) => {
    const steps = 20;
    let currentStep = 0;
    
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      const newLat = startPos.lat + (currentLocation.lat - startPos.lat) * progress;
      const newLng = startPos.lng + (currentLocation.lng - startPos.lng) * progress;
      
      setAmbulancePosition({ lat: newLat, lng: newLng });
      setEta(Math.max(0, 8 * (1 - progress)));
      
      if (currentStep >= steps) {
        clearInterval(interval);
        setSimulationStage('arrived');
        setEta(0);
        
        // Auto pickup after 2 seconds
        setTimeout(() => {
          setSimulationStage('picked');
          // Go to hospital after 2 seconds
          setTimeout(() => {
            animateToHospital();
          }, 2000);
        }, 2000);
      }
    }, 500);
  };

  const animateToHospital = () => {
    setSimulationStage('hospital');
    const hospital = { lat: 28.6069, lng: 77.2090 }; // AIIMS Delhi
    const startPos = ambulancePosition || currentLocation;
    
    const steps = 15;
    let currentStep = 0;
    
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      const newLat = startPos.lat + (hospital.lat - startPos.lat) * progress;
      const newLng = startPos.lng + (hospital.lng - startPos.lng) * progress;
      
      setAmbulancePosition({ lat: newLat, lng: newLng });
      
      if (currentStep >= steps) {
        clearInterval(interval);
        setSimulationActive(false);
        setAmbulancePosition(null);
        setSimulationStage('idle');
        alert('✅ Successfully delivered to AIIMS Delhi Hospital!');
      }
    }, 500);
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
              <button onClick={startSOSSimulation} disabled={simulationActive} className="w-full py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                <AlertTriangle className="w-4 h-4" />
                {simulationActive ? `SOS Active - ${simulationStage}` : '🚨 Start SOS Simulation'}
              </button>
              <button onClick={callAmbulance} className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-2">
                <Phone className="w-4 h-4" />
                Call Ambulance
              </button>
              <button onClick={shareLocation} className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center justify-center gap-2">
                <MapPin className="w-4 h-4" />
                Share Location
              </button>
              <button onClick={showMedicalHistory} className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 flex items-center justify-center gap-2">
                <Activity className="w-4 h-4" />
                Medical History
              </button>
              {eta > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-yellow-800">🚑 Ambulance ETA:</span>
                    <span className="text-lg font-bold text-yellow-900">{eta} min</span>
                  </div>
                </div>
              )}

              {assignedAmbulance && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-3">
                  <h4 className="font-semibold text-blue-900 mb-3">🚑 Assigned Ambulance</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vehicle Number:</span>
                      <span className="font-medium">{assignedAmbulance.vehicle.number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vehicle Type:</span>
                      <span className="font-medium">{assignedAmbulance.vehicle.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Driver Name:</span>
                      <span className="font-medium">{assignedAmbulance.driver.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Driver Phone:</span>
                      <span className="font-medium">{assignedAmbulance.driver.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Experience:</span>
                      <span className="font-medium">{assignedAmbulance.driver.experience}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Equipment:</span>
                      <span className="font-medium text-xs">{assignedAmbulance.vehicle.equipment}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium text-green-600">{assignedAmbulance.vehicle.status}</span>
                    </div>
                  </div>
                </div>
              )}
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
                ambulances={allAmbulances}
                hospitals={[
                  { id: "AIIMS", lat: 28.6069, lng: 77.2090, name: "AIIMS Delhi", status: "Available" },
                  { id: "SJDH", lat: 28.5850, lng: 77.2030, name: "Safdarjung Hospital", status: "Available" },
                  { id: "LNJP", lat: 28.6580, lng: 77.2100, name: "LNJP Hospital", status: "Available" },
                  { id: "GTB", lat: 28.6800, lng: 77.2800, name: "GTB Hospital", status: "Available" }
                ]}
                sosVehicles={[
                  { id: "POL-001", lat: 28.6150, lng: 77.2050, type: "police" },
                  { id: "POL-002", lat: 28.6100, lng: 77.2250, type: "police" },
                  { id: "AMB-006", lat: 28.5950, lng: 77.2100, type: "ambulance" }
                ]}
                userLocation={currentLocation}
                showUserLocation={true}
                emergencies={[]}
                center={currentLocation ? [currentLocation.lat, currentLocation.lng] : [28.6139, 77.2090]}
                zoom={13}
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
