<div align="center">

# 🚨 RescueGrid
### Autonomous Disaster Coordination & Live Graph Brain Powered by FalkorDB

[![Next.js 15](https://img.shields.io/badge/Next.js-15.5-black?style=flat&logo=next.js)](https://nextjs.org/)
[![FalkorDB](https://img.shields.io/badge/FalkorDB-Graph_Brain-red?style=flat)](https://www.falkordb.com/)
[![Gemini Flash](https://img.shields.io/badge/Google_Gemini-Flash_Dispatch-blue?style=flat&logo=google)](https://ai.google.dev/)
[![Groq LLaMA/Qwen](https://img.shields.io/badge/Groq-Sub--15ms_Inference-orange?style=flat)](https://groq.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v3-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)

**RescueGrid** is an autonomous disaster-response coordination platform built entirely with **FalkorDB** as its unified knowledge graph and memory layer. When a crisis strikes, response coordinators create an isolated "Crisis Room". As emergency SOS requests, relief camps, hazard routes, and rescue fleets are onboarded, the graph topology evolves live in real time. Autonomous AI agents traverse this connected graph to dispatch life-saving assets, navigate around flooded and mud-blocked routes, and provide instant operational intelligence.

</div>

---

## 🌟 Key Highlights & Hackathon Tracks

RescueGrid was built specifically for the **FalkorDB AI Agent Hackathon**:

### 🎯 Track 01: Agents That Act on Connected Data
- **Multi-Hop Graph Traversal:** The autonomous **Dispatch Agent** (Gemini Flash) evaluates multi-hop graph routes: `(SOS) → (Sector) ← [CONNECTED_BY route] → (Resource Sector) ← (Resource)`.
- **Hazard-Aware Decisioning:** Automatically inspects road route statuses (`clear` vs `blocked`). If a bridge collapses, ground ambulances are bypassed in favor of amphibious rescue boats or ridge detour routes.
- **Explainable Reasoning Trails:** Every dispatch decision writes an explainable operational reasoning log directly into FalkorDB, showing judges the exact path behind every automated action.

### 🧠 Track 02: Agent Memory and Coordination
- **FalkorDB as Shared Agent Memory:** The Dispatch Agent (Gemini) and Query Agent (Groq) coordinate strictly through the graph without message queues or webhooks. When the Dispatch Agent assigns an asset, the Query Agent instantly reads the updated state.
- **Episodic, Semantic, & Procedural Memory:**
  - *Episodic:* Incident timelines and decisions across Day 1 to Day 3 crisis progression.
  - *Semantic:* Real-world organizational hierarchies mapping resources to government & NGO agencies (`NDRF`, `Army`, `Red Cross`, `Volunteer Fisherfolk`).
  - *Procedural:* Graph traversal algorithms avoiding blocked road segments.
- **Isolated Multi-Tenant Crisis Rooms:** Strict sub-graph partitioning (`CrisisRoom -[:HAS_ZONE]-> Location`) guarantees zero data leakage between regional disaster zones.
- **Sub-15ms Concurrency:** Sub-millisecond Cypher query execution on FalkorDB enables live crisis coordination under heavy concurrent reads and writes.

---

## 🏗️ System Architecture & Graph Schema

RescueGrid relies on **FalkorDB as the single source of truth**. No parallel database, local cache, or in-memory stores are used.

```
       [ CrisisRoom ]
             │
         :HAS_ZONE
             ▼
        [ Location ] ◄─────── :LOCATED_IN ─────── [ Shelter ]
        ▲          ▲
        │          │
   :CONNECTED_BY   │
 {status: clear|   │
      blocked}     ├───────── :LOCATED_IN ─────── [ Resource ]
        │          │                                   │
        ▼          │                               :OWNED_BY
   [ Location ]    │                                   ▼
        ▲          │                               [ Agency ]
        │          │
        └─── :LOCATED_IN ──── [ SOSRequest ]
                                   │
                              :ASSIGNED_TO
                        {reasoning, assigned_at}
                                   ▼
                              [ Resource ]
```

### Graph Nodes
- `CrisisRoom`: `id`, `name`, `location`, `status`, `created_at`
- `Location / Ward`: `id`, `name`, `region`, `accessibility_status` (`accessible` | `flooded` | `blocked`), `lat`, `lng`
- `Resource`: `id`, `name`, `type` (`boat` | `ambulance` | `food` | `medicine` | `drone` | `generator`), `status` (`available` | `assigned`), `capacity`, `contact_phone`, `notes`
- `Shelter`: `id`, `name`, `capacity`, `current_occupancy`, `has_medical`, `has_generator`, `contact_phone`
- `Agency`: `id`, `name`, `type` (`government` | `NGO` | `volunteer_group`)
- `SOSRequest`: `id`, `description`, `urgency` (`critical` | `high` | `medium` | `low`), `status` (`open` | `assigned` | `resolved`), `people_count`, `timestamp`
- `AgentLog`: `id`, `timestamp`, `agent`, `action`, `reasoning`, `model_used`, `status`, `created_at`

### Graph Edges
- `(:CrisisRoom)-[:HAS_ZONE]->(:Location)`
- `(:CrisisRoom)-[:HAS_AGENT_LOG]->(:AgentLog)`
- `(:Location)-[:CONNECTED_BY { status: 'clear'|'blocked' }]->(:Location)`
- `(:Shelter)-[:LOCATED_IN]->(:Location)`
- `(:Resource)-[:LOCATED_IN]->(:Location)`
- `(:Resource)-[:OWNED_BY]->(:Agency)`
- `(:SOSRequest)-[:LOCATED_IN]->(:Location)`
- `(:SOSRequest)-[:ASSIGNED_TO { reasoning, assigned_at }]->(:Resource)`

---

## 🤖 The AI Agent System

### 1. Autonomous Dispatch Agent
- **Model:** Google Gemini Flash
- **Trigger:** Incoming emergency SOS broadcasts or multi-day disaster simulations.
- **Behavior:** Queries FalkorDB for candidate resources in the operational zone, verifies hazard routes, selects the optimal asset, creates the `[:ASSIGNED_TO]` edge, updates resource availability, and logs human-readable reasoning directly to the graph.

### 2. Query Agent ("Ask the Brain")
- **Model:** Groq (LLaMA / Qwen)
- **Trigger:** Natural-language questions from coordinators in the chat interface.
- **Behavior:** Converts conversational questions into validated read-only Cypher queries against FalkorDB, executes in sub-15ms, and synthesizes grounded answers with **zero hallucination**. Includes a clickable dropdown to inspect the executed Cypher code and latency.

---

## 💻 Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Graph Database** | [FalkorDB](https://falkordb.com) | Low-latency graph database serving as single source of truth & shared agent memory |
| **Frontend Framework** | Next.js 15 (App Router) + React 19 | Responsive UI, server components, and API routes |
| **Styling** | Tailwind CSS + Lucide Icons | Clean disaster-command design system |
| **Graph Visualization** | Cytoscape.js | Interactive live force-directed graph canvas |
| **Reasoning Agent** | Google Gemini Flash | Complex judgment calls for resource dispatching |
| **Speed Agent** | Groq (LLaMA / Qwen) | Ultra-fast natural language text-to-Cypher translation |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or 20+
- A running FalkorDB instance (local Docker or FalkorDB Cloud)
- Google Gemini API Key
- Groq API Key

### 1. Clone & Install
```bash
git clone https://github.com/Manthan-cpp/RescueGrid.git
cd RescueGrid
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
FALKORDB_HOST=your-falkordb-host
FALKORDB_PORT=6379
FALKORDB_USERNAME=your-username
FALKORDB_PASSWORD=your-password
FALKORDB_GRAPH_NAME=rescuegrid

GEMINI_API_KEY=your-gemini-api-key
GROQ_API_KEY=your-groq-api-key
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 👥 Multi-Role Crisis Collaboration

RescueGrid supports frictionless role switching for disaster stakeholders:
- **Incident Commander:** Full command oversight, SOS queue management, simulation triggers, and dispatch reviews.
- **NGO & Field Volunteer:** Field onboarding of rescue boats, ambulances, medical clinics, and shelter camps.
- **Citizen / Triage:** Streamlined emergency SOS broadcast with GPS auto-detection and sector mapping.

---

## 📜 License

MIT License. Built for the FalkorDB AI Agent Hackathon.
