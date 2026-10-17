"use client";

import React, { useState, useMemo } from "react";
import {
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Info,
  CheckCircle,
  AlertTriangle,
  LifeBuoy,
  Building,
  MapPin,
  X,
  Filter,
  Shield,
  Truck,
  Activity,
  Flame,
} from "lucide-react";
import { GraphData, GraphNode } from "@/lib/types";

interface LiveGraphTabProps {
  graphData: GraphData;
}

export function LiveGraphTab({ graphData }: LiveGraphTabProps) {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Deterministic 2D Orbital Layout across 850x550 canvas
  const layoutNodes = useMemo(() => {
    const width = 850;
    const height = 550;
    const centerX = width / 2;
    const centerY = height / 2;

    const nodes = graphData.nodes;

    return nodes.map((node) => {
      // 1. Center Command Hub (CrisisRoom)
      if (node.type === "CrisisRoom") {
        return { ...node, x: centerX, y: centerY };
      }

      // 2. Operational Wards in Inner Orbit (radius 160)
      if (node.type === "Location") {
        const wards = nodes.filter((n) => n.type === "Location");
        const wardIndex = wards.indexOf(node);
        const count = wards.length || 1;
        // Distribute nicely with angular tilt
        const angle = (wardIndex / count) * 2 * Math.PI - Math.PI / 4;
        const radius = 160;
        return {
          ...node,
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        };
      }

      // 3. Shelters in Mid-Orbit (radius 230)
      if (node.type === "Shelter") {
        const shelters = nodes.filter((n) => n.type === "Shelter");
        const idx = shelters.indexOf(node);
        const count = shelters.length || 1;
        const angle = (idx / count) * Math.PI * 1.2 + Math.PI / 6;
        const radius = 230;
        return {
          ...node,
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        };
      }

      // 4. Resources in Mid-Orbit (radius 240)
      if (node.type === "Resource") {
        const resources = nodes.filter((n) => n.type === "Resource");
        const idx = resources.indexOf(node);
        const count = resources.length || 1;
        const angle = (idx / count) * Math.PI + Math.PI * 0.7;
        const radius = 240;
        return {
          ...node,
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        };
      }

      // 5. Agencies in Outer Orbit (radius 270)
      if (node.type === "Agency") {
        const agencies = nodes.filter((n) => n.type === "Agency");
        const idx = agencies.indexOf(node);
        const count = agencies.length || 1;
        const angle = (idx / count) * Math.PI - Math.PI * 0.8;
        const radius = 270;
        return {
          ...node,
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        };
      }

      // 6. SOS Requests in Outer Alert Perimeter (radius 285)
      const sosList = nodes.filter((n) => n.type === "SOSRequest");
      const idx = sosList.indexOf(node);
      const count = sosList.length || 1;
      const angle = (idx / count) * Math.PI * 1.4 - Math.PI / 3;
      const radius = 285;
      return {
        ...node,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });
  }, [graphData]);

  const filteredNodes = useMemo(() => {
    if (filterType === "all") return layoutNodes;
    return layoutNodes.filter((n) => n.type === filterType);
  }, [layoutNodes, filterType]);

  const filteredNodeIds = useMemo(() => {
    return new Set(filteredNodes.map((n) => n.id));
  }, [filteredNodes]);

  const filteredEdges = useMemo(() => {
    return graphData.edges.filter(
      (e) => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target)
    );
  }, [graphData.edges, filteredNodeIds]);

  const formatLabel = (label: string, maxLen = 22) => {
    if (!label) return "";
    return label.length > maxLen ? `${label.slice(0, maxLen)}...` : label;
  };

  return (
    <div className="space-y-4">
      <style jsx>{`
        @keyframes flowForward {
          from {
            stroke-dashoffset: 48;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes pulseGlow {
          0%, 100% {
            filter: drop-shadow(0 0 2px rgba(56, 189, 248, 0.4));
          }
          50% {
            filter: drop-shadow(0 0 8px rgba(56, 189, 248, 0.9));
          }
        }
        .animated-flow {
          animation: flowForward 3s linear infinite;
        }
        .pulse-assigned {
          animation: flowForward 2s linear infinite, pulseGlow 2.5s ease-in-out infinite;
        }
      `}</style>

      {/* Canvas Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 border border-gray-200 rounded-lg shadow-sm">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-gray-700" />
          <h3 className="text-sm font-bold text-gray-900">
            FalkorDB Live Knowledge Graph
          </h3>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
            {graphData.nodes.length} nodes · {graphData.edges.length} edges
          </span>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center space-x-1.5 text-xs">
          <Filter className="w-3.5 h-3.5 text-gray-400 mr-1" />
          {[
            { label: "All Nodes", val: "all" },
            { label: "SOS Requests", val: "SOSRequest" },
            { label: "Resources", val: "Resource" },
            { label: "Wards", val: "Location" },
            { label: "Shelters", val: "Shelter" },
          ].map((item) => (
            <button
              key={item.val}
              onClick={() => setFilterType(item.val)}
              className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                filterType === item.val
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 2))}
            className="p-1.5 text-gray-600 hover:text-gray-950 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.6))}
            className="p-1.5 text-gray-600 hover:text-gray-950 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setZoomLevel(1);
              setPan({ x: 0, y: 0 });
            }}
            className="p-1.5 text-gray-600 hover:text-gray-950 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Canvas & Inspection Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Redesigned Contrast Zone Graph Canvas */}
        <div className="lg:col-span-3 bg-[#080C14] rounded-lg border border-gray-800 shadow-2xl overflow-hidden relative min-h-[580px] flex items-center justify-center">
          {/* Top Engine Badge */}
          <div className="absolute top-3 left-3 z-10 flex items-center space-x-2 text-[11px] font-mono text-gray-300 bg-gray-900/95 px-3 py-1 rounded-md border border-gray-700 shadow-sm backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>FalkorDB Traversal Engine · Live Active Graph</span>
          </div>

          <svg
            className="w-full h-[580px] select-none"
            viewBox="0 0 850 550"
          >
            <defs>
              {/* Subtle Tech Dot Grid Pattern */}
              <pattern
                id="graph-grid"
                width="36"
                height="36"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="18" cy="18" r="1" fill="#1E293B" opacity="0.7" />
              </pattern>

              {/* Node Glow Filters */}
              <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="glow-purple" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>

              {/* Arrow Marker for Directed Edges */}
              <marker
                id="arrow-cyan"
                viewBox="0 0 10 10"
                refX="22"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#38BDF8" />
              </marker>
              <marker
                id="arrow-slate"
                viewBox="0 0 10 10"
                refX="22"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#475569" />
              </marker>
            </defs>

            {/* Background Dot Grid */}
            <rect width="850" height="550" fill="url(#graph-grid)" />

            <g
              transform={`translate(${pan.x}, ${pan.y}) scale(${zoomLevel})`}
              style={{ transformOrigin: "425px 275px" }}
            >
              {/* Connecting Edges */}
              {filteredEdges.map((edge) => {
                const source = layoutNodes.find((n) => n.id === edge.source);
                const target = layoutNodes.find((n) => n.id === edge.target);
                if (!source || !target) return null;

                const isAssigned = edge.label === "ASSIGNED_TO";
                const isRoute = edge.label === "CONNECTED_BY";
                const isBlocked = edge.properties?.status === "blocked";

                const strokeColor = isAssigned
                  ? "#38BDF8"
                  : isRoute
                  ? isBlocked
                    ? "#EF4444"
                    : "#10B981"
                  : "#334155";

                const strokeWidth = isAssigned ? 2.5 : isRoute ? 2 : 1.2;

                const pathData = `M ${source.x} ${source.y} L ${target.x} ${target.y}`;

                return (
                  <g key={edge.id}>
                    {/* Background Trace Line */}
                    <path
                      d={pathData}
                      fill="none"
                      stroke="#1E293B"
                      strokeWidth={strokeWidth + 2}
                      strokeOpacity={0.6}
                    />

                    {/* Active Animated Connecting Line */}
                    <path
                      d={pathData}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      strokeDasharray={isAssigned ? "8 6" : isRoute ? "6 6" : "4 4"}
                      className={isAssigned ? "pulse-assigned" : "animated-flow"}
                      markerEnd={isAssigned ? "url(#arrow-cyan)" : "url(#arrow-slate)"}
                    />

                    {/* Edge Label Badge */}
                    <g
                      transform={`translate(${(source.x + target.x) / 2}, ${(source.y + target.y) / 2})`}
                    >
                      <rect
                        x="-30"
                        y="-8"
                        width="60"
                        height="16"
                        rx="3"
                        fill="#0B0F19"
                        stroke={strokeColor}
                        strokeWidth="0.8"
                        strokeOpacity="0.7"
                      />
                      <text
                        textAnchor="middle"
                        dy="3.5"
                        fill={isAssigned ? "#38BDF8" : "#94A3B8"}
                        fontSize="8.5"
                        fontFamily="monospace"
                        fontWeight="600"
                        letterSpacing="0.05em"
                        pointerEvents="none"
                      >
                        {edge.label}
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* Graph Nodes */}
              {filteredNodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                const isHovered = hoveredNode?.id === node.id;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={() => setSelectedNode(node)}
                    onMouseEnter={() => setHoveredNode(node)}
                    onMouseLeave={() => setHoveredNode(null)}
                    className="cursor-pointer"
                  >
                    {/* Rock-Solid Transparent Hit Target (Completely prevents hover flickering!) */}
                    <circle r="36" fill="transparent" pointerEvents="all" />

                    {/* Selection Active Ring */}
                    {isSelected && (
                      <circle
                        r="32"
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                        className="animate-spin"
                        style={{ animationDuration: "10s" }}
                        pointerEvents="none"
                      />
                    )}

                    {/* Node Visual Shape by Type */}
                    {node.type === "CrisisRoom" ? (
                      /* 1. Command Hub: Large Hex/Octagon Card */
                      <g pointerEvents="none" filter="url(#glow-purple)">
                        <circle
                          r="25"
                          fill="#4F46E5"
                          stroke={isHovered ? "#A5B4FC" : "#818CF8"}
                          strokeWidth="2.5"
                          className="transition-colors"
                        />
                        <circle r="19" fill="#3730A3" />
                        {/* Command Core Icon */}
                        <path
                          d="M -3 -8 L 4 0 L -1 0 L 2 8 L -4 0 L 0 0 Z"
                          fill="#FFFFFF"
                        />
                      </g>
                    ) : node.type === "Location" ? (
                      /* 2. Ward Location: Shielded Sector Pod */
                      <g pointerEvents="none">
                        <circle
                          r="20"
                          fill="#1E293B"
                          stroke={
                            node.properties?.accessibility_status === "blocked"
                              ? "#EF4444"
                              : node.properties?.accessibility_status === "flooded"
                              ? "#F59E0B"
                              : isHovered
                              ? "#94A3B8"
                              : "#64748B"
                          }
                          strokeWidth={isHovered ? "2.5" : "1.8"}
                          className="transition-colors"
                        />
                        {/* Map Pin Icon Vector */}
                        <path
                          d="M 0 -8 C -4 -8 -6 -5 -6 -2 C -6 3 0 8 0 8 C 0 8 6 3 6 -2 C 6 -5 4 -8 0 -8 Z"
                          fill={
                            node.properties?.accessibility_status === "blocked"
                              ? "#EF4444"
                              : node.properties?.accessibility_status === "flooded"
                              ? "#F59E0B"
                              : "#38BDF8"
                          }
                        />
                        <circle cx="0" cy="-3" r="2" fill="#0F172A" />
                      </g>
                    ) : node.type === "SOSRequest" ? (
                      /* 3. Emergency SOS: Vibrant Alert Beacon */
                      <g
                        pointerEvents="none"
                        filter={
                          node.properties?.urgency === "critical"
                            ? "url(#glow-red)"
                            : undefined
                        }
                      >
                        <circle
                          r="20"
                          fill={
                            node.properties?.urgency === "critical"
                              ? "#DC2626"
                              : "#D97706"
                          }
                          stroke={isHovered ? "#FFFFFF" : "#FCA5A5"}
                          strokeWidth="2"
                          className="transition-colors"
                        />
                        {/* Alert Flame / Siren Vector */}
                        <path
                          d="M -6 6 L 6 6 L 0 -6 Z"
                          fill="#FFFFFF"
                          stroke="#FFFFFF"
                          strokeWidth="0.8"
                        />
                        <line
                          x1="0"
                          y1="-2"
                          x2="0"
                          y2="2"
                          stroke="#DC2626"
                          strokeWidth="1.5"
                        />
                        <circle cx="0" cy="4" r="0.8" fill="#DC2626" />
                      </g>
                    ) : node.type === "Resource" ? (
                      /* 4. Resource: High-Tech Asset Pod */
                      <g pointerEvents="none" filter="url(#glow-cyan)">
                        <rect
                          x="-18"
                          y="-18"
                          width="36"
                          height="36"
                          rx="8"
                          fill="#0E7490"
                          stroke={isHovered ? "#A5F3FC" : "#38BDF8"}
                          strokeWidth="2"
                          className="transition-colors"
                        />
                        {/* LifeBuoy / Raft Vector */}
                        <circle
                          cx="0"
                          cy="0"
                          r="8"
                          fill="none"
                          stroke="#FFFFFF"
                          strokeWidth="2.5"
                        />
                        <line x1="-8" y1="0" x2="-3" y2="0" stroke="#FFFFFF" strokeWidth="2" />
                        <line x1="3" y1="0" x2="8" y2="0" stroke="#FFFFFF" strokeWidth="2" />
                        <line x1="0" y1="-8" x2="0" y2="-3" stroke="#FFFFFF" strokeWidth="2" />
                        <line x1="0" y1="3" x2="0" y2="8" stroke="#FFFFFF" strokeWidth="2" />
                      </g>
                    ) : node.type === "Shelter" ? (
                      /* 5. Shelter: Relief Sanctuary Cross */
                      <g pointerEvents="none">
                        <rect
                          x="-18"
                          y="-18"
                          width="36"
                          height="36"
                          rx="8"
                          fill="#065F46"
                          stroke={isHovered ? "#6EE7B7" : "#10B981"}
                          strokeWidth="2"
                          className="transition-colors"
                        />
                        {/* Medical Cross Vector */}
                        <rect x="-3" y="-8" width="6" height="16" rx="1" fill="#FFFFFF" />
                        <rect x="-8" y="-3" width="16" height="6" rx="1" fill="#FFFFFF" />
                      </g>
                    ) : (
                      /* 6. Agency: Official Government/NGO Shield */
                      <g pointerEvents="none">
                        <polygon
                          points="0,-18 16,-10 12,14 0,20 -12,14 -16,-10"
                          fill="#312E81"
                          stroke={isHovered ? "#C7D2FE" : "#6366F1"}
                          strokeWidth="1.8"
                          className="transition-colors"
                        />
                        <polygon
                          points="0,-12 10,-6 7,9 0,14 -7,9 -10,-6"
                          fill="#4338CA"
                        />
                      </g>
                    )}

                    {/* Node Text Label (Cleanly formatted & truncated) */}
                    <g pointerEvents="none" transform="translate(0, 30)">
                      <rect
                        x="-65"
                        y="-2"
                        width="130"
                        height="18"
                        rx="4"
                        fill="#050811"
                        fillOpacity="0.85"
                        stroke={isSelected ? "#FFFFFF" : isHovered ? "#94A3B8" : "#1E293B"}
                        strokeWidth={isSelected ? "1.2" : "0.6"}
                      />
                      <text
                        textAnchor="middle"
                        dy="11"
                        fill={isSelected ? "#FFFFFF" : isHovered ? "#E2E8F0" : "#94A3B8"}
                        fontSize="9"
                        fontFamily="system-ui"
                        fontWeight={isSelected || isHovered ? "600" : "400"}
                      >
                        {formatLabel(node.label)}
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Redesigned Legend Bottom Bar */}
          <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between text-[11px] font-mono text-gray-300 bg-gray-900/95 px-4 py-2 rounded-md border border-gray-800 shadow-md backdrop-blur-sm">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm" />
                <span className="text-gray-300">SOS Alert</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 shadow-sm" />
                <span className="text-gray-300">Resource</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shadow-sm" />
                <span className="text-gray-300">Ward</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 shadow-sm" />
                <span className="text-gray-300">Shelter</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 shadow-sm" />
                <span className="text-gray-300">Agency</span>
              </span>
            </div>
            <span className="text-gray-400 hidden sm:inline">
              Click any node to inspect live Cypher properties
            </span>
          </div>
        </div>

        {/* Node Inspection Sidebar Panel */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <Info className="w-4 h-4 text-gray-700" />
                <h4 className="text-sm font-bold text-gray-900">
                  Node Inspector
                </h4>
              </div>
              {selectedNode && (
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-gray-400 hover:text-gray-600 p-0.5 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {selectedNode ? (
              <div className="mt-4 space-y-4 text-xs">
                <div>
                  <span className="text-gray-500 uppercase tracking-wider font-semibold text-[10px]">
                    Node Type
                  </span>
                  <div className="mt-1 flex items-center space-x-2">
                    <span className="font-mono font-bold text-gray-900 text-sm">
                      {selectedNode.type}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-gray-500 uppercase tracking-wider font-semibold text-[10px]">
                    Identifier & Label
                  </span>
                  <p className="mt-0.5 font-medium text-gray-900 text-sm leading-snug">
                    {selectedNode.label}
                  </p>
                  <p className="font-mono text-gray-400 text-[11px] mt-0.5">
                    id: {selectedNode.id}
                  </p>
                </div>

                <div>
                  <span className="text-gray-500 uppercase tracking-wider font-semibold text-[10px]">
                    Live Graph Properties
                  </span>
                  <div className="mt-1.5 bg-gray-50 p-3 rounded-md border border-gray-200 font-mono text-[11px] space-y-1.5">
                    {Object.entries(selectedNode.properties || {}).map(([k, v]) => (
                      <div key={k} className="flex justify-between border-b border-gray-100 pb-1 last:border-none last:pb-0">
                        <span className="text-gray-500">{k}:</span>
                        <span className="font-semibold text-gray-900 ml-2 text-right truncate max-w-[140px]">
                          {String(v)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-gray-500 uppercase tracking-wider font-semibold text-[10px]">
                    Connected Relationships
                  </span>
                  <div className="mt-1.5 space-y-1 font-mono text-[11px] max-h-48 overflow-y-auto">
                    {graphData.edges
                      .filter(
                        (e) =>
                          e.source === selectedNode.id || e.target === selectedNode.id
                      )
                      .map((edge) => (
                        <div
                          key={edge.id}
                          className="p-1.5 rounded bg-gray-50 border border-gray-200 text-gray-700 flex items-center justify-between"
                        >
                          <span className="text-blue-600 font-semibold">{edge.label}</span>
                          <span className="text-gray-500 text-[10px] truncate max-w-[120px]">
                            {edge.source === selectedNode.id ? `→ ${edge.target}` : `← ${edge.source}`}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-gray-400">
                <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-300 stroke-1" />
                <p className="text-xs font-medium text-gray-600">No node selected</p>
                <p className="text-[11px] text-gray-400 mt-1 max-w-[200px] mx-auto">
                  Click on any node in the live graph canvas to inspect its schema properties and Cypher edges.
                </p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-gray-100 text-[11px] text-gray-400 font-mono">
            Direct Cypher projection via FalkorDB engine.
          </div>
        </div>
      </div>
    </div>
  );
}
