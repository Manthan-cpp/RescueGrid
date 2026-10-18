"use client";

import React, { useState } from "react";
import { X, LifeBuoy, Truck, Package, HeartPulse, Zap, Radio, MapPin, Phone, FileText, Crosshair } from "lucide-react";
import { Resource, ResourceType, WardLocation } from "@/lib/types";

interface AddResourceModalProps {
  isOpen: boolean;
  wards: WardLocation[];
  onClose: () => void;
  onSubmit: (resource: Partial<Resource>) => void;
}

export function AddResourceModal({
  isOpen,
  wards,
  onClose,
  onSubmit,
}: AddResourceModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<ResourceType>("boat");
  const [locationId, setLocationId] = useState(wards[0]?.id || "custom");
  const [customLocation, setCustomLocation] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [capacity, setCapacity] = useState(6);
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [lat, setLat] = useState<string>("");
  const [lng, setLng] = useState<string>("");

  if (!isOpen) return null;

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude.toFixed(5));
          setLng(pos.coords.longitude.toFixed(5));
        },
        (err) => console.warn("Geolocation denied or unavailable:", err.message)
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const isCustom = wards.length === 0 || locationId === "custom";
    let finalLocId = locationId;
    let finalLocName = "Base Staging Area";

    if (isCustom) {
      finalLocName = customLocation.trim() || "Incident Sector";
      finalLocId = `loc-${finalLocName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    } else {
      const selectedWard = wards.find((w) => w.id === locationId);
      finalLocName = selectedWard?.name || locationId;
    }

    onSubmit({
      name: name.trim(),
      type,
      location_id: finalLocId,
      location_name: finalLocName,
      agency_name: agencyName.trim() || "Civil Defense Force",
      capacity: Number(capacity) || 1,
      contact_phone: phone.trim(),
      notes: notes.trim(),
      lat: lat ? parseFloat(lat) : undefined,
      lng: lng ? parseFloat(lng) : undefined,
    });

    // Reset & Close
    setName("");
    setPhone("");
    setNotes("");
    setLat("");
    setLng("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg border border-gray-200 shadow-xl max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-blue-50/50">
          <div className="flex items-center space-x-2">
            <LifeBuoy className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-gray-900">
              Register Emergency Resource / Fleet
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 rounded p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {/* Resource Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Resource Name / Unit Call Sign *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Gemini Rigid Inflatable 02"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Asset Category *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ResourceType)}
                className="w-full text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 text-gray-900 font-medium"
              >
                <option value="boat">Rescue Boat / Inflatable</option>
                <option value="ambulance">Emergency Ambulance / EMT</option>
                <option value="food">Ration & Drinking Water Pack</option>
                <option value="medicine">Medical Kit / Trauma Pack</option>
                <option value="generator">Portable Power Generator</option>
                <option value="drone">Aerial Reconnaissance Drone</option>
              </select>
            </div>
          </div>

          {/* Operating Agency & Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Operating Agency / NGO / Group *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. NDRF, Red Cross, Coastal Fishermen"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Capacity / Payload (Persons or Units)
              </label>
              <input
                type="number"
                min={1}
                max={1000}
                value={capacity}
                onChange={(e) => setCapacity(parseInt(e.target.value) || 1)}
                className="w-full text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 text-gray-900"
              />
            </div>
          </div>

          {/* Location & Sector */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-gray-700">
                Staging Sector / Base Location *
              </label>
              {wards.length > 0 && (
                <button
                  type="button"
                  onClick={() => setLocationId(locationId === "custom" ? (wards[0]?.id || "") : "custom")}
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-medium"
                >
                  {locationId === "custom" ? "Choose existing ward" : "+ Type custom sector"}
                </button>
              )}
            </div>

            {wards.length > 0 && locationId !== "custom" ? (
              <div className="relative">
                <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <select
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  className="w-full text-sm pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 text-gray-900"
                >
                  {wards.map((ward) => (
                    <option key={ward.id} value={ward.id}>
                      {ward.name} ({ward.accessibility_status})
                    </option>
                  ))}
                  <option value="custom">+ Enter New / Custom Location...</option>
                </select>
              </div>
            ) : (
              <div className="relative">
                <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Kalpetta North Staging Base, River Landing"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  className="w-full text-sm pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 text-gray-900"
                />
              </div>
            )}
          </div>

          {/* Optional GPS Coordinates */}
          <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-700 flex items-center">
                <Crosshair className="w-3.5 h-3.5 mr-1 text-gray-500" />
                Exact GPS Coordinates (Optional)
              </span>
              <button
                type="button"
                onClick={handleGetLocation}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold"
              >
                Auto-Detect GPS
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                step="any"
                placeholder="Latitude (e.g. 11.605)"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="text-xs px-2.5 py-1.5 border border-gray-300 rounded bg-white text-gray-800"
              />
              <input
                type="number"
                step="any"
                placeholder="Longitude (e.g. 76.083)"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="text-xs px-2.5 py-1.5 border border-gray-300 rounded bg-white text-gray-800"
              />
            </div>
          </div>

          {/* Contact Phone & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Crew Lead Contact Phone
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  placeholder="+91 98471 23456"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-sm pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 text-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Operational Notes
              </label>
              <input
                type="text"
                placeholder="e.g. 40HP outboard motor, night searchlight"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 text-gray-900"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[11px] text-gray-500 font-mono">
              FalkorDB verified node creation
            </span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-colors"
              >
                Register into Graph
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
