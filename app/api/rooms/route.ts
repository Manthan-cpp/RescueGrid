import { NextResponse } from "next/server";
import { getCrisisRooms, createCrisisRoom } from "@/lib/graph";
import { CrisisRoom } from "@/lib/types";

export async function GET() {
  try {
    const rooms = await getCrisisRooms();
    return NextResponse.json({ success: true, rooms });
  } catch (error: any) {
    console.error("Error fetching crisis rooms from FalkorDB:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch crisis rooms" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, location } = body;

    if (!name || !location) {
      return NextResponse.json(
        { success: false, error: "Name and location are required." },
        { status: 400 }
      );
    }

    const roomId = `room-${Date.now()}`;
    const newRoom: CrisisRoom = {
      id: roomId,
      name: name.trim(),
      location: location.trim(),
      created_at: new Date().toISOString(),
      status: "active",
    };

    await createCrisisRoom(newRoom);

    return NextResponse.json({ success: true, room: newRoom }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating crisis room in FalkorDB:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create crisis room" },
      { status: 500 }
    );
  }
}
