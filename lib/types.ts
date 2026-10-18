export type CrisisRoomStatus = "active" | "standby" | "resolved";

export interface CrisisRoom {
  id: string;
  name: string;
  location: string;
  created_at: string;
  status: CrisisRoomStatus;
}

export type UserRole = "commander" | "ngo" | "public";

export type PersonRole = "victim" | "volunteer" | "coordinator";

export interface Person {
  id: string;
  name: string;
  role: PersonRole;
  contact: string;
  status: string;
  location_id?: string;
}

export type SOSUrgency = "critical" | "high" | "medium" | "low";
export type SOSStatus = "open" | "assigned" | "resolved";

export interface SOSRequest {
  id: string;
  description: string;
  urgency: SOSUrgency;
  status: SOSStatus;
  timestamp: string;
  reported_by?: string;
  location_id: string;
  location_name?: string;
  assigned_resource_id?: string;
  assigned_resource_name?: string;
  people_count?: number;
  lat?: number;
  lng?: number;
  caller_phone?: string;
}

export type ResourceType = "boat" | "ambulance" | "food" | "medicine" | "shelter_bed" | "generator" | "drone";
export type ResourceStatus = "available" | "assigned" | "maintenance";

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  status: ResourceStatus;
  location_id: string;
  location_name?: string;
  agency_id: string;
  agency_name?: string;
  capacity?: number;
  contact_phone?: string;
  lat?: number;
  lng?: number;
  notes?: string;
}

export interface Shelter {
  id: string;
  name: string;
  capacity: number;
  current_occupancy: number;
  location_id: string;
  location_name?: string;
  has_medical?: boolean;
  has_generator?: boolean;
  contact_phone?: string;
  lat?: number;
  lng?: number;
}

export type RouteStatus = "clear" | "blocked" | "restricted";

export interface WardLocation {
  id: string;
  name: string;
  region: string;
  accessibility_status: "accessible" | "flooded" | "blocked";
  lat?: number;
  lng?: number;
}

export interface Route {
  id: string;
  from_location: string;
  to_location: string;
  status: RouteStatus;
  distance_km?: number;
}

export interface Agency {
  id: string;
  name: string;
  type: "NGO" | "government" | "volunteer_group";
}

export interface AgentLogEntry {
  id: string;
  timestamp: string;
  agent: "Dispatch Agent" | "Query Agent";
  action: string;
  reasoning: string;
  model_used: "Gemini 1.5 Flash" | "Groq LLaMA 3.3" | "Gemini 2.5 Flash";
  status: "success" | "warning" | "error";
  sos_id?: string;
  resource_id?: string;
  roomId?: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "brain";
  text: string;
  timestamp: string;
  cypher_query?: string;
  execution_ms?: number;
  model_used?: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: "CrisisRoom" | "Person" | "SOSRequest" | "Resource" | "Shelter" | "Location" | "Agency";
  properties: Record<string, any>;
  x?: number;
  y?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  properties?: Record<string, any>;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
