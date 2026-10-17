import { NextResponse } from "next/server";
import { runQueryAgent } from "@/agents/query";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { question, roomId } = body;

    if (!question || !question.trim()) {
      return NextResponse.json(
        { success: false, error: "Question is required." },
        { status: 400 }
      );
    }

    const result = await runQueryAgent(question.trim(), roomId);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error("Error in Query Agent route:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process question" },
      { status: 500 }
    );
  }
}
