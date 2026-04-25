// PRAVAH + LifeLane - Database Access Layer
// Type-safe database queries using Drizzle ORM

import { db } from "./index";
import {
  users,
  ambulances,
  hospitals,
  emergencies,
  trafficJunctions,
  preemptionLogs,
  trafficFlowData,
  alerts,
  type User,
  type Ambulance,
  type Hospital,
  type Emergency,
  type TrafficJunction,
  type PreemptionLog,
  type Alert,
} from "./schema";
import { eq, and, desc, lt, gt, sql, inArray } from "drizzle-orm";

// ============== USER OPERATIONS ==============
export async function getUserById(id: string): Promise<User | null> {
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0] || null;
}

export async function getUserByPhone(phone: string): Promise<User | null> {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.phone, phone))
    .limit(1);
  return result[0] || null;
}

export async function createUser(data: {
  name: string;
  phone: string;
  email?: string;
  role: User["role"];
}): Promise<User> {
  const result = await db.insert(users).values(data).returning();
  return result[0];
}

export async function getUsersByRole(role: User["role"]): Promise<User[]> {
  return db.select().from(users).where(eq(users.role, role));
}

// ============== AMBULANCE OPERATIONS ==============
export async function getAmbulanceById(id: string): Promise<Ambulance | null> {
  const result = await db
    .select()
    .from(ambulances)
    .where(eq(ambulances.id, id))
    .limit(1);
  return result[0] || null;
}

export async function getAllAmbulances(): Promise<Ambulance[]> {
  return db.select().from(ambulances).orderBy(desc(ambulances.lastUpdated));
}

export async function getAvailableAmbulances(): Promise<Ambulance[]> {
  return db
    .select()
    .from(ambulances)
    .where(eq(ambulances.status, "available"));
}

export async function updateAmbulanceLocation(data: {
  id: string;
  lat: number;
  lng: number;
  heading?: number;
  speed?: number;
}): Promise<Ambulance | null> {
  const result = await db
    .update(ambulances)
    .set({
      lat: data.lat.toString(),
      lng: data.lng.toString(),
      heading: data.heading?.toString(),
      speed: data.speed?.toString(),
      lastUpdated: new Date(),
    })
    .where(eq(ambulances.id, data.id))
    .returning();
  return result[0] || null;
}

export async function updateAmbulanceStatus(
  id: string,
  status: Ambulance["status"]
): Promise<Ambulance | null> {
  const result = await db
    .update(ambulances)
    .set({ status, lastUpdated: new Date() })
    .where(eq(ambulances.id, id))
    .returning();
  return result[0] || null;
}

export async function findNearestAmbulance(
  lat: number,
  lng: number
): Promise<Ambulance | null> {
  // Find available ambulances and calculate distance
  const available = await getAvailableAmbulances();

  if (available.length === 0) return null;

  let nearest: Ambulance = available[0];
  let minDistance = Infinity;

  for (const ambulance of available) {
    if (!ambulance.lat || !ambulance.lng) continue;

    const distance = calculateDistance(
      parseFloat(ambulance.lat),
      parseFloat(ambulance.lng),
      lat,
      lng
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearest = ambulance;
    }
  }

  return nearest;
}

function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ============== HOSPITAL OPERATIONS ==============
export async function getHospitalById(id: string): Promise<Hospital | null> {
  const result = await db
    .select()
    .from(hospitals)
    .where(eq(hospitals.id, id))
    .limit(1);
  return result[0] || null;
}

export async function getAllHospitals(): Promise<Hospital[]> {
  return db.select().from(hospitals);
}

export async function findNearestHospital(
  lat: number,
  lng: number
): Promise<Hospital | null> {
  const hospitals_list = await getAllHospitals();

  if (hospitals_list.length === 0) return null;

  let nearest: Hospital = hospitals_list[0];
  let minDistance = Infinity;

  for (const hospital of hospitals_list) {
    const distance = calculateDistance(
      parseFloat(hospital.lat),
      parseFloat(hospital.lng),
      lat,
      lng
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearest = hospital;
    }
  }

  return nearest;
}

// ============== EMERGENCY OPERATIONS ==============
export async function getEmergencyById(
  id: string
): Promise<Emergency | null> {
  const result = await db
    .select()
    .from(emergencies)
    .where(eq(emergencies.id, id))
    .limit(1);
  return result[0] || null;
}

export async function getActiveEmergencies(): Promise<Emergency[]> {
  return db
    .select()
    .from(emergencies)
    .where(
      inArray(emergencies.status, [
        "pending",
        "dispatched",
        "arrived",
        "en-route-to-hospital",
      ])
    )
    .orderBy(desc(emergencies.createdAt));
}

export async function createEmergency(data: {
  userId: string;
  patientName: string;
  patientPhone?: string;
  type: Emergency["type"];
  description?: string;
  pickupLat: number;
  pickupLng: number;
  hospitalLat?: number;
  hospitalLng?: number;
  destinationHospitalId?: string;
}): Promise<Emergency> {
  const result = await db
    .insert(emergencies)
    .values({
      userId: data.userId,
      patientName: data.patientName,
      patientPhone: data.patientPhone,
      type: data.type,
      description: data.description,
      pickupLat: data.pickupLat.toString(),
      pickupLng: data.pickupLng.toString(),
      hospitalLat: data.hospitalLat?.toString(),
      hospitalLng: data.hospitalLng?.toString(),
      destinationHospitalId: data.destinationHospitalId,
      status: "pending",
    })
    .returning();
  return result[0];
}

export async function updateEmergencyStatus(
  id: string,
  status: Emergency["status"],
  additionalData?: {
    assignedAmbulanceId?: string;
    dispatchedAt?: Date;
    arrivedAtPickupAt?: Date;
    arrivedAtHospitalAt?: Date;
    completedAt?: Date;
  }
): Promise<Emergency | null> {
  const result = await db
    .update(emergencies)
    .set({
      status,
      ...additionalData,
    })
    .where(eq(emergencies.id, id))
    .returning();
  return result[0] || null;
}

export async function assignAmbulanceToEmergency(
  emergencyId: string,
  ambulanceId: string
): Promise<Emergency | null> {
  return updateEmergencyStatus(emergencyId, "dispatched", {
    assignedAmbulanceId: ambulanceId,
    dispatchedAt: new Date(),
  });
}

// ============== TRAFFIC JUNCTION OPERATIONS ==============
export async function getJunctionById(
  id: string
): Promise<TrafficJunction | null> {
  const result = await db
    .select()
    .from(trafficJunctions)
    .where(eq(trafficJunctions.id, id))
    .limit(1);
  return result[0] || null;
}

export async function getAllJunctions(): Promise<TrafficJunction[]> {
  return db.select().from(trafficJunctions);
}

export async function getJunctionsNearLocation(
  lat: number,
  lng: number,
  radiusMeters: number = 500
): Promise<TrafficJunction[]> {
  const allJunctions = await getAllJunctions();

  return allJunctions.filter((junction) => {
    const distance = calculateDistance(
      parseFloat(junction.lat),
      parseFloat(junction.lng),
      lat,
      lng
    );
    return distance <= radiusMeters;
  });
}

export async function updateJunctionStatus(
  id: string,
  status: TrafficJunction["status"],
  additionalData?: {
    activeAmbulanceId?: string | null;
    signalMode?: TrafficJunction["signalMode"];
  }
): Promise<TrafficJunction | null> {
  const result = await db
    .update(trafficJunctions)
    .set({
      status,
      lastUpdated: new Date(),
      ...additionalData,
    })
    .where(eq(trafficJunctions.id, id))
    .returning();
  return result[0] || null;
}

export async function updateJunctionSignals(
  id: string,
  signals: {
    northState?: TrafficJunction["northState"];
    southState?: TrafficJunction["southState"];
    eastState?: TrafficJunction["eastState"];
    westState?: TrafficJunction["westState"];
  }
): Promise<TrafficJunction | null> {
  const result = await db
    .update(trafficJunctions)
    .set({
      ...signals,
      lastUpdated: new Date(),
    })
    .where(eq(trafficJunctions.id, id))
    .returning();
  return result[0] || null;
}

export async function updateJunctionMetrics(
  id: string,
  metrics: {
    trafficDensity?: number;
    averageWaitTime?: number;
    vehiclesPerMinute?: number;
  }
): Promise<TrafficJunction | null> {
  const result = await db
    .update(trafficJunctions)
    .set({
      ...metrics,
      lastUpdated: new Date(),
    })
    .where(eq(trafficJunctions.id, id))
    .returning();
  return result[0] || null;
}

// ============== PREEMPTION LOG OPERATIONS ==============
export async function createPreemptionLog(data: {
  junctionId: string;
  ambulanceId: string;
  emergencyId: string;
  startTime: Date;
  reason?: string;
}): Promise<PreemptionLog> {
  const result = await db.insert(preemptionLogs).values(data).returning();
  return result[0];
}

export async function completePreemptionLog(
  id: string,
  endTime: Date
): Promise<PreemptionLog | null> {
  const startTime = await db
    .select()
    .from(preemptionLogs)
    .where(eq(preemptionLogs.id, id))
    .limit(1);

  if (startTime.length === 0) return null;

  const duration = Math.floor(
    (endTime.getTime() - startTime[0].startTime.getTime()) / 1000
  );

  const result = await db
    .update(preemptionLogs)
    .set({ endTime, duration })
    .where(eq(preemptionLogs.id, id))
    .returning();

  return result[0] || null;
}

export async function getPreemptionLogs(
  junctionId?: string,
  ambulanceId?: string,
  limit: number = 100
): Promise<PreemptionLog[]> {
  if (junctionId && ambulanceId) {
    return db
      .select()
      .from(preemptionLogs)
      .where(
        and(
          eq(preemptionLogs.junctionId, junctionId),
          eq(preemptionLogs.ambulanceId, ambulanceId)
        )
      )
      .orderBy(desc(preemptionLogs.startTime))
      .limit(limit);
  }

  if (junctionId) {
    return db
      .select()
      .from(preemptionLogs)
      .where(eq(preemptionLogs.junctionId, junctionId))
      .orderBy(desc(preemptionLogs.startTime))
      .limit(limit);
  }

  if (ambulanceId) {
    return db
      .select()
      .from(preemptionLogs)
      .where(eq(preemptionLogs.ambulanceId, ambulanceId))
      .orderBy(desc(preemptionLogs.startTime))
      .limit(limit);
  }

  return db
    .select()
    .from(preemptionLogs)
    .orderBy(desc(preemptionLogs.startTime))
    .limit(limit);
}

// ============== TRAFFIC FLOW DATA OPERATIONS ==============
export async function recordTrafficFlow(data: {
  junctionId: string;
  northBoundFlow?: number;
  southBoundFlow?: number;
  eastBoundFlow?: number;
  westBoundFlow?: number;
  averageSpeed?: number;
  congestionLevel?: number;
}): Promise<void> {
  await db.insert(trafficFlowData).values({
    junctionId: data.junctionId,
    northBoundFlow: data.northBoundFlow || 0,
    southBoundFlow: data.southBoundFlow || 0,
    eastBoundFlow: data.eastBoundFlow || 0,
    westBoundFlow: data.westBoundFlow || 0,
    averageSpeed: data.averageSpeed?.toString(),
    congestionLevel: data.congestionLevel || 0,
  });
}

export async function getRecentTrafficFlow(
  junctionId: string,
  limit: number = 60
): Promise<any[]> {
  return db
    .select()
    .from(trafficFlowData)
    .where(eq(trafficFlowData.junctionId, junctionId))
    .orderBy(desc(trafficFlowData.timestamp))
    .limit(limit);
}

// ============== ALERT OPERATIONS ==============
export async function createAlert(data: {
  type: Alert["type"];
  severity: Alert["severity"];
  title: string;
  message: string;
  junctionId?: string;
  ambulanceId?: string;
  emergencyId?: string;
}): Promise<Alert> {
  const result = await db.insert(alerts).values(data).returning();
  return result[0];
}

export async function getActiveAlerts(): Promise<Alert[]> {
  return db
    .select()
    .from(alerts)
    .where(eq(alerts.resolved, "false"))
    .orderBy(desc(alerts.createdAt));
}

export async function acknowledgeAlert(
  id: string,
  userId: string
): Promise<Alert | null> {
  const result = await db
    .update(alerts)
    .set({
      acknowledged: "true",
      acknowledgedBy: userId,
      acknowledgedAt: new Date(),
    })
    .where(eq(alerts.id, id))
    .returning();
  return result[0] || null;
}

export async function resolveAlert(id: string): Promise<Alert | null> {
  const result = await db
    .update(alerts)
    .set({ resolved: "true", resolvedAt: new Date() })
    .where(eq(alerts.id, id))
    .returning();
  return result[0] || null;
}

// ============== DASHBOARD METRICS ==============
export async function getDashboardMetrics(): Promise<{
  totalAmbulances: number;
  availableAmbulances: number;
  activeEmergencies: number;
  totalJunctions: number;
  preemptedJunctions: number;
  activeAlerts: number;
}> {
  const totalAmbulances = await db.$count(ambulances);
  const availableAmbulances = await db
    .$count(ambulances, eq(ambulances.status, "available"));
  const activeEmergencies = await db.$count(
    emergencies,
    inArray(emergencies.status, [
      "pending",
      "dispatched",
      "arrived",
      "en-route-to-hospital",
    ])
  );
  const totalJunctions = await db.$count(trafficJunctions);
  const preemptedJunctions = await db.$count(
    trafficJunctions,
    eq(trafficJunctions.status, "preempted")
  );
  const activeAlerts = await db.$count(alerts, eq(alerts.resolved, "false"));

  return {
    totalAmbulances,
    availableAmbulances,
    activeEmergencies,
    totalJunctions,
    preemptedJunctions,
    activeAlerts,
  };
}
