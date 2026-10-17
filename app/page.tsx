"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  RefreshCw,
  AlertCircle,
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
  CrisisRoom,
  SOSRequest,
  Resource,
  Shelter,
  WardLocation,
  ChatMessage,
  AgentLogEntry,
  GraphData,
} from "@/lib/types";

export default function Home() {
  // Navigation & Modal State
  const [rooms, setRooms] = useState<CrisisRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<CrisisRoom | null>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSOSModalOpen, setIsSOSModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live Graph Data State (Directly populated from FalkorDB)
  const [sosRequests, setSosRequests] = useState<SOSRequest[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [wards, setWards] = useState<WardLocation[]>([]);
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  const [agentLogs, setAgentLogs] = useState<AgentLogEntry[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isBrainLoading, setIsBrainLoading] = useState(false);

  // 1. Fetch Rooms from FalkorDB
  const fetchRooms = useCallback(async () => {
    try {
      setErrorMessage(null);
      const res = await fetch("/api/rooms");
      const data = await res.json();
      if (data.success && Array.isArray(data.rooms)) {
        setRooms(data.rooms);
        if (data.rooms.length > 0 && !currentRoom) {
          setCurrentRoom(data.rooms[0]);
        }
      } else if (!data.success) {
        setErrorMessage(data.error || "FalkorDB unreachable");
      }
    } catch (err: any) {
      console.error("Failed to fetch rooms:", err);
      setErrorMessage("Could not connect to FalkorDB Cloud. Verify connection.");
    } finally {
      setIsLoading(false);
    }
  }, [currentRoom]);

  // 2. Fetch Room Details & Live Graph from FalkorDB
  const fetchRoomDetails = useCallback(async (roomId: string) => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/rooms/${roomId}`);
      const data = await res.json();
      if (data.success) {
        setWards(data.wards || []);
        setShelters(data.shelters || []);
        setResources(data.resources || []);
        setSosRequests(data.sosRequests || []);
        setGraphData(data.graphData || { nodes: [], edges: [] });
      }
    } catch (err: any) {
      console.error("Failed to fetch room details:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Load details whenever currentRoom changes
  useEffect(() => {
    if (currentRoom) {
      fetchRoomDetails(currentRoom.id);
    }
  }, [currentRoom, fetchRoomDetails]);

  // Handle Room Creation
  const handleCreateRoom = async (roomData: CrisisRoom) => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: roomData.name, location: roomData.location }),
      });
      const data = await res.json();
      if (data.success && data.room) {
        setRooms((prev) => [data.room, ...prev]);
        setCurrentRoom(data.room);
        setActiveTab("overview");
      }
    } catch (err) {
      console.error("Error creating room:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle New SOS Broadcast (Calls real FalkorDB API + autonomous Dispatch Agent)
  const handleNewSOS = async (sosData: Partial<SOSRequest>) => {
    if (!currentRoom) return;

    try {
      const res = await fetch("/api/sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...sosData,
          roomId: currentRoom.id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Log Dispatch Agent reasoning in activity timeline
        if (data.dispatch) {
          const newLog: AgentLogEntry = {
            id: `log-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            agent: "Dispatch Agent",
            action: data.dispatch.assigned
              ? `Assigned ${data.dispatch.resourceName} to ${data.sos.id}`
              : `Queued ${data.sos.id} (Resource Deficit)`,
            reasoning: data.dispatch.reasoning,
            model_used: data.dispatch.modelUsed,
            status: data.dispatch.status,
            sos_id: data.sos.id,
            resource_id: data.dispatch.resourceId,
          };
          setAgentLogs((prev) => [newLog, ...prev]);
        }

        // Refresh live graph and room data from FalkorDB
        await fetchRoomDetails(currentRoom.id);
      }
    } catch (err) {
      console.error("Error broadcasting SOS:", err);
    }
  };

  // Handle SOS Resolution
  const handleResolveSOS = async (sosId: string) => {
    if (!currentRoom) return;
    try {
      const res = await fetch(`/api/sos/${sosId}/resolve`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        await fetchRoomDetails(currentRoom.id);
      }
    } catch (err) {
      console.error("Error resolving SOS:", err);
    }
  };

  // Handle Query Agent in Ask the Brain
  const handleSendBrainMessage = async (queryText: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: "user",
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsBrainLoading(true);

    try {
      const res = await fetch("/api/brain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: queryText, roomId: currentRoom?.id }),
      });

      const data = await res.json();
      const brainMsg: ChatMessage = {
        id: `msg-${Date.now()}-brain`,
        sender: "brain",
        text: data.answer || "Query completed.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        cypher_query: data.cypher,
        execution_ms: data.executionMs || 15,
        model_used: data.modelUsed,
      };

      setChatMessages((prev) => [...prev, brainMsg]);
    } catch (err) {
      console.error("Error querying brain:", err);
      const errMsg: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        sender: "brain",
        text: "Error executing query against FalkorDB. Please check connection.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsBrainLoading(false);
    }
  };

  // Handle Live Crisis Simulation
  const [isSimulating, setIsSimulating] = useState(false);
  const handleRunSimulation = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: currentRoom?.id }),
      });
      const data = await res.json();
      if (data.success && data.simulatedEvents) {
        // Append all new simulation logs
        const newLogs: AgentLogEntry[] = data.simulatedEvents.map((ev: any) => ({
          id: `log-${Date.now()}-${ev.sos.id}`,
          timestamp: ev.sos.timestamp,
          agent: "Dispatch Agent",
          action: ev.dispatch.assigned
            ? `Assigned ${ev.dispatch.resourceName} to ${ev.sos.id}`
            : `Queued ${ev.sos.id} (Deficit Alert)`,
          reasoning: ev.dispatch.reasoning,
          model_used: ev.dispatch.modelUsed,
          status: ev.dispatch.status,
          sos_id: ev.sos.id,
          resource_id: ev.dispatch.resourceId,
        }));
        setAgentLogs((prev) => [...newLogs, ...prev]);

        // Refresh room details if room is currently selected
        if (currentRoom) {
          await fetchRoomDetails(currentRoom.id);
        } else {
          await fetchRooms();
        }
      }
    } catch (err) {
      console.error("Simulation failed:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Top level error banner if FalkorDB connection fails
  if (errorMessage && rooms.length === 0 && !isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] flex flex-col items-center justify-center p-4">
        <div className="bg-white border border-red-300 rounded-lg p-6 max-w-md w-full shadow-md text-center">
          <AlertCircle className="w-10 h-10 text-red-600 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-900">FalkorDB Connection Notice</h2>
          <p className="text-xs text-gray-600 mt-2 leading-relaxed">
            {errorMessage}
          </p>
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center space-x-3">
            <button
              onClick={() => fetchRooms()}
              className="px-4 py-2 bg-gray-900 text-white rounded text-xs font-semibold hover:bg-gray-800"
            >
              Retry Connection
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700"
            >
              + Initialize First Crisis Room
            </button>
          </div>
        </div>
        <CreateRoomModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateRoom}
        />
      </div>
    );
  }

  // Landing Page: Crisis Room Selection
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
                Connected to live FalkorDB instance. Select an active crisis room or create one.
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

          {rooms.length > 0 ? (
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
                      <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                        LIVE GRAPH
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
                      FalkorDB Verified
                    </span>
                    <span className="font-semibold text-blue-600 flex items-center">
                      Enter Crisis Room <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-900">No Crisis Rooms Active</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-4">
                FalkorDB currently has zero crisis rooms. Initialize the first crisis zone to seed initial wards and emergency infrastructure.
              </p>
              <div className="flex items-center justify-center space-x-3">
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700 shadow-sm"
                >
                  + Create Crisis Room
                </button>
                <button
                  onClick={handleRunSimulation}
                  disabled={isSimulating}
                  className="px-4 py-2 bg-purple-700 text-white rounded text-xs font-semibold hover:bg-purple-800 shadow-sm flex items-center"
                >
                  <Sparkles className={`w-3.5 h-3.5 mr-1.5 ${isSimulating ? "animate-spin" : ""}`} />
                  {isSimulating ? "Simulating..." : "⚡ Quick Demo Simulation"}
                </button>
              </div>
            </div>
          )}
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
    { id: "sos", label: "SOS Requests", icon: ShieldAlert, count: sosRequests.filter((s) => s.status === "open").length },
    { id: "resources", label: "Resources", icon: LifeBuoy, count: resources.filter((r) => r.status === "available").length },
    { id: "brain", label: "Ask the Brain", icon: Sparkles },
    { id: "activity", label: "Agent Activity Log", icon: Clock, count: agentLogs.length },
  ];

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex flex-col">
      <Navbar
        currentRoom={currentRoom}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onBackToRooms={() => setCurrentRoom(null)}
        onOpenNewSOSModal={() => setIsSOSModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Room Header Banner */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                {currentRoom.id}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase font-mono flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                Live FalkorDB Brain
              </span>
            </div>
            <h1 className="text-xl font-bold text-gray-950 mt-1">
              {currentRoom.name}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              <span>{currentRoom.location}</span>
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => fetchRoomDetails(currentRoom.id)}
              disabled={isRefreshing}
              className="p-2 border border-gray-200 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              title="Refresh Graph State"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-md bg-purple-700 text-white hover:bg-purple-800 disabled:opacity-50 transition-colors shadow-sm"
              title="Inject realistic multi-day crisis incidents to demonstrate autonomous dispatch & graph memory"
            >
              <Sparkles className={`w-3.5 h-3.5 mr-1.5 ${isSimulating ? "animate-spin" : ""}`} />
              {isSimulating ? "Simulating..." : "Run Crisis Simulation"}
            </button>
            <button
              onClick={() => setIsSOSModalOpen(true)}
              className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Broadcast Emergency SOS
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
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
            shelters={shelters}
            wards={wards}
            agentLogs={agentLogs}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenSOSModal={() => setIsSOSModalOpen(true)}
          />
        )}

        {activeTab === "graph" && <LiveGraphTab graphData={graphData} />}

        {activeTab === "sos" && (
          <SOSRequestsTab
            sosRequests={sosRequests}
            wards={wards}
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
        wards={wards}
        onClose={() => setIsSOSModalOpen(false)}
        onSubmit={handleNewSOS}
      />
    </div>
  );
}
