# DATA.md — Mock vs Real Data Strategy

Goal: the demo video should feel almost entirely "real" — data flowing because someone
(or a script acting as someone) actually did something, not because it was hardcoded.

## Real data (flows through the actual UI → FalkorDB → agents)
These must NEVER be hardcoded/mocked, even in Phase 1 UI — build the UI to receive this
shape of data from day one so wiring it to FalkorDB later is a connection, not a rewrite:
- **Crisis Room creation** — user fills the form, room node is actually created
- **SOS requests** — entered through the UI (by a "victim" role) or injected by the
  simulation script (Phase 8) calling the same API the UI calls — never a static JSON file
- **Volunteer sign-ups / availability** — entered live
- **Resource status changes** (assigned, en route, delivered) — real state transitions
- **Dispatch Agent decisions** — always computed live from the graph at that moment,
  never pre-scripted "the agent will say X"
- **Query Agent answers** — always generated live from a real Cypher query result, never
  a canned response string

## Mock data (allowed, and necessary, only here)
- **Seed infrastructure data**, loaded once when a Crisis Room is created, representing
  "what would already exist" in a real deployment: a starter set of Shelters, Agencies,
  and known Locations/Wards for the region the user typed in. This is the equivalent of
  "existing infrastructure records" — real systems would pull this from government/NGO
  databases; you're seeding it because that integration is out of scope for a hackathon.
  Keep this set small (5–10 shelters, 3–5 agencies, 8–12 wards) — just enough that the
  graph doesn't look empty on day one.
- **Simulation script** (Phase 8 only) — generates realistic-looking SOS requests,
  volunteer actions, and resource updates by calling the real API endpoints, on a timer,
  during the demo recording. This is not "mock data" in the UI sense — it's a fake crisis
  generating real graph activity, same as a real user would. This is what makes the demo
  look alive without you manually clicking 40 times on camera.

## What this means in practice
- Phase 1 (UI only): components are built against realistic-shaped sample objects
  (TypeScript interfaces / fixture data) purely so the UI can be built and viewed before
  the backend exists — but every one of those fixtures gets deleted the moment Phase 3
  wires up FalkorDB. Nothing from Phase 1 fixtures should still be present by Phase 4.
- From Phase 3 onward, if a screen shows data, that data exists as a real node/edge in
  FalkorDB — no exceptions, no "static for now, dynamic later" shortcuts.
- The ONLY data that remains intentionally pre-loaded at demo time is the seed
  infrastructure set described above, and that is clearly real-shaped data living in
  FalkorDB too (not a frontend mock) — it's just data representing "pre-existing"
  records rather than "things that happened during the crisis."
