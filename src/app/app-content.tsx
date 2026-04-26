// PRAVAH + LifeLane - Main Application Content
// Role-based routing and view rendering with authentication

"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Play, Pause, Gauge, LogOut, Truck, Shield, Heart, Users, Activity, Package } from "lucide-react";
import { useApp } from "@/store/AppContext";
import { useAuth, AuthProvider } from "@/store/AuthContext";
import { AppProvider } from "@/store/AppContext";
import PatientView from "@/views/PatientView";
import DriverView from "@/views/DriverView";
import DispatchView from "@/views/DispatchView";
import TrafficView from "@/views/TrafficView";
import WomenSafetyView from "@/views/WomenSafetyView";
import ParentalView from "@/views/ParentalView";
import ElderlyView from "@/views/ElderlyView";
import ParcelView from "@/views/ParcelView";
import type { UserRole } from "@/types";
import type { UserProfile, UserPermissions } from "@/types/roles";

function RoleSelector() {
  const { setRole, currentUser } = useApp();

  const services = [
    {
      id: "emergency",
      role: "patient" as UserRole,
      label: "Emergency Services",
      icon: <Shield className="w-6 h-6" />,
      color: "bg-red-500",
    },
    {
      id: "driver",
      role: "driver" as UserRole,
      label: "Service Provider",
      icon: <Truck className="w-6 h-6" />,
      color: "bg-yellow-500",
    },
    {
      id: "dispatch",
      role: "dispatch" as UserRole,
      label: "Dispatch Control",
      icon: <Activity className="w-6 h-6" />,
      color: "bg-blue-500",
    },
    {
      id: "traffic",
      role: "traffic" as UserRole,
      label: "Traffic Control",
      icon: <Users className="w-6 h-6" />,
      color: "bg-green-500",
    },
    {
      id: "womensafety",
      role: "patient" as UserRole,
      label: "Women Safety",
      icon: <Shield className="w-6 h-6" />,
      color: "bg-pink-500",
    },
    {
      id: "parent",
      role: "patient" as UserRole,
      label: "Parental Monitoring",
      icon: <Users className="w-6 h-6" />,
      color: "bg-indigo-500",
    },
    {
      id: "eldercare",
      role: "patient" as UserRole,
      label: "Elderly Care",
      icon: <Heart className="w-6 h-6" />,
      color: "bg-teal-500",
    },
    {
      id: "parcel",
      role: "patient" as UserRole,
      label: "Parcel Delivery",
      icon: <Package className="w-6 h-6" />,
      color: "bg-blue-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            PRAVAH + LifeLane
          </h1>
          <p className="text-gray-600">
            Smart Traffic Management & Emergency Response System
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {services.map((service) => (
            <motion.button
              key={service.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setRole(service.role);
                // Redirect to service-specific URL
                window.location.href = `/?service=${service.id}`;
              }}
              className={`p-6 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all cursor-pointer ${service.color} text-white`}
            >
              <div className="flex flex-col items-center gap-3">
                {service.icon}
                <div>
                  <div className="font-bold text-lg">{service.label}</div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="text-center text-sm text-gray-500">
          Select a role to access the corresponding interface
        </div>
      </motion.div>
    </div>
  );
}

function MainContent() {
  const { currentUser, setRole, isSimulationRunning, toggleSimulation, simulationSpeed, setSimulationSpeed } =
    useApp();
  const { user } = useAuth();
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const selectedService = searchParams?.get('service') || 'emergency';

  if (!currentUser) {
    return <RoleSelector />;
  }

  const renderView = () => {
    // Route based on selected service from login
    switch (selectedService) {
      case "emergency":
      case "patient":
        return <PatientView />;
      case "driver":
        return <DriverView />;
      case "dispatch":
      case "dispatcher":
        return <DispatchView />;
      case "traffic":
      case "traffic_control":
        return <TrafficView />;
      case "womensafety":
        return <WomenSafetyView />;
      case "parent":
      case "parental":
        return <ParentalView />;
      case "eldercare":
        return <ElderlyView />;
      case "parcel":
        return <ParcelView />;
      case "child":
        return <ParentalView />; // Child uses similar interface
      case "admin":
        return <DispatchView />; // Admin gets dispatch view
      case "fleet":
        return <DriverView />; // Fleet manager gets driver view
      case "ai":
        return <DispatchView />; // AI analyst gets dispatch view
      default:
        return <PatientView />;
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Top Bar */}
      <div className="bg-white border-b px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500" />
            <select
              value={currentUser.role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="patient">Patient</option>
              <option value="driver">Driver</option>
              <option value="dispatch">Dispatch</option>
              <option value="traffic">Traffic Control</option>
            </select>
          </div>
          <div className="text-sm text-gray-500">
            Current: <span className="font-medium">{currentUser.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Simulation Controls */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
            <button
              onClick={toggleSimulation}
              className={`p-1.5 rounded transition-colors ${
                isSimulationRunning
                  ? "bg-green-500 text-white"
                  : "bg-gray-300 text-gray-600"
              }`}
              title={isSimulationRunning ? "Pause Simulation" : "Start Simulation"}
            >
              {isSimulationRunning ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-gray-500" />
              <input
                type="range"
                min="1"
                max="5"
                value={simulationSpeed}
                onChange={(e) => setSimulationSpeed(parseInt(e.target.value))}
                className="w-20"
              />
              <span className="text-xs text-gray-600">{simulationSpeed}x</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main View */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentUser.role}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full"
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function AppContent() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
