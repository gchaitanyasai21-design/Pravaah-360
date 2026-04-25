// PRAVAH + LifeLane Merged Schema - Smart City Traffic & Emergency Response System
import {
  pgTable,
  text,
  integer,
  timestamp,
  decimal,
  uuid,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";

// ============== ENUMS ==============
export const userRoleEnum = pgEnum("user_role", [
  "patient",
  "driver",
  "dispatch",
  "traffic",
  "admin",
]);

export const emergencyTypeEnum = pgEnum("emergency_type", [
  "cardiac",
  "accident",
  "breathing",
  "maternity",
  "fire",
  "other",
]);

export const emergencyStatusEnum = pgEnum("emergency_status", [
  "pending",
  "dispatched",
  "arrived",
  "en-route-to-hospital",
  "completed",
]);

export const ambulanceStatusEnum = pgEnum("ambulance_status", [
  "available",
  "en-route",
  "to-hospital",
  "busy",
  "offline",
]);

export const junctionStatusEnum = pgEnum("junction_status", [
  "normal",
  "preparing",
  "preempted",
  "restored",
]);

export const trafficLightStateEnum = pgEnum("traffic_light_state", [
  "green",
  "yellow",
  "red",
]);

export const signalModeEnum = pgEnum("signal_mode", [
  "normal",
  "emergency-preemption",
  "traffic-optimization",
  "manual",
]);

// ============== USER MANAGEMENT ==============
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    phone: text("phone").notNull().unique(),
    email: text("email"),
    role: userRoleEnum("role").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    roleIdx: index("users_role_idx").on(table.role),
    phoneIdx: index("users_phone_idx").on(table.phone),
  })
);

// ============== AMBULANCE FLEET ==============
export const ambulances = pgTable(
  "ambulances",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    vehicleNumber: text("vehicle_number").notNull().unique(),
    driverId: uuid("driver_id")
      .notNull()
      .references(() => users.id),
    driverName: text("driver_name").notNull(),
    status: ambulanceStatusEnum("status").notNull().default("available"),
    lat: decimal("lat", { precision: 10, scale: 8 }),
    lng: decimal("lng", { precision: 11, scale: 8 }),
    heading: decimal("heading", { precision: 5, scale: 2 }),
    speed: decimal("speed", { precision: 5, scale: 2 }), // km/h
    hospitalId: uuid("hospital_id"),
    lastUpdated: timestamp("last_updated").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    statusIdx: index("ambulances_status_idx").on(table.status),
    locationIdx: index("ambulances_location_idx").on(table.lat, table.lng),
  })
);

// ============== HOSPITALS ==============
export const hospitals = pgTable(
  "hospitals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    lat: decimal("lat", { precision: 10, scale: 8 }).notNull(),
    lng: decimal("lng", { precision: 11, scale: 8 }).notNull(),
    address: text("address").notNull(),
    phone: text("phone").notNull(),
    capacity: integer("capacity"),
    availableBeds: integer("available_beds"),
    traumaCenter: text("trauma_center").default("false"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    locationIdx: index("hospitals_location_idx").on(table.lat, table.lng),
  })
);

// ============== EMERGENCY REQUESTS ==============
export const emergencies = pgTable(
  "emergencies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    patientName: text("patient_name").notNull(),
    patientPhone: text("patient_phone"),
    type: emergencyTypeEnum("type").notNull(),
    description: text("description"),
    pickupLat: decimal("pickup_lat", { precision: 10, scale: 8 }).notNull(),
    pickupLng: decimal("pickup_lng", { precision: 11, scale: 8 }).notNull(),
    hospitalLat: decimal("hospital_lat", { precision: 10, scale: 8 }),
    hospitalLng: decimal("hospital_lng", { precision: 11, scale: 8 }),
    destinationHospitalId: uuid("destination_hospital_id").references(
      () => hospitals.id
    ),
    status: emergencyStatusEnum("status").notNull().default("pending"),
    assignedAmbulanceId: uuid("assigned_ambulance_id").references(
      () => ambulances.id
    ),
    dispatchedAt: timestamp("dispatched_at"),
    arrivedAtPickupAt: timestamp("arrived_at_pickup_at"),
    arrivedAtHospitalAt: timestamp("arrived_at_hospital_at"),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    statusIdx: index("emergencies_status_idx").on(table.status),
    typeIdx: index("emergencies_type_idx").on(table.type),
    createdAtIdx: index("emergencies_created_at_idx").on(table.createdAt),
    ambulanceIdx: index("emergencies_ambulance_idx").on(
      table.assignedAmbulanceId
    ),
  })
);

// ============== TRAFFIC JUNCTIONS ==============
export const trafficJunctions = pgTable(
  "traffic_junctions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    lat: decimal("lat", { precision: 10, scale: 8 }).notNull(),
    lng: decimal("lng", { precision: 11, scale: 8 }).notNull(),
    status: junctionStatusEnum("status").notNull().default("normal"),
    activeAmbulanceId: uuid("active_ambulance_id"),
    signalMode: signalModeEnum("signal_mode").notNull().default("normal"),

    // Traffic light states for each direction
    northState: trafficLightStateEnum("north_state").notNull().default("red"),
    southState: trafficLightStateEnum("south_state").notNull().default("green"),
    eastState: trafficLightStateEnum("east_state").notNull().default("red"),
    westState: trafficLightStateEnum("west_state").notNull().default("red"),

    // Traffic metrics
    trafficDensity: integer("traffic_density").default(0), // 0-100
    averageWaitTime: integer("average_wait_time").default(0), // seconds
    vehiclesPerMinute: integer("vehicles_per_minute").default(0),

    lastUpdated: timestamp("last_updated").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    statusIdx: index("traffic_junctions_status_idx").on(table.status),
    locationIdx: index("traffic_junctions_location_idx").on(
      table.lat,
      table.lng
    ),
    signalModeIdx: index("traffic_junctions_signal_mode_idx").on(
      table.signalMode
    ),
  })
);

// ============== PREEMPTION LOGS ==============
export const preemptionLogs = pgTable(
  "preemption_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    junctionId: uuid("junction_id")
      .notNull()
      .references(() => trafficJunctions.id),
    ambulanceId: uuid("ambulance_id")
      .notNull()
      .references(() => ambulances.id),
    emergencyId: uuid("emergency_id")
      .notNull()
      .references(() => emergencies.id),
    startTime: timestamp("start_time").notNull(),
    endTime: timestamp("end_time"),
    duration: integer("duration"), // seconds
    reason: text("reason").default("emergency-response"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    junctionIdx: index("preemption_logs_junction_idx").on(table.junctionId),
    ambulanceIdx: index("preemption_logs_ambulance_idx").on(table.ambulanceId),
    emergencyIdx: index("preemption_logs_emergency_idx").on(table.emergencyId),
    startTimeIdx: index("preemption_logs_start_time_idx").on(table.startTime),
  })
);

// ============== TRAFFIC FLOW DATA (Time Series) ==============
export const trafficFlowData = pgTable(
  "traffic_flow_data",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    junctionId: uuid("junction_id")
      .notNull()
      .references(() => trafficJunctions.id),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
    northBoundFlow: integer("north_bound_flow").default(0),
    southBoundFlow: integer("south_bound_flow").default(0),
    eastBoundFlow: integer("east_bound_flow").default(0),
    westBoundFlow: integer("west_bound_flow").default(0),
    averageSpeed: decimal("average_speed", { precision: 5, scale: 2 }),
    congestionLevel: integer("congestion_level").default(0), // 0-100
  },
  (table) => ({
    junctionTimestampIdx: index("traffic_flow_junction_timestamp_idx").on(
      table.junctionId,
      table.timestamp
    ),
    timestampIdx: index("traffic_flow_timestamp_idx").on(table.timestamp),
  })
);

// ============== TRAFFIC SIGNAL CYCLES ==============
export const trafficSignalCycles = pgTable(
  "traffic_signal_cycles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    junctionId: uuid("junction_id")
      .notNull()
      .references(() => trafficJunctions.id),
    cycleNumber: integer("cycle_number").notNull(),
    northGreenDuration: integer("north_green_duration").notNull(), // seconds
    southGreenDuration: integer("south_green_duration").notNull(),
    eastGreenDuration: integer("east_green_duration").notNull(),
    westGreenDuration: integer("west_green_duration").notNull(),
    totalCycleTime: integer("total_cycle_time").notNull(),
    optimizationScore: decimal("optimization_score", {
      precision: 5,
      scale: 2,
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    junctionIdx: index("traffic_signal_cycles_junction_idx").on(
      table.junctionId
    ),
    cycleNumberIdx: index("traffic_signal_cycles_number_idx").on(
      table.cycleNumber
    ),
  })
);

// ============== VEHICLE DETECTIONS ==============
export const vehicleDetections = pgTable(
  "vehicle_detections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    junctionId: uuid("junction_id")
      .notNull()
      .references(() => trafficJunctions.id),
    direction: text("direction").notNull(), // north, south, east, west
    vehicleType: text("vehicle_type").notNull(), // car, bus, truck, bike, emergency
    detectedAt: timestamp("detected_at").defaultNow().notNull(),
    confidence: decimal("confidence", { precision: 5, scale: 4 }),
    imageData: text("image_data"), // base64 or URL
  },
  (table) => ({
    junctionIdx: index("vehicle_detections_junction_idx").on(table.junctionId),
    detectedAtIdx: index("vehicle_detections_detected_at_idx").on(
      table.detectedAt
    ),
    vehicleTypeIdx: index("vehicle_detections_type_idx").on(table.vehicleType),
  })
);

// ============== SYSTEM METRICS ==============
export const systemMetrics = pgTable(
  "system_metrics",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    metricName: text("metric_name").notNull(),
    metricValue: decimal("metric_value", { precision: 15, scale: 4 }).notNull(),
    unit: text("unit").notNull(),
    junctionId: uuid("junction_id").references(() => trafficJunctions.id),
    ambulanceId: uuid("ambulance_id").references(() => ambulances.id),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
    metadata: text("metadata"), // JSON string
  },
  (table) => ({
    metricNameIdx: index("system_metrics_name_idx").on(table.metricName),
    timestampIdx: index("system_metrics_timestamp_idx").on(table.timestamp),
  })
);

// ============== ALERTS & NOTIFICATIONS ==============
export const alerts = pgTable(
  "alerts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: text("type").notNull(), // emergency, traffic, system, weather
    severity: text("severity").notNull(), // low, medium, high, critical
    title: text("title").notNull(),
    message: text("message").notNull(),
    junctionId: uuid("junction_id").references(() => trafficJunctions.id),
    ambulanceId: uuid("ambulance_id").references(() => ambulances.id),
    emergencyId: uuid("emergency_id").references(() => emergencies.id),
    acknowledged: text("acknowledged").default("false"),
    acknowledgedBy: uuid("acknowledged_by").references(() => users.id),
    acknowledgedAt: timestamp("acknowledged_at"),
    resolved: text("resolved").default("false"),
    resolvedAt: timestamp("resolved_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    typeIdx: index("alerts_type_idx").on(table.type),
    severityIdx: index("alerts_severity_idx").on(table.severity),
    createdAtIdx: index("alerts_created_at_idx").on(table.createdAt),
    acknowledgedIdx: index("alerts_acknowledged_idx").on(table.acknowledged),
  })
);

// Export all tables for Drizzle
export const schema = {
  users,
  ambulances,
  hospitals,
  emergencies,
  trafficJunctions,
  preemptionLogs,
  trafficFlowData,
  trafficSignalCycles,
  vehicleDetections,
  systemMetrics,
  alerts,
};

// Type exports
export type User = typeof users.$inferSelect;
export type Ambulance = typeof ambulances.$inferSelect;
export type Hospital = typeof hospitals.$inferSelect;
export type Emergency = typeof emergencies.$inferSelect;
export type TrafficJunction = typeof trafficJunctions.$inferSelect;
export type PreemptionLog = typeof preemptionLogs.$inferSelect;
export type TrafficFlowData = typeof trafficFlowData.$inferSelect;
export type TrafficSignalCycle = typeof trafficSignalCycles.$inferSelect;
export type VehicleDetection = typeof vehicleDetections.$inferSelect;
export type SystemMetric = typeof systemMetrics.$inferSelect;
export type Alert = typeof alerts.$inferSelect;
