import { NextResponse } from "next/server";
import { getHederaStatus } from "@/lib/hedera";
import { BatchStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const hedera = getHederaStatus();
  const batches = BatchStore.getAllBatches();
  const events = BatchStore.getAuditEvents();

  return NextResponse.json({
    status: "ok",
    service: "BatchProof Verification Engine",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    hedera: {
      network: hedera.network,
      demoMode: hedera.demoMode,
      isConfigured: hedera.isConfigured,
      topicId: hedera.topicId || (hedera.demoMode ? "0.0.7812044 (Demo)" : null),
    },
    counts: {
      totalBatches: batches.length,
      totalAuditEvents: events.length,
    },
  });
}
