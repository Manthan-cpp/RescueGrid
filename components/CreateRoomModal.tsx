"use client";

import React, { useState } from "react";
import { X, Building2, MapPin, Layers } from "lucide-react";
import { CrisisRoom } from "@/lib/types";

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (room: CrisisRoom) => void;
}

export function CreateRoomModal({ isOpen, onClose, onCreate }: CreateRoomModalProps) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [zones, setZones] = useState("Sector 1, Sector 2, River Basin, Relief Hub");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !location.trim()) return;

    const newRoom: CrisisRoom = {
      id: `room-${Date.now()}`,
      name: name.trim(),
      location: location.trim(),
      created_at: new Date().toISOString(),
      status: "active",
    };

    onCreate(newRoom);
    setName("");
    setLocation("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg border border-gray-200 shadow-xl max-w-md w-full overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-gray-700" />
            <h3 className="text-base font-bold text-gray-900">
              Create New Crisis Room
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Crisis Room Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Wayanad Landslide Rapid Ops"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Geographic Region / Location *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                placeholder="e.g., Wayanad District, Kerala"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full text-sm pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Initial Operational Zones / Wards (comma separated)
            </label>
            <div className="relative">
              <Layers className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Sector 1, Chooralmala, Kalpetta Hub"
                value={zones}
                onChange={(e) => setZones(e.target.value)}
                className="w-full text-sm pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Creates foundational Location nodes and connects them to this Crisis Room.
            </p>
          </div>

          <div className="pt-2 border-t border-gray-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-gray-950 hover:bg-gray-800 rounded-md shadow-sm transition-colors"
            >
              Initialize Room & Graph
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
