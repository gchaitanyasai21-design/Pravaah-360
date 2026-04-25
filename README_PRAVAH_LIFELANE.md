# 🚀 PRAVAH + LifeLane - Merged Smart City Traffic & Emergency Response System

A comprehensive, production-ready platform that combines intelligent traffic management with real-time emergency ambulance routing and green corridor creation.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [User Roles](#user-roles)
- [Installation & Setup](#installation--setup)
- [Usage Guide](#usage-guide)
- [Green Corridor Algorithm](#green-corridor-algorithm)
- [Future Enhancements](#future-enhancements)

---

## 🎯 Overview

**PRAVAH** (Traffic Management System) and **LifeLane** (Smart Ambulance Routing) have been merged into a unified platform that provides:

- **Real-time traffic monitoring** and adaptive signal control
- **Emergency ambulance dispatch** with nearest-unit allocation
- **Green corridor creation** - automatic traffic signal preemption for ambulances
- **Multi-role dashboards** for patients, drivers, dispatchers, and traffic controllers
- **Live tracking** on interactive maps
- **Comprehensive analytics** and preemption logs

---

## ✨ Features

### Traffic Management (PRAVAH)
- 🚦 Real-time junction monitoring with signal state visualization
- 📊 Traffic density and flow metrics
- 🔄 Adaptive signal timing optimization
- 📈 Historical traffic data analysis
- 🎮 Manual override controls for traffic operators

### Emergency Response (LifeLane)
- 🚑 One-click SOS emergency requests
- 🎯 Automatic nearest ambulance dispatch (Haversine algorithm)
- 🗺️ Live ambulance tracking on map
- 🟢 **Green Corridor** - automatic signal preemption
- ⏱️ ETA calculation and real-time updates
- 📱 Multi-type emergency support (Cardiac, Accident, Breathing, Maternity, Fire)

### Green Corridor System
- **Zone 1 (500m)**: Junction enters PREPARING state (yellow alert)
- **Zone 2 (200m)**: Junction PREEMPTED - signals turn GREEN for ambulance direction
- **Zone 3 (250m past)**: Junction RESTORED to normal operation after 3 seconds

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ Patient  │ │  Driver  │ │ Dispatch │ │ Traffic  │  │
│  │   View   │ │   View   │ │   View   │ │   View   │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│                    Leaflet Maps + Socket.IO              │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   API Layer (Next.js)                   │
│  /api/ambulances  /api/emergencies  /api/junctions     │
│  /api/hospitals   /api/metrics      /api/logs          │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│              Database (PostgreSQL + Drizzle)            │
│  users | ambulances | emergencies | traffic_junctions  │
│  hospitals | preemption_logs | traffic_flow_data       │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Modern styling
- **Framer Motion** - Smooth animations
- **Leaflet + React-Leaflet** - Interactive maps
- **Lucide Icons** - Beautiful icons
- **Socket.IO Client** - Real-time communication

### Backend
- **Next.js API Routes** - RESTful endpoints
- **Drizzle ORM** - Type-safe database queries
- **PostgreSQL** - Primary database
- **Socket.IO** - Real-time bidirectional events

### Database
- **PostgreSQL** with PostGIS-ready schema
- Time-series data support for traffic flow
- Spatial indexing for location queries

---

## 🗄️ Database Schema

### Core Tables

#### `users`
User accounts with role-based access (patient, driver, dispatch, traffic, admin)

#### `ambulances`
Fleet management with real-time location, status, and driver assignment

#### `emergencies`
Emergency requests with type, location, status, and ambulance assignment

#### `traffic_junctions`
Traffic signals with state per direction (N/S/E/W), density metrics, and preemption status

#### `hospitals`
Hospital locations with capacity and bed availability

#### `preemption_logs`
Audit trail of all green corridor activations with duration

#### `traffic_flow_data`
Time-series traffic metrics for analytics and ML predictions

---

## 🔌 API Endpoints

### Ambulances
```
GET    /api/ambulances              - Get all ambulances
PATCH  /api/ambulances/:id/location - Update location
```

### Emergencies
```
GET    /api/emergencies             - Get active emergencies
POST   /api/emergencies/sos         - Create SOS request
```

### Junctions
```
GET    /api/junctions               - Get all junctions
PATCH  /api/junctions/:id/override  - Manual signal override
```

### Hospitals
```
GET    /api/hospitals               - Get all hospitals
GET    /api/hospitals?lat=&lng=     - Find nearest hospital
```

### Logs
```
GET    /api/logs/preemptions        - Get preemption history
```

### Metrics
```
GET    /api/metrics                 - Get dashboard metrics
```

---

## 👥 User Roles

### 1. Patient
- **SOS Button** - One-click emergency request
- **Emergency Type Selector** - Cardiac, Accident, Breathing, etc.
- **Live Tracking** - Watch ambulance approach on map
- **ETA Display** - Real-time arrival estimate
- **Share Tracking** - Send location link to family

### 2. Driver
- **Emergency Requests** - Accept/Reject incoming emergencies
- **Navigation Map** - Centered on driver with route
- **Signal Status Badge** - GREEN/YELLOW/RED for upcoming junctions
- **Speedometer** - Real-time speed display
- **Case Management** - Mark arrival, completion

### 3. Dispatch
- **Global Map** - All ambulances and emergencies
- **Emergency Queue** - Real-time pending requests
- **Fleet Status** - Available/Busy/Offline breakdown
- **Auto-Assign** - Nearest ambulance algorithm
- **System Metrics** - Response times, preemptions

### 4. Traffic Control
- **Junction Panel** - All signals with live status
- **Preemption Alerts** - Which ambulance triggered
- **Manual Override** - Force GREEN/RED per junction
- **Preemption Logs** - Historical audit table
- **Traffic Metrics** - Density, wait times, flow

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 1. Clone and Install
```bash
npm install
```

### 2. Configure Database
Update `.env` with your PostgreSQL connection:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/pravah_lifelane
```

### 3. Push Schema
```bash
npx drizzle-kit push
```

### 4. Seed Data (Optional)
Add sample ambulances, junctions, and hospitals via the database.

### 5. Run Development Server
```bash
npm run dev
```

### 6. Access Application
Open http://localhost:3000 and select a role to begin.

---

## 📖 Usage Guide

### For Patients
1. Select "Patient" role on landing page
2. Enter patient name and phone
3. Select emergency type (Cardiac, Accident, etc.)
4. Click **SOS - CALL AMBULANCE**
5. Watch live ambulance tracking on map
6. Share tracking link with family

### For Drivers
1. Select "Driver" role
2. Wait for emergency request notification
3. Review emergency details (type, location, patient)
4. Click **Accept** to dispatch
5. Follow navigation to pickup location
6. Green corridor activates automatically at junctions
7. Mark arrival, then mark complete at hospital

### For Dispatchers
1. Select "Dispatch" role
2. Monitor emergency queue on left panel
3. Click **Auto-Assign Nearest** for pending emergencies
4. Track all ambulances on global map
5. View system metrics (response time, fleet status)
6. Manually reassign if needed

### For Traffic Controllers
1. Select "Traffic Control" role
2. Monitor all junctions on left panel
3. Watch for preemption alerts (green badges)
4. Use **Manual Override** for special situations
5. Review preemption logs for audits
6. Adjust signal timing based on traffic density

---

## 🟢 Green Corridor Algorithm

### How It Works

```
Ambulance → En-route to Hospital
    │
    ▼
Approaching Junction (500m)
    │
    ├─→ Zone 1: PREPARING
    │   - Junction status = "preparing"
    │   - Emit: signal:prewarning
    │   - Driver sees: YELLOW alert
    │
    ▼
Approaching Junction (200m)
    │
    ├─→ Zone 2: PREEMPTED
    │   - Junction status = "preempted"
    │   - All directions = RED
    │   - Ambulance direction = GREEN
    │   - Emit: signal:green_activated
    │   - Create: PreemptionLog (startTime)
    │   - Driver sees: GREEN - Safe to Pass
    │
    ▼
Passed Junction (>250m)
    │
    ├─→ Zone 3: RESTORED
    │   - Junction status = "restored"
    │   - Emit: signal:restored
    │   - Update: PreemptionLog (endTime, duration)
    │   - After 3s: status = "normal"
    │
    ▼
Repeat for Next Junction
```

### Geofencing Implementation
- **Haversine Formula** for accurate distance calculation
- **Heading Calculation** to determine approach direction
- **Zone-based Triggers** for smooth preemption
- **Automatic Restoration** to prevent traffic disruption

---

## 📊 Key Metrics

### Performance Targets
- **Response Time**: < 8 minutes average
- **Preemption Accuracy**: 100% junction coverage
- **System Uptime**: 99.9% availability
- **Location Updates**: Every 1 second
- **Signal Preemption**: < 2 seconds latency

### Dashboard Metrics
- Total Ambulances / Available / En-route
- Active Emergencies / Pending / Completed
- Average Response Time
- Total Preemptions Today
- Junction Congestion Levels

---

## 🔮 Future Enhancements

### Phase 1: AI/ML Integration
- [ ] Traffic flow prediction with LSTM networks
- [ ] Reinforcement learning for signal optimization
- [ ] Computer vision for emergency vehicle detection
- [ ] Anomaly detection for accident prediction

### Phase 2: Advanced Features
- [ ] Multi-junction coordination for long corridors
- [ ] Weather-aware traffic management
- [ ] Integration with city-wide traffic cameras
- [ ] Voice commands for drivers

### Phase 3: Scalability
- [ ] Microservices architecture
- [ ] Redis caching for sub-ms responses
- [ ] TimescaleDB for time-series data
- [ ] Docker containerization
- [ ] Kubernetes orchestration

### Phase 4: Mobile Apps
- [ ] Native iOS app for patients
- [ ] Android app for drivers
- [ ] PWA for dispatchers
- [ ] SMS/WhatsApp integration

---

## 📝 License

This project is part of the PRAVAH + LifeLane smart city initiative.

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:
1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Test thoroughly
5. Submit a pull request

---

## 📞 Support

For questions or issues, please contact the development team.

---

**Built with ❤️ for smarter cities and faster emergency response**
