# DESIGN.md — RescueGrid UI/UX System

UI is Phase 1 — before any backend logic. It must be near-final quality before the project
moves on. Treat this file as a hard spec, not a vibe.

## Explicitly banned (do not use, even once)
- Glassmorphism (frosted blur panels, translucent cards)
- Pill-shaped buttons/tags/badges (use rectangles with small border-radius, 4–8px max)
- Glowing text, glowing borders, neon drop-shadows
- Purple/violet gradient backgrounds as a default theme (the generic "AI product" look)
- Overused rounded-everything — mix sharp and soft deliberately, don't round every corner
- Emoji used as UI icons (use a proper icon set — e.g. Lucide/Phosphor)
- Centered-everything layouts with giant hero text and vague taglines

## Visual direction
- **Base:** Clean, light background (off-white, not pure white — e.g. `#F7F7F5` or similar),
  high-contrast dark text. This is a utility tool used during a real crisis — clarity over flash.
- **Graph canvas specifically:** can go dark/light-on-dark as a deliberate contrast zone
  (e.g. a near-black graph canvas with light-colored nodes/edges) so it reads as "the
  system's live brain" distinct from the rest of the UI — but the surrounding app chrome
  stays light and calm.
- **Color use:** one accent color used sparingly and consistently (status/urgency only —
  e.g. red for unresolved SOS, green for resolved, amber for in-progress). Color should
  carry meaning, not decoration.
- **Typography:** one clean sans-serif for UI (e.g. Inter) + optionally one monospace for
  IDs/timestamps/technical labels (ward codes, resource IDs). No more than 2 typefaces.
- **Density:** information-dense but organized — this tool is used by coordinators under
  pressure, not browsed casually. Favor tables, lists, and clear hierarchy over empty
  whitespace-heavy "landing page" layouts.

## Structure — separate panels, tabs, and pages (not one giant dashboard)
- **Landing / Room selection** — list of active Crisis Rooms + "Create Room" action
- **Create Room flow** — short form: name, region/location, initial zones (this is the
  "create a WhatsApp group" moment the user described)
- **Room Dashboard** (once inside a room), with distinct tabs:
  - **Overview** — key stats (open SOS count, resources available, active volunteers)
  - **Live Graph** — the FalkorDB graph rendered and animating as data comes in
  - **SOS Requests** — list/table view, filterable by status/ward
  - **Resources** — list/table of resources and their assignment status
  - **Ask the Brain** — the Query Agent chat interface (Company Brain track)
  - **Agent Activity Log** — shows what the Dispatch Agent has done and why (reasoning
    path shown per action — this is the "show the path behind an answer" requirement)

## Animation guidelines (purposeful, not decorative)
- New node appears on the graph: gentle fade + scale-in, not a bounce or neon pulse
- New edge forms: draw-in line animation (left-to-right or source-to-target), under 400ms
- Status changes (SOS resolved, resource assigned): a brief color transition, not a flash
- Live counters (open SOS, available resources): animate number changes, don't just snap
- Keep every animation under ~400ms. Nothing should feel like it's trying to impress —
  it should feel like a professional ops tool that happens to be alive.

## Definition of "perfect UI" for Phase 1
Every screen above exists, is fully navigable, uses mock data (see `DATA.md`), has zero
dead ends or placeholder "lorem ipsum" text, and would look correct in a demo recording
with zero backend connected.
