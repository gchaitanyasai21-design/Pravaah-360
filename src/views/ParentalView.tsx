"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Clock, AlertTriangle, CheckCircle,
  Plus, MapPin, Lock, Shield, Bell,
} from "lucide-react";
import LiveMap from "@/components/LiveMap";
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

export default function ParentalView() {
  const { ambulances, emergencies } = useApp();
  const { user } = useAuth();
  
  // PIN LOCK SYSTEM
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [enteredPin, setEnteredPin] = useState("");
  const [savedPin, setSavedPin] = useState("");
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [pinError, setPinError] = useState("");
  const [wrongAttempts, setWrongAttempts] = useState(0);

  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(null);
  const [showAddChild, setShowAddChild] = useState(false);
  const [newChildData, setNewChildData] = useState({
    name: "", age: "", bloodGroup: "O+", phone: ""
  });

  // Check PIN on mount
  useEffect(() => {
    const pin = localStorage.getItem('parent_pin');
    if (pin) {
      setSavedPin(pin);
      setIsFirstTime(false);
    } else {
      setIsFirstTime(true);
    }
  }, []);

  // Set new PIN (first time)
  const setNewPin = () => {
    if (enteredPin.length !== 4) {
      setPinError("PIN must be 4 digits");
      return;
    }
    localStorage.setItem('parent_pin', enteredPin);
    setSavedPin(enteredPin);
    setIsFirstTime(false);
    setIsUnlocked(true);
    setEnteredPin("");
    setPinError("");
  };

  // Verify PIN
  const verifyPin = () => {
    if (enteredPin === savedPin) {
      setIsUnlocked(true);
      setPinError("");
      setEnteredPin("");
      setWrongAttempts(0);
    } else {
      setWrongAttempts(prev => prev + 1);
      setPinError(`Wrong PIN! Attempts: ${wrongAttempts + 1}/3`);
      setEnteredPin("");
      if (wrongAttempts >= 2) {
        alert("⚠️ 3 wrong attempts! Alert sent to registered email.");
      }
    }
  };

  // Load children data
  useEffect(() => {
    if (!isUnlocked) return;
    
    const loadChildData = () => {
      const savedChildren = localStorage.getItem('parent_children');
      
      if (savedChildren) {
        const childList = JSON.parse(savedChildren);
        
        // Get updated location from child app
        const updatedChildren = childList.map((child: ChildProfile) => {
          const childLoc = localStorage.getItem(`child_location_${child.id}`);
          const childEmergency = localStorage.getItem(`child_emergency_${child.id}`);
          
          let location = child.currentLocation;
          let status: 'safe' | 'warning' | 'emergency' = 'safe';
          
          if (childLoc) {
            const locData = JSON.parse(childLoc);
            location = { lat: locData.lat, lng: locData.lng };
          }
          
          if (childEmergency) {
            const emg = JSON.parse(childEmergency);
            const timeDiff = Date.now() - new Date(emg.timestamp).getTime();
            if (timeDiff < 10 * 60 * 1000) status = 'emergency';
          }
          
          return {
            ...child,
            currentLocation: location,
            status,
            lastSeen: new Date()
          };
        });
        
        setChildren(updatedChildren);
      }
    };
    
    loadChildData();
    const interval = setInterval(loadChildData, 5000);
    return () => clearInterval(interval);
  }, [isUnlocked]);

  // Add new child
  const addChild = () => {
    if (!newChildData.name || !newChildData.age) {
      alert("Please fill name and age");
      return;
    }
    
    const newChild: ChildProfile = {
      id: `child-${Date.now()}`,
      name: newChildData.name,
      age: parseInt(newChildData.age),
      bloodGroup: newChildData.bloodGroup,
      parentPhone: newChildData.phone || user?.email || "",
      currentLocation: { lat: 28.6139, lng: 77.2090 },
      status: 'safe',
      lastSeen: new Date(),
    };
    
    const updated = [...children, newChild];
    setChildren(updated);
    localStorage.setItem('parent_children', JSON.stringify(updated));
    
    setNewChildData({ name: "", age: "", bloodGroup: "O+", phone: "" });
    setShowAddChild(false);
    alert(`✅ ${newChild.name} added successfully!`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'emergency': return 'text-red-600 bg-red-100 animate-pulse';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // PIN LOCK SCREEN
  if (!isUnlocked) {
    return (
      <div className="h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl max-w-md w-full border border-white/20"
        >
          <div className="text-center mb-6">
            <div className="inline-flex p-4 bg-white/20 rounded-full mb-4">
              <Lock className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {isFirstTime ? "Set Parent PIN" : "Parent Access"}
            </h1>
            <p className="text-white/80 text-sm">
              {isFirstTime 
                ? "Create a 4-digit PIN. Only you can access this."
                : "Enter your 4-digit PIN to continue"}
            </p>
          </div>

          <div className="space-y-4">
            <input
              type="password"
              maxLength={4}
              value={enteredPin}
              onChange={(e) => setEnteredPin(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              className="w-full px-6 py-4 bg-white/20 backdrop-blur border border-white/30 rounded-2xl text-white text-center text-3xl tracking-widest placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            
            {pinError && (
              <p className="text-red-300 text-center text-sm">{pinError}</p>
            )}
            
            <button
              onClick={isFirstTime ? setNewPin : verifyPin}
              disabled={enteredPin.length !== 4}
              className="w-full py-4 bg-white text-purple-900 rounded-2xl font-bold text-lg hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Shield className="w-5 h-5" />
              {isFirstTime ? "Create PIN" : "Unlock"}
            </button>
            
            <p className="text-white/60 text-xs text-center">
              🔒 This PIN protects parent settings. Child cannot disable this.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // MAIN DASHBOARD (After PIN)
  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-lg shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BackToLogin />
              <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-indigo-600" />
                  Parent Dashboard
                </h1>
                <p className="text-gray-600 text-sm">Secure monitoring for your children</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{children.length}</div>
                <div className="text-xs text-gray-500">Children</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {children.filter(c => c.status === 'emergency').length}
                </div>
                <div className="text-xs text-gray-500">Alerts</div>
              </div>
              <button
                onClick={() => setIsUnlocked(false)}
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                title="Lock"
              >
                <Lock className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col lg:flex-row p-4 gap-4 overflow-hidden">
          {/* Left - Children List */}
          <div className="lg:w-1/3 flex flex-col space-y-4 overflow-y-auto">
            <button
              onClick={() => setShowAddChild(true)}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Add Child
            </button>

            {/* Add Child Form */}
            <AnimatePresence>
              {showAddChild && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-xl p-5 shadow-lg space-y-3"
                >
                  <h3 className="font-semibold text-gray-800">Add Child Details</h3>
                  <input
                    type="text"
                    placeholder="Child Name *"
                    value={newChildData.name}
                    onChange={(e) => setNewChildData({...newChildData, name: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="number"
                    placeholder="Age *"
                    value={newChildData.age}
                    onChange={(e) => setNewChildData({...newChildData, age: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                  <select
                    value={newChildData.bloodGroup}
                    onChange={(e) => setNewChildData({...newChildData, bloodGroup: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option>O+</option><option>O-</option><option>A+</option>
                    <option>A-</option><option>B+</option><option>B-</option>
                    <option>AB+</option><option>AB-</option>
                  </select>
                  <input
                    type="tel"
                    placeholder="Parent Phone"
                    value={newChildData.phone}
                    onChange={(e) => setNewChildData({...newChildData, phone: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="flex gap-2">
                    <button onClick={addChild} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">
                      Save
                    </button>
                    <button onClick={() => setShowAddChild(false)} className="flex-1 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Children Cards */}
            {children.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No children added yet</p>
                <p className="text-sm">Click "Add Child" to start</p>
              </div>
            ) : (
              children.map((child) => (
                <motion.div
                  key={child.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedChild(child)}
                  className={`bg-white rounded-xl p-4 shadow-lg cursor-pointer border-2 transition-all ${
                    selectedChild?.id === child.id ? 'border-indigo-500' : 'border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center text-2xl">
                        👶
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{child.name}</h3>
                        <p className="text-sm text-gray-600">Age {child.age} • {child.bloodGroup}</p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(child.status)}`}>
                      {child.status.toUpperCase()}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>Tracked</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{child.lastSeen.toLocaleTimeString()}</span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Right - Map */}
          <div className="lg:w-2/3 bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-600" />
                {selectedChild ? `${selectedChild.name}'s Location` : 'Select a child'}
              </h3>
              {selectedChild?.currentLocation && (
                <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                  🟢 LIVE
                </span>
              )}
            </div>
            <div className="h-[500px] rounded-lg overflow-hidden">
              <LiveMap
                ambulances={ambulances.filter(a => a.status === "en-route")}
                emergencies={emergencies}
                userLocation={selectedChild?.currentLocation}
                showUserLocation={!!selectedChild?.currentLocation}
                center={selectedChild?.currentLocation 
                  ? [selectedChild.currentLocation.lat, selectedChild.currentLocation.lng] 
                  : [28.6139, 77.2090]}
                zoom={15}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}