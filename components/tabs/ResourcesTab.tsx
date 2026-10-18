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
  Phone,
  Plus,
  Zap,
  Radio,
} from "lucide-react";
import { Resource, ResourceType, ResourceStatus } from "@/lib/types";

interface ResourcesTabProps {
  resources: Resource[];
  onOpenAddResourceModal?: () => void;
  onUpdateStatus?: (resourceId: string, status: ResourceStatus) => void;
}

export function ResourcesTab({
  resources,
  onOpenAddResourceModal,
  onUpdateStatus,
}: ResourcesTabProps) {
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
      case "generator":
        return <Zap className="w-4 h-4 text-yellow-600" />;
      case "drone":
        return <Radio className="w-4 h-4 text-purple-600" />;
      default:
        return <LifeBuoy className="w-4 h-4 text-blue-600" />;
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
        <div className="flex flex-wrap items-center gap-3">
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
              <option value="generator">Generators</option>
              <option value="drone">Drones</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-gray-500 uppercase">
              Status:
            </span>
            <div className="flex items-center border border-gray-200 rounded-md overflow-hidden bg-gray-50 text-xs">
              {["all", "available", "assigned", "maintenance"].map((st) => (
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

        {onOpenAddResourceModal && (
          <button
            onClick={onOpenAddResourceModal}
            className="inline-flex items-center px-3.5 py-1.5 text-xs font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            + Register Resource / Fleet
          </button>
        )}
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
                <th className="py-3 px-4">Capacity</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Status & Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length > 0 ? (
                filtered.map((res) => (
                  <tr key={res.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900">{res.name}</div>
                      <div className="font-mono text-gray-400 text-[11px]">{res.id}</div>
                      {res.notes && (
                        <div className="text-[11px] text-gray-500 italic mt-0.5">{res.notes}</div>
                      )}
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
                      {res.lat && res.lng ? (
                        <div className="text-[10px] text-gray-400 font-mono">
                          {res.lat.toFixed(3)}, {res.lng.toFixed(3)}
                        </div>
                      ) : null}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-gray-900 whitespace-nowrap">
                      {res.capacity ? `${res.capacity} units` : "N/A"}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {res.contact_phone ? (
                        <a
                          href={`tel:${res.contact_phone}`}
                          className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-mono text-[11px] font-semibold"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{res.contact_phone}</span>
                        </a>
                      ) : (
                        <span className="text-gray-400 text-[11px]">Unlisted</span>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {onUpdateStatus ? (
                        <select
                          value={res.status}
                          onChange={(e) => onUpdateStatus(res.id, e.target.value as ResourceStatus)}
                          className={`text-xs px-2 py-1 rounded font-semibold border ${
                            res.status === "available"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : res.status === "assigned"
                              ? "bg-blue-50 text-blue-800 border-blue-200"
                              : "bg-gray-100 text-gray-700 border-gray-300"
                          }`}
                        >
                          <option value="available">Available / Ready</option>
                          <option value="assigned">En Route / Deployed</option>
                          <option value="maintenance">Maintenance</option>
                        </select>
                      ) : (
                        getStatusBadge(res.status)
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    No resources matching filters. Click "+ Register Resource" to onboard new emergency fleet.
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
