import { NextResponse } from "next/server";
import { addResource, updateResourceStatus } from "@/lib/graph";
import { Resource } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, type, location_id, location_name, capacity, agency_name, contact_phone, notes, lat, lng, roomId } = body;

    if (!name || !type || !location_id) {
      return NextResponse.json(
        { success: false, error: "Resource name, category, and location are required." },
        { status: 400 }
      );
    }

    const resourceId = `res-${Date.now().toString().slice(-5)}`;
    const newResource: Resource = {
      id: resourceId,
      name: name.trim(),
      type,
      status: "available",
      location_id,
      location_name: location_name || "Staging Base",
      capacity: Number(capacity) || 1,
      agency_id: `agency-${(agency_name || "vol").toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
      agency_name: agency_name || "Emergency Task Force",
      contact_phone: contact_phone?.trim() || "",
      notes: notes?.trim() || "",
      lat: Number(lat) || undefined,
      lng: Number(lng) || undefined,
    };

    await addResource(newResource, roomId);

    return NextResponse.json({ success: true, resource: newResource }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating resource in FalkorDB:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create resource" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { resourceId, status } = body;

    if (!resourceId || !status) {
      return NextResponse.json(
        { success: false, error: "resourceId and status are required." },
        { status: 400 }
      );
    }

    await updateResourceStatus(resourceId, status);
    return NextResponse.json({ success: true, resourceId, status });
  } catch (error: any) {
    console.error("Error updating resource status in FalkorDB:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update resource" },
      { status: 500 }
    );
  }
}
