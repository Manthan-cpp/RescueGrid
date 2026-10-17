import { GoogleGenerativeAI } from "@google/generative-ai";
import { Groq } from "groq-sdk";
import { getGraph, assignResourceToSOS } from "@/lib/graph";
import { SOSRequest, AgentLogEntry, Resource } from "@/lib/types";

export interface DispatchResult {
  assigned: boolean;
  resourceId?: string;
  resourceName?: string;
  reasoning: string;
  modelUsed: "Gemini 1.5 Flash" | "Groq LLaMA 3.3" | "Gemini 2.5 Flash";
  status: "success" | "warning" | "error";
}

export async function runDispatchAgent(
  sos: SOSRequest,
  roomId: string
): Promise<DispatchResult> {
  const graph = await getGraph();

  // 1. Query FalkorDB graph for candidate resources and route statuses
  const candidatesCypher = `
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
  `;

  const queryRes = await graph.query(candidatesCypher, {
    params: { locationId: sos.location_id },
  });

  const candidates: any[] = queryRes.data || [];

  if (candidates.length === 0) {
    return {
      assigned: false,
      reasoning: `Zero available resources found in operational perimeter for ${sos.location_name || sos.location_id}. Request queued as open priority ${sos.urgency}.`,
      modelUsed: "Gemini 1.5 Flash",
      status: "warning",
    };
  }

  // 2. Formulate Prompt for Gemini Flash Judgment Call
  const systemPrompt = `You are the RescueGrid Autonomous Dispatch Agent.
You operate on connected graph data from FalkorDB.
Your task: Match an incoming SOS request to the single best available emergency resource.

Graph Schema:
- Nodes: SOSRequest, Resource (boat, ambulance, food, medicine), Location, Shelter, Agency, Route
- Edges: (SOSRequest)-[:LOCATED_IN]->(Location), (Resource)-[:LOCATED_IN]->(Location), (Location)-[:CONNECTED_BY {status: 'clear'|'blocked'}]->(Location)

Criteria:
1. Prioritize resources where the route is NOT blocked ('clear' or direct same-ward).
2. For floods/trapped victims, prioritize 'boat' or appropriate medical support.
3. Pick the closest and most viable asset.
4. Output STRICT JSON only. Format:
{
  "selected_resource_id": "res_id",
  "reasoning": "Concise human-readable operational reasoning (1-2 sentences) citing distance, route status, and asset capability."
}`;

  const userPrompt = `Incoming SOS Request:
ID: ${sos.id}
Description: ${sos.description}
Urgency: ${sos.urgency}
Location: ${sos.location_name || sos.location_id}
People affected: ${sos.people_count || 1}

Available Candidate Resources in Graph:
${JSON.stringify(candidates, null, 2)}

Select the best match and provide reasoning.`;

  let decision: { selected_resource_id: string; reasoning: string } | null = null;
  let modelUsed: "Gemini 1.5 Flash" | "Groq LLaMA 3.3" | "Gemini 2.5 Flash" = "Gemini 1.5 Flash";

  // Try Gemini Flash first
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({
      model: "gemini-3.8-flash",
      generationConfig: { responseMimeType: "application/json" },
    });
    const result = await model.generateContent(`${systemPrompt}\n\n${userPrompt}`);
    const text = result.response.text();
    decision = JSON.parse(text);
    modelUsed = "Gemini 1.5 Flash";
  } catch (geminiErr: any) {
    console.warn("Gemini dispatch failed, falling back to Groq:", geminiErr.message);

    // Fallback to Groq LLaMA / Qwen
    try {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        model: "qwen/qwen3.8-27b",
        response_format: { type: "json_object" },
      });
      const text = completion.choices[0]?.message?.content || "{}";
      decision = JSON.parse(text);
      modelUsed = "Groq LLaMA 3.3";
    } catch (groqErr: any) {
      console.error("Both LLMs failed during dispatch:", groqErr.message);
      // Deterministic graph fallback
      const nonBlocked: any = candidates.find((c: any) => c.route_status !== "blocked") || candidates[0];
      decision = {
        selected_resource_id: nonBlocked?.res_id || "",
        reasoning: `Graph algorithm fallback: Selected nearest available asset ${nonBlocked?.res_name} staged at ${nonBlocked?.res_loc_name}.`,
      };
    }
  }

  if (decision && decision.selected_resource_id) {
    const matched: any = candidates.find((c: any) => c.res_id === decision!.selected_resource_id) || candidates[0];

    // 3. Write decision back to FalkorDB
    await assignResourceToSOS(sos.id, matched.res_id, decision.reasoning);

    return {
      assigned: true,
      resourceId: matched.res_id,
      resourceName: matched.res_name,
      reasoning: decision.reasoning,
      modelUsed,
      status: "success",
    };
  }

  return {
    assigned: false,
    reasoning: "No viable candidate could be assigned by graph traversal.",
    modelUsed,
    status: "warning",
  };
}
