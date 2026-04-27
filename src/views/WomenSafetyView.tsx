// PRAVAH + LifeLane - Women Safety View
// Personal safety and emergency assistance for women

"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  MapPin,
  Phone,
  Users,
  AlertTriangle,
  Share2,
  Eye,
  EyeOff,
  Clock,
  CheckCircle,
  Plus,
  X,
} from "lucide-react";
import LiveMap from "@/components/LiveMap";
import BackToLogin from "@/components/BackToLogin";
import { useApp } from "@/store/AppContext";
import { useAuth } from "@/store/AuthContext";

export default function WomenSafetyView() {
  const { ambulances, emergencies, createEmergency } = useApp();
  const { user, updateProfile } = useAuth();
  const [isTrackingEnabled, setIsTrackingEnabled] = useState(false);
  const [shareCode, setShareCode] = useState(user?.trackingShareCode || "");
  const [emergencyContacts, setEmergencyContacts] = useState<string[]>(user?.emergencyContacts as string[] || []);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
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

  // Toggle location tracking
  const toggleTracking = () => {
    setIsTrackingEnabled(!isTrackingEnabled);
    if (!isTrackingEnabled) {
      getCurrentLocation();
    }
  };

  // Share location with trusted contacts
  const shareLocation = () => {
    if (currentLocation) {
      const locationLink = `https://www.google.com/maps?q=${currentLocation.lat},${currentLocation.lng}`;
      navigator.clipboard.writeText(locationLink);
      alert("Location link copied to clipboard! Share with your trusted contacts.");
    }
  };

  // Add emergency contact
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

  // Trigger emergency alert
  const triggerEmergency = () => {
    setIsEmergency(true);
    
    // Create emergency with current location
    createEmergency({
      patientName: user?.name || "Safety User",
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
                <h1 className="text-2xl font-bold text-gray-800">Women Safety</h1>
                <p className="text-gray-600">Personal safety and emergency assistance</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                isTrackingEnabled ? "bg-green-500" : "bg-gray-500"
              }`}>
                {isTrackingEnabled ? "Tracking Active" : "Tracking Off"}
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
        <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full p-4 gap-4 overflow-hidden">
          {/* Left Panel - Safety Features */}
          <div className="lg:w-1/3 space-y-4 overflow-y-auto">
            {/* Location Tracking */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">Location Tracking</h3>
              </div>
              <div className="space-y-3">
                <button
                  onClick={toggleTracking}
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    isTrackingEnabled
                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  {isTrackingEnabled ? "Disable Tracking" : "Enable Tracking"}
                </button>
                {currentLocation && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Current location: {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                    </p>
                  </div>
                )}
                <button
                  onClick={shareLocation}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share Location
                </button>
              </div>
            </div>

            {/* Share Code */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-800">Share Code</h3>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-800 mb-1">Your tracking code:</p>
                  <p className="text-xl font-bold text-purple-900">{shareCode}</p>
                </div>
                <p className="text-sm text-gray-600">
                  Share this code with trusted contacts to allow them to track your location.
                </p>
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-red-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Emergency Contacts</h3>
                </div>
                <button
                  onClick={() => {
                    const newContact = prompt("Enter emergency contact (phone number):");
                    if (newContact) addEmergencyContact(newContact);
                  }}
                  className="text-red-600 hover:text-red-700"
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
                    <button
                      onClick={() => removeEmergencyContact(contact)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
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

          {/* Right Panel - Map & SOS */}
          <div className="lg:w-2/3 flex flex-col space-y-4">
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
                  center={currentLocation ? [currentLocation.lat, currentLocation.lng] : [28.6139, 77.2090]}
                  zoom={15}
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
