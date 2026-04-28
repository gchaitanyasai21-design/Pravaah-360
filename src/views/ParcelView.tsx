// PRAVAH + LifeLane - Parcel Service View
// Package delivery and tracking system

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Package,
  MapPin,
  Clock,
  CheckCircle,
  Truck,
  Phone,
  User,
  Plus,
  Search,
} from "lucide-react";
import LiveMap from "@/components/LiveMap";
import BackToLogin from "@/components/BackToLogin";
import { useApp } from "@/store/AppContext";
import { useAuth } from "@/store/AuthContext";

interface ParcelRequest {
  id: string;
  senderName: string;
  senderPhone: string;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  recipientName: string;
  recipientPhone: string;
  deliveryAddress: string;
  deliveryLat: number;
  deliveryLng: number;
  packageType: string;
  weight: string;
  status: 'pending' | 'picked_up' | 'in_transit' | 'delivered';
  createdAt: Date;
  estimatedDelivery?: Date;
  trackingCode: string;
}

export default function ParcelView() {
  const { ambulances } = useApp(); // Using ambulances as delivery vehicles for now
  const { user } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchCode, setSearchCode] = useState("");
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number }>({ lat: 28.6139, lng: 77.2090 });
  const [parcels, setParcels] = useState<ParcelRequest[]>([
    {
      id: "parcel-1",
      senderName: "John Doe",
      senderPhone: "+91-9876543210",
      pickupAddress: "123, Main Street, Delhi",
      pickupLat: 28.6139,
      pickupLng: 77.2090,
      recipientName: "Jane Smith",
      recipientPhone: "+91-9876543211",
      deliveryAddress: "456, Park Avenue, Delhi",
      deliveryLat: 28.6289,
      deliveryLng: 77.2195,
      packageType: "Document",
      weight: "0.5 kg",
      status: "in_transit",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      estimatedDelivery: new Date(Date.now() + 1 * 60 * 60 * 1000),
      trackingCode: "PKG" + Math.random().toString(36).substring(2, 8).toUpperCase(),
    },
    {
      id: "parcel-2",
      senderName: "Alice Johnson",
      senderPhone: "+91-9876543212",
      pickupAddress: "789, Market Road, Delhi",
      pickupLat: 28.6439,
      pickupLng: 77.2390,
      recipientName: "Bob Wilson",
      recipientPhone: "+91-9876543213",
      deliveryAddress: "321, College Street, Delhi",
      deliveryLat: 28.6039,
      deliveryLng: 77.1990,
      packageType: "Electronics",
      weight: "2.5 kg",
      status: "pending",
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
      trackingCode: "PKG" + Math.random().toString(36).substring(2, 8).toUpperCase(),
    },
  ]);

  const [newParcel, setNewParcel] = useState({
    senderName: "",
    senderPhone: "",
    pickupAddress: "",
    recipientName: "",
    recipientPhone: "",
    deliveryAddress: "",
    packageType: "Document",
    weight: "",
  });

  // Create new parcel request
  const createParcel = () => {
    const parcel: ParcelRequest = {
      id: `parcel-${Date.now()}`,
      ...newParcel,
      pickupLat: 28.6139, // Default coordinates
      pickupLng: 77.2090,
      deliveryLat: 28.6289,
      deliveryLng: 77.2195,
      status: 'pending',
      createdAt: new Date(),
      trackingCode: "PKG" + Math.random().toString(36).substring(2, 8).toUpperCase(),
    };

    setParcels(prev => [parcel, ...prev]);
    setNewParcel({
      senderName: "",
      senderPhone: "",
      pickupAddress: "",
      recipientName: "",
      recipientPhone: "",
      deliveryAddress: "",
      packageType: "Document",
      weight: "",
    });
    setShowCreateForm(false);
  };

  // Track parcel by code
  const trackedParcel = parcels.find(p => p.trackingCode === searchCode);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'in_transit': return 'text-blue-600 bg-blue-100';
      case 'picked_up': return 'text-yellow-600 bg-yellow-100';
      case 'pending': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return CheckCircle;
      case 'in_transit': return Truck;
      case 'picked_up': return Package;
      case 'pending': return Clock;
      default: return Clock;
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BackToLogin />
              <div className="flex items-center gap-3">
                <Package className="w-8 h-8" />
                <div>
                  <h1 className="text-2xl font-bold">Parcel Delivery</h1>
                  <p className="text-blue-100 text-sm">Send and track packages</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Send Parcel
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tracking Bar */}
      <div className="bg-white border-b p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
              placeholder="Enter tracking code (e.g., PKG123ABC)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Track
            </button>
          </div>
        </div>
      </div>

      {/* Tracked Parcel Result */}
      {trackedParcel && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border-b border-green-200 p-4"
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-green-800">Parcel Found: {trackedParcel.trackingCode}</h3>
                <p className="text-green-600">Status: {trackedParcel.status.replace('_', ' ').toUpperCase()}</p>
              </div>
              <div className="text-sm text-green-600">
                Est. Delivery: {trackedParcel.estimatedDelivery?.toLocaleDateString()}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full p-4 gap-4 overflow-hidden">
        {/* Left Panel - Parcel List */}
        <div className="lg:w-1/2 flex flex-col space-y-4">
          {/* Create Parcel Form */}
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h3 className="font-bold text-gray-800 mb-4">Send New Parcel</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sender Name</label>
                    <input
                      type="text"
                      value={newParcel.senderName}
                      onChange={(e) => setNewParcel(prev => ({ ...prev, senderName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sender Phone</label>
                    <input
                      type="tel"
                      value={newParcel.senderPhone}
                      onChange={(e) => setNewParcel(prev => ({ ...prev, senderPhone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Your phone"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Address</label>
                  <input
                    type="text"
                    value={newParcel.pickupAddress}
                    onChange={(e) => setNewParcel(prev => ({ ...prev, pickupAddress: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Pickup address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Name</label>
                    <input
                      type="text"
                      value={newParcel.recipientName}
                      onChange={(e) => setNewParcel(prev => ({ ...prev, recipientName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Recipient name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Phone</label>
                    <input
                      type="tel"
                      value={newParcel.recipientPhone}
                      onChange={(e) => setNewParcel(prev => ({ ...prev, recipientPhone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Recipient phone"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                  <input
                    type="text"
                    value={newParcel.deliveryAddress}
                    onChange={(e) => setNewParcel(prev => ({ ...prev, deliveryAddress: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Delivery address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Package Type</label>
                    <select
                      value={newParcel.packageType}
                      onChange={(e) => setNewParcel(prev => ({ ...prev, packageType: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Document">Document</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Clothing">Clothing</option>
                      <option value="Food">Food</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                    <input
                      type="text"
                      value={newParcel.weight}
                      onChange={(e) => setNewParcel(prev => ({ ...prev, weight: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Weight"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={createParcel}
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Send Parcel
                  </button>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Parcel List */}
          <div className="bg-white rounded-xl shadow-lg p-6 flex-1 overflow-auto">
            <h3 className="font-bold text-gray-800 mb-4">Your Parcels</h3>

            <div className="space-y-3">
              {parcels.map((parcel) => {
                const StatusIcon = getStatusIcon(parcel.status);
                return (
                  <motion.div
                    key={parcel.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-medium text-gray-800">{parcel.trackingCode}</div>
                        <div className="text-sm text-gray-600">{parcel.packageType} • {parcel.weight}</div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(parcel.status)}`}>
                        {parcel.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3" />
                        <span>{parcel.senderName} → {parcel.recipientName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        <span>{parcel.pickupAddress} → {parcel.deliveryAddress}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span>Created: {parcel.createdAt.toLocaleTimeString()}</span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <StatusIcon className="w-4 h-4 text-gray-400" />
                      <div className="text-xs text-gray-500">
                        {parcel.estimatedDelivery && `Est. delivery: ${parcel.estimatedDelivery.toLocaleDateString()}`}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Panel - Map */}
        <div className="lg:w-1/2 flex flex-col">
          <div className="bg-white rounded-xl shadow-lg p-4 flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Live Tracking</h3>
              <div className="text-sm text-gray-600">
                Active deliveries: {parcels.filter(p => p.status === 'in_transit').length}
              </div>
            </div>
            
            <div className="h-full min-h-[500px] rounded-lg overflow-hidden">
              <LiveMap
                ambulances={ambulances.filter(a => a.status === "en-route")}
                deliveryVehicles={[
                  { id: "DEL-001", lat: 28.6200, lng: 77.2100, status: "In Transit" },
                  { id: "DEL-002", lat: 28.6050, lng: 77.2150, status: "Delivered" },
                  { id: "DEL-003", lat: 28.6180, lng: 77.1950, status: "In Transit" },
                  { id: "DEL-004", lat: 28.6080, lng: 77.2250, status: "In Transit" },
                  { id: "DEL-005", lat: 28.6150, lng: 77.1900, status: "Delivered" }
                ]}
                trafficSignals={[
                  { id: "TS-001", lat: 28.6139, lng: 77.2090, name: "Connaught Place", status: "Normal" },
                  { id: "TS-002", lat: 28.6141, lng: 77.2092, name: "India Gate", status: "Busy" },
                  { id: "TS-003", lat: 28.6100, lng: 77.2150, name: "Karol Bagh", status: "Congested" },
                  { id: "TS-004", lat: 28.6180, lng: 77.1950, name: "Rajiv Chowk", status: "Normal" }
                ]}
                hospitals={[
                  { id: "AIIMS", lat: 28.6069, lng: 77.2090, name: "AIIMS Delhi", status: "Available" },
                  { id: "SJDH", lat: 28.5850, lng: 77.2030, name: "Safdarjung Hospital", status: "Available" }
                ]}
                emergencies={[]}
                junctions={[]}
                userLocation={currentLocation || undefined}
                showUserLocation={true}
                center={[currentLocation.lat, currentLocation.lng]}
                zoom={12}
                showControls={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
