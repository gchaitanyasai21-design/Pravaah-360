// PRAVAH + LifeLane - Elderly Care Direct Page
// Direct access to elderly monitoring features

"use client";

import { useEffect } from "react";
import { useAuth } from "@/store/AuthContext";
import { AppProvider } from "@/store/AppContext";
import ElderlyView from "@/views/ElderlyView";

function ElderlyCarePageContent() {
  const { login } = useAuth();

  useEffect(() => {
    // Auto-login for elderly care
    login("elderly@parvah.com", "elderly123", "elderly_user");
  }, [login]);

  return <ElderlyView />;
}

export default function ElderlyCarePage() {
  return (
    <AppProvider>
      <ElderlyCarePageContent />
    </AppProvider>
  );
}
