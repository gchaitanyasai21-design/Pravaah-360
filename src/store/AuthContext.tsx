// PRAVAH 360 - Authentication Context
// Multi-Service Smart City Platform

"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
// Assuming types are exported from "@/types" or "@/types/roles"
// UserRole covers every citizen-facing module including flood_response
import type { UserRole, UserPermissions, UserProfile } from "@/types/roles";

interface AuthState {
  user: UserProfile | null;
  permissions: UserPermissions | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  hasPermission: (permission: keyof UserPermissions) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    permissions: null,
    isAuthenticated: false,
    isLoading: false,
  });

  const login = useCallback(async (email: string, password: string, role: UserRole): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Format role name for display (e.g. "flood_response" -> "Flood Response User")
      const formattedRoleName = role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      
      // Create user profile
      const userProfile: UserProfile = {
        id: `user-${role}-${Date.now()}`,
        email,
        name: `${formattedRoleName} User`,
        role,
        createdAt: new Date(),
        lastActive: new Date(),
      };

      // Get child profile data if exists
      if (role === "child_user") {
        const stored = localStorage.getItem('childProfile');
        if (stored) {
          const childProfile = JSON.parse(stored);
          userProfile.isAbove18 = childProfile.isAbove18;
          userProfile.parentName = childProfile.parentName;
          userProfile.parentPhone = childProfile.parentPhone;
          userProfile.bloodGroup = childProfile.bloodGroup;
        }
      }

      // Add tracking code for relevant roles
      if (role.includes("_user") || role === "women_safety") {
        userProfile.trackingShareCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      }

      // Add emergency contacts for safety roles
      if (role === "women_safety" || role === "elderly_user") {
        userProfile.emergencyContacts = ["+91-9999999999"];
      }

      // Grant permissions based on role
      // For demo, we grant all, but you can restrict flood_response later if needed
      setState({
        user: userProfile,
        permissions: { 
          canViewTrafficControl: true, 
          canViewDispatch: true, 
          canViewAllAmbulances: true, 
          canControlJunctions: true, 
          canAssignEmergencies: true, 
          canViewAllUsers: true, 
          canAccessAnalytics: true, 
          canManageFleet: true, 
          canTrackLocation: true, 
          canCreateEmergency: true, 
          canCreateServiceRequest: true 
        }, 
        isAuthenticated: true,
        isLoading: false,
      });

      return true;
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setState({
      user: null,
      permissions: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setState(prev => {
      if (!prev.user) return prev;
      return {
        ...prev,
        user: { ...prev.user, ...updates, lastActive: new Date() },
      };
    });
  }, []);

  const hasPermission = useCallback((permission: keyof UserPermissions): boolean => {
    return state.permissions?.[permission] || false;
  }, [state.permissions]);

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    updateProfile,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}