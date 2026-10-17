"use client";

import React, { useState } from "react";
import { X, AlertTriangle, Users, MapPin, FileText } from "lucide-react";
import { SOSRequest, SOSUrgency, WardLocation } from "@/lib/types";

interface NewSOSModalProps {
  isOpen: boolean;
  wards: WardLocation[];
  onClose: () => void;
  onSubmit: (sos: Partial<SOSRequest>) => void;
}

export function NewSOSModal({
  isOpen,
  wards,
  onClose,
  onSubmit,
}: NewSOSModalProps) {
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState<SOSUrgency>("high");
  const [locationId, setLocationId] = useState(wards[0]?.id || "");
  const [peopleCount, setPeopleCount] = useState(2);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const selectedWard = wards.find((w) => w.id === locationId);

    onSubmit({
      description: description.trim(),
      urgency,
      location_id: locationId,
      location_name: selectedWard?.name || "Target Ward",
      people_count: Number(peopleCount),
      status: "open",
    });

    setDescription("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg border border-gray-200 shadow-xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-red-50/50">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="text-base font-bold text-gray-900">
              Broadcast Emergency SOS Request
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 rounded p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Situation Description *
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <textarea
                required
                rows={3}
                placeholder="Describe current emergency: water level, injuries, structural damage, trapped individuals..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-sm pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-600 focus:border-red-600 text-gray-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Urgency Level *
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as SOSUrgency)}
                className="w-full text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900 font-medium"
              >
                <option value="critical">Critical (Immediate Life Risk)</option>
                <option value="high">High (Rapidly Rising Risk)</option>
                <option value="medium">Medium (Supplies / Non-Urgent)</option>
                <option value="low">Low (Information / Standby)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Number of Trapped / At-Risk People
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={peopleCount}
                  onChange={(e) => setPeopleCount(parseInt(e.target.value) || 1)}
                  className="w-full text-sm pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Location / Ward *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full text-sm pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900"
              >
                {wards.map((ward) => (
                  <option key={ward.id} value={ward.id}>
                    {ward.name} ({ward.accessibility_status})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500 font-mono">
              ⚡ Will trigger live Gemini Dispatch Agent matching
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
                className="px-4 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md shadow-sm transition-colors"
              >
                Broadcast to Graph
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
