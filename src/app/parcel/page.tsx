// PRAVAH + LifeLane - Parcel Delivery Direct Page
// Direct access to parcel delivery features

"use client";

import { useEffect } from "react";
import { useAuth } from "@/store/AuthContext";
import { AppProvider } from "@/store/AppContext";
import ParcelView from "@/views/ParcelView";

function ParcelPageContent() {
  const { login } = useAuth();

  useEffect(() => {
    // Auto-login for parcel delivery
    login("user@parvah.com", "user123", "parcel_user");
  }, [login]);

  return <ParcelView />;
}

export default function ParcelPage() {
  return (
    <AppProvider>
      <ParcelPageContent />
    </AppProvider>
  );
}
