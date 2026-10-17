# AGENTS.md — The AI Agent System

RescueGrid has three agents. All three read/write the same FalkorDB graph — that shared
graph IS the coordination and memory layer, not a message queue between agents.

## 1. Dispatch Agent
**Model:** Gemini (Flash) — used for the judgment call of matching a request to a resource.
**Trigger:** A new `SOSRequest` node is created.
**Behavior:**
1. Query the graph: request's location → nearby available Resources → check Route status
   between resource location and request location → check nearest Shelter capacity if relevant.
2. Pick the best match (nearest available + route not blocked).
3. Write the decision back to the graph: create `ASSIGNED_TO` edge, update Resource status.
4. Log a human-readable reasoning string ("Assigned Boat-04 — nearest available, route
   clear, ETA ~12 min") to an `Agent Activity Log` — this is what the UI's Agent Activity
   tab displays, and it's the "show the path behind an answer" requirement from the brief.

## 2. Query Agent ("Ask the Brain")
**Model:** Groq (Llama) — used for speed, since this is a live chat interface.
**Trigger:** User types a natural-language question in the "Ask the Brain" tab.
**Behavior:**
1. Convert the user's question into a Cypher query against the current schema
   (`ARCHITECTURE.md` has the schema — the agent's system prompt must include it).
2. Run the query against FalkorDB.
3. Convert the raw graph result back into a natural-language answer.
4. If the question can't map to the schema, say so plainly — never hallucinate an answer
   not backed by an actual query result.

## 3. Coordination / Memory behavior (not a separate UI, but a required property)
This isn't a third chat interface — it's a property the system must demonstrably have:
- Any agent, asked the same question on Day 1 vs Day 3 of a simulated crisis, gives a
  different, correct answer because the graph has changed — this is "memory across
  sessions," proven by the graph itself, not by an agent's internal chat history.
- The Dispatch Agent's decisions on Day 3 should visibly account for state the Query
  Agent could also report on (e.g., "Ward 7 already has low resource availability") —
  this is "shared state between agents," proven by both reading the same graph.

## Prompt-engineering rules for both agents
- Every agent's system prompt includes the exact graph schema from `ARCHITECTURE.md` —
  never let the agent guess node/edge names.
- Every agent call should fail loudly and visibly in the UI (not fail silently) if the
  LLM API or FalkorDB is unreachable — this is part of proving the FalkorDB dependency.
- Add a fallback: if Groq rate-limits, retry on Gemini, and vice versa. Log which model
  actually answered (small detail, but shows production-grade thinking to judges).
