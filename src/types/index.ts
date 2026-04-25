// PRAVAH + LifeLane - TypeScript Type Definitions
// Merged Traffic Management & Emergency Response System

// ============== USER TYPES ==============
export type UserRole = "patient" | "driver" | "dispatch" | "traffic" | "admin";

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// ============== EMERGENCY TYPES ==============
export type EmergencyType =
  | "cardiac"
  | "accident"
  | "breathing"
  | "maternity"
  | "fire"
  | "other";

export type EmergencyStatus =
  | "pending"
  | "dispatched"
  | "arrived"
  | "en-route-to-hospital"
  | "completed";

export interface Emergency {
  id: string;
  userId: string;
  patientName: string;
  patientPhone?: string;
  type: EmergencyType;
  description?: string;
  pickupLat: number;
  pickupLng: number;
  hospitalLat?: number;
  hospitalLng?: number;
  destinationHospitalId?: string;
  status: EmergencyStatus;
  assignedAmbulanceId?: string;
  dispatchedAt?: Date;
  arrivedAtPickupAt?: Date;
  arrivedAtHospitalAt?: Date;
  completedAt?: Date;
  createdAt: Date;
}

// ============== AMBULANCE TYPES ==============
export type AmbulanceStatus =
  | "available"
  | "en-route"
  | "to-hospital"
  | "busy"
  | "offline";

export interface Ambulance {
  id: string;
  vehicleNumber: string;
  driverId: string;
  driverName: string;
  status: AmbulanceStatus;
  lat?: number;
  lng?: number;
  heading?: number;
  speed?: number;
  hospitalId?: string;
  lastUpdated: Date;
  createdAt: Date;
}

export interface AmbulanceLocationUpdate {
  id: string;
  lat: number;
  lng: number;
  heading: number;
  speed: number;
  timestamp: Date;
}

// ============== HOSPITAL TYPES ==============
export interface Hospital {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  phone: string;
  capacity?: number;
  availableBeds?: number;
  traumaCenter?: string;
  createdAt: Date;
}

// ============== TRAFFIC JUNCTION TYPES ==============
export type JunctionStatus = "normal" | "preparing" | "preempted" | "restored";
export type TrafficLightState = "green" | "yellow" | "red";
export type SignalMode =
  | "normal"
  | "emergency-preemption"
  | "traffic-optimization"
  | "manual";
export type Direction = "north" | "south" | "east" | "west";

export interface TrafficJunction {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: JunctionStatus;
  activeAmbulanceId?: string;
  signalMode: SignalMode;
  northState: TrafficLightState;
  southState: TrafficLightState;
  eastState: TrafficLightState;
  westState: TrafficLightState;
  trafficDensity: number;
  averageWaitTime: number;
  vehiclesPerMinute: number;
  lastUpdated: Date;
  createdAt: Date;
}

export interface JunctionSignalState {
  junctionId: string;
  north: TrafficLightState;
  south: TrafficLightState;
  east: TrafficLightState;
  west: TrafficLightState;
}

// ============== PREEMPTION TYPES ==============
export interface PreemptionLog {
  id: string;
  junctionId: string;
  ambulanceId: string;
  emergencyId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  reason?: string;
  createdAt: Date;
}

export interface PreemptionZone {
  zone: 1 | 2 | 3;
  distance: number;
  action: "preparing" | "preempted" | "restored";
}

// ============== TRAFFIC FLOW TYPES ==============
export interface TrafficFlowData {
  id: string;
  junctionId: string;
  timestamp: Date;
  northBoundFlow: number;
  southBoundFlow: number;
  eastBoundFlow: number;
  westBoundFlow: number;
  averageSpeed?: number;
  congestionLevel: number;
}

export interface TrafficFlowPrediction {
  junctionId: string;
  timestamp: Date;
  predictedFlow: number;
  predictedWaitTime: number;
  confidence: number;
}

// ============== SIGNAL CYCLE TYPES ==============
export interface TrafficSignalCycle {
  id: string;
  junctionId: string;
  cycleNumber: number;
  northGreenDuration: number;
  southGreenDuration: number;
  eastGreenDuration: number;
  westGreenDuration: number;
  totalCycleTime: number;
  optimizationScore?: number;
  createdAt: Date;
}

export interface SignalTimingOptimization {
  junctionId: string;
  recommendedDurations: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  expectedImprovement: number;
  algorithm: "rl" | "heuristic" | "ml";
}

// ============== VEHICLE DETECTION TYPES ==============
export type VehicleType = "car" | "bus" | "truck" | "bike" | "emergency";

export interface VehicleDetection {
  id: string;
  junctionId: string;
  direction: Direction;
  vehicleType: VehicleType;
  detectedAt: Date;
  confidence: number;
  imageData?: string;
}

export interface EmergencyVehicleDetection {
  junctionId: string;
  vehicleType: "ambulance" | "fire-truck" | "police";
  direction: Direction;
  distance: number;
  heading: number;
  confidence: number;
  timestamp: Date;
}

// ============== SYSTEM METRICS TYPES ==============
export interface SystemMetric {
  id: string;
  metricName: string;
  metricValue: number;
  unit: string;
  junctionId?: string;
  ambulanceId?: string;
  timestamp: Date;
  metadata?: string;
}

export interface DashboardMetrics {
  totalAmbulances: number;
  availableAmbulances: number;
  activeEmergencies: number;
  averageResponseTime: number;
  totalPreemptions: number;
  junctionsWithCongestion: number;
  systemHealth: "healthy" | "degraded" | "critical";
}

// ============== ALERT TYPES ==============
export type AlertType = "emergency" | "traffic" | "system" | "weather";
export type AlertSeverity = "low" | "medium" | "high" | "critical";

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  junctionId?: string;
  ambulanceId?: string;
  emergencyId?: string;
  acknowledged: string;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolved: string;
  resolvedAt?: Date;
  createdAt: Date;
}

// ============== GEOLOCATION TYPES ==============
export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface GeoBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface Route {
  start: GeoLocation;
  end: GeoLocation;
  waypoints: GeoLocation[];
  distance: number; // meters
  duration: number; // seconds
  junctions: string[]; // junction IDs along route
}

// ============== SOCKET.IO EVENT TYPES ==============
// Define bidirectional events for Socket.IO
export interface SocketIOEvents {
  // Ambulance events
  "ambulance:location_update": (data: AmbulanceLocationUpdate) => void;
  "ambulance:status_change": (data: {
    id: string;
    status: AmbulanceStatus;
  }) => void;
  "ambulance:send_location": (data: {
    id: string;
    lat: number;
    lng: number;
    heading?: number;
    speed?: number;
  }) => void;
  "ambulance:status_update": (data: {
    id: string;
    status: AmbulanceStatus;
  }) => void;

  // Emergency events
  "emergency:new_request": (data: Emergency) => void;
  "emergency:assigned": (data: {
    emergencyId: string;
    ambulanceId: string;
  }) => void;
  "emergency:status_update": (data: {
    emergencyId: string;
    status: EmergencyStatus;
  }) => void;
  "emergency:completed": (data: { emergencyId: string }) => void;
  "emergency:request_sos": (data: {
    userId: string;
    type: EmergencyType;
    lat: number;
    lng: number;
    patientName: string;
    patientPhone?: string;
    description?: string;
  }) => void;
  "emergency:accept": (data: {
    emergencyId: string;
    ambulanceId: string;
  }) => void;
  "emergency:reject": (data: {
    emergencyId: string;
    ambulanceId: string;
    reason: string;
  }) => void;
  "emergency:complete": (data: { emergencyId: string }) => void;

  // Signal/Junction events
  "signal:prewarning": (data: {
    junctionId: string;
    ambulanceId: string;
    distance: number;
  }) => void;
  "signal:green_activated": (data: {
    junctionId: string;
    ambulanceId: string;
    direction: Direction;
  }) => void;
  "signal:restored": (data: {
    junctionId: string;
    duration: number;
  }) => void;
  "junction:status_update": (data: TrafficJunction) => void;
  "junction:override": (data: {
    junctionId: string;
    state: JunctionSignalState;
  }) => void;
  "junction:set_mode": (data: {
    junctionId: string;
    mode: SignalMode;
  }) => void;

  // Traffic events
  "traffic:flow_update": (data: TrafficFlowData) => void;
  "traffic:prediction": (data: TrafficFlowPrediction) => void;
  "traffic:signal_optimized": (data: SignalTimingOptimization) => void;

  // Vehicle detection
  "vehicle:detected": (data: VehicleDetection) => void;
  "vehicle:emergency_detected": (data: EmergencyVehicleDetection) => void;

  // System events
  "system:metric_update": (data: SystemMetric) => void;
  "alert:new": (data: Alert) => void;
  "alert:acknowledged": (data: { alertId: string }) => void;

  // Subscription events
  "subscribe:ambulances": () => void;
  "subscribe:emergencies": () => void;
  "subscribe:junctions": () => void;
  "subscribe:alerts": () => void;
}

// ============== API RESPONSE TYPES ==============
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============== DISPATCH ALGORITHM TYPES ==============
export interface DispatchCandidate {
  ambulanceId: string;
  distance: number; // meters
  eta: number; // seconds
  currentStatus: AmbulanceStatus;
}

export interface DispatchResult {
  emergencyId: string;
  assignedAmbulanceId: string;
  distance: number;
  eta: number;
  route: Route;
  timestamp: Date;
}

// ============== GREEN CORRIDOR TYPES ==============
export interface GreenCorridor {
  emergencyId: string;
  ambulanceId: string;
  route: string[]; // junction IDs
  activeJunctions: string[]; // currently preempted
  createdAt: Date;
  expiresAt?: Date;
}

export interface CorridorStatus {
  corridorId: string;
  progress: number; // 0-100
  currentJunction?: string;
  nextJunction?: string;
  etaToDestination: number;
}

// ============== UI COMPONENT TYPES ==============
export interface MapMarker {
  id: string;
  type: "ambulance" | "emergency" | "hospital" | "junction";
  lat: number;
  lng: number;
  status?: string;
  metadata?: Record<string, unknown>;
}

export interface DashboardCard {
  id: string;
  title: string;
  value: string | number;
  change?: number;
  trend?: "up" | "down" | "stable";
  icon: string;
}

// ============== SIMULATION TYPES ==============
export interface SimulationConfig {
  enableAmbulanceSimulation: boolean;
  enableTrafficSimulation: boolean;
  ambulanceUpdateInterval: number; // ms
  trafficUpdateInterval: number; // ms
  emergencyGenerationRate: number; // per hour
}

export interface SimulationState {
  isRunning: boolean;
  startTime?: Date;
  elapsedSeconds: number;
  generatedEmergencies: number;
  completedEmergencies: number;
  averageResponseTime: number;
}
