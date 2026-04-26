// PRAVAH + LifeLane - Women Safety Direct Page
// Direct access to women safety features

"use client";

import { useEffect } from "react";
import { useAuth } from "@/store/AuthContext";
import { AppProvider } from "@/store/AppContext";
import WomenSafetyView from "@/views/WomenSafetyView";

function WomenSafetyPageContent() {
  const { login } = useAuth();

  useEffect(() => {
    // Auto-login for women safety
    login("safety@parvah.com", "safety123", "women_safety");
  }, [login]);

  return <WomenSafetyView />;
}

export default function WomenSafetyPage() {
  return (
    <AppProvider>
      <WomenSafetyPageContent />
    </AppProvider>
  );
}
