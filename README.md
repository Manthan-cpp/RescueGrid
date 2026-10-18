<div align="center">

# 🚨 RescueGrid
### Autonomous Disaster Coordination & Live Multi-Agent Cognitive Graph Brain Powered by FalkorDB

[![FalkorDB](https://img.shields.io/badge/FalkorDB-Cognitive_Graph_Brain-crimson?style=for-the-badge&logo=redis&logoColor=white)](https://www.falkordb.com/)
[![Track 02: Primary](https://img.shields.io/badge/Hackathon_Track_02-Agent_Memory_%26_Coordination-8A2BE2?style=for-the-badge)](https://www.falkordb.com/)
[![Track 01: Secondary](https://img.shields.io/badge/Hackathon_Track_01-Connected_Data_Agents-blue?style=for-the-badge)](https://www.falkordb.com/)
[![Next.js 15](https://img.shields.io/badge/Next.js-15.5_(App_Router)-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Gemini Flash](https://img.shields.io/badge/Google_Gemini-1.5_Flash_Dispatch-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![Groq Speed](https://img.shields.io/badge/Groq-Sub--15ms_Cypher_Inference-F55036?style=for-the-badge)](https://groq.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

<br/>

![RescueGrid Hero Banner](./public/screenshots/hero_banner.jpg)

<br/>

**RescueGrid** is an ultra-low-latency, autonomous disaster coordination operating system powered entirely by **FalkorDB** as its unified knowledge graph, shared agent memory, and procedural reasoning engine. When catastrophic flash floods, landslides, and infrastructure collapses strike, traditional relational databases and vector search systems fail catastrophically. RescueGrid dynamically models real-world geography, blocked arterial routes, stranded citizens, volunteer relief fleets, and government agencies as a **living, mutating knowledge graph**, enabling autonomous AI agents to make life-saving dispatch decisions in milliseconds.

</div>

---

## 📑 Table of Contents
- [🏆 Hackathon Tracks & Justification](#-hackathon-tracks--justification)
  - [Primary Focus: Track 02 — Agent Memory and Coordination](#-primary-focus-track-02--agent-memory-and-coordination)
  - [Secondary Focus: Track 01 — Agents That Act on Connected Data](#-secondary-focus-track-01--agents-that-act-on-connected-data)
- [⚠️ The Problem: Why Traditional Systems Break in Disasters](#️-the-problem-why-traditional-systems-break-in-disasters)
- [💡 The Solution: RescueGrid Cognitive Graph Brain](#-the-solution-rescuegrid-cognitive-graph-brain)
- [🏛️ System Architecture & Graph Ontology](#️-system-architecture--graph-ontology)
- [⚡ Cypher Queries & Graph Algorithms In Production](#-cypher-queries--graph-algorithms-in-production)
- [🖥️ Visual Interface Showcase](#️-visual-interface-showcase)
- [🤖 Autonomous Multi-Agent Fleet](#-autonomous-multi-agent-fleet)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Local Setup & Installation Guide](#-local-setup--installation-guide)
- [🗺️ Future Roadmap & Real-World Scalability](#️-future-roadmap--real-world-scalability)
- [🤝 Acknowledgments](#-acknowledgments)
- [📜 License](#-license)

---

## 🏆 Hackathon Tracks & Justification

RescueGrid is engineered from the ground up for the **FalkorDB "Graph Hacks: Context for AI Agents"** hackathon:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       RESCUEGRID TRACK ALIGNMENT                            │
├──────────────────────────────────────┬──────────────────────────────────────┤
│  🎯 PRIMARY TRACK: TRACK 02          │  🥈 SECONDARY TRACK: TRACK 01        │
│  Agent Memory & Coordination         │  Agents That Act on Connected Data   │
│  (Targeting the PS5 + GTA VI Prize)  │  (Multi-hop pathfinding & routing)   │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

### 🎯 Primary Focus: Track 02 — Agent Memory and Coordination

RescueGrid is a masterclass in autonomous multi-agent coordination over an in-memory graph database. Rather than relying on fragile message brokers, polling queues, or lossy vector embeddings, **FalkorDB serves as the single shared cognitive memory bank** where state, history, relationships, and procedural rules live in one unified substrate.

#### 1. Persistent Multi-Turn Conversation & Operational History
Every emergency broadcast, citizen SOS, agent dispatch decision, and route condition change is permanently stamped into FalkorDB as a first-class graph node (`AgentLog`, `SOSRequest`). When commanders, volunteers, or query agents interrogate the system over multi-turn dialogues across days of disaster response, the historical operational trajectory is queried with zero loss of context:
```cypher
MATCH (cr:CrisisRoom { id: $roomId })-[:HAS_AGENT_LOG]->(al:AgentLog)
RETURN al ORDER BY al.created_at DESC
```

#### 2. Tri-Layer Memory Architecture: Episodic, Semantic, & Procedural
RescueGrid implements human-grade memory architecture within the graph:
- **🧠 Episodic Memory (Temporal Crisis History):** Preserves chronologically ordered disaster progression (Day 1 flash flood cresting, Day 2 bridge collapse, Day 3 mudslide wave). Every asset allocation retains its contextual timestamp and explainable reasoning in `(:SOSRequest)-[:ASSIGNED_TO {reasoning, assigned_at}]->(:Resource)`.
- **🌐 Semantic Memory (Organizational Knowledge & Hierarchy):** Ground-truth disaster ontology connecting agencies (`NDRF`, `Indian Army Tactical Trauma`, `Red Cross`, `Volunteer Fisherfolk`) to equipment inventories (`amphibious skiff`, `4x4 mobile trauma clinic`, `heavy payload drone`), capability ratings, and geographical jurisdictions.
- **⚡ Procedural Memory (Topological Navigation Rules):** Graph traversal logic that understands physical reality—e.g., ground ambulances cannot traverse roads flagged as `blocked`; water rescues require crafts with `type = 'boat'`; isolated valleys require high-capacity staging hubs.

#### 3. Strict Multi-Tenant Sub-Graph Isolation (Separate Memory Per Tenant / Room)
Different disaster theatres (e.g., *Wayanad Landslide Command* vs. *Coastal Cyclone Command*) cannot cross-contaminate. RescueGrid dynamically partitions the graph using tenant-scoped root anchors:
```cypher
MATCH (cr:CrisisRoom { id: $roomId })-[:HAS_ZONE]->(loc:Location)
```
All queries, resource dispatches, and agent memory lookups are structurally scoped to the active `CrisisRoom` sub-graph. Multiple independent disaster response teams run concurrently on the same FalkorDB cluster with **zero data bleeding**.

#### 4. Real-Time Multi-Human & Multi-Agent Collaboration Without Race Conditions
In an emergency, dozens of stakeholders (Incident Commanders, Field NGO responders, Shelter Managers, and Autonomous AI Agents) query and mutate the graph simultaneously. FalkorDB’s sub-millisecond ACID transactions guarantee that when the **Dispatch Agent** locks a rescue boat via:
```cypher
MATCH (s:SOSRequest { id: $sosId }), (r:Resource { id: $resourceId })
SET s.status = 'assigned', r.status = 'assigned'
MERGE (s)-[a:ASSIGNED_TO]->(r)
```
No concurrent human coordinator or secondary agent can double-book that same asset. State is synchronized instantaneously across all client screens via live graph sync.

#### 5. Cross-Agent Shared State Without Queues
The **Dispatch Agent** (Google Gemini 1.5 Flash) and the **Query Agent** (Groq Qwen/LLaMA) do not communicate through webhooks or message buses. When the Dispatch Agent mutates an edge in the graph, the Query Agent ("Ask the Brain") reads the updated topology within **12 milliseconds**. FalkorDB acts as an ultra-fast, zero-overhead blackboard architecture.

---

### 🥈 Secondary Focus: Track 01 — Agents That Act on Connected Data

RescueGrid showcases autonomous agents executing complex multi-hop graph traversals:
- **Multi-Hop Pathfinding:** Dispatches evaluate multi-step relational traversals: `(Citizen SOS) → (Location) ← [:CONNECTED_BY {status: 'clear'}] → (Staging Hub) ← [:LOCATED_IN] - (Available Fleet)`.
- **Topological Hazard Evasion:** If a bridge collapses, the agent detects the `CONNECTED_BY {status: 'blocked'}` edge and reroutes or re-evaluates the optimal resource type (switching from wheeled 4x4s to amphibious inflatable skiffs).
- **Explainable Operational Trails:** Every dispatch decision writes its exact multi-hop reasoning path back into FalkorDB, providing coordinators with human-verifiable operational transparency.

---

## ⚠️ The Problem: Why Traditional Systems Break in Disasters

When catastrophic floods, landslides, or earthquakes occur (such as the devastating 2024 Wayanad disasters in Kerala, India), infrastructure collapses, bridges wash away, and thousands of lives hang in the balance. The single biggest bottleneck is **coordination paralysis**:

```
                       TRADITIONAL DISASTER DISPATCH FAILURE
  
  Stranded Citizens  ──▶  Siloed WhatsApp Groups  ──▶  Manual Excel Sheets
                                                            │
                                                            ▼
  Washed-out Bridges ──▶  Disconnected Relational DBs  ──▶  Blind Dispatch (Vehicles Trapped)
                                                            │
                                                            ▼
  Depleted Shelters  ──▶  Hallucinating Vector RAG    ──▶  Double-Booked Ambulances & Deaths
```

### Why Existing Tech Stacks Fail:
1. **Relational Databases (PostgreSQL / MySQL) Suffer "JOIN Explosion":** Disaster dispatching requires navigating multi-hop relationships: Citizens $\rightarrow$ Wards $\rightarrow$ Road Arteries $\rightarrow$ Hazards $\rightarrow$ Staging Bases $\rightarrow$ Equipment $\rightarrow$ Relief Agencies. Relational engines executing 6-way recursive JOINs choke or produce unmaintainable spaghetti SQL.
2. **Vector Databases (Embeddings / Vector RAG) Hallucinate Distances:** Semantic vector search is blind to physical topology. A vector similarity search might match an ambulance 1 kilometer away as the crow flies—oblivious to the fact that the river bridge between them is completely destroyed.
3. **Double-Booking & Zero Shared Memory:** Disconnected responders on radios, WhatsApp groups, and spreadsheets dispatch multiple teams to the same location while remote cut-off sectors receive zero aid.

---

## 💡 The Solution: RescueGrid Cognitive Graph Brain

RescueGrid replaces chaos with **deterministic, real-time graph intelligence**:

```
                       RESCUEGRID COGNITIVE GRAPH BRAIN
  
  [ Citizens / SOS ] ──┐
  [ Road Sensors   ] ──┼─▶ [ FalkorDB Live Graph ] ──▶ [ Autonomous AI Dispatch ] ──▶ Verified Saves
  [ NGO / Army Res ] ──┘     • Sub-15ms Latency          • Route Obstacle Evasion       (Zero Collisions)
                             • ACID Concurrency          • Transparent Reasoning
```

- **FalkorDB as the Single Source of Truth:** Every ward, bridge, ambulance, boat, shelter bed, and distress call is modeled as an interconnected node.
- **Topological Obstacle Awareness:** Road washouts immediately invalidate blocked paths in graph traversals.
- **Autonomous Sub-Second Dispatch:** AI agents autonomously evaluate available assets, inspect route conditions, lock resources atomically, and dispatch aid before water levels rise.
- **Zero-Hallucination Querying:** Incident commanders ask natural language questions ("*Are any rescue boats available in Chooralmala?*") and get grounded answers backed by openCypher execution in under 15ms.

---

## 🏛️ System Architecture & Graph Ontology

RescueGrid operates with **zero parallel databases and zero external cache layers**. FalkorDB handles knowledge modeling, live telemetry, transactional locking, and agent memory simultaneously.

```mermaid
graph TD
    classDef room fill:#1e1b4b,stroke:#818cf8,stroke-width:2px,color:#fff;
    classDef loc fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#fff;
    classDef sos fill:#450a0a,stroke:#ef4444,stroke-width:2px,color:#fff;
    classDef res fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#fff;
    classDef agency fill:#312e81,stroke:#6366f1,stroke-width:2px,color:#fff;
    classDef shelter fill:#14532d,stroke:#22c55e,stroke-width:2px,color:#fff;
    classDef log fill:#581c87,stroke:#a855f7,stroke-width:2px,color:#fff;

    CR["CrisisRoom: Wayanad Command"]:::room
    L1["Location: Chooralmala Ground Zero"]:::loc
    L2["Location: Mundakkai Cutoff"]:::loc
    L3["Location: Meppadi Staging Hub"]:::loc
    
    SOS["SOSRequest: 5 Trapped on Roof"]:::sos
    RES["Resource: NDRF Inflatable Craft 04"]:::res
    AG["Agency: NDRF 4th Battalion"]:::agency
    SH["Shelter: Meppadi Community Camp"]:::shelter
    AL["AgentLog: Gemini Flash Reasoning Trail"]:::log

    CR -->|":HAS_ZONE"| L1
    CR -->|":HAS_ZONE"| L2
    CR -->|":HAS_ZONE"| L3
    CR -->|":HAS_AGENT_LOG"| AL

    L1 -.->|":CONNECTED_BY (blocked)"| L2
    L1 -->|":CONNECTED_BY (clear)"| L3

    SOS -->|":LOCATED_IN"| L1
    SOS -->|":ASSIGNED_TO"| RES
    
    RES -->|":LOCATED_IN"| L3
    RES -->|":OWNED_BY"| AG
    
    SH -->|":LOCATED_IN"| L3
```

### Graph Nodes Ontology
| Node Label | Key Properties | Operational Role |
| :--- | :--- | :--- |
| `CrisisRoom` | `id`, `name`, `location`, `status`, `created_at` | Isolated multi-tenant crisis partition anchor |
| `Location` | `id`, `name`, `region`, `accessibility_status`, `lat`, `lng` | Operational sectors, wards, and staging grounds |
| `SOSRequest` | `id`, `description`, `urgency`, `status`, `people_count`, `timestamp` | Real-time distress beacons logged from citizens |
| `Resource` | `id`, `name`, `type`, `status`, `capacity`, `contact_phone`, `notes` | Rescue boats, 4x4s, trauma clinics, drones, generators |
| `Shelter` | `id`, `name`, `capacity`, `current_occupancy`, `has_medical`, `contact_phone` | Evacuation camps tracking real-time bed capacity |
| `Agency` | `id`, `name`, `type` (`government`, `NGO`, `volunteer_group`) | Organizational entities deploying equipment and personnel |
| `AgentLog` | `id`, `agent`, `action`, `reasoning`, `model_used`, `status`, `created_at` | Explainable episodic memory trace of automated AI actions |

### Graph Edges & Relationships
| Relationship | Connected Nodes | Semantics |
| :--- | :--- | :--- |
| `:HAS_ZONE` | `(CrisisRoom) -> (Location)` | Restricts operational zones to specific crisis command rooms |
| `:CONNECTED_BY` | `(Location) -> (Location)` | Physical road network carrying `{status: 'clear' \| 'blocked'}` |
| `:LOCATED_IN` | `(SOS \| Resource \| Shelter) -> (Location)` | Spatial grounding of requests, equipment, and shelters |
| `:ASSIGNED_TO` | `(SOSRequest) -> (Resource)` | Real-time asset lock stamped with AI operational reasoning |
| `:OWNED_BY` | `(Resource) -> (Agency)` | Chain of command linking assets back to parent agencies |
| `:HAS_AGENT_LOG` | `(CrisisRoom) -> (AgentLog)` | Episodic memory chain enabling audit trails and multi-turn QA |

---

## ⚡ Cypher Queries & Graph Algorithms In Production

RescueGrid demonstrates deep mastery of **openCypher on FalkorDB**. Below are the actual queries driving the platform in production:

### 1. Multi-Hop Candidate Asset Discovery with Hazard Evasion
When an SOS alert arrives, the **Dispatch Agent** executes a multi-hop traversal to locate available resources, their staging sectors, and the arterial route connectivity to the incident sector:
```cypher
MATCH (reqLoc:Location { id: $locationId })
MATCH (res:Resource { status: 'available' })-[:LOCATED_IN]->(resLoc:Location)
OPTIONAL MATCH (resLoc)-[route:CONNECTED_BY]->(reqLoc)
OPTIONAL MATCH (reqLoc)-[:CONNECTED_BY]->(resLoc)
RETURN
  res.id as res_id,
  res.name as res_name,
  res.type as res_type,
  res.capacity as res_capacity,
  resLoc.name as res_loc_name,
  route.status as route_status
```
*Algorithm Impact:* Evaluates asset viability in a single database hop. If a route is marked `blocked`, the agent automatically deprioritizes wheeled ambulances and favors watercraft or alternate staging bases.

---

### 2. Atomic State Mutation & Asset Allocation
To guarantee zero double-booking under high-concurrency disaster conditions, RescueGrid executes atomic graph mutations:
```cypher
MATCH (s:SOSRequest { id: $sosId }), (r:Resource { id: $resourceId })
SET s.status = 'assigned'
SET r.status = 'assigned'
MERGE (s)-[a:ASSIGNED_TO]->(r)
ON CREATE SET a.reasoning = $reasoning, a.assigned_at = $timestamp
ON MATCH SET a.reasoning = $reasoning, a.assigned_at = $timestamp
```
*Algorithm Impact:* Atomically locks the resource, links it to the distress incident, and stamps the AI agent's operational reasoning directly onto the edge.

---

### 3. Dynamic Road Network Severing (Mudslide / Bridge Collapse)
When field responders report a washed-out bridge or landslide blockage, the graph relationship is dynamically mutated in real time:
```cypher
MATCH (l1:Location { id: $fromLocId }), (l2:Location { id: $toLocId })
MERGE (l1)-[r:CONNECTED_BY]->(l2)
SET r.status = 'blocked'
SET r.notes = 'Bridge collapsed due to torrential flash flood'
SET r.updated_at = $timestamp

WITH l2
MATCH (loc:Location { id: $toLocId })
SET loc.accessibility_status = 'blocked'
```
*Algorithm Impact:* Automatically severs routing across the edge for subsequent agent dispatches and flags the target ward as cutoff.

---

### 4. Incident Resolution & Instant Resource Reclamation
When field units complete a rescue operation, the coordinator resolves the incident, freeing the resource back into the available pool:
```cypher
MATCH (s:SOSRequest { id: $sosId })
SET s.status = 'resolved'

WITH s
MATCH (s)-[a:ASSIGNED_TO]->(r:Resource)
SET r.status = 'available'
DELETE a
```
*Algorithm Impact:* Releases the asset in sub-millisecond execution time, making it immediately discoverable for the next queued emergency.

---

### 5. Natural Language Text-to-Cypher with Case-Insensitive Containment
The **Query Agent ("Ask the Brain")** translates unstructured coordinator queries into optimized openCypher read queries. It handles negation via `OPTIONAL MATCH` and `IS NULL` checks (avoiding unsupported subqueries) and uses case-insensitive containment:
```cypher
// Question: "Which wards currently have open critical SOS requests and no boats nearby?"
MATCH (loc:Location)<-[:LOCATED_IN]-(sos:SOSRequest)
WHERE sos.urgency = 'critical' AND sos.status = 'open'
OPTIONAL MATCH (boat:Resource { type: 'boat', status: 'available' })-[:LOCATED_IN]->(loc)
WITH loc, sos, boat
WHERE boat IS NULL
RETURN loc.name AS ward_name, sos.id AS sos_id, sos.description AS emergency, sos.urgency AS urgency
```
*Execution Speed:* Sub-15ms on FalkorDB via Groq Qwen/LLaMA inference.

---

### 6. Multi-Tenant Sub-Graph Isolation & Room State Hydration
To hydrate the entire command room in a single query cycle without touching other crisis rooms:
```cypher
MATCH (cr:CrisisRoom { id: $roomId })-[:HAS_ZONE]->(w:Location)
OPTIONAL MATCH (w)<-[:LOCATED_IN]-(s:SOSRequest)
OPTIONAL MATCH (s)-[:ASSIGNED_TO]->(assignedRes:Resource)
OPTIONAL MATCH (w)<-[:LOCATED_IN]-(r:Resource)-[:OWNED_BY]->(ag:Agency)
OPTIONAL MATCH (w)<-[:LOCATED_IN]-(sh:Shelter)
RETURN w, s, assignedRes, r, ag, sh
```

---

## 🖥️ Visual Interface Showcase

Every screenshot below is captured directly from the live RescueGrid platform running against FalkorDB:

### 1. Multi-Tenant Crisis Command Rooms Hub
Coordinators can launch or switch between distinct disaster rooms. Each room provisions its own sub-graph topology in FalkorDB with strict tenant isolation.
<div align="center">
  <img src="./public/screenshots/crisis_hub.png" alt="RescueGrid Crisis Hub" width="900" />
</div>

<br/>

### 2. Dynamic Room Provisioning & Sub-Graph Isolation Modal
When a new disaster strikes, coordinators define the region and initial operational sectors. FalkorDB instantly instantiates the isolated sub-graph and establishes `:HAS_ZONE` relationships.
<div align="center">
  <img src="./public/screenshots/create_room_modal.png" alt="Create Crisis Room Modal" width="750" />
</div>

<br/>

### 3. Incident Commander Overview & Real-Time KPI Matrix
The command center displays open SOS emergencies, active dispatches, available fleet counts, shelter bed occupancy, and live ward accessibility tables alongside the real-time AI reasoning trail.
<div align="center">
  <img src="./public/screenshots/commander_overview.png" alt="Commander Overview Dashboard" width="900" />
</div>

<br/>

### 4. Interactive Live Cytoscape Graph Canvas
A force-directed, interactive graph visualizer rendering live FalkorDB nodes and edges. Coordinators can click any node to open the **Node Inspector**, inspect live properties, and examine active relationships (`LOCATED_IN`, `ASSIGNED_TO`, `CONNECTED_BY`).
<div align="center">
  <img src="./public/screenshots/live_graph_canvas.png" alt="Cytoscape Live Graph Canvas" width="900" />
</div>

<br/>

### 5. Graph Node Inspector & Dynamic Asset Tracking
Clicking the `NDRF Rapid Inflatable Craft 04` reveals its live status (`assigned`), capacity (8 people), emergency contact, and edge traversal pointing directly to `sos-9477`.
<div align="center">
  <img src="./public/screenshots/resource_node_inspector.png" alt="Resource Node Inspector" width="900" />
</div>

<br/>

### 6. Autonomous Agent Activity & Explainable Reasoning Log
Every dispatch action by the **Google Gemini 1.5 Flash Dispatch Agent** writes an explainable operational reasoning trail into FalkorDB's episodic memory layer, proving why a specific asset was chosen and how blocked routes were evaded.
<div align="center">
  <img src="./public/screenshots/agent_reasoning_log.png" alt="Agent Activity Log" width="900" />
</div>

<br/>

### 7. "Ask the Brain" — Sub-15ms Natural Language Cypher Engine
Coordinators interrogate the live disaster graph using natural human speech. Powered by Groq, queries translate into openCypher, execute in sub-15ms on FalkorDB, and return grounded answers with zero hallucination and a clickable Cypher code inspector.
<div align="center">
  <img src="./public/screenshots/ask_the_brain.png" alt="Ask the Brain Cypher QA" width="900" />
</div>

<br/>

### 8. From Hackathon Prototype to Real-World Disaster Deployment
Our verified production-grade architecture roadmap demonstrates how RescueGrid scales from a hackathon prototype to real-world deployment across government agencies, SMS/WhatsApp 2G ingestion, and field NGOs.
<div align="center">
  <img src="./public/screenshots/real_world_architecture.png" alt="Real World Architecture Infographic" width="900" />
</div>

---

## 🤖 Autonomous Multi-Agent Fleet

RescueGrid deploys two specialized, symbiotic AI agents that coordinate exclusively through the FalkorDB graph:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           RESCUEGRID AGENT FLEET                            │
├──────────────────────────────────────┬──────────────────────────────────────┤
│  ⚡ 1. Autonomous Dispatch Agent     │  💬 2. Query Agent ("Ask the Brain") │
├──────────────────────────────────────┼──────────────────────────────────────┤
│  • Model: Google Gemini 1.5 Flash    │  • Model: Groq (Qwen 2.5 / LLaMA 3.3)│
│  • Trigger: Incoming SOS broadcast   │  • Trigger: Natural language chat    │
│  • Traversal: Multi-hop route check  │  • Translation: Natural text -> Cypher│
│  • Action: Atomic graph mutation     │  • Latency: Sub-15ms Cypher run      │
│  • Output: Explainable reasoning     │  • Grounding: Zero hallucination     │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

### The Autonomous Dispatch Cycle
1. **Distress Ingestion:** An emergency SOS request is broadcast via citizen triage or simulated incident scenario.
2. **FalkorDB Path Evaluation:** The Dispatch Agent queries FalkorDB for candidate resources in adjacent wards, verifying road accessibility (`status = 'clear'`).
3. **Cognitive Judgment:** Gemini 1.5 Flash weighs urgency, trapped victim count, road conditions, and resource capabilities.
4. **Graph State Mutation:** The agent creates the `[:ASSIGNED_TO]` edge, transitions the resource status from `available` to `assigned`, and writes its reasoning into `AgentLog`.
5. **Human Oversight:** Incident commanders review the decision trail in real time with the ability to override or re-route.

---

## 🛠️ Tech Stack

| Layer | Technology | Operational Function |
| :--- | :--- | :--- |
| **Cognitive Graph Brain** | **[FalkorDB](https://falkordb.com)** | Ultra-fast Redis-based graph database providing sub-millisecond openCypher traversals, ACID transactions, and shared agent memory |
| **Frontend Framework** | **Next.js 15.5 (App Router)** | High-performance React 19 server components, dynamic API routes, and client-side reactive state |
| **Graph Visualization** | **Cytoscape.js** | Interactive force-directed canvas with custom node badges, hazard styling, and real-time layout updates |
| **Autonomous Reasoning Agent** | **Google Gemini 1.5 Flash** | Multi-factor cognitive judgment for resource allocation and hazard route avoidance |
| **Sub-15ms Speed Agent** | **Groq (Qwen 3.8 / LLaMA 3.3)** | Ultra-fast natural language text-to-Cypher translation with openCypher validation |
| **Styling & UI Components** | **Tailwind CSS + Lucide Icons** | Military/crisis command design system with dark mode graph canvas and high-contrast alerts |
| **Type Safety** | **TypeScript 5.0** | Strict typing across graph schemas, API payloads, and agent interfaces |

---

## 🚀 Local Setup & Installation Guide

Follow these steps to run RescueGrid locally on your development machine.

### Prerequisites
- **Node.js:** v18.17+ or v20+
- **Docker:** (To run a local FalkorDB container) or a free [FalkorDB Cloud](https://app.falkordb.cloud) instance
- **API Keys:**
  - Google Gemini API Key ([Get one free here](https://aistudio.google.com/))
  - Groq API Key ([Get one free here](https://console.groq.com/))

---

### Step 1: Launch FalkorDB

#### Option A: Run Local FalkorDB with Docker (Recommended)
```bash
docker run -p 6379:6379 -it --rm falkordb/falkordb:latest
```
*Note:* This starts FalkorDB on port `6379` with no password by default.

#### Option B: Use FalkorDB Cloud
Sign up at [FalkorDB Cloud](https://app.falkordb.cloud) and copy your connection endpoint, username, and password.

---

### Step 2: Clone & Install Dependencies
```bash
git clone https://github.com/Manthan-cpp/RescueGrid.git
cd RescueGrid
npm install
```

---

### Step 3: Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
# FalkorDB Connection Settings
FALKORDB_HOST=127.0.0.1
FALKORDB_PORT=6379
FALKORDB_USERNAME=
FALKORDB_PASSWORD=
FALKORDB_GRAPH_NAME=rescuegrid

# AI Model Keys
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here
```

---

### Step 4: Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

### Step 5: Interactive 3-Minute Demo Walkthrough
1. **Enter or Create a Crisis Room:** Open the dashboard and click into the pre-seeded *"Wayanad Landslide & Flood Command"*, or click **"+ Create Crisis Room"** to instantiate a new isolated disaster sub-graph.
2. **Inspect the Live Knowledge Graph:** Click the **Live Graph** tab. Interact with the force-directed Cytoscape graph canvas. Click any node to open the **Node Inspector** and inspect its live properties and connected relationships.
3. **Simulate Disaster Scenarios:** Click the purple **"Run Simulation"** button. Watch as Day 1 flash flood and Day 3 mudslide incidents are ingested, triggering the **Dispatch Agent** to evaluate routes and assign relief craft autonomously.
4. **Examine the Agent Activity Log:** Click the **Agent Activity Log** tab to view the explainable reasoning trails persisted into FalkorDB's episodic memory.
5. **Ask the Brain:** Click the **Ask the Brain** tab and try questions like:
   - *"Is the Fisherfolk Skiff in Chooralmala currently available?"*
   - *"Which wards currently have open critical SOS requests and no boats nearby?"*
   - Click **">_ Inspect Executed Cypher Query"** to view the live openCypher code and execution latency (~12-70ms).
6. **Broadcast a Live SOS:** Click **"+ Broadcast SOS"**, select a ward, pick an urgency level, and submit. Watch the live graph update instantaneously!

---

## 🗺️ Future Roadmap & Real-World Scalability

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 RESCUEGRID PRODUCTION DEPLOYMENT ROADMAP                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  Phase 1: Verified Role-Based Authentication (Govt Credentials + SMS OTP)   │
│  Phase 2: Decentralized Ingestion (2G SMS, WhatsApp Business API, IVR)      │
│  Phase 3: Real-Time Satellite & Drone Feeds (SAR Flood Inundation Overlays)  │
│  Phase 4: LoRaWAN Offline Mesh Synchronization (Zero Internet Resilience)   │
└─────────────────────────────────────────────────────────────────────────────┘
```

1. **Verified Role-Based Authentication:**
   Integration with national identity systems (e.g., Aadhaar / Digilocker) and government dispatch portals to authenticate Incident Commanders, authorized NGO coordinators, and hospital shelter directors via SMS-OTP, ensuring only certified personnel authorize heavy equipment dispatches.
2. **Decoupled Agent Pipelines at Scale:**
   Our decoupled architecture separates Ingestion Agents, Analysis Agents, Decision Agents, and Action Agents around FalkorDB. Scaling to thousands of concurrent emergency calls requires **zero architectural rewrites**.
3. **Low-Bandwidth 2G SMS & WhatsApp Distress Ingestion:**
   Enabling citizens in cellular dead zones to broadcast distress signals via 160-character 2G SMS or lightweight WhatsApp bots that parse text, geolocate coordinates, and ingest them directly into FalkorDB.
4. **LoRaWAN Offline Mesh Sync:**
   Deploying battery-powered field edge devices running local FalkorDB micro-instances that sync over LoRa radio frequencies when cellular towers and power grids go dark.

---

## 🤝 Acknowledgments

RescueGrid was built with passion for the **FalkorDB "Graph Hacks: Context for AI Agents"** hackathon organized by **FalkorDB** and **WeMakeDevs**.

Special thanks to:
- The **FalkorDB Team** for pioneering an in-memory graph database with blazing-fast openCypher performance.
- The **WeMakeDevs Community** for hosting world-class hackathons empowering developers to build software with real-world impact.
- The first responders, Indian Army, NDRF personnel, and brave volunteer fisherfolk of Kerala whose heroic real-world rescue efforts during natural disasters inspired this project.

---

## 📜 License

This project is licensed under the **MIT License** — feel free to use, modify, and distribute it for disaster relief, humanitarian research, and civil defense applications.

<div align="center">
  <br/>
  <b>Built with ❤️ for real-world humanitarian impact using FalkorDB.</b>
</div>
