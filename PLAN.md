# PLAN.md — RescueGrid Build Plan

Read `ARCHITECTURE.md`, `DESIGN.md`, `DATA.md`, and `AGENTS.md` before starting any phase.
Each phase below must be fully complete (its Definition of Done met) before moving to the
next. If you are an agent resuming this project, check `README.md`'s status checklist to
find where to continue.

---

## Phase 0 — Project Setup
**Goal:** A clean, running skeleton with nothing demo-worthy yet, but all tooling in place.

**Tasks:**
- Initialize Next.js project (TypeScript) + folder structure (`/app`, `/components`,
  `/lib`, `/agents`, `/docs`)
- Set up linting/formatting
- Set up Docker Compose with a FalkorDB container (for local dev)
- Create `.env.example` listing every required key (FalkorDB connection, Groq key,
  Gemini key) — never commit real keys
- Push to GitHub, deploy an empty Next.js app to Vercel to confirm the pipeline works

**Definition of Done:** `npm run dev` runs locally, FalkorDB container starts via Docker
Compose, empty app is live on a Vercel URL.

**Data:** None yet.

---

## Phase 1 — UI Implementation (perfect, zero backend)
**Goal:** Every screen from `DESIGN.md`'s structure section exists, looks final, and is
fully navigable using fixture data. No FalkorDB connection yet.

**Tasks:**
- Build the design system first: colors, typography, spacing, icon set, base components
  (buttons, tables, tabs, cards, status badges) following `DESIGN.md` exactly
- Landing page: list of Crisis Rooms (fixture data) + "Create Room" button
- Create Room flow: full form, validates, "creates" a room (in local state only)
- Room Dashboard shell with all tabs navigable: Overview, Live Graph, SOS Requests,
  Resources, Ask the Brain, Agent Activity Log
- Overview tab: stat cards wired to fixture numbers
- SOS Requests tab: table/list UI with filter/sort, using fixture requests
- Resources tab: same, using fixture resources
- Live Graph tab: graph canvas rendering a static fixture graph (no live updates yet),
  but using the real visual style and node/edge types from `ARCHITECTURE.md`'s schema
- Ask the Brain tab: chat UI shell with a few fixture Q&A pairs shown as if answered
- Agent Activity Log tab: list UI showing a few fixture log entries with reasoning text
- Responsive pass: confirm it holds up at common demo-recording resolutions

**Definition of Done:** Every screen in `DESIGN.md` exists, nothing is a dead link or
placeholder text, it would look complete in a silent screen recording. Zero backend calls.

**Data:** 100% fixture data per `DATA.md`'s Phase 1 rule — all of it gets deleted by
Phase 3, so keep fixtures in one isolated file, not scattered across components.

---

## Phase 2 — FalkorDB Schema & Connection
**Goal:** Real graph exists and is queryable; nothing in the UI uses it yet.

**Tasks:**
- Write Cypher setup scripts to create constraints/indexes for the schema in
  `ARCHITECTURE.md`
- Build a thin data-access layer (`/lib/graph.ts` or similar) — every future read/write
  to FalkorDB goes through this layer, nowhere else
- Write the seed-data script for infrastructure records (shelters, agencies, wards) per
  `DATA.md`
- Confirm: create a Crisis Room via a script, query it back, confirm seed data attaches
  correctly

**Definition of Done:** Can create a room + see its seeded infrastructure data purely via
script/CLI, no UI involvement yet.

**Data:** Real graph writes, driven by scripts (not yet the UI).

---

## Phase 3 — Crisis Room + Live Data Ingestion
**Goal:** The UI actually talks to FalkorDB. Fixture data is fully removed.

**Tasks:**
- Wire "Create Room" form to actually create a `CrisisRoom` node + trigger seed data
- Wire SOS Request submission (new UI form, or extend an existing screen) to create a
  real `SOSRequest` node
- Wire volunteer sign-up similarly
- Wire resource status updates similarly
- Replace every fixture-data usage in Phase 1 screens with real FalkorDB reads
- Add real-time sync (WebSocket/SSE) so one browser tab's changes appear in another
  without a refresh — required for the "live, growing graph" effect

**Definition of Done:** Opening the app with an empty FalkorDB shows an empty state; every
action taken in the UI is verifiable as a real node/edge via a direct FalkorDB query.

**Data:** 100% real from here on, except the seed infrastructure set.

---

## Phase 4 — Dispatch Agent
**Goal:** New SOS requests get real, automatic resource assignment.

**Tasks:**
- Implement the Dispatch Agent per `AGENTS.md` (Gemini-powered)
- Trigger it on every new `SOSRequest` creation
- Write its decision + reasoning text back to the graph
- Surface the reasoning text in the Agent Activity Log tab (now live, not fixture)
- Handle the "no resource available" case gracefully in the UI

**Definition of Done:** Submitting an SOS request through the UI results in a visible,
correct, graph-backed assignment within a few seconds, with a readable reasoning trail.

**Data:** Fully real — every assignment is a live Gemini call against live graph state.

---

## Phase 5 — Query Agent (Company Brain)
**Goal:** "Ask the Brain" tab answers real questions from the live graph.

**Tasks:**
- Implement the Query Agent per `AGENTS.md` (Groq-powered)
- Natural language → Cypher → graph result → natural language answer pipeline
- Handle unanswerable questions gracefully (no hallucination)
- Wire the chat UI from Phase 1 to this real pipeline, remove fixture Q&A

**Definition of Done:** Asking "what's the status of Ward X" or "who's available right
now" returns a correct, graph-verifiable answer, live.

**Data:** Fully real.

---

## Phase 6 — Memory & Multi-Agent Coordination (proof, not new UI)
**Goal:** Demonstrate that agents share state and that the system remembers across time.

**Tasks:**
- Build a small internal test/demo scenario: simulate "Day 1" and "Day 3" of a crisis
  (can reuse the simulation script foundation from Phase 8, built early here if easier)
- Confirm Dispatch Agent's Day 3 decisions visibly account for Day 1 state
  (e.g., depleted resources, already-known blocked routes)
- Confirm Query Agent can answer questions referencing earlier-crisis events correctly
- No separate UI needed — this phase is about verifying the property already designed
  into the architecture, and making sure the Agent Activity Log tells this story clearly

**Definition of Done:** You can demo, live, a question whose correct answer depends on
something that happened earlier in the same crisis — and get it right.

**Data:** Fully real, run across a simulated multi-day timeline.

---

## Phase 7 — Live Graph Visualization + Real-time Sync Polish
**Goal:** The Live Graph tab becomes the visual centerpiece of the demo.

**Tasks:**
- Wire the graph canvas to real, live FalkorDB data (replacing Phase 1's static fixture)
- Implement the node/edge entrance animations from `DESIGN.md`
- Color-code by status (open SOS = one color, resolved = another, etc.)
- Add click-to-inspect on nodes (show details in a side panel, not a popup/modal that
  breaks flow)
- Performance pass: confirm it stays smooth with a realistic demo-sized graph (hundreds
  of nodes, not thousands — don't over-engineer for scale you won't demo)

**Definition of Done:** Watching the graph tab during a live simulated crisis is, by
itself, a compelling 30-second demo clip.

**Data:** Fully real.

---

## Phase 8 — Demo Polish & Simulation Script
**Goal:** A repeatable, impressive, recordable demo.

**Tasks:**
- Build the simulation script described in `DATA.md` — calls real API endpoints to
  generate a believable sequence of SOS requests, volunteer actions, and resource
  updates over a compressed timeline
- Write a demo script (the spoken narrative + what to click, in order)
- Final visual QA pass against `DESIGN.md` (catch any leftover AI-slop patterns)
- Error-state QA: confirm what happens if FalkorDB is briefly unreachable (should fail
  visibly, proving the dependency, not silently fall back to stale data)
- Record the demo video

**Definition of Done:** A clean run-through, start to finish, that hits all three tracks
without needing to explain away any rough edges.

**Data:** Fully real, generated live by the simulation script during recording.
