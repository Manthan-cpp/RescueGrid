import { Groq } from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { executeCypher } from "@/lib/graph";

export interface QueryAgentResult {
  answer: string;
  cypher: string;
  executionMs: number;
  modelUsed: string;
  graphData: any[];
}

const GRAPH_SCHEMA = `
Nodes:
- CrisisRoom (id, name, location, created_at, status)
- Location (id, name, region, accessibility_status) // accessibility_status is 'accessible', 'flooded', or 'blocked'
- SOSRequest (id, description, urgency, status, timestamp, people_count) // urgency: 'critical','high','medium','low'; status: 'open','assigned','resolved'
- Resource (id, name, type, status, capacity) // type: 'boat','ambulance','food','medicine'; status: 'available','assigned'
- Shelter (id, name, capacity, current_occupancy)
- Agency (id, name, type)

Edges:
- (CrisisRoom)-[:HAS_ZONE]->(Location)
- (SOSRequest)-[:LOCATED_IN]->(Location)
- (SOSRequest)-[:ASSIGNED_TO]->(Resource)
- (Resource)-[:LOCATED_IN]->(Location)
- (Resource)-[:OWNED_BY]->(Agency)
- (Location)-[:CONNECTED_BY {status: 'clear'|'blocked'}]->(Location)
- (Shelter)-[:LOCATED_IN]->(Location)
`;

export async function runQueryAgent(
  userQuestion: string,
  roomId?: string
): Promise<QueryAgentResult> {
  const systemPrompt = `You are the RescueGrid Query Agent ("Ask the Brain").
You convert natural language questions from crisis coordinators into precise Cypher read queries against FalkorDB.

Exact Schema:
${GRAPH_SCHEMA}

Rules:
1. Generate READ-ONLY Cypher queries (MATCH, WHERE, WITH, RETURN, ORDER BY, LIMIT). NEVER generate CREATE, DELETE, or SET.
2. If filtering by room, note that (CrisisRoom {id: '${roomId || ""}'})-[:HAS_ZONE]->(Location).
3. If the question cannot be answered by this graph schema, return an empty string for cypher.
4. Output STRICT JSON only. Format:
{
  "cypher": "MATCH ... RETURN ..."
}`;

  let generatedCypher = "";
  let modelUsed = "Groq LLaMA 3.3";

  // Step 1: Generate Cypher using Groq (Fast) with Gemini fallback
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Question: "${userQuestion}"` },
      ],
      model: "qwen/qwen3.8-27b",
      response_format: { type: "json_object" },
    });
    const parsed = JSON.parse(completion.choices[0]?.message?.content || "{}");
    generatedCypher = parsed.cypher || "";
    modelUsed = "Groq (Qwen 3.8 / LLaMA)";
  } catch (err: any) {
    console.warn("Groq failed for Query Agent, falling back to Gemini:", err.message);
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
      const model = genAI.getGenerativeModel({
        model: "gemini-3.8-flash",
        generationConfig: { responseMimeType: "application/json" },
      });
      const res = await model.generateContent(`${systemPrompt}\n\nQuestion: "${userQuestion}"`);
      const parsed = JSON.parse(res.response.text());
      generatedCypher = parsed.cypher || "";
      modelUsed = "Gemini Flash (Fallback)";
    } catch (geminiErr: any) {
      console.error("Both LLMs failed during Cypher generation:", geminiErr.message);
    }
  }

  // If question cannot map to schema
  if (!generatedCypher.trim()) {
    return {
      answer: "I could not map this question to the current disaster graph schema (Wards, SOS Requests, Resources, Shelters, Routes). Please ask about active requests, asset availability, shelter capacities, or route conditions.",
      cypher: "",
      executionMs: 0,
      modelUsed,
      graphData: [],
    };
  }

  // Step 2: Run Query against FalkorDB
  let graphResult: any[] = [];
  let executionMs = 0;
  try {
    const res = await executeCypher(generatedCypher);
    graphResult = res.data;
    executionMs = res.durationMs;
  } catch (dbErr: any) {
    console.error("FalkorDB Cypher execution error:", dbErr.message);
    return {
      answer: `The generated graph query encountered an execution error in FalkorDB: ${dbErr.message}`,
      cypher: generatedCypher,
      executionMs: 0,
      modelUsed,
      graphData: [],
    };
  }

  // Step 3: Synthesize Answer Grounded in Real Graph Data (Zero Hallucination)
  const synthesisPrompt = `You are the RescueGrid Query Agent.
User Question: "${userQuestion}"
Executed Cypher: ${generatedCypher}
Raw FalkorDB Result: ${JSON.stringify(graphResult)}

Instructions:
1. Provide a direct, authoritative, operational answer strictly grounded in the raw result above.
2. Never hallucinate names, numbers, or details not present in the FalkorDB data.
3. If the result is empty, clearly state that no records match in the graph.
4. Keep it concise (2-4 sentences max).`;

  let naturalAnswer = "";
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: synthesisPrompt }],
      model: "qwen/qwen3.8-27b",
      max_tokens: 300,
    });
    naturalAnswer = completion.choices[0]?.message?.content?.trim() || "";
  } catch (err: any) {
    // Fallback synthesis with Gemini
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
      const model = genAI.getGenerativeModel({ model: "gemini-3.8-flash" });
      const res = await model.generateContent(synthesisPrompt);
      naturalAnswer = res.response.text().trim();
    } catch {
      naturalAnswer = `Query returned ${graphResult.length} records: ${JSON.stringify(graphResult)}`;
    }
  }

  return {
    answer: naturalAnswer,
    cypher: generatedCypher,
    executionMs,
    modelUsed,
    graphData: graphResult,
  };
}
