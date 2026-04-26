// PRAVAH + LifeLane - Parental Monitoring View
// Track and protect your children

"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Phone,
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
  Bell,
  Heart,
  School,
  Home,
  Plus,
  X,
  MapPin,
} from "lucide-react";
import LiveMap from "@/components/LiveMapSimple";
import BackToLogin from "@/components/BackToLogin";
import { useApp } from "@/store/AppContext";
import { useAuth } from "@/store/AuthContext";

interface ChildProfile {
  id: string;
  name: string;
  age: number;
  bloodGroup: string;
  parentPhone: string;
  currentLocation?: { lat: number; lng: number };
  status: 'safe' | 'warning' | 'emergency';
  lastSeen: Date;
}

interface Alert {
  id: string;
  childId: string;
  type: 'geofence' | 'sos' | 'low_battery' | 'emergency';
  message: string;
  timestamp: Date;
}

export default function ParentalView() {
  const { ambulances, emergencies } = useApp();
  const { user, updateProfile } = useAuth();
  const [children, setChildren] = useState<ChildProfile[]>([]);

  // Load child data from localStorage
  useEffect(() => {
    const loadChildData = () => {
      const childName = localStorage.getItem('childName');
      const parentPhone = localStorage.getItem('parentPhone');
      const childLocation = localStorage.getItem('childLocation');
      const childEmergency = localStorage.getItem('childEmergency');
      
      if (childName && parentPhone) {
        let location = { lat: 28.6139, lng: 77.2090 };
        let status: 'safe' | 'warning' | 'emergency' = 'safe';
        
        if (childLocation) {
          location = JSON.parse(childLocation);
        }
        
        if (childEmergency) {
          const emergency = JSON.parse(childEmergency);
          const emergencyTime = new Date(emergency.timestamp);
          const now = new Date();
          const timeDiff = now.getTime() - emergencyTime.getTime();
          
          // If emergency was triggered in last 10 minutes, show as emergency
          if (timeDiff < 10 * 60 * 1000) {
            status = 'emergency';
          }
        }
        
        const child: ChildProfile = {
          id: "child-saved",
          name: childName,
          age: 10, // Default age
          bloodGroup: "O+", // Default blood group
          parentPhone: parentPhone,
          currentLocation: location,
          status: status,
          lastSeen: new Date(),
        };
        
        setChildren([child]);
      } else {
        // Default demo children if no saved data
        setChildren([
          {
            id: "child-1",
            name: "Emma",
            age: 12,
            bloodGroup: "O+",
            parentPhone: "+91-9876543210",
            currentLocation: { lat: 28.6139, lng: 77.2090 },
            status: 'safe',
            lastSeen: new Date(),
          },
          {
            id: "child-2", 
            name: "Noah",
            age: 8,
            bloodGroup: "A+",
            parentPhone: "+91-9876543210",
            currentLocation: { lat: 28.6289, lng: 77.2195 },
            status: 'safe',
            lastSeen: new Date(),
          },
        ]);
      }
    };
    
    loadChildData();
    
    // Update every 5 seconds to check for new emergency data
    const interval = setInterval(loadChildData, 5000);
    return () => clearInterval(interval);
  }, []);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // Load alerts from child safety data
  useEffect(() => {
    const childEmergency = localStorage.getItem('childEmergency');
    const childName = localStorage.getItem('childName');
    
    if (childEmergency && childName) {
      const emergency = JSON.parse(childEmergency);
      const newAlert: Alert = {
        id: "emergency-alert",
        childId: "child-saved",
        type: 'emergency',
        message: `${childName} triggered emergency SOS!`,
        timestamp: new Date(emergency.timestamp),
      };
      setAlerts([newAlert]);
    }
  }, []);
  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(null);
  const [showAddChild, setShowAddChild] = useState(false);
  const [trackingCode, setTrackingCode] = useState("");

  // Add child by tracking code
  const addChildByCode = () => {
    if (trackingCode.trim()) {
      const newChild: ChildProfile = {
        id: `child-${Date.now()}`,
        name: "New Child",
        age: 10,
        bloodGroup: "O+",
        parentPhone: user?.email || "",
        status: 'safe',
        lastSeen: new Date(),
      };
      setChildren([...children, newChild]);
      setTrackingCode("");
      setShowAddChild(false);
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'emergency': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'safe': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'emergency': return AlertTriangle;
      default: return Clock;
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BackToLogin />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Parental Monitoring</h1>
                <p className="text-gray-600">Track and protect your children</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{children.length}</div>
                <div className="text-xs text-gray-500">Children</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{alerts.filter(a => a.type === 'emergency').length}</div>
                <div className="text-xs text-gray-500">Active Alerts</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full p-4 gap-4 overflow-hidden">
          {/* Left Panel - Children List */}
          <div className="lg:w-1/3 flex flex-col space-y-4 overflow-y-auto">
            {/* Add Child Button */}
            <button
              onClick={() => setShowAddChild(true)}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Child by Tracking Code
            </button>

            {/* Add Child Form */}
            {showAddChild && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-4 shadow-lg"
              >
                <h3 className="font-semibold text-gray-800 mb-3">Add Child</h3>
                <input
                  type="text"
                  placeholder="Enter tracking code"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3"
                />
                <div className="flex gap-2">
                  <button
                    onClick={addChildByCode}
                    className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowAddChild(false)}
                    className="flex-1 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}

            {/* Children Cards */}
            {children.map((child) => {
              const StatusIcon = getStatusIcon(child.status);
              return (
                <motion.div
                  key={child.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedChild(child)}
                  className={`bg-white rounded-xl p-4 shadow-lg cursor-pointer border-2 transition-colors ${
                    selectedChild?.id === child.id ? 'border-indigo-500' : 'border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-xl">👶</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{child.name}</h3>
                        <p className="text-sm text-gray-600">Age {child.age} • {child.bloodGroup}</p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(child.status)}`}>
                      {child.status}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>Location tracked</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{child.lastSeen.toLocaleTimeString()}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Right Panel - Map & Alerts */}
          <div className="lg:w-2/3 flex flex-col space-y-4">
            {/* Map */}
            <div className="bg-white rounded-xl shadow-lg p-4 flex-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  {selectedChild ? `${selectedChild.name}'s Location` : 'Select a child to view location'}
                </h3>
                {selectedChild?.currentLocation && (
                  <span className="text-sm text-gray-600">
                    Lat: {selectedChild.currentLocation.lat.toFixed(4)}, Lng: {selectedChild.currentLocation.lng.toFixed(4)}
                  </span>
                )}
              </div>
              
              <div className="h-full min-h-[400px] rounded-lg overflow-hidden">
                <LiveMap
                  ambulances={ambulances.filter(a => a.status === "en-route")}
                  emergencies={emergencies.filter(e => children.some(c => c.id === e.userId))}
                  center={selectedChild?.currentLocation ? [selectedChild.currentLocation.lat, selectedChild.currentLocation.lng] : [28.6139, 77.2090]}
                  zoom={15}
                />
              </div>
            </div>

            {/* Alerts */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-yellow-600" />
                  Recent Alerts
                </h3>
                <span className="text-sm text-gray-600">{alerts.length} alerts</span>
              </div>
              
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {alerts.map((alert) => {
                  const child = children.find(c => c.id === alert.childId);
                  return (
                    <div key={alert.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-2 h-2 rounded-full ${
                        alert.type === 'emergency' ? 'bg-red-500' :
                        alert.type === 'geofence' ? 'bg-blue-500' :
                        alert.type === 'sos' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`} />
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">
                          {child?.name}: {alert.message}
                        </div>
                        <div className="text-xs text-gray-600">
                          {alert.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {alerts.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <p>No recent alerts</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
