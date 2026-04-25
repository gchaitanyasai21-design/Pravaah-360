// PRAVAH + LifeLane - Global Application Context
// Manages global state and simulation logic

"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type {
  Ambulance,
  Emergency,
  TrafficJunction,
  Hospital,
  UserRole,
  AmbulanceStatus,
  EmergencyStatus,
  JunctionStatus,
} from "@/types";
import { calculateDistance, calculateHeading, interpolatePoint, headingToDirection } from "@/utils/geo";

interface AppState {
  // Data
  ambulances: Ambulance[];
  emergencies: Emergency[];
  junctions: TrafficJunction[];
  hospitals: Hospital[];

  // User
  currentUser: {
    id: string;
    name: string;
    role: UserRole;
  } | null;

  // Simulation
  isSimulationRunning: boolean;
  simulationSpeed: number;

  // Actions
  setRole: (role: UserRole) => void;
  toggleSimulation: () => void;
  setSimulationSpeed: (speed: number) => void;
  updateAmbulanceLocation: (id: string, lat: number, lng: number) => void;
  createEmergency: (data: Partial<Emergency>) => void;
  updateEmergencyStatus: (id: string, status: EmergencyStatus) => void;
  assignAmbulance: (emergencyId: string, ambulanceId: string) => void;
  updateJunctionStatus: (id: string, status: JunctionStatus) => void;
}

const AppContext = createContext<AppState | null>(null);

// Mock data for initial state
const mockAmbulances: Ambulance[] = [
  {
    id: "amb-1",
    vehicleNumber: "AMB-001",
    driverId: "drv-1",
    driverName: "Rajesh Kumar",
    status: "available",
    lat: 28.6139,
    lng: 77.2090,
    heading: 45,
    speed: 0,
    lastUpdated: new Date(),
    createdAt: new Date(),
  },
  {
    id: "amb-2",
    vehicleNumber: "AMB-002",
    driverId: "drv-2",
    driverName: "Suresh Patel",
    status: "available",
    lat: 28.6289,
    lng: 77.2195,
    heading: 180,
    speed: 0,
    lastUpdated: new Date(),
    createdAt: new Date(),
  },
  {
    id: "amb-3",
    vehicleNumber: "AMB-003",
    driverId: "drv-3",
    driverName: "Amit Singh",
    status: "busy",
    lat: 28.6350,
    lng: 77.2100,
    heading: 90,
    speed: 35,
    lastUpdated: new Date(),
    createdAt: new Date(),
  },
];

const mockJunctions: TrafficJunction[] = [
  {
    id: "jct-1",
    name: "Connaught Place",
    lat: 28.6315,
    lng: 77.2167,
    status: "normal",
    signalMode: "normal",
    northState: "red",
    southState: "green",
    eastState: "red",
    westState: "red",
    trafficDensity: 45,
    averageWaitTime: 30,
    vehiclesPerMinute: 25,
    lastUpdated: new Date(),
    createdAt: new Date(),
  },
  {
    id: "jct-2",
    name: "India Gate",
    lat: 28.6129,
    lng: 77.2295,
    status: "normal",
    signalMode: "normal",
    northState: "red",
    southState: "green",
    eastState: "red",
    westState: "red",
    trafficDensity: 60,
    averageWaitTime: 45,
    vehiclesPerMinute: 35,
    lastUpdated: new Date(),
    createdAt: new Date(),
  },
  {
    id: "jct-3",
    name: "Kashmere Gate",
    lat: 28.6692,
    lng: 77.2289,
    status: "normal",
    signalMode: "normal",
    northState: "green",
    southState: "red",
    eastState: "red",
    westState: "red",
    trafficDensity: 75,
    averageWaitTime: 60,
    vehiclesPerMinute: 45,
    lastUpdated: new Date(),
    createdAt: new Date(),
  },
  {
    id: "jct-4",
    name: "AIIMS Crossing",
    lat: 28.5677,
    lng: 77.2097,
    status: "normal",
    signalMode: "normal",
    northState: "green",
    southState: "red",
    eastState: "red",
    westState: "red",
    trafficDensity: 55,
    averageWaitTime: 35,
    vehiclesPerMinute: 30,
    lastUpdated: new Date(),
    createdAt: new Date(),
  },
  {
    id: "jct-5",
    name: "Saket Junction",
    lat: 28.6428,
    lng: 77.2234,
    status: "normal",
    signalMode: "normal",
    northState: "red",
    southState: "green",
    eastState: "red",
    westState: "red",
    trafficDensity: 40,
    averageWaitTime: 25,
    vehiclesPerMinute: 20,
    lastUpdated: new Date(),
    createdAt: new Date(),
  },
  {
    id: "jct-6",
    name: "Nehru Place",
    lat: 28.5473,
    lng: 77.2518,
    status: "normal",
    signalMode: "normal",
    northState: "green",
    southState: "red",
    eastState: "red",
    westState: "red",
    trafficDensity: 70,
    averageWaitTime: 50,
    vehiclesPerMinute: 40,
    lastUpdated: new Date(),
    createdAt: new Date(),
  },
  {
    id: "jct-7",
    name: "Dhaula Kuan",
    lat: 28.5933,
    lng: 77.1670,
    status: "normal",
    signalMode: "normal",
    northState: "red",
    southState: "green",
    eastState: "red",
    westState: "red",
    trafficDensity: 65,
    averageWaitTime: 40,
    vehiclesPerMinute: 38,
    lastUpdated: new Date(),
    createdAt: new Date(),
  },
  {
    id: "jct-8",
    name: "Rajouri Garden",
    lat: 28.6450,
    lng: 77.1124,
    status: "normal",
    signalMode: "normal",
    northState: "green",
    southState: "red",
    eastState: "red",
    westState: "red",
    trafficDensity: 50,
    averageWaitTime: 30,
    vehiclesPerMinute: 28,
    lastUpdated: new Date(),
    createdAt: new Date(),
  },
  {
    id: "jct-9",
    name: "Lajpat Nagar",
    lat: 28.5670,
    lng: 77.2444,
    status: "normal",
    signalMode: "normal",
    northState: "red",
    southState: "green",
    eastState: "red",
    westState: "red",
    trafficDensity: 58,
    averageWaitTime: 38,
    vehiclesPerMinute: 32,
    lastUpdated: new Date(),
    createdAt: new Date(),
  },
  {
    id: "jct-10",
    name: "Karol Bagh",
    lat: 28.6514,
    lng: 77.1906,
    status: "normal",
    signalMode: "normal",
    northState: "green",
    southState: "red",
    eastState: "red",
    westState: "red",
    trafficDensity: 72,
    averageWaitTime: 55,
    vehiclesPerMinute: 42,
    lastUpdated: new Date(),
    createdAt: new Date(),
  },
];

const mockHospitals: Hospital[] = [
  {
    id: "hosp-1",
    name: "AIIMS Delhi",
    lat: 28.5677,
    lng: 77.2097,
    address: "Ansari Nagar, New Delhi",
    phone: "+91-11-26588500",
    capacity: 100,
    availableBeds: 45,
    traumaCenter: "true",
    createdAt: new Date(),
  },
  {
    id: "hosp-2",
    name: "Safdarjung Hospital",
    lat: 28.5921,
    lng: 77.2066,
    address: "Ring Road, New Delhi",
    phone: "+91-11-26165060",
    capacity: 80,
    availableBeds: 30,
    traumaCenter: "true",
    createdAt: new Date(),
  },
  {
    id: "hosp-3",
    name: "Max Super Specialty Hospital",
    lat: 28.6428,
    lng: 77.2234,
    address: "Saket, New Delhi",
    phone: "+91-11-26515151",
    capacity: 120,
    availableBeds: 60,
    traumaCenter: "true",
    createdAt: new Date(),
  },
  {
    id: "hosp-4",
    name: "Fortis Escorts Hospital",
    lat: 28.6950,
    lng: 77.2024,
    address: "Okhla, New Delhi",
    phone: "+91-11-42888888",
    capacity: 90,
    availableBeds: 35,
    traumaCenter: "false",
    createdAt: new Date(),
  },
  {
    id: "hosp-5",
    name: "Apollo Hospital",
    lat: 28.5530,
    lng: 77.2693,
    address: "Sarita Vihar, New Delhi",
    phone: "+91-11-26925858",
    capacity: 110,
    availableBeds: 50,
    traumaCenter: "true",
    createdAt: new Date(),
  },
  {
    id: "hosp-6",
    name: "BLK Super Specialty Hospital",
    lat: 28.6782,
    lng: 77.2124,
    address: "Pusa Road, New Delhi",
    phone: "+91-11-30403040",
    capacity: 95,
    availableBeds: 40,
    traumaCenter: "true",
    createdAt: new Date(),
  },
];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ambulances, setAmbulances] = useState<Ambulance[]>(mockAmbulances);
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [junctions, setJunctions] = useState<TrafficJunction[]>(mockJunctions);
  const [hospitals] = useState<Hospital[]>(mockHospitals);

  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    role: UserRole;
  } | null>(null);

  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1);

  // Set user role
  const setRole = useCallback((role: UserRole) => {
    setCurrentUser({
      id: `user-${role}`,
      name: `${role.charAt(0).toUpperCase() + role.slice(1)} User`,
      role,
    });
  }, []);

  // Toggle simulation
  const toggleSimulation = useCallback(() => {
    setIsSimulationRunning((prev) => !prev);
  }, []);

  // Update ambulance location
  const updateAmbulanceLocation = useCallback(
    (id: string, lat: number, lng: number) => {
      setAmbulances((prev) =>
        prev.map((amb) => {
          if (amb.id === id && amb.lat && amb.lng) {
            const currentLat = typeof amb.lat === 'string' ? parseFloat(amb.lat) : amb.lat;
            const currentLng = typeof amb.lng === 'string' ? parseFloat(amb.lng) : amb.lng;
            const heading = calculateHeading(currentLat, currentLng, lat, lng);
            return {
              ...amb,
              lat,
              lng,
              heading,
              speed: amb.status === "en-route" || amb.status === "to-hospital" ? 40 : 0,
              lastUpdated: new Date(),
            };
          }
          return amb;
        })
      );
    },
    []
  );

  // Create emergency
  const createEmergency = useCallback((data: Partial<Emergency>) => {
    // Find nearest hospital for the emergency
    const pickupLat = data.pickupLat || 28.6139;
    const pickupLng = data.pickupLng || 77.2090;
    
    let nearestHospital = hospitals[0];
    let minDistance = Infinity;
    
    for (const hospital of hospitals) {
      const distance = calculateDistance(pickupLat, pickupLng, hospital.lat, hospital.lng);
      if (distance < minDistance) {
        minDistance = distance;
        nearestHospital = hospital;
      }
    }

    const emergency: Emergency = {
      id: `emg-${Date.now()}`,
      userId: "user-patient",
      patientName: data.patientName || "Unknown Patient",
      type: data.type || "other",
      pickupLat,
      pickupLng,
      hospitalLat: nearestHospital.lat,
      hospitalLng: nearestHospital.lng,
      destinationHospitalId: nearestHospital.id,
      status: "pending",
      createdAt: new Date(),
    };
    setEmergencies((prev) => [...prev, emergency]);
  }, [hospitals]);

  // Update emergency status
  const updateEmergencyStatus = useCallback(
    (id: string, status: EmergencyStatus) => {
      setEmergencies((prev) =>
        prev.map((emg) =>
          emg.id === id
            ? {
                ...emg,
                status,
                ...(status === "completed" ? { completedAt: new Date() } : {}),
              }
            : emg
        )
      );
    },
    []
  );

  // Assign ambulance to emergency
  const assignAmbulance = useCallback(
    (emergencyId: string, ambulanceId: string) => {
      setEmergencies((prev) =>
        prev.map((emg) =>
          emg.id === emergencyId
            ? { ...emg, assignedAmbulanceId: ambulanceId, status: "dispatched", dispatchedAt: new Date() }
            : emg
        )
      );

      setAmbulances((prev) =>
        prev.map((amb) =>
          amb.id === ambulanceId ? { ...amb, status: "en-route" } : amb
        )
      );
    },
    []
  );

  // Update junction status
  const updateJunctionStatus = useCallback(
    (id: string, status: JunctionStatus) => {
      setJunctions((prev) =>
        prev.map((jct) =>
          jct.id === id
            ? { ...jct, status, lastUpdated: new Date() }
            : jct
        )
      );
    },
    []
  );

  // Simulation effect - move ambulances and handle green corridor preemption
  useEffect(() => {
    if (!isSimulationRunning) return;

    const interval = setInterval(() => {
      setAmbulances((prev) =>
        prev.map((amb) => {
          if ((amb.status === "en-route" || amb.status === "to-hospital") && amb.lat && amb.lng) {
            // Find the assigned emergency to get route
            const assignedEmergency = emergencies.find(e => e.assignedAmbulanceId === amb.id);
            
            if (assignedEmergency) {
              const currentLat = typeof amb.lat === 'string' ? parseFloat(amb.lat) : amb.lat;
              const currentLng = typeof amb.lng === 'string' ? parseFloat(amb.lng) : amb.lng;
              
              // Determine destination based on emergency status
              let destLat: number, destLng: number;
              if (amb.status === "en-route") {
                // Going to pickup location
                destLat = assignedEmergency.pickupLat;
                destLng = assignedEmergency.pickupLng;
              } else {
                // Going to hospital
                destLat = assignedEmergency.hospitalLat || 28.6139;
                destLng = assignedEmergency.hospitalLng || 77.2090;
              }
              
              // Calculate heading towards destination
              const heading = calculateHeading(currentLat, currentLng, destLat, destLng);
              const moveDistance = 0.001 * simulationSpeed; // ~100 meters
              const headingRad = (heading * Math.PI) / 180;

              const newLat = currentLat + Math.cos(headingRad) * moveDistance;
              const newLng = currentLng + Math.sin(headingRad) * moveDistance;
              
              // Check if reached destination
              const distanceToDest = calculateDistance(newLat, newLng, destLat, destLng);
              let newStatus = amb.status;
              
              if (distanceToDest < 50) { // Within 50 meters
                if (amb.status === "en-route") {
                  newStatus = "to-hospital"; // Reached pickup, now go to hospital
                } else if (amb.status === "to-hospital") {
                  // Update emergency status to completed and make ambulance available
                  updateEmergencyStatus(assignedEmergency.id, "completed");
                  newStatus = "available"; // Reached hospital, become available
                }
              }

              return {
                ...amb,
                lat: newLat,
                lng: newLng,
                heading,
                status: newStatus,
                lastUpdated: new Date(),
              };
            }
          }
          return amb;
        })
      );

      // Green corridor preemption logic
      setJunctions((prevJunctions) =>
        prevJunctions.map((junction) => {
          let newStatus = junction.status;
          
          // Check for nearby ambulances
          const nearbyAmbulance = ambulances.find((amb) => {
            if (!amb.lat || !amb.lng || (amb.status !== "en-route" && amb.status !== "to-hospital")) {
              return false;
            }
            
            const ambLat = typeof amb.lat === 'string' ? parseFloat(amb.lat) : amb.lat;
            const ambLng = typeof amb.lng === 'string' ? parseFloat(amb.lng) : amb.lng;
            const juncLat = typeof junction.lat === 'string' ? parseFloat(junction.lat) : junction.lat;
            const juncLng = typeof junction.lng === 'string' ? parseFloat(junction.lng) : junction.lng;
            
            const distance = calculateDistance(ambLat, ambLng, juncLat, juncLng);
            return distance < 500; // Within 500m
          });

          if (nearbyAmbulance) {
            const ambLat = typeof nearbyAmbulance.lat === 'string' ? parseFloat(nearbyAmbulance.lat) : nearbyAmbulance.lat;
            const ambLng = typeof nearbyAmbulance.lng === 'string' ? parseFloat(nearbyAmbulance.lng) : nearbyAmbulance.lng;
            const juncLat = typeof junction.lat === 'string' ? parseFloat(junction.lat) : junction.lat;
            const juncLng = typeof junction.lng === 'string' ? parseFloat(junction.lng) : junction.lng;
            
            if (ambLat && ambLng && juncLat && juncLng) {
              const distance = calculateDistance(ambLat, ambLng, juncLat, juncLng);
              const heading = calculateHeading(juncLat, juncLng, ambLat, ambLng);
              const direction = headingToDirection(heading);
              
              if (distance < 200) {
                newStatus = "preempted";
                // Set green signal for ambulance direction
                return {
                  ...junction,
                  status: newStatus,
                  signalMode: "emergency-preemption",
                  northState: direction === "north" ? "green" : "red",
                  southState: direction === "south" ? "green" : "red",
                  eastState: direction === "east" ? "green" : "red",
                  westState: direction === "west" ? "green" : "red",
                  lastUpdated: new Date(),
                };
              } else if (distance < 500) {
                newStatus = "preparing";
              }
            }
          } else if (junction.status !== "normal") {
            newStatus = "restored";
            // Restore normal signal pattern
            return {
              ...junction,
              status: newStatus,
              signalMode: "normal",
              northState: "red",
              southState: "green",
              eastState: "red",
              westState: "red",
              lastUpdated: new Date(),
            };
          }

          return {
            ...junction,
            status: newStatus,
            lastUpdated: new Date(),
          };
        })
      );
    }, 1000 / simulationSpeed);

    return () => clearInterval(interval);
  }, [isSimulationRunning, simulationSpeed, ambulances]);

  const value: AppState = {
    ambulances,
    emergencies,
    junctions,
    hospitals,
    currentUser,
    isSimulationRunning,
    simulationSpeed,
    setRole,
    toggleSimulation,
    setSimulationSpeed,
    updateAmbulanceLocation,
    createEmergency,
    updateEmergencyStatus,
    assignAmbulance,
    updateJunctionStatus,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
