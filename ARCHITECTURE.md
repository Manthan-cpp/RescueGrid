# ARCHITECTURE.md — RescueGrid

## What this project is
A disaster-response coordination platform for any crisis zone (flood, cyclone, earthquake —
not scoped to one city). Users create a "Crisis Room," and as SOS requests, volunteers, and
resources get logged, an AI agent system acts on a live knowledge graph to dispatch help,
coordinate across agents, and answer questions about the crisis in real time.

Built for a hackathon with three tracks, all served by **one** graph:
- Agents that act on connected data → Dispatch Agent
- Agent memory & coordination → shared graph state across agents + across sessions
- Company brain → Query Agent answering natural-language questions from the graph

## Tech stack (all free-tier)

| Layer | Choice | Why |
|---|---|---|
| Database | **FalkorDB** (Docker locally, or FalkorDB Cloud free tier) | Required by hackathon — graph is the single source of truth |
| Frontend | Next.js (React) | Free hosting on Vercel, fast dev |
| Backend | Node.js (Next.js API routes or a small Express server) | Keeps one language across the stack |
| Fast LLM calls | **Groq** (Llama models) | Free, very low latency — use for Query Agent |
| Reasoning-heavy LLM calls | **Gemini** (Flash) | Free tier — use for Dispatch Agent's judgment calls |
| Real-time updates | WebSockets (Socket.io) or Server-Sent Events | Graph must visibly grow live in the UI |
| Hosting | Vercel (frontend/backend), FalkorDB Cloud free tier or a free-tier VM for Docker | Zero cost end to end |
| Graph visualization | A graph-rendering library (e.g. react-force-graph or similar) | Must support live node/edge addition with animation |

Do not introduce a second database, a Redis cache, or local file-based storage "temporarily."
If data needs to persist or be queried, it goes in FalkorDB. This is a rule, not a
suggestion — the whole pitch depends on FalkorDB being load-bearing for everything.

## Graph schema

**Nodes:**
- `CrisisRoom` — id, name, location/region, created_at, status
- `Person` — id, name, role (victim | volunteer | coordinator), contact, status
- `SOSRequest` — id, description, urgency, status (open | assigned | resolved), timestamp
- `Resource` — id, type (boat | ambulance | food | medicine | shelter_bed), status (available | assigned)
- `Shelter` — id, name, capacity, current_occupancy
- `Location` / `Ward` — id, name, region, accessibility_status
- `Agency` — id, name, type (NGO | government | volunteer_group)
- `Route` — id, from_location, to_location, status (clear | blocked)

**Edges:**
- `(CrisisRoom)-[:HAS_ZONE]->(Location)`
- `(Person)-[:LOCATED_IN]->(Location)`
- `(Person)-[:REPORTED]->(SOSRequest)`
- `(SOSRequest)-[:LOCATED_IN]->(Location)`
- `(SOSRequest)-[:ASSIGNED_TO]->(Resource)`
- `(Resource)-[:LOCATED_IN]->(Location)`
- `(Resource)-[:OWNED_BY]->(Agency)`
- `(Person)-[:VOLUNTEERED_FOR]->(CrisisRoom)`
- `(Location)-[:CONNECTED_BY]->(Route)-[:CONNECTED_BY]->(Location)`
- `(Shelter)-[:LOCATED_IN]->(Location)`
- `(SOSRequest)-[:RESOLVED_BY]->(Person)`

Keep the schema exactly this tight for the hackathon. Resist the urge to add more node
types — every extra node type is more seed data and more surface area for bugs before the demo.

## Agent-to-data contract
Every agent (Dispatch, Query, Coordination) reads and writes **only** through FalkorDB
queries (Cypher). No agent should hold state in memory between requests beyond what it
needs for a single reasoning step. This is what makes "memory across sessions" and
"shared state between agents" true by construction, not by a separate caching layer.
