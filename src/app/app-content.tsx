// PRAVAH + LifeLane - Main App Content
// Role-based view router
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Ambulance, ClipboardList, TrafficCone, Play, Pause, Gauge } from "lucide-react";
import { AppProvider, useApp } from "@/store/AppContext";
import PatientView from "@/views/PatientView";
import DriverView from "@/views/DriverView";
import DispatchView from "@/views/DispatchView";
import TrafficView from "@/views/TrafficView";
import type { UserRole } from "@/types";

function RoleSelector() {
  const { setRole, currentUser } = useApp();

  const roles: { role: UserRole; label: string; icon: React.ReactNode; color: string }[] = [
    {
      role: "patient",
      label: "Patient",
      icon: <User className="w-6 h-6" />,
      color: "bg-red-500",
    },
    {
      role: "driver",
      label: "Driver",
      icon: <Ambulance className="w-6 h-6" />,
      color: "bg-blue-500",
    },
    {
      role: "dispatch",
      label: "Dispatch",
      icon: <ClipboardList className="w-6 h-6" />,
      color: "bg-purple-500",
    },
    {
      role: "traffic",
      label: "Traffic Control",
      icon: <TrafficCone className="w-6 h-6" />,
      color: "bg-yellow-500",
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {roles.map((item) => (
            <motion.button
              key={item.role}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setRole(item.role)}
              className={`${item.color} text-white p-6 rounded-xl shadow-lg flex flex-col items-center gap-3 transition-colors hover:opacity-90`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
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

  const [showRoleSelector, setShowRoleSelector] = useState(false);

  if (!currentUser || showRoleSelector) {
    return <RoleSelector />;
  }

  const renderView = () => {
    switch (currentUser.role) {
      case "patient":
        return <PatientView />;
      case "driver":
        return <DriverView />;
      case "dispatch":
        return <DispatchView />;
      case "traffic":
        return <TrafficView />;
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
