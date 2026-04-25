// PRAVAH + LifeLane - Modern Login Page
// Multi-Service Smart City Platform

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Lock, Mail, ArrowRight, Shield, Truck, Heart, MapPin, Brain } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedService, setSelectedService] = useState("emergency");

  const services = [
    {
      id: "emergency",
      name: "Emergency Response",
      icon: Shield,
      color: "from-red-500 to-pink-500",
      description: "Ambulance dispatch & green corridor"
    },
    {
      id: "parcel",
      name: "Parcel Service",
      icon: Truck,
      color: "from-blue-500 to-cyan-500",
      description: "Smart delivery & tracking"
    },
    {
      id: "parental",
      name: "Parental Tracking",
      icon: MapPin,
      color: "from-purple-500 to-indigo-500",
      description: "Family safety & location tracking"
    },
    {
      id: "eldercare",
      name: "Elder Care",
      icon: Heart,
      color: "from-green-500 to-teal-500",
      description: "Senior citizen monitoring"
    },
    {
      id: "womensafety",
      name: "Women Safety",
      icon: Shield,
      color: "from-pink-500 to-rose-500",
      description: "Personal safety & alerts"
    },
    {
      id: "fleet",
      name: "Fleet Management",
      icon: Truck,
      color: "from-orange-500 to-amber-500",
      description: "Vehicle fleet operations"
    },
    {
      id: "ai",
      name: "AI Predictions",
      icon: Brain,
      color: "from-violet-500 to-purple-500",
      description: "Predictive analytics & insights"
    }
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect to main app with selected service
    window.location.href = `/?service=${selectedService}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 bg-black opacity-50"></div>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* Service Selection */}
        <div className="w-1/2 p-8 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-md w-full"
          >
            <h1 className="text-4xl font-bold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              PRAVAH + LifeLane
            </h1>
            <p className="text-gray-300 mb-8">
              Multi-Service Smart City Platform
            </p>

            <div className="space-y-3 mb-8">
              <h3 className="text-white font-semibold mb-4">Select Service</h3>
              {services.map((service) => (
                <motion.button
                  key={service.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedService(service.id)}
                  className={`w-full p-4 rounded-xl border-2 transition-all ${
                    selectedService === service.id
                      ? "border-white bg-white/10"
                      : "border-white/20 hover:border-white/40 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${service.color} flex items-center justify-center`}>
                      <service.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-white font-medium">{service.name}</div>
                      <div className="text-gray-400 text-sm">{service.description}</div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Login Form */}
        <div className="w-1/2 p-8 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-md w-full"
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">Sign In</h2>
              
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg shadow-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all"
                >
                  <span className="flex items-center justify-center gap-2">
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </motion.button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-400 text-sm">
                  Don't have an account?{" "}
                  <Link href="/signup" className="text-purple-400 hover:text-purple-300 font-medium">
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
