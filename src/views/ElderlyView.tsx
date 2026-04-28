// PRAVAH + LifeLane - Elderly Care View
// Senior citizen monitoring and assistance

"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  Pill,
  Activity,
  Calendar,
  Users,
  Heart,
  Phone,
  Plus,
  X,
} from "lucide-react";
import LiveMap from "@/components/LiveMap";
import BackToLogin from "@/components/BackToLogin";
import { useApp } from "@/store/AppContext";
import { useAuth } from "@/store/AuthContext";

interface MedicationReminder {
  id: string;
  name: string;
  time: string;
  taken: boolean;
  dosage: string;
}

interface HealthMetrics {
  heartRate: number;
  bloodPressure: string;
  temperature: number;
  lastUpdated: Date;
}

export default function ElderlyView() {
  const { ambulances, emergencies, createEmergency } = useApp();
  const { user, updateProfile } = useAuth();
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isTrackingEnabled, setIsTrackingEnabled] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState<string[]>(user?.emergencyContacts as string[] || []);
  const [medications, setMedications] = useState<MedicationReminder[]>([
    { id: "med-1", name: "Blood Pressure Medicine", time: "08:00", taken: false, dosage: "1 tablet" },
    { id: "med-2", name: "Diabetes Medicine", time: "12:00", taken: false, dosage: "2 tablets" },
    { id: "med-3", name: "Heart Medicine", time: "20:00", taken: false, dosage: "1 tablet" },
  ]);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics>({
    heartRate: 72,
    bloodPressure: "120/80",
    temperature: 98.6,
    lastUpdated: new Date(),
  });
  const [isEmergency, setIsEmergency] = useState(false);

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          // Set default location (Delhi)
          setCurrentLocation({ lat: 28.6139, lng: 77.2090 });
        }
      );
    }
  };

  // Mark medication as taken
  const markMedicationTaken = (medId: string) => {
    setMedications(prev =>
      prev.map(med => 
        med.id === medId ? { ...med, taken: true } : med
      )
    );
  };

  // Trigger emergency alert
  const triggerEmergency = () => {
    setIsEmergency(true);
    
    // Create emergency with current location
    createEmergency({
      patientName: user?.name || "Elderly User",
      type: "accident", // Use valid emergency type
      pickupLat: currentLocation?.lat || 28.6139,
      pickupLng: currentLocation?.lng || 77.2090,
    });

    // Share location with emergency contacts
    if (currentLocation && emergencyContacts.length > 0) {
      const locationLink = `https://www.google.com/maps?q=${currentLocation.lat},${currentLocation.lng}`;
      
      // Send location to all emergency contacts
      emergencyContacts.forEach(contact => {
        // In real app, this would send SMS/email
        console.log(`Emergency alert sent to ${contact}: Location - ${locationLink}`);
      });
      
      // Show location sharing confirmation
      alert(`Emergency alert sent to ${emergencyContacts.length} contacts!\nLocation: ${locationLink}`);
    }

    // Auto-call emergency contacts after 10 seconds if not cancelled
    setTimeout(() => {
      if (isEmergency) {
        alert("Emergency contacts notified! Help is on the way.");
      }
    }, 10000);
  };

  // Add new emergency contact
  const addEmergencyContact = (contact: string) => {
    if (contact.trim() && !emergencyContacts.includes(contact.trim())) {
      setEmergencyContacts([...emergencyContacts, contact.trim()]);
      updateProfile({ emergencyContacts: [...emergencyContacts, contact.trim()] });
    }
  };

  // Remove emergency contact
  const removeEmergencyContact = (contact: string) => {
    const updated = emergencyContacts.filter(c => c !== contact);
    setEmergencyContacts(updated);
    updateProfile({ emergencyContacts: updated });
  };

  // Cancel emergency
  const cancelEmergency = () => {
    setIsEmergency(false);
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  return (
    <div className="h-screen bg-gray-50 flex">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BackToLogin />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Elderly Care</h1>
                <p className="text-gray-600">Health monitoring and emergency assistance</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                {user?.name} • {user?.role}
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Alert */}
        {isEmergency && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-600 text-white p-4 border-b-4 border-red-800"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
                <div>
                  <h3 className="font-bold">EMERGENCY ALERT ACTIVATED</h3>
                  <p className="text-sm">Help is on the way. Location shared with emergency contacts.</p>
                </div>
              </div>
              <button
                onClick={cancelEmergency}
                className="px-4 py-2 bg-white text-red-600 rounded-lg font-medium hover:bg-red-50"
              >
                Cancel Alert
              </button>
            </div>
          </motion.div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex lg:flex-row gap-4 p-6 overflow-hidden">
          {/* Left Panel - Health & Medications */}
          <div className="lg:w-1/3 space-y-4 overflow-y-auto">
            {/* Health Metrics */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-800">Health Metrics</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Heart Rate</span>
                  <span className="font-semibold text-gray-800">{healthMetrics.heartRate} bpm</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Blood Pressure</span>
                  <span className="font-semibold text-gray-800">{healthMetrics.bloodPressure}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Temperature</span>
                  <span className="font-semibold text-gray-800">{healthMetrics.temperature}°F</span>
                </div>
                <div className="text-xs text-gray-500">
                  Last updated: {healthMetrics.lastUpdated.toLocaleTimeString()}
                </div>
              </div>
            </div>

            {/* Medication Reminders */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <Pill className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">Medication Reminders</h3>
              </div>
              <div className="space-y-3">
                {medications.map((med) => (
                  <div key={med.id} className={`p-3 rounded-lg border ${med.taken ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-800">{med.name}</div>
                        <div className="text-sm text-gray-600">{med.time} • {med.dosage}</div>
                      </div>
                      <button
                        onClick={() => markMedicationTaken(med.id)}
                        className={`p-2 rounded-lg ${med.taken ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}
                        disabled={med.taken}
                      >
                        {med.taken ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <Clock className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Emergency Contacts</h3>
                </div>
                <button
                  onClick={() => {
                    const newContact = prompt("Enter emergency contact (phone number):");
                    if (newContact) addEmergencyContact(newContact);
                  }}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-2">
                {emergencyContacts.map((contact, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-700">{contact}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="text-green-600 hover:text-green-700">
                        <Phone className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeEmergencyContact(contact)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {emergencyContacts.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <p>No emergency contacts added</p>
                    <p className="text-sm">Click + to add emergency contacts</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Map & Location */}
          <div className="lg:w-2/3 flex flex-col space-y-4">
            {/* Location Tracking */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Location Tracking
                </h3>
                <button
                  onClick={() => setIsTrackingEnabled(!isTrackingEnabled)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isTrackingEnabled
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {isTrackingEnabled ? "ON" : "OFF"}
                </button>
              </div>
              
              {currentLocation && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Current location: {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                  </p>
                </div>
              )}
            </div>

            {/* Map */}
            <div className="bg-white rounded-xl shadow-lg p-4 flex-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800">Your Location</h3>
                {currentLocation && (
                  <span className="text-sm text-gray-600">
                    Lat: {currentLocation.lat.toFixed(4)}, Lng: {currentLocation.lng.toFixed(4)}
                  </span>
                )}
              </div>
              
              <div className="h-full min-h-[400px] rounded-lg overflow-hidden">
                <LiveMap
                  ambulances={ambulances.filter(a => a.status === "en-route")}
                  emergencies={emergencies.filter(e => e.userId === user?.id)}
                  userLocation={currentLocation}
                  showUserLocation={!!currentLocation}
                  center={currentLocation ? [currentLocation.lat, currentLocation.lng] : [28.6139, 77.2090]}
                  zoom={14}
                />
              </div>
            </div>

            {/* Emergency SOS Button */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <button
                onClick={triggerEmergency}
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-lg transition-colors flex items-center justify-center gap-3"
              >
                <AlertTriangle className="w-6 h-6" />
                EMERGENCY SOS
              </button>
              <p className="text-center text-sm text-gray-600 mt-2">
                Press for immediate emergency assistance
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
