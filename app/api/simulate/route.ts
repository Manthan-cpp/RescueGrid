import { NextResponse } from "next/server";
import { getCrisisRooms, createCrisisRoom, createSOS, createAgentLog, getGraph } from "@/lib/graph";
import { runDispatchAgent } from "@/agents/dispatch";
import { CrisisRoom, SOSRequest, AgentLogEntry } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    let roomId = body.roomId;

    // 1. If no room provided, find or create one
    if (!roomId) {
      const existingRooms = await getCrisisRooms();
      if (existingRooms.length > 0) {
        roomId = existingRooms[0].id;
      } else {
        roomId = `room-sim-${Date.now().toString().slice(-4)}`;
        const simRoom: CrisisRoom = {
          id: roomId,
          name: "Wayanad Emergency Response Operations",
          location: "Wayanad District, Kerala",
          created_at: new Date().toISOString(),
          status: "active",
        };
        await createCrisisRoom(simRoom);
      }
    }

    const graph = await getGraph();

    // 2. Query available wards in this room
    const wardsRes = await graph.query(
      `MATCH (r:CrisisRoom { id: $roomId })-[:HAS_ZONE]->(w:Location) RETURN w.id as id, w.name as name`,
      { params: { roomId } }
    );
    const wards: any[] = wardsRes.data || [];
    const w1 = wards[0]?.id || `${roomId}-w1`;
    const w2 = wards[1]?.id || `${roomId}-w2`;

    // 3. Ingest Scenario Incident 1 (Day 1: Flash flood trapping family)
    const sos1: SOSRequest = {
      id: `sos-${Date.now().toString().slice(-4)}-1`,
      description: "Family of 4 trapped on roof as flash flood crests lower valley sector.",
      urgency: "critical",
      status: "open",
      timestamp: "10:14 AM (Day 1)",
      location_id: w1,
      location_name: wards[0]?.name || "Sector 1 Lower Basin",
      people_count: 4,
    };
    await createSOS(sos1, roomId);
    const dispatch1 = await runDispatchAgent(sos1, roomId);

    if (dispatch1 && roomId) {
      const log1: AgentLogEntry = {
        id: `log-${Date.now()}-${sos1.id}`,
        timestamp: sos1.timestamp,
        agent: "Dispatch Agent",
        action: dispatch1.assigned
          ? `Assigned ${dispatch1.resourceName} to ${sos1.id}`
          : `Queued ${sos1.id} (Deficit Alert)`,
        reasoning: dispatch1.reasoning,
        model_used: dispatch1.modelUsed,
        status: dispatch1.status,
        sos_id: sos1.id,
        resource_id: dispatch1.resourceId,
        roomId,
      };
      await createAgentLog(roomId, log1).catch((err) =>
        console.error("Failed to persist simulation log 1:", err)
      );
    }

    // 4. Ingest Scenario Incident 2 (Day 3: Second wave mudslide testing memory & depleted assets)
    const sos2: SOSRequest = {
      id: `sos-${Date.now().toString().slice(-4)}-2`,
      description: "Mudslide blocks eastern ridge road; 6 elderly residents need medical extraction.",
      urgency: "high",
      status: "open",
      timestamp: "02:30 PM (Day 3)",
      location_id: w2,
      location_name: wards[1]?.name || "Bridge Crossing East",
      people_count: 6,
    };
    await createSOS(sos2, roomId);
    const dispatch2 = await runDispatchAgent(sos2, roomId);

    if (dispatch2 && roomId) {
      const log2: AgentLogEntry = {
        id: `log-${Date.now()}-${sos2.id}`,
        timestamp: sos2.timestamp,
        agent: "Dispatch Agent",
        action: dispatch2.assigned
          ? `Assigned ${dispatch2.resourceName} to ${sos2.id}`
          : `Queued ${sos2.id} (Deficit Alert)`,
        reasoning: dispatch2.reasoning,
        model_used: dispatch2.modelUsed,
        status: dispatch2.status,
        sos_id: sos2.id,
        resource_id: dispatch2.resourceId,
        roomId,
      };
      await createAgentLog(roomId, log2).catch((err) =>
        console.error("Failed to persist simulation log 2:", err)
      );
    }

    return NextResponse.json({
      success: true,
      roomId,
      simulatedEvents: [
        { sos: sos1, dispatch: dispatch1 },
        { sos: sos2, dispatch: dispatch2 },
      ],
    });
  } catch (error: any) {
    console.error("Simulation error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to run simulation" },
      { status: 500 }
    );
  }
}
