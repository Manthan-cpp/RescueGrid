"use client";

import React, { useState } from "react";
import { X, AlertTriangle, Route as RouteIcon, MapPin, FileText } from "lucide-react";
import { RouteStatus, WardLocation } from "@/lib/types";

interface ReportHazardModalProps {
  isOpen: boolean;
  wards: WardLocation[];
  onClose: () => void;
  onSubmit: (hazard: { from_location_id: string; to_location_id: string; status: RouteStatus; notes?: string }) => void;
}

export function ReportHazardModal({
  isOpen,
  wards,
  onClose,
  onSubmit,
}: ReportHazardModalProps) {
  const [fromLocId, setFromLocId] = useState(wards[0]?.id || "");
  const [toLocId, setToLocId] = useState(wards[1]?.id || wards[0]?.id || "");
  const [status, setStatus] = useState<RouteStatus>("blocked");
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromLocId || !toLocId || fromLocId === toLocId) {
      alert("Please select two distinct locations/wards for the route.");
      return;
    }

    onSubmit({
      from_location_id: fromLocId,
      to_location_id: toLocId,
      status,
      notes: notes.trim(),
    });

    setNotes("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg border border-gray-200 shadow-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-amber-50/50">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-bold text-gray-900">
              Report Road Hazard / Accessibility
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                From Sector *
              </label>
              <select
                value={fromLocId}
                onChange={(e) => setFromLocId(e.target.value)}
                className="w-full text-xs px-2.5 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 text-gray-900"
              >
                {wards.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                To Sector *
              </label>
              <select
                value={toLocId}
                onChange={(e) => setToLocId(e.target.value)}
                className="w-full text-xs px-2.5 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 text-gray-900"
              >
                {wards.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Passage Status *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as RouteStatus)}
              className="w-full text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 text-gray-900 font-semibold"
            >
              <option value="blocked">⛔ Blocked (Mudslide / Tree / Bridge Collapse)</option>
              <option value="restricted">⚠️ Flooded / Restricted (Water Level High)</option>
              <option value="clear">✅ Clear / Passable (Road Restored)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Field Hazard Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Eastern bypass bridge inundated with 2m flood water; 4x4 or boats only."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 text-gray-900"
            />
          </div>

          <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[11px] text-gray-500 font-mono">
              Updates routing graph in FalkorDB
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
                className="px-4 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-md shadow-sm transition-colors"
              >
                Update Route Edge
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
