import { NextResponse } from "next/server";
import { getHederaStatus } from "@/lib/hedera";
import { BatchStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const status = getHederaStatus();
  const allEvents = BatchStore.getAuditEvents();

  return NextResponse.json({
    success: true,
    hedera: {
      network: status.network,
      demoMode: status.demoMode,
      isConfigured: status.isConfigured,
      topicId: status.topicId || (status.demoMode ? "0.0.7812044" : null),
      operatorPreview: status.operatorId,
      totalEventsAnchored: allEvents.length,
    },
    latestEvents: allEvents.slice(0, 5),
  });
}
