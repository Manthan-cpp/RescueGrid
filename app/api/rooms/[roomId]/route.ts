import { NextResponse } from "next/server";
import { getRoomDetails } from "@/lib/graph";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
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
