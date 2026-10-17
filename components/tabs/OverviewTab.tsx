"use client";

import React from "react";
import {
  AlertTriangle,
  LifeBuoy,
  Users,
  CheckCircle2,
  Building,
  Route as RouteIcon,
  Clock,
  Sparkles,
} from "lucide-react";
import {
  SOSRequest,
  Resource,
  Shelter,
  WardLocation,
  AgentLogEntry,
} from "@/lib/types";

interface OverviewTabProps {
  sosRequests: SOSRequest[];
  resources: Resource[];
  shelters: Shelter[];
  wards: WardLocation[];
  agentLogs: AgentLogEntry[];
  onNavigateTab: (tab: string) => void;
  onOpenSOSModal: () => void;
}

export function OverviewTab({
  sosRequests,
  resources,
  shelters,
  wards,
  agentLogs,
  onNavigateTab,
  onOpenSOSModal,
}: OverviewTabProps) {
  const openCount = sosRequests.filter((s) => s.status === "open").length;
  const criticalCount = sosRequests.filter((s) => s.urgency === "critical" && s.status !== "resolved").length;
  const assignedCount = sosRequests.filter((s) => s.status === "assigned").length;
  const resolvedCount = sosRequests.filter((s) => s.status === "resolved").length;

  const availableResources = resources.filter((r) => r.status === "available").length;
  const totalResources = resources.length;

  const totalShelterCap = shelters.reduce((acc, s) => acc + s.capacity, 0);
  const totalShelterOcc = shelters.reduce((acc, s) => acc + s.current_occupancy, 0);
  const remainingBeds = Math.max(0, totalShelterCap - totalShelterOcc);

  const blockedWards = wards.filter((w) => w.accessibility_status === "blocked").length;
  const floodedWards = wards.filter((w) => w.accessibility_status === "flooded").length;

  return (
    <div className="space-y-6">
      {/* Top Banner Alert if Critical SOS exist */}
      {criticalCount > 0 && (
        <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-r-md flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-900">
                {criticalCount} Critical SOS Requests Require Urgent Coordination
              </p>
              <p className="text-xs text-red-700 mt-0.5">
                Dispatch Agent is calculating fastest multi-hop routing avoiding flooded sectors.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onNavigateTab("sos")}
              className="text-xs font-semibold px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              View SOS Queue
            </button>
          </div>
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Open SOS */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Open SOS Requests
            </span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-gray-900 font-mono">
              {openCount}
            </span>
            <span className="text-xs text-red-600 font-medium">
              ({criticalCount} critical)
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
            <span>{assignedCount} currently assigned</span>
            <span className="text-emerald-600 font-medium">{resolvedCount} resolved</span>
          </div>
        </div>

        {/* Resources Available */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Available Resources
            </span>
            <LifeBuoy className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-gray-900 font-mono">
              {availableResources}
            </span>
            <span className="text-xs text-gray-500">
              / {totalResources} deployed
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
            <span>Boats: {resources.filter(r => r.type === 'boat' && r.status === 'available').length} free</span>
            <span>Ambulance: {resources.filter(r => r.type === 'ambulance' && r.status === 'available').length} free</span>
          </div>
        </div>

        {/* Shelter Occupancy */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Shelter Bed Capacity
            </span>
            <Building className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-gray-900 font-mono">
              {remainingBeds}
            </span>
            <span className="text-xs text-gray-500">
              beds available
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
            <span>Total Occupancy: {totalShelterOcc} / {totalShelterCap}</span>
            <span className="font-mono text-gray-700">
              {Math.round((totalShelterOcc / (totalShelterCap || 1)) * 100)}%
            </span>
          </div>
        </div>

        {/* Route / Ward Risk */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Zone Accessibility
            </span>
            <RouteIcon className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-gray-900 font-mono">
              {wards.length - blockedWards}
            </span>
            <span className="text-xs text-gray-500">
              / {wards.length} sectors clear
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
            <span className="text-red-600">{blockedWards} blocked</span>
            <span className="text-amber-600">{floodedWards} flooded</span>
          </div>
        </div>
      </div>

      {/* Operational Sections: Ward Status & Recent Agent Decisions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ward Operations List */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-gray-900">
                Operational Sectors & Accessibility
              </h4>
              <p className="text-xs text-gray-500">
                Live graph state of wards and emergency staging hubs
              </p>
            </div>
            <button
              onClick={() => onNavigateTab("graph")}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              Open Live Graph →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 border-y border-gray-200 font-semibold uppercase">
                <tr>
                  <th className="py-2.5 px-3">Ward Code & Name</th>
                  <th className="py-2.5 px-3">Region</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Active SOS</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {wards.map((ward) => {
                  const wardSOS = sosRequests.filter(
                    (s) => s.location_id === ward.id && s.status !== "resolved"
                  ).length;
                  return (
                    <tr key={ward.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-medium text-gray-900">
                        <span className="font-mono text-gray-500 mr-1.5">{ward.id}</span>
                        {ward.name}
                      </td>
                      <td className="py-2.5 px-3 text-gray-600">{ward.region}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium border ${
                            ward.accessibility_status === "accessible"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : ward.accessibility_status === "flooded"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          }`}
                        >
                          {ward.accessibility_status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-gray-900">
                        {wardSOS > 0 ? (
                          <span className="text-red-600">{wardSOS} pending</span>
                        ) : (
                          <span className="text-gray-400">0</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => onNavigateTab("sos")}
                          className="text-xs text-gray-600 hover:text-gray-900 font-medium"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Agent Activity Feed Preview */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h4 className="text-sm font-bold text-gray-900">
                  Agent Reasoning Trail
                </h4>
              </div>
              <button
                onClick={() => onNavigateTab("activity")}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                Full Log →
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-3">
              Automated decisions by Dispatch Agent with visible Cypher graph path.
            </p>

            <div className="space-y-3">
              {agentLogs.slice(0, 3).map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-md border border-gray-200 bg-gray-50/60 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900 font-mono">
                      {log.action}
                    </span>
                    <span className="text-[11px] text-gray-400 font-mono">
                      {log.timestamp}
                    </span>
                  </div>
                  <p className="text-gray-600 line-clamp-2 leading-relaxed">
                    {log.reasoning}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-200/60 font-mono">
                    <span>{log.model_used}</span>
                    <span className="text-emerald-600 font-semibold">Graph Verified</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">Need emergency dispatch?</span>
            <button
              onClick={onOpenSOSModal}
              className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded hover:bg-red-700 transition-colors shadow-sm"
            >
              + Broadcast SOS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
