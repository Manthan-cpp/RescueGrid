import { NextResponse } from "next/server";
import { getRoomDetails } from "@/lib/graph";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const roomId = url.searchParams.get("roomId");

    if (!roomId) {
      return NextResponse.json({ success: false, error: "roomId query param required" }, { status: 400 });
    }

    const details = await getRoomDetails(roomId);

    return NextResponse.json({
      success: true,
      roomId,
      ...details,
    });
  } catch (error: any) {
    console.error("Error fetching room details:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch room details" },
      { status: 500 }
    );
  }
}
