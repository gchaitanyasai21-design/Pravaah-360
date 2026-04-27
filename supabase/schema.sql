-- PRAVAH + LifeLane - Supabase Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ambulances Table
CREATE TABLE IF NOT EXISTS ambulances (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  vehicle_number VARCHAR(50) NOT NULL,
  driver_id VARCHAR(50) NOT NULL,
  driver_name VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'en-route', 'to-hospital', 'busy', 'offline')),
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  heading DECIMAL(5, 2),
  speed DECIMAL(5, 2),
  hospital_id UUID REFERENCES hospitals(id),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Emergencies Table
CREATE TABLE IF NOT EXISTS emergencies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  patient_name VARCHAR(100) NOT NULL,
  patient_phone VARCHAR(20),
  type VARCHAR(20) NOT NULL CHECK (type IN ('cardiac', 'accident', 'breathing', 'maternity', 'fire', 'other')),
  description TEXT,
  pickup_lat DECIMAL(10, 8) NOT NULL,
  pickup_lng DECIMAL(11, 8) NOT NULL,
  hospital_lat DECIMAL(10, 8),
  hospital_lng DECIMAL(11, 8),
  destination_hospital_id UUID REFERENCES hospitals(id),
  status VARCHAR(25) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'dispatched', 'arrived', 'en-route-to-hospital', 'completed')),
  assigned_ambulance_id UUID REFERENCES ambulances(id),
  dispatched_at TIMESTAMP WITH TIME ZONE,
  arrived_at_pickup_at TIMESTAMP WITH TIME ZONE,
  arrived_at_hospital_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hospitals Table
CREATE TABLE IF NOT EXISTS hospitals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  address TEXT NOT NULL,
  phone VARCHAR(20) NOT NULL,
  capacity INTEGER,
  available_beds INTEGER,
  trauma_center VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Traffic Junctions Table
CREATE TABLE IF NOT EXISTS traffic_junctions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (status IN ('normal', 'preparing', 'preempted', 'restored')),
  active_ambulance_id UUID REFERENCES ambulances(id),
  signal_mode VARCHAR(25) NOT NULL DEFAULT 'normal' CHECK (signal_mode IN ('normal', 'emergency-preemption', 'traffic-optimization', 'manual')),
  north_state VARCHAR(10) NOT NULL DEFAULT 'red' CHECK (north_state IN ('green', 'yellow', 'red')),
  south_state VARCHAR(10) NOT NULL DEFAULT 'red' CHECK (south_state IN ('green', 'yellow', 'red')),
  east_state VARCHAR(10) NOT NULL DEFAULT 'red' CHECK (east_state IN ('green', 'yellow', 'red')),
  west_state VARCHAR(10) NOT NULL DEFAULT 'red' CHECK (west_state IN ('green', 'yellow', 'red')),
  traffic_density DECIMAL(5, 2) DEFAULT 0,
  average_wait_time DECIMAL(5, 2) DEFAULT 0,
  vehicles_per_minute DECIMAL(5, 2) DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ambulances_status ON ambulances(status);
CREATE INDEX IF NOT EXISTS idx_ambulances_location ON ambulances(lat, lng);
CREATE INDEX IF NOT EXISTS idx_emergencies_status ON emergencies(status);
CREATE INDEX IF NOT EXISTS idx_emergencies_location ON emergencies(pickup_lat, pickup_lng);
CREATE INDEX IF NOT EXISTS idx_hospitals_location ON hospitals(lat, lng);
CREATE INDEX IF NOT EXISTS idx_junctions_status ON traffic_junctions(status);
CREATE INDEX IF NOT EXISTS idx_junctions_location ON traffic_junctions(lat, lng);

-- Insert sample data for Delhi
INSERT INTO hospitals (name, lat, lng, address, phone, capacity, available_beds, trauma_center) VALUES
('AIIMS Delhi', 28.6139, 77.2090, 'Ansari Nagar, New Delhi', '+91-11-26588500', 1000, 150, 'Level 1'),
('Safdarjung Hospital', 28.5616, 77.2101, 'Safdarjung Enclave, New Delhi', '+91-11-26101234', 800, 120, 'Level 2'),
('LNJP Hospital', 28.6398, 77.2155, 'LNJP Marg, New Delhi', '+91-11-23366555', 1200, 200, 'Level 1'),
('GTB Hospital', 28.6692, 77.2739, 'Dilshad Garden, Delhi', '+91-11-22093300', 900, 180, 'Level 2');

INSERT INTO traffic_junctions (name, lat, lng, signal_mode, north_state, south_state, east_state, west_state) VALUES
('India Gate Circle', 28.6129, 77.2295, 'normal', 'green', 'red', 'yellow', 'red'),
('Connaught Place', 28.6308, 77.2167, 'normal', 'red', 'green', 'red', 'yellow'),
('AIIMS Crossing', 28.6139, 77.2090, 'normal', 'yellow', 'red', 'green', 'red'),
('Dhaula Kuan', 28.6094, 77.1699, 'normal', 'red', 'yellow', 'red', 'green');

INSERT INTO ambulances (vehicle_number, driver_id, driver_name, status, lat, lng, heading, speed) VALUES
('DL-01-AB-1234', 'driver001', 'Rajesh Kumar', 'available', 28.6139, 77.2090, 0, 0),
('DL-02-CD-5678', 'driver002', 'Amit Sharma', 'available', 28.5616, 77.2101, 90, 0),
('DL-03-EF-9012', 'driver003', 'Vikram Singh', 'en-route', 28.6308, 77.2167, 45, 25),
('DL-04-GH-3456', 'driver004', 'Sanjay Patel', 'to-hospital', 28.6398, 77.2155, 180, 35);
