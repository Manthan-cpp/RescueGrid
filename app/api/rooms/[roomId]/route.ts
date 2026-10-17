import { NextResponse } from "next/server";
import { getRoomDetails } from "@/lib/graph";

export async function GET(
  req: Request,
  context: any
) {
  try {
    let roomId = "";
    if (context?.params) {
      const resolved = context.params instanceof Promise ? await context.params : context.params;
      roomId = resolved?.roomId || "";
    }

    if (!roomId) {
      const url = new URL(req.url);
      roomId = url.searchParams.get("roomId") || "";
    }

    if (!roomId) {
      return NextResponse.json({ success: false, error: "Missing roomId" }, { status: 400 });
    }

    const details = await getRoomDetails(roomId);

    return NextResponse.json({
      success: true,
      roomId,
      ...details,
    });
  } catch (error: any) {
    console.error("Error fetching room details from FalkorDB:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch room details" },
      { status: 500 }
    );
  }
}
