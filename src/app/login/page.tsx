// PRAVAH + LifeLane - Modern Login Page
// Multi-Service Smart City Platform

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Lock, Mail, ArrowRight, Shield, Truck, Heart, MapPin, Brain, Users, AlertTriangle, Phone, Eye, EyeOff, ChevronRight } from "lucide-react";
import LiveMap from "@/components/LiveMapSimple";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedService, setSelectedService] = useState("patient");
  const [isAbove18, setIsAbove18] = useState(false);
  const [childName, setChildName] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [showAdditionalFields, setShowAdditionalFields] = useState(false);

  const services = [
    {
      id: "patient",
      name: "Emergency Services",
      icon: Shield,
      color: "from-red-500 to-pink-500",
      description: "Medical emergency assistance",
      role: "patient" as const
    },
    {
      id: "parcel",
      name: "Parcel Delivery",
      icon: Truck,
      color: "from-blue-500 to-cyan-500",
      description: "Send & receive packages",
      role: "parcel_user" as const
    },
    {
      id: "womensafety",
      name: "Women Safety",
      icon: Shield,
      color: "from-pink-500 to-rose-500",
      description: "Personal safety & location tracking",
      role: "women_safety" as const
    },
    {
      id: "child",
      name: "Child Safety",
      icon: MapPin,
      color: "from-purple-500 to-indigo-500",
      description: "Child monitoring & safety",
      role: "child_user" as const,
      requiresAgeVerification: true
    },
    {
      id: "parent",
      name: "Parental Monitoring",
      icon: MapPin,
      color: "from-indigo-500 to-purple-500",
      description: "Track your children's location",
      role: "parent_user" as const
    },
    {
      id: "eldercare",
      name: "Elderly Care",
      icon: Heart,
      color: "from-green-500 to-teal-500",
      description: "Senior citizen monitoring",
      role: "elderly_user" as const
    },
    {
      id: "driver",
      name: "Service Provider",
      icon: Truck,
      color: "from-orange-500 to-amber-500",
      description: "Driver & delivery partner",
      role: "driver" as const
    },
    {
      id: "admin",
      name: "System Admin",
      icon: Shield,
      color: "from-gray-500 to-slate-500",
      description: "Full system control",
      role: "admin" as const,
      requiresAdmin: true
    }
  ];

  const handleServiceChange = (serviceId: string) => {
    setSelectedService(serviceId);
    const service = services.find(s => s.id === serviceId);
    setShowAdditionalFields(service?.requiresAgeVerification || false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Store additional data for child users
    if (showAdditionalFields) {
      localStorage.setItem('childProfile', JSON.stringify({
        isAbove18,
        childName,
        parentName,
        parentPhone,
        bloodGroup
      }));
    }
    
    // Store login info
    localStorage.setItem('userEmail', email);
    localStorage.setItem('selectedService', selectedService);
    
    // Redirect to service-specific page
    window.location.href = `/${selectedService}`;
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
        <div className="flex-1 flex items-center justify-center p-8 relative">
          {/* Background Map */}
          <div className="absolute inset-0 opacity-10">
            <LiveMap
              ambulances={[]}
              emergencies={[]}
              center={[28.6139, 77.2090]}
              zoom={10}
            />
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md relative z-10"
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
                  onClick={() => handleServiceChange(service.id)}
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

                {/* Additional fields for child users */}
                {showAdditionalFields && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-4 border-t border-white/20 pt-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Are you above 18 years old?
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            checked={isAbove18}
                            onChange={() => setIsAbove18(true)}
                            className="mr-2"
                          />
                          <span className="text-white">Yes (18+)</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            checked={!isAbove18}
                            onChange={() => setIsAbove18(false)}
                            className="mr-2"
                          />
                          <span className="text-white">No (Below 18)</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Child Name
                      </label>
                      <input
                        type="text"
                        value={childName}
                        onChange={(e) => setChildName(e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="Enter child's name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Parent/Guardian Name
                      </label>
                      <input
                        type="text"
                        value={parentName}
                        onChange={(e) => setParentName(e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="Enter parent's name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Parent Phone Number
                      </label>
                      <input
                        type="tel"
                        value={parentPhone}
                        onChange={(e) => setParentPhone(e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="Enter parent's phone number"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Blood Group
                      </label>
                      <select
                        value={bloodGroup}
                        onChange={(e) => setBloodGroup(e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        required
                      >
                        <option value="" className="text-gray-800">Select blood group</option>
                        <option value="A+" className="text-gray-800">A+</option>
                        <option value="A-" className="text-gray-800">A-</option>
                        <option value="B+" className="text-gray-800">B+</option>
                        <option value="B-" className="text-gray-800">B-</option>
                        <option value="AB+" className="text-gray-800">AB+</option>
                        <option value="AB-" className="text-gray-800">AB-</option>
                        <option value="O+" className="text-gray-800">O+</option>
                        <option value="O-" className="text-gray-800">O-</option>
                      </select>
                    </div>
                  </motion.div>
                )}

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
                <p className="text-gray-400 text-sm mb-3">
                  Or use direct access:
                </p>
                <div className="space-y-2 text-xs">
                  <div className="text-purple-300">
                    Women Safety: <span className="text-white">safety@parvah.com / safety123</span>
                  </div>
                  <div className="text-purple-300">
                    Parental: <span className="text-white">parent@parvah.com / parent123</span>
                  </div>
                  <div className="text-purple-300">
                    Elderly Care: <span className="text-white">elderly@parvah.com / elderly123</span>
                  </div>
                  <div className="text-purple-300">
                    Parcel: <span className="text-white">user@parvah.com / user123</span>
                  </div>
                  <div className="text-purple-300">
                    Emergency: <span className="text-white">patient@parvah.com / patient123</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-600">
                  <p className="text-gray-400 text-sm">
                    Or visit: <span className="text-purple-400">/womensafety</span>, <span className="text-purple-400">/parent</span>, <span className="text-purple-400">/eldercare</span>, <span className="text-purple-400">/parcel</span>, <span className="text-purple-400">/emergency</span>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
