# RescueGrid — Agent Onboarding

> If you are an AI coding agent picking up this project (fresh start OR mid-way),
> read these files **in this order** before writing any code:

1. `ARCHITECTURE.md` — what we're building, tech stack, graph schema, zero-cost rules
2. `DESIGN.md` — UI/UX system. Non-negotiable. Read before writing a single component.
3. `DATA.md` — what is mock, what is real, and where each lives
4. `AGENTS.md` — the AI agent system inside the product (Dispatch Agent, Query Agent, etc.)
5. `PLAN.md` — the phased build plan. Find the last completed phase, continue from there.

## One-line pitch
RescueGrid is a disaster-response coordination platform built entirely on **FalkorDB**
as a knowledge graph. A "Crisis Room" is created like a WhatsApp group; as SOS requests,
volunteers, and resources get logged, the graph grows live, and AI agents traverse it to
dispatch resources, coordinate with each other, and answer questions instantly
("Company Brain").

## Hard constraints (apply to every phase)
- **Zero cost.** Every tool/service used must have a genuinely free tier. No credit card traps.
- **FalkorDB is the single source of truth.** No parallel database, no local cache that
  survives a restart, no "just for now" in-memory store. If FalkorDB goes down, the app
  should visibly stop working — that's intentional, it proves the dependency.
- **No AI-slop UI.** See `DESIGN.md` — this is strictly enforced, not a suggestion.
- **Minimal mock data.** See `DATA.md` for exactly where mock is allowed and where it isn't.
- **Beginner-friendly UX.** Separate panels/tabs/pages for each concern. Never cram
  multiple unrelated actions into one screen.

## Current status
Update this section as phases complete:
- [x] Phase 0 — Project Setup
- [ ] Phase 1 — UI Implementation (all screens, mock data wired, zero backend)
- [ ] Phase 2 — FalkorDB Schema & Connection
- [ ] Phase 3 — Crisis Room + Live Data Ingestion
- [ ] Phase 4 — Dispatch Agent
- [ ] Phase 5 — Query Agent (Company Brain)
- [ ] Phase 6 — Memory & Multi-Agent Coordination
- [ ] Phase 7 — Live Graph Visualization + Real-time Sync
- [ ] Phase 8 — Demo Polish & Simulation Script
