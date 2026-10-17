import { NextResponse } from "next/server";
import { resolveSOS } from "@/lib/graph";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ sosId: string }> }
) {
  try {
    const { sosId } = await params;
    await resolveSOS(sosId);

    return NextResponse.json({ success: true, sosId, status: "resolved" });
  } catch (error: any) {
    console.error("Error resolving SOS in FalkorDB:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to resolve SOS request" },
      { status: 500 }
    );
  }
}
