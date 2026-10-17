import { NextResponse } from "next/server";
import { createSOS } from "@/lib/graph";
import { runDispatchAgent } from "@/agents/dispatch";
import { SOSRequest } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { description, urgency, location_id, location_name, people_count, roomId } = body;

    if (!description || !location_id) {
      return NextResponse.json(
        { success: false, error: "Description and location are required." },
        { status: 400 }
      );
    }

    const sosId = `sos-${Date.now().toString().slice(-4)}`;
    const newSOS: SOSRequest = {
      id: sosId,
      description: description.trim(),
      urgency: urgency || "high",
      status: "open",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      location_id,
      location_name: location_name || "Assigned Sector",
      people_count: Number(people_count) || 1,
    };

    // 1. Create SOS node in FalkorDB
    await createSOS(newSOS, roomId);

    // 2. Trigger Dispatch Agent (Gemini Flash judgment & graph writeback)
    const dispatchResult = await runDispatchAgent(newSOS, roomId || "default");

    return NextResponse.json({
      success: true,
      sos: {
        ...newSOS,
        status: dispatchResult.assigned ? "assigned" : "open",
        assigned_resource_id: dispatchResult.resourceId,
        assigned_resource_name: dispatchResult.resourceName,
      },
      dispatch: dispatchResult,
    });
  } catch (error: any) {
    console.error("Error creating SOS in FalkorDB:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create SOS request" },
      { status: 500 }
    );
  }
}
