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

    await createCrisisRoom(newRoom, false);

    // If user provided initial operational zones, create only those clean location nodes
    const { zones } = body;
    if (zones && typeof zones === "string" && zones.trim()) {
      const graph = await (await import("@/lib/graph")).getGraph();
      const zoneNames = zones.split(",").map((z: string) => z.trim()).filter(Boolean);
      for (let i = 0; i < zoneNames.length; i++) {
        const zoneName = zoneNames[i];
        const locId = `${roomId}-z${i + 1}`;
        await graph.query(
          `MATCH (room:CrisisRoom { id: $roomId })
           MERGE (loc:Location { id: $locId })
           ON CREATE SET loc.name = $name, loc.region = $region, loc.accessibility_status = 'accessible'
           MERGE (room)-[:HAS_ZONE]->(loc)`,
          { params: { roomId, locId, name: zoneName, region: newRoom.location } }
        );
      }
    }

    return NextResponse.json({ success: true, room: newRoom }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating crisis room in FalkorDB:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create crisis room" },
      { status: 500 }
    );
  }
}
