// PRAVAH + LifeLane - Traffic Control Direct Page
// Direct access to traffic control features

"use client";

import { useEffect } from "react";
import { useAuth } from "@/store/AuthContext";
import { AppProvider } from "@/store/AppContext";
import TrafficView from "@/views/TrafficView";

function TrafficPageContent() {
  const { login } = useAuth();

  useEffect(() => {
    // Auto-login for traffic control
    login("traffic@parvah.com", "traffic123", "traffic_control");
  }, [login]);

  return <TrafficView />;
}

export default function TrafficPage() {
  return (
    <AppProvider>
      <TrafficPageContent />
    </AppProvider>
  );
}
