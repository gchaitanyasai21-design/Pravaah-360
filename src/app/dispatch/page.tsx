// PRAVAH + LifeLane - Dispatch Control Direct Page
// Direct access to dispatch control features

"use client";

import { useEffect } from "react";
import { useAuth } from "@/store/AuthContext";
import { AppProvider } from "@/store/AppContext";
import DispatchView from "@/views/DispatchView";

function DispatchPageContent() {
  const { login } = useAuth();

  useEffect(() => {
    // Auto-login for dispatch control
    login("dispatch@parvah.com", "dispatch123", "dispatcher");
  }, [login]);

  return <DispatchView />;
}

export default function DispatchPage() {
  return (
    <AppProvider>
      <DispatchPageContent />
    </AppProvider>
  );
}
