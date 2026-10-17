"use client";

import React, { useState } from "react";
import {
  LifeBuoy,
  Truck,
  Package,
  HeartPulse,
  Home,
  CheckCircle,
  Clock,
  MapPin,
  Building2,
} from "lucide-react";
import { Resource, ResourceType, ResourceStatus } from "@/lib/types";

interface ResourcesTabProps {
  resources: Resource[];
}

export function ResourcesTab({ resources }: ResourcesTabProps) {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = resources.filter((r) => {
    if (typeFilter !== "all" && r.type !== typeFilter) return false;
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    return true;
  });

  const getResourceTypeIcon = (type: ResourceType) => {
    switch (type) {
      case "boat":
        return <LifeBuoy className="w-4 h-4 text-blue-600" />;
      case "ambulance":
        return <Truck className="w-4 h-4 text-red-600" />;
      case "food":
        return <Package className="w-4 h-4 text-amber-600" />;
      case "medicine":
        return <HeartPulse className="w-4 h-4 text-rose-600" />;
      case "shelter_bed":
        return <Home className="w-4 h-4 text-emerald-600" />;
    }
  };

  const getStatusBadge = (status: ResourceStatus) => {
    switch (status) {
      case "available":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
            Available / Ready
          </span>
        );
      case "assigned":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5 animate-pulse" />
            En Route / Deployed
          </span>
        );
      case "maintenance":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
            Maintenance
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Controls */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-gray-500 uppercase">
            Filter by Type:
          </span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 text-gray-900 font-medium"
          >
            <option value="all">All Resources ({resources.length})</option>
            <option value="boat">Rescue Boats</option>
            <option value="ambulance">Ambulances</option>
            <option value="food">Ration Packs</option>
            <option value="medicine">Medical Kits</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-gray-500 uppercase">
            Status:
          </span>
          <div className="flex items-center border border-gray-200 rounded-md overflow-hidden bg-gray-50 text-xs">
            {["all", "available", "assigned"].map((st) => (
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
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">Resource ID & Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Operating Agency</th>
                <th className="py-3 px-4">Staging Location</th>
                <th className="py-3 px-4">Capacity / Payload</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((res) => (
                <tr key={res.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-gray-900">{res.name}</div>
                    <div className="font-mono text-gray-400 text-[11px]">{res.id}</div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1.5 font-medium text-gray-800 capitalize">
                      {getResourceTypeIcon(res.type)}
                      <span>{res.type}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      <Building2 className="w-3.5 h-3.5 text-gray-400" />
                      <span>{res.agency_name || res.agency_id}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span>{res.location_name || res.location_id}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-gray-900 whitespace-nowrap">
                    {res.capacity ? `${res.capacity} units` : "N/A"}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {getStatusBadge(res.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
