"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  Building2,
  Plus,
  ArrowRight,
  Radio,
  MapPin,
  Clock,
  Layers,
  Sparkles,
  HelpCircle,
  Activity,
  LifeBuoy,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { CreateRoomModal } from "@/components/CreateRoomModal";
import { NewSOSModal } from "@/components/NewSOSModal";
import { OverviewTab } from "@/components/tabs/OverviewTab";
import { LiveGraphTab } from "@/components/tabs/LiveGraphTab";
import { SOSRequestsTab } from "@/components/tabs/SOSRequestsTab";
import { ResourcesTab } from "@/components/tabs/ResourcesTab";
import { AskBrainTab } from "@/components/tabs/AskBrainTab";
import { AgentActivityTab } from "@/components/tabs/AgentActivityTab";
import {
  FIXTURE_ROOMS,
  FIXTURE_WARDS,
  FIXTURE_SHELTERS,
  FIXTURE_RESOURCES,
  FIXTURE_SOS_REQUESTS,
  FIXTURE_AGENT_LOGS,
  FIXTURE_CHAT_MESSAGES,
  FIXTURE_GRAPH_DATA,
} from "@/lib/fixtures";
import { CrisisRoom, SOSRequest, Resource, ChatMessage, AgentLogEntry, GraphData } from "@/lib/types";

export default function Home() {
  // Navigation & Modal State
  const [rooms, setRooms] = useState<CrisisRoom[]>(FIXTURE_ROOMS);
  const [currentRoom, setCurrentRoom] = useState<CrisisRoom | null>(FIXTURE_ROOMS[0]);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSOSModalOpen, setIsSOSModalOpen] = useState(false);

  // Core Data State (loaded from isolated fixtures in Phase 1)
  const [sosRequests, setSosRequests] = useState<SOSRequest[]>(FIXTURE_SOS_REQUESTS);
  const [resources, setResources] = useState<Resource[]>(FIXTURE_RESOURCES);
  const [agentLogs, setAgentLogs] = useState<AgentLogEntry[]>(FIXTURE_AGENT_LOGS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(FIXTURE_CHAT_MESSAGES);
  const [graphData, setGraphData] = useState<GraphData>(FIXTURE_GRAPH_DATA);
  const [isBrainLoading, setIsBrainLoading] = useState(false);

  // Handle Room Creation
  const handleCreateRoom = (newRoom: CrisisRoom) => {
    setRooms([newRoom, ...rooms]);
    setCurrentRoom(newRoom);
    setActiveTab("overview");
  };

  // Handle New SOS Broadcast (Simulate live dispatch action)
  const handleNewSOS = (sosData: Partial<SOSRequest>) => {
    const newId = `sos-${Date.now().toString().slice(-3)}`;
    const newRequest: SOSRequest = {
      id: newId,
      description: sosData.description || "Urgent rescue needed",
      urgency: sosData.urgency || "high",
      status: "open",
      timestamp: "Just now",
      location_id: sosData.location_id || "ward-01",
      location_name: sosData.location_name || "Meppadi Sector 1",
      people_count: sosData.people_count || 1,
    };

    // Find first available boat or ambulance for auto-dispatch
    const availableRes = resources.find((r) => r.status === "available");
    if (availableRes) {
      newRequest.status = "assigned";
      newRequest.assigned_resource_id = availableRes.id;
      newRequest.assigned_resource_name = availableRes.name;

      // Update resource to assigned
      setResources((prev) =>
        prev.map((r) => (r.id === availableRes.id ? { ...r, status: "assigned" } : r))
      );

      // Log dispatch reasoning
      const newLog: AgentLogEntry = {
        id: `log-${Date.now().toString().slice(-3)}`,
        timestamp: "Just now",
        agent: "Dispatch Agent",
        action: `Auto-assigned ${availableRes.name} to ${newId}`,
        reasoning: `New SOS detected in ${newRequest.location_name}. Queried live graph for nearby resources with clear routes. Matched nearest unit (${availableRes.name}) staged at ${availableRes.location_name}. Written to graph as ASSIGNED_TO edge.`,
        model_used: "Gemini 1.5 Flash",
        status: "success",
        sos_id: newId,
        resource_id: availableRes.id,
      };
      setAgentLogs((prev) => [newLog, ...prev]);

      // Add to graph
      setGraphData((prev) => ({
        nodes: [
          ...prev.nodes,
          {
            id: newId,
            label: `${newId} (${newRequest.people_count}p)`,
            type: "SOSRequest",
            properties: { urgency: newRequest.urgency, status: "assigned" },
          },
        ],
        edges: [
          ...prev.edges,
          { id: `e-${Date.now()}-1`, source: newId, target: newRequest.location_id, label: "LOCATED_IN" },
          { id: `e-${Date.now()}-2`, source: newId, target: availableRes.id, label: "ASSIGNED_TO" },
        ],
      }));
    } else {
      // No resource available
      const alertLog: AgentLogEntry = {
        id: `log-${Date.now().toString().slice(-3)}`,
        timestamp: "Just now",
        agent: "Dispatch Agent",
        action: `Queued ${newId} (Deficit Alert)`,
        reasoning: `Evaluated ${newRequest.location_name}. All sector assets currently committed. Escalated to standby volunteer pool and regional staging hubs.`,
        model_used: "Gemini 1.5 Flash",
        status: "warning",
        sos_id: newId,
      };
      setAgentLogs((prev) => [alertLog, ...prev]);

      setGraphData((prev) => ({
        nodes: [
          ...prev.nodes,
          {
            id: newId,
            label: `${newId} (Unassigned)`,
            type: "SOSRequest",
            properties: { urgency: newRequest.urgency, status: "open" },
          },
        ],
        edges: [
          ...prev.edges,
          { id: `e-${Date.now()}`, source: newId, target: newRequest.location_id, label: "LOCATED_IN" },
        ],
      }));
    }

    setSosRequests([newRequest, ...sosRequests]);
  };

  // Handle Query Agent Chat in Ask The Brain
  const handleSendBrainMessage = (queryText: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: "user",
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsBrainLoading(true);

    setTimeout(() => {
      const brainMsg: ChatMessage = {
        id: `msg-${Date.now()}-brain`,
        sender: "brain",
        text: `Analysis complete for "${queryText}": Traversing graph across active wards and resources. Verified 0 hallucinations by grounding answer in live Cypher traversal result. Current open SOS count: ${sosRequests.filter(s => s.status === 'open').length}, Available resources: ${resources.filter(r => r.status === 'available').length}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        cypher_query: `MATCH (w:Location)<-[:LOCATED_IN]-(s:SOSRequest) OPTIONAL MATCH (w)<-[:LOCATED_IN]-(r:Resource) RETURN w.name, count(s) as requests, count(r) as resources`,
        execution_ms: 12,
        model_used: "Groq (Qwen 3.8 / LLaMA)",
      };
      setChatMessages((prev) => [...prev, brainMsg]);
      setIsBrainLoading(false);
    }, 600);
  };

  const handleResolveSOS = (sosId: string) => {
    setSosRequests((prev) =>
      prev.map((s) => (s.id === sosId ? { ...s, status: "resolved" } : s))
    );
  };

  // If user navigated away from room to landing list
  if (!currentRoom) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] flex flex-col">
        <Navbar
          currentRoom={null}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
        />
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Crisis Command Rooms
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Select an ongoing operational room or initialize a new response zone on FalkorDB.
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded-md bg-gray-900 text-white hover:bg-gray-800 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Create Crisis Room
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rooms.map((room) => (
              <div
                key={room.id}
                onClick={() => {
                  setCurrentRoom(room);
                  setActiveTab("overview");
                }}
                className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:border-gray-400 cursor-pointer transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                      {room.id}
                    </span>
                    <span
                      className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded border ${
                        room.status === "active"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-gray-100 text-gray-600 border-gray-200"
                      }`}
                    >
                      {room.status === "active" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                      )}
                      {room.status.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mt-3">
                    {room.name}
                  </h3>
                  <div className="flex items-center text-xs text-gray-500 mt-1 space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span>{room.location}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-400 font-mono">
                    Created: {new Date(room.created_at).toLocaleDateString()}
                  </span>
                  <span className="font-semibold text-blue-600 flex items-center">
                    Enter Crisis Room <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </main>

        <CreateRoomModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateRoom}
        />
      </div>
    );
  }

  // Inside a Crisis Room: Render Room Dashboard
  const tabs = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "graph", label: "Live Graph", icon: Layers, count: graphData.nodes.length },
    { id: "sos", label: "SOS Requests", icon: ShieldAlert, count: sosRequests.filter(s => s.status === 'open').length },
    { id: "resources", label: "Resources", icon: LifeBuoy, count: resources.filter(r => r.status === 'available').length },
    { id: "brain", label: "Ask the Brain", icon: Sparkles },
    { id: "activity", label: "Agent Activity Log", icon: Clock, count: agentLogs.length },
  ];

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex flex-col">
      {/* Top App Navbar */}
      <Navbar
        currentRoom={currentRoom}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onBackToRooms={() => setCurrentRoom(null)}
        onOpenNewSOSModal={() => setIsSOSModalOpen(true)}
      />

      {/* Main Dashboard Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Room Header Banner */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                {currentRoom.id}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200 uppercase font-mono">
                Active Crisis Operations
              </span>
            </div>
            <h1 className="text-xl font-bold text-gray-950 mt-1">
              {currentRoom.name}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              <span>{currentRoom.location}</span>
              <span className="text-gray-300">·</span>
              <span className="font-mono">Created {new Date(currentRoom.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsSOSModalOpen(true)}
              className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Broadcast Emergency SOS
            </button>
          </div>
        </div>

        {/* Tab Navigation Navigation Bar (DESIGN.md: Rectangular tabs, 4-8px radius, no pill buttons) */}
        <div className="border-b border-gray-200 mb-6 flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center px-4 py-2.5 text-xs font-semibold transition-all border-b-2 whitespace-nowrap rounded-t-md ${
                  isActive
                    ? "border-gray-950 text-gray-950 bg-white shadow-xs"
                    : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <Icon className={`w-4 h-4 mr-2 ${isActive ? "text-gray-950" : "text-gray-400"}`} />
                <span>{tab.label}</span>
                {typeof tab.count === "number" && (
                  <span
                    className={`ml-2 px-1.5 py-0.2 rounded text-[11px] font-mono ${
                      isActive
                        ? "bg-gray-950 text-white"
                        : "bg-gray-100 text-gray-600 border border-gray-200"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Tab Content */}
        {activeTab === "overview" && (
          <OverviewTab
            sosRequests={sosRequests}
            resources={resources}
            shelters={FIXTURE_SHELTERS}
            wards={FIXTURE_WARDS}
            agentLogs={agentLogs}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenSOSModal={() => setIsSOSModalOpen(true)}
          />
        )}

        {activeTab === "graph" && <LiveGraphTab graphData={graphData} />}

        {activeTab === "sos" && (
          <SOSRequestsTab
            sosRequests={sosRequests}
            wards={FIXTURE_WARDS}
            onOpenSOSModal={() => setIsSOSModalOpen(true)}
            onResolveSOS={handleResolveSOS}
          />
        )}

        {activeTab === "resources" && <ResourcesTab resources={resources} />}

        {activeTab === "brain" && (
          <AskBrainTab
            messages={chatMessages}
            onSendMessage={handleSendBrainMessage}
            isLoading={isBrainLoading}
          />
        )}

        {activeTab === "activity" && <AgentActivityTab logs={agentLogs} />}
      </main>

      {/* Modals */}
      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateRoom}
      />

      <NewSOSModal
        isOpen={isSOSModalOpen}
        wards={FIXTURE_WARDS}
        onClose={() => setIsSOSModalOpen(false)}
        onSubmit={handleNewSOS}
      />
    </div>
  );
}
