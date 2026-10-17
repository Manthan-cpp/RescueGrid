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
} from "lucide-react";
import { GraphData, GraphNode } from "@/lib/types";

interface LiveGraphTabProps {
  graphData: GraphData;
}

export function LiveGraphTab({ graphData }: LiveGraphTabProps) {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Calculate coordinates in a circular/force-like deterministic layout
  const layoutNodes = useMemo(() => {
    const width = 800;
    const height = 500;
    const centerX = width / 2;
    const centerY = height / 2;

    const nodes = graphData.nodes;
    const total = nodes.length;

    return nodes.map((node, index) => {
      // Pin CrisisRoom to center
      if (node.type === "CrisisRoom") {
        return { ...node, x: centerX, y: centerY };
      }

      // Wards in inner orbit
      if (node.type === "Location") {
        const wardIndex = nodes.filter(n => n.type === "Location").indexOf(node);
        const wardCount = nodes.filter(n => n.type === "Location").length;
        const angle = (wardIndex / (wardCount || 1)) * 2 * Math.PI;
        const radius = 160;
        return {
          ...node,
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        };
      }

      // SOS, Resources, Shelters in outer orbit connected to wards
      const angle = (index / total) * 2 * Math.PI;
      const radius = 260 + (index % 3) * 35;
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

  const getNodeColor = (node: GraphNode) => {
    switch (node.type) {
      case "CrisisRoom":
        return "#818CF8"; // Indigo
      case "Location":
        return "#94A3B8"; // Slate
      case "SOSRequest":
        return node.properties?.urgency === "critical"
          ? "#EF4444" // Bright Red
          : "#F59E0B"; // Amber
      case "Resource":
        return "#06B6D4"; // Cyan
      case "Shelter":
        return "#10B981"; // Emerald
      default:
        return "#9CA3AF";
    }
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case "SOSRequest":
        return "🚨";
      case "Resource":
        return "🚤";
      case "Shelter":
        return "🏥";
      case "Location":
        return "📍";
      case "CrisisRoom":
        return "⚡";
      default:
        return "•";
    }
  };

  return (
    <div className="space-y-4">
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
            className="p-1.5 text-gray-600 hover:text-gray-950 border border-gray-200 rounded hover:bg-gray-50"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.6))}
            className="p-1.5 text-gray-600 hover:text-gray-950 border border-gray-200 rounded hover:bg-gray-50"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setZoomLevel(1);
              setPan({ x: 0, y: 0 });
            }}
            className="p-1.5 text-gray-600 hover:text-gray-950 border border-gray-200 rounded hover:bg-gray-50"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Canvas & Inspection Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Contrast Zone Graph Canvas (Dark background per DESIGN.md) */}
        <div className="lg:col-span-3 bg-[#0B0F17] rounded-lg border border-gray-800 shadow-inner overflow-hidden relative min-h-[560px] flex items-center justify-center">
          <div className="absolute top-3 left-3 z-10 flex items-center space-x-2 text-[11px] font-mono text-gray-400 bg-gray-900/90 px-2.5 py-1 rounded border border-gray-700">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>FalkorDB Cypher Engine · Active Traversals</span>
          </div>

          <svg
            className="w-full h-[560px] cursor-grab active:cursor-grabbing select-none"
            viewBox="0 0 800 500"
          >
            <g
              transform={`translate(${pan.x}, ${pan.y}) scale(${zoomLevel})`}
              transform-origin="400 250"
            >
              {/* Edges */}
              {filteredEdges.map((edge) => {
                const sourceNode = layoutNodes.find((n) => n.id === edge.source);
                const targetNode = layoutNodes.find((n) => n.id === edge.target);
                if (!sourceNode || !targetNode) return null;

                const isAssigned = edge.label === "ASSIGNED_TO";
                return (
                  <g key={edge.id} className="transition-all duration-300">
                    <line
                      x1={sourceNode.x}
                      y1={sourceNode.y}
                      x2={targetNode.x}
                      y2={targetNode.y}
                      stroke={isAssigned ? "#38BDF8" : "#334155"}
                      strokeWidth={isAssigned ? 2.5 : 1.2}
                      strokeDasharray={isAssigned ? "4 3" : undefined}
                      className={isAssigned ? "animate-pulse" : ""}
                    />
                    {/* Edge Label */}
                    <text
                      x={(sourceNode.x + targetNode.x) / 2}
                      y={(sourceNode.y + targetNode.y) / 2 - 4}
                      fill="#64748B"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {edge.label}
                    </text>
                  </g>
                );
              })}

              {/* Nodes */}
              {filteredNodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                const nodeColor = getNodeColor(node);

                return (
                  <g
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className="cursor-pointer group transition-transform duration-200 hover:scale-110"
                    transform={`translate(${node.x}, ${node.y})`}
                  >
                    {/* Selection halo */}
                    {isSelected && (
                      <circle
                        r={24}
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth={2}
                        strokeDasharray="3 3"
                        className="animate-spin"
                      />
                    )}

                    {/* Node circle */}
                    <circle
                      r={node.type === "CrisisRoom" ? 20 : 15}
                      fill={nodeColor}
                      stroke="#0B0F17"
                      strokeWidth={2}
                      className="shadow-lg transition-colors"
                    />

                    {/* Node inner symbol */}
                    <text
                      textAnchor="middle"
                      dy="4"
                      fontSize="10"
                      fill="#FFFFFF"
                      pointerEvents="none"
                    >
                      {getNodeIcon(node.type)}
                    </text>

                    {/* Node Label */}
                    <text
                      y={26}
                      textAnchor="middle"
                      fill={isSelected ? "#FFFFFF" : "#CBD5E1"}
                      fontSize="10"
                      fontWeight={isSelected ? "600" : "400"}
                      fontFamily="system-ui"
                      className="transition-colors drop-shadow"
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Legend Bottom Bar */}
          <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between text-[11px] font-mono text-gray-400 bg-gray-900/90 px-3 py-1.5 rounded border border-gray-800">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                <span>Critical SOS</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
                <span>Resource</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" />
                <span>Ward / Location</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                <span>Shelter</span>
              </span>
            </div>
            <span className="text-gray-500 hidden sm:inline">
              Click any node to inspect properties & connected edges
            </span>
          </div>
        </div>

        {/* Node Inspection Sidebar Panel (DESIGN.md requirement: Side panel, not modal!) */}
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
                  className="text-gray-400 hover:text-gray-600 p-0.5 rounded"
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
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: getNodeColor(selectedNode) }}
                    />
                    <span className="font-mono font-bold text-gray-900 text-sm">
                      {selectedNode.type}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-gray-500 uppercase tracking-wider font-semibold text-[10px]">
                    Label / Identifier
                  </span>
                  <p className="mt-0.5 font-medium text-gray-900 text-sm">
                    {selectedNode.label}
                  </p>
                  <p className="font-mono text-gray-400 text-[11px]">
                    id: {selectedNode.id}
                  </p>
                </div>

                <div>
                  <span className="text-gray-500 uppercase tracking-wider font-semibold text-[10px]">
                    Graph Properties
                  </span>
                  <div className="mt-1.5 bg-gray-50 p-2.5 rounded border border-gray-200 font-mono text-[11px] space-y-1">
                    {Object.entries(selectedNode.properties || {}).map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-gray-500">{k}:</span>
                        <span className="font-semibold text-gray-900">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-gray-500 uppercase tracking-wider font-semibold text-[10px]">
                    Connected Relationships
                  </span>
                  <div className="mt-1.5 space-y-1 font-mono text-[11px]">
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
                          <span className="text-gray-500">
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
