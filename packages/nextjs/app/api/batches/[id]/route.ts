import { NextRequest, NextResponse } from "next/server";
import { BatchStore } from "@/lib/store";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id || id.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Batch code is required" },
        { status: 400 }
      );
    }

    const verification = BatchStore.verifyBatch(id);
    return NextResponse.json({ success: true, verification });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Verification failed" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action, reason } = body;

    if (action === "recall") {
      if (!reason || typeof reason !== "string" || reason.trim().length < 5) {
        return NextResponse.json(
          { success: false, error: "A valid recall reason (minimum 5 characters) is required." },
          { status: 400 }
        );
      }

      const result = await BatchStore.recallBatch(id, reason);
      return NextResponse.json({
        success: true,
        message: `Batch ${id} has been marked as RECALLED on Hedera Consensus Service.`,
        batch: result.batch,
        event: result.event,
        hcsResult: result.hcsResult,
      });
    }

    return NextResponse.json(
      { success: false, error: `Unsupported batch action: '${action}'` },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update batch status" },
      { status: 400 }
    );
  }
}
