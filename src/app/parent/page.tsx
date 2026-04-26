// PRAVAH + LifeLane - Parental Monitoring Direct Page
// Direct access to parental tracking features

"use client";

import { useEffect } from "react";
import { useAuth } from "@/store/AuthContext";
import { AppProvider } from "@/store/AppContext";
import ParentalView from "@/views/ParentalView";

function ParentPageContent() {
  const { login } = useAuth();

  useEffect(() => {
    // Auto-login for parental monitoring
    login("parent@parvah.com", "parent123", "parent_user");
  }, [login]);

  return <ParentalView />;
}

export default function ParentPage() {
  return (
    <AppProvider>
      <ParentPageContent />
    </AppProvider>
  );
}
