import { NextResponse } from "next/server";
import { reportRoadHazard } from "@/lib/graph";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { from_location_id, to_location_id, status, notes, roomId } = body;

    if (!from_location_id || !to_location_id || !status) {
      return NextResponse.json(
        { success: false, error: "from_location_id, to_location_id, and status are required." },
        { status: 400 }
      );
    }

    await reportRoadHazard(from_location_id, to_location_id, status, notes, roomId);

    return NextResponse.json({
      success: true,
      hazard: {
        from_location_id,
        to_location_id,
        status,
        notes,
      },
    });
  } catch (error: any) {
    console.error("Error reporting road hazard in FalkorDB:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to report hazard" },
      { status: 500 }
    );
  }
}
