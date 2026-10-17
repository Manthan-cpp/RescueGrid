"use client";

import React, { useState } from "react";
import {
  Sparkles,
  GitCommit,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Search,
  Filter,
} from "lucide-react";
import { AgentLogEntry } from "@/lib/types";

interface AgentActivityTabProps {
  logs: AgentLogEntry[];
}

export function AgentActivityTab({ logs }: AgentActivityTabProps) {
  const [filterModel, setFilterModel] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredLogs = logs.filter((log) => {
    if (filterModel !== "all" && !log.model_used.includes(filterModel)) return false;
    if (
      searchQuery.trim() &&
      !log.action.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !log.reasoning.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Top Bar with hackathon brief alignment callout */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-gray-900">
              Agent Activity & Autonomous Reasoning Log
            </h3>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Demonstrating Hackathon Track 1 & 2: Agents acting on connected data + cross-agent memory.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="text"
            placeholder="Filter by action or reasoning..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 w-52 text-gray-900"
          />

          <select
            value={filterModel}
            onChange={(e) => setFilterModel(e.target.value)}
            className="text-xs px-2.5 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 text-gray-700"
          >
            <option value="all">All Models</option>
            <option value="Gemini">Gemini Flash (Dispatch)</option>
            <option value="Groq">Groq LLaMA (Query)</option>
          </select>
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="space-y-3">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:border-gray-300 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      log.status === "warning" ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                  />
                  <span className="text-xs font-bold text-gray-900 font-mono">
                    {log.action}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
                    {log.agent}
                  </span>
                </div>

                <div className="flex items-center space-x-3 text-xs font-mono text-gray-500">
                  <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-semibold">
                    {log.model_used}
                  </span>
                  <span>{log.timestamp}</span>
                </div>
              </div>

              {/* Reasoning Trail (The "Show the path behind an answer" requirement) */}
              <div className="mt-3">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                  Autonomous Reasoning Path & Graph Evaluation:
                </span>
                <p className="text-xs text-gray-800 leading-relaxed bg-gray-50 p-3 rounded border border-gray-200/80 font-sans">
                  {log.reasoning}
                </p>
              </div>

              {/* Target Nodes / Graph Impact */}
              {(log.sos_id || log.resource_id) && (
                <div className="mt-3 flex items-center space-x-4 text-xs font-mono text-gray-600">
                  {log.sos_id && (
                    <span className="flex items-center space-x-1">
                      <span className="text-gray-400">Target SOS:</span>
                      <span className="font-bold text-red-600">{log.sos_id}</span>
                    </span>
                  )}
                  {log.resource_id && (
                    <span className="flex items-center space-x-1">
                      <span className="text-gray-400">Resource:</span>
                      <span className="font-bold text-cyan-600">{log.resource_id}</span>
                    </span>
                  )}
                  <span className="flex items-center space-x-1 text-emerald-600 ml-auto font-sans text-[11px] font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>State persisted directly to FalkorDB</span>
                  </span>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center text-gray-400">
            No agent logs found.
          </div>
        )}
      </div>
    </div>
  );
}
