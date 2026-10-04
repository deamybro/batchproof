import { NextRequest, NextResponse } from "next/server";
import { BatchStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const batches = BatchStore.getAllBatches();
    return NextResponse.json({ success: true, batches });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve batches" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      id,
      medicineName,
      strength,
      manufacturer,
      manufacturingDate,
      expiryDate,
      storageConditions,
      activeIngredients,
    } = body;

    // Strict input validation
    if (!id || typeof id !== "string" || id.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: "Batch ID is required and must be at least 3 characters." },
        { status: 400 }
      );
    }

    if (!medicineName || typeof medicineName !== "string" || medicineName.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Medicine name is required." },
        { status: 400 }
      );
    }

    if (!strength || typeof strength !== "string" || strength.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Strength/dosage is required (e.g. 500 mg)." },
        { status: 400 }
      );
    }

    if (!manufacturer || typeof manufacturer !== "string" || manufacturer.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Manufacturer name is required." },
        { status: 400 }
      );
    }

    if (!manufacturingDate || !/^\d{4}-\d{2}-\d{2}$/.test(manufacturingDate)) {
      return NextResponse.json(
        { success: false, error: "Manufacturing date must be formatted as YYYY-MM-DD." },
        { status: 400 }
      );
    }

    if (!expiryDate || !/^\d{4}-\d{2}-\d{2}$/.test(expiryDate)) {
      return NextResponse.json(
        { success: false, error: "Expiry date must be formatted as YYYY-MM-DD." },
        { status: 400 }
      );
    }

    if (new Date(expiryDate).getTime() <= new Date(manufacturingDate).getTime()) {
      return NextResponse.json(
        { success: false, error: "Expiry date must be later than manufacturing date." },
        { status: 400 }
      );
    }

    const result = await BatchStore.registerBatch({
      id: id.trim().toUpperCase(),
      medicineName,
      strength,
      manufacturer,
      manufacturingDate,
      expiryDate,
      storageConditions,
      activeIngredients: Array.isArray(activeIngredients) ? activeIngredients : undefined,
    });

    return NextResponse.json({
      success: true,
      message: `Batch ${result.batch.id} registered and published to Hedera Consensus Service.`,
      batch: result.batch,
      event: result.event,
      hcsResult: result.hcsResult,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to register medicine batch" },
      { status: 400 }
    );
  }
}
