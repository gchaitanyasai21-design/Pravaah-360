// PRAVAH + LifeLane - Role Types and Access Control
// User vs Admin separation with proper permissions

export type UserRole = 
  | 'admin'           // Full system control
  | 'dispatcher'      // Emergency dispatch control
  | 'traffic_control' // Traffic junction management
  | 'driver'          // Service provider (ambulance, parcel, transport)
  | 'patient'         // Medical emergency user
  | 'parcel_user'     // Parcel delivery user
  | 'women_safety'    // Women safety user
  | 'child_user'      // Child tracking user
  | 'parent_user'     // Parental monitoring user
  | 'elderly_user'    // Elderly care user
  | 'fleet_manager'   // Fleet vehicle management
  | 'ai_analyst';     // AI predictions and analytics

export interface UserPermissions {
  canViewTrafficControl: boolean;
  canViewDispatch: boolean;
  canViewAllAmbulances: boolean;
  canControlJunctions: boolean;
  canAssignEmergencies: boolean;
  canViewAllUsers: boolean;
  canAccessAnalytics: boolean;
  canManageFleet: boolean;
  canTrackLocation: boolean;
  canCreateEmergency: boolean;
  canCreateServiceRequest: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, UserPermissions> = {
  admin: {
    canViewTrafficControl: true,
    canViewDispatch: true,
    canViewAllAmbulances: true,
    canControlJunctions: true,
    canAssignEmergencies: true,
    canViewAllUsers: true,
    canAccessAnalytics: true,
    canManageFleet: true,
    canTrackLocation: true,
    canCreateEmergency: false,
    canCreateServiceRequest: false,
  },
  dispatcher: {
    canViewTrafficControl: false,
    canViewDispatch: true,
    canViewAllAmbulances: true,
    canControlJunctions: false,
    canAssignEmergencies: true,
    canViewAllUsers: false,
    canAccessAnalytics: true,
    canManageFleet: false,
    canTrackLocation: true,
    canCreateEmergency: false,
    canCreateServiceRequest: false,
  },
  traffic_control: {
    canViewTrafficControl: true,
    canViewDispatch: false,
    canViewAllAmbulances: true,
    canControlJunctions: true,
    canAssignEmergencies: false,
    canViewAllUsers: false,
    canAccessAnalytics: true,
    canManageFleet: false,
    canTrackLocation: true,
    canCreateEmergency: false,
    canCreateServiceRequest: false,
  },
  driver: {
    canViewTrafficControl: false,
    canViewDispatch: false,
    canViewAllAmbulances: false,
    canControlJunctions: false,
    canAssignEmergencies: false,
    canViewAllUsers: false,
    canAccessAnalytics: false,
    canManageFleet: false,
    canTrackLocation: true,
    canCreateEmergency: false,
    canCreateServiceRequest: false,
  },
  patient: {
    canViewTrafficControl: false,
    canViewDispatch: false,
    canViewAllAmbulances: false,
    canControlJunctions: false,
    canAssignEmergencies: false,
    canViewAllUsers: false,
    canAccessAnalytics: false,
    canManageFleet: false,
    canTrackLocation: false,
    canCreateEmergency: true,
    canCreateServiceRequest: false,
  },
  parcel_user: {
    canViewTrafficControl: false,
    canViewDispatch: false,
    canViewAllAmbulances: false,
    canControlJunctions: false,
    canAssignEmergencies: false,
    canViewAllUsers: false,
    canAccessAnalytics: false,
    canManageFleet: false,
    canTrackLocation: true,
    canCreateEmergency: false,
    canCreateServiceRequest: true,
  },
  women_safety: {
    canViewTrafficControl: false,
    canViewDispatch: false,
    canViewAllAmbulances: false,
    canControlJunctions: false,
    canAssignEmergencies: false,
    canViewAllUsers: false,
    canAccessAnalytics: false,
    canManageFleet: false,
    canTrackLocation: true,
    canCreateEmergency: true,
    canCreateServiceRequest: false,
  },
  child_user: {
    canViewTrafficControl: false,
    canViewDispatch: false,
    canViewAllAmbulances: false,
    canControlJunctions: false,
    canAssignEmergencies: false,
    canViewAllUsers: false,
    canAccessAnalytics: false,
    canManageFleet: false,
    canTrackLocation: false,
    canCreateEmergency: false,
    canCreateServiceRequest: true,
  },
  parent_user: {
    canViewTrafficControl: false,
    canViewDispatch: false,
    canViewAllAmbulances: false,
    canControlJunctions: false,
    canAssignEmergencies: false,
    canViewAllUsers: false,
    canAccessAnalytics: false,
    canManageFleet: false,
    canTrackLocation: true,
    canCreateEmergency: false,
    canCreateServiceRequest: false,
  },
  elderly_user: {
    canViewTrafficControl: false,
    canViewDispatch: false,
    canViewAllAmbulances: false,
    canControlJunctions: false,
    canAssignEmergencies: false,
    canViewAllUsers: false,
    canAccessAnalytics: false,
    canManageFleet: false,
    canTrackLocation: true,
    canCreateEmergency: true,
    canCreateServiceRequest: false,
  },
  fleet_manager: {
    canViewTrafficControl: false,
    canViewDispatch: false,
    canViewAllAmbulances: true,
    canControlJunctions: false,
    canAssignEmergencies: false,
    canViewAllUsers: false,
    canAccessAnalytics: true,
    canManageFleet: true,
    canTrackLocation: true,
    canCreateEmergency: false,
    canCreateServiceRequest: false,
  },
  ai_analyst: {
    canViewTrafficControl: false,
    canViewDispatch: false,
    canViewAllAmbulances: false,
    canControlJunctions: false,
    canAssignEmergencies: false,
    canViewAllUsers: false,
    canAccessAnalytics: true,
    canManageFleet: false,
    canTrackLocation: false,
    canCreateEmergency: false,
    canCreateServiceRequest: false,
  },
};

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isAbove18?: boolean; // For child users
  parentName?: string; // For child users
  parentPhone?: string; // For child users
  bloodGroup?: string; // For child users
  emergencyContacts?: string[]; // For women safety, elderly care
  trackingShareCode?: string; // For location sharing
  createdAt: Date;
  lastActive: Date;
}
