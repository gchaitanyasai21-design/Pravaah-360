// PRAVAH + LifeLane - Back to Login Button
// Navigation component for returning to login page

"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackToLoginProps {
  className?: string;
}

export default function BackToLogin({ className = "" }: BackToLoginProps) {
  const router = useRouter();

  const handleBackToLogin = () => {
    // Clear any stored data
    localStorage.removeItem('userEmail');
    localStorage.removeItem('selectedService');
    localStorage.removeItem('childProfile');
    
    // Navigate to login page
    router.push('/login');
  };

  return (
    <button
      onClick={handleBackToLogin}
      className={`flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
      <span className="text-sm font-medium">Back to Login</span>
    </button>
  );
}
