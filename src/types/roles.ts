// PRAVAH 360 - Role Types and Access Control

export type UserRole = 
  | 'admin'
  | 'dispatcher'
  | 'traffic_control'
  | 'driver'
  | 'patient'
  | 'flood_response'
  | 'women_safety'
  | 'child_user'
  | 'parent_user'
  | 'elderly_user'
  | 'fleet_manager'
  | 'ai_analyst';

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
  flood_response: {
    canViewTrafficControl: false,
    canViewDispatch: false,
    canViewAllAmbulances: false,
    canControlJunctions: false,
    canAssignEmergencies: false,
    canViewAllUsers: false,
    canAccessAnalytics: true,
    canManageFleet: false,
    canTrackLocation: true,
    canCreateEmergency: true,
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
  isAbove18?: boolean;
  parentName?: string;
  parentPhone?: string;
  bloodGroup?: string;
  emergencyContacts?: string[];
  trackingShareCode?: string;
  createdAt: Date;
  lastActive: Date;
}