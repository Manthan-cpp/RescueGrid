"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Plus,
  Filter,
  Users,
  MapPin,
  Clock,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { SOSRequest, WardLocation, SOSStatus } from "@/lib/types";

interface SOSRequestsTabProps {
  sosRequests: SOSRequest[];
  wards: WardLocation[];
  onOpenSOSModal: () => void;
  onResolveSOS?: (sosId: string) => void;
}

export function SOSRequestsTab({
  sosRequests,
  wards,
  onOpenSOSModal,
  onResolveSOS,
}: SOSRequestsTabProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [wardFilter, setWardFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredRequests = sosRequests.filter((req) => {
    if (statusFilter !== "all" && req.status !== statusFilter) return false;
    if (wardFilter !== "all" && req.location_id !== wardFilter) return false;
    if (
      searchQuery.trim() &&
      !req.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !req.id.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800 border border-red-200 uppercase font-mono">
            Critical
          </span>
        );
      case "high":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200 uppercase font-mono">
            High
          </span>
        );
      case "medium":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200 uppercase font-mono">
            Medium
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700 border border-gray-200 uppercase font-mono">
            Low
          </span>
        );
    }
  };

  const getStatusBadge = (status: SOSStatus) => {
    switch (status) {
      case "open":
        return (
          <span className="inline-flex items-center text-xs font-semibold text-red-600">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 mr-1.5 animate-ping" />
            Open (Unassigned)
          </span>
        );
      case "assigned":
        return (
          <span className="inline-flex items-center text-xs font-semibold text-blue-600">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mr-1.5" />
            Resource Dispatched
          </span>
        );
      case "resolved":
        return (
          <span className="inline-flex items-center text-xs font-semibold text-emerald-600">
            <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            Resolved
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Header & Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search & Ward Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Search SOS by ID, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 w-56 text-gray-900"
          />

          <select
            value={wardFilter}
            onChange={(e) => setWardFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 text-gray-700"
          >
            <option value="all">All Operational Wards</option>
            {wards.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter Tabs & Broadcast Button */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center border border-gray-200 rounded-md overflow-hidden bg-gray-50 text-xs">
            {["all", "open", "assigned", "resolved"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 font-medium capitalize transition-colors ${
                  statusFilter === st
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenSOSModal}
            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            + New SOS
          </button>
        </div>
      </div>

      {/* SOS Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">SOS ID</th>
                <th className="py-3 px-4">Urgency</th>
                <th className="py-3 px-4">Situation & Location</th>
                <th className="py-3 px-4">People</th>
                <th className="py-3 px-4">Status & Assignment</th>
                <th className="py-3 px-4">Reported</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-gray-900 whitespace-nowrap">
                      {req.id}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getUrgencyBadge(req.urgency)}
                    </td>
                    <td className="py-3 px-4 max-w-sm">
                      <p className="font-medium text-gray-900 leading-snug">
                        {req.description}
                      </p>
                      <div className="mt-1 flex items-center text-gray-500 text-[11px] space-x-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span>{req.location_name || req.location_id}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-800 font-mono font-medium">
                        <Users className="w-3 h-3 mr-1 text-gray-500" />
                        {req.people_count || 1}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div>{getStatusBadge(req.status)}</div>
                      {req.assigned_resource_name && (
                        <p className="mt-1 text-[11px] font-mono text-gray-600">
                          ↳ {req.assigned_resource_name}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-500 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span>{req.timestamp}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {req.status !== "resolved" && onResolveSOS ? (
                        <button
                          onClick={() => onResolveSOS(req.id)}
                          className="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition-colors"
                        >
                          Mark Resolved
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs">Completed</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    No SOS requests matching the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
