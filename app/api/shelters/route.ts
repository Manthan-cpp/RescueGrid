import { NextResponse } from "next/server";
import { addShelter, updateShelterOccupancy } from "@/lib/graph";
import { Shelter } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, location_id, location_name, capacity, current_occupancy, has_medical, has_generator, contact_phone, lat, lng, roomId } = body;

    if (!name || !location_id) {
      return NextResponse.json(
        { success: false, error: "Shelter name and location are required." },
        { status: 400 }
      );
    }

    const shelterId = `sh-${Date.now().toString().slice(-5)}`;
    const newShelter: Shelter = {
      id: shelterId,
      name: name.trim(),
      capacity: Number(capacity) || 50,
      current_occupancy: Number(current_occupancy) || 0,
      location_id,
      location_name: location_name || "Relief Zone",
      has_medical: Boolean(has_medical),
      has_generator: Boolean(has_generator),
      contact_phone: contact_phone?.trim() || "",
      lat: Number(lat) || undefined,
      lng: Number(lng) || undefined,
    };

    await addShelter(newShelter, roomId);

    return NextResponse.json({ success: true, shelter: newShelter }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating shelter in FalkorDB:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create shelter" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { shelterId, current_occupancy } = body;

    if (!shelterId || typeof current_occupancy !== "number") {
      return NextResponse.json(
        { success: false, error: "shelterId and current_occupancy are required." },
        { status: 400 }
      );
    }

    await updateShelterOccupancy(shelterId, current_occupancy);
    return NextResponse.json({ success: true, shelterId, current_occupancy });
  } catch (error: any) {
    console.error("Error updating shelter occupancy in FalkorDB:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update shelter occupancy" },
      { status: 500 }
    );
  }
}
