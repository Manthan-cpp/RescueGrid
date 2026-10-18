"use client";

import React, { useState } from "react";
import { X, Building, Users, MapPin, Phone, HeartPulse, Zap, Crosshair } from "lucide-react";
import { Shelter, WardLocation } from "@/lib/types";

interface AddShelterModalProps {
  isOpen: boolean;
  wards: WardLocation[];
  onClose: () => void;
  onSubmit: (shelter: Partial<Shelter>) => void;
}

export function AddShelterModal({
  isOpen,
  wards,
  onClose,
  onSubmit,
}: AddShelterModalProps) {
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState(150);
  const [currentOccupancy, setCurrentOccupancy] = useState(0);
  const [locationId, setLocationId] = useState(wards[0]?.id || "custom");
  const [customLocation, setCustomLocation] = useState("");
  const [hasMedical, setHasMedical] = useState(true);
  const [hasGenerator, setHasGenerator] = useState(true);
  const [phone, setPhone] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

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
    let finalLocName = "Relief Zone";

    if (isCustom) {
      finalLocName = customLocation.trim() || "Safe Evacuation Sector";
      finalLocId = `loc-${finalLocName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    } else {
      const selectedWard = wards.find((w) => w.id === locationId);
      finalLocName = selectedWard?.name || locationId;
    }

    onSubmit({
      name: name.trim(),
      capacity: Number(capacity) || 50,
      current_occupancy: Number(currentOccupancy) || 0,
      location_id: finalLocId,
      location_name: finalLocName,
      has_medical: hasMedical,
      has_generator: hasGenerator,
      contact_phone: phone.trim(),
      lat: lat ? parseFloat(lat) : undefined,
      lng: lng ? parseFloat(lng) : undefined,
    });

    setName("");
    setPhone("");
    setLat("");
    setLng("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg border border-gray-200 shadow-xl max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-emerald-50/50">
          <div className="flex items-center space-x-2">
            <Building className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-gray-900">
              Register Relief Camp / Shelter
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
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Camp / Shelter Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. St. Joseph Higher Secondary School Camp"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 text-gray-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Total Bed Capacity *
              </label>
              <input
                type="number"
                min={1}
                max={5000}
                required
                value={capacity}
                onChange={(e) => setCapacity(parseInt(e.target.value) || 1)}
                className="w-full text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Current Headcount / Occupancy
              </label>
              <input
                type="number"
                min={0}
                max={capacity}
                value={currentOccupancy}
                onChange={(e) => setCurrentOccupancy(parseInt(e.target.value) || 0)}
                className="w-full text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 text-gray-900"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-gray-700">
                Shelter Sector / Location *
              </label>
              {wards.length > 0 && (
                <button
                  type="button"
                  onClick={() => setLocationId(locationId === "custom" ? (wards[0]?.id || "") : "custom")}
                  className="text-[11px] text-emerald-600 hover:text-emerald-800 font-medium"
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
                  placeholder="e.g. Kalpetta North Hill Station"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  className="w-full text-sm pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-600 text-gray-900"
                />
              </div>
            )}
          </div>

          {/* Facility Checkboxes */}
          <div className="bg-gray-50 p-3 rounded-md border border-gray-200 space-y-2">
            <span className="text-xs font-semibold text-gray-700 block">
              Emergency Facilities On-Site:
            </span>
            <div className="flex items-center space-x-6 text-xs text-gray-800">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasMedical}
                  onChange={(e) => setHasMedical(e.target.checked)}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="flex items-center">
                  <HeartPulse className="w-3.5 h-3.5 mr-1 text-red-500" />
                  First-Aid / Medical Station
                </span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasGenerator}
                  onChange={(e) => setHasGenerator(e.target.checked)}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="flex items-center">
                  <Zap className="w-3.5 h-3.5 mr-1 text-amber-500" />
                  Backup Power Generator
                </span>
              </label>
            </div>
          </div>

          {/* Contact Phone & Coordinates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Camp Coordinator Phone
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  placeholder="+91 94470 12345"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-sm pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 text-gray-900"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-gray-700">
                  GPS Coordinates
                </label>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="text-[11px] text-emerald-600 hover:text-emerald-800 font-semibold"
                >
                  Auto-Detect GPS
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="number"
                  step="any"
                  placeholder="Lat (11.60)"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  className="text-xs px-2 py-1.5 border border-gray-300 rounded text-gray-800"
                />
                <input
                  type="number"
                  step="any"
                  placeholder="Lng (76.08)"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  className="text-xs px-2 py-1.5 border border-gray-300 rounded text-gray-800"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
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
                className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-sm transition-colors"
              >
                Register Shelter
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
