import {
  BatchAuditEvent,
  BatchStatus,
  CanonicalBatchPayload,
  HcsBatchEventPayload,
  HcsEventType,
  MedicineBatch,
} from "./types";
import { computeCanonicalBatchHash } from "./batch-hash";

/**
 * Creates an HCS event payload ready to be serialized and submitted to an HCS topic
 */
export function createHcsEventPayload(params: {
  eventType: HcsEventType;
  batch: MedicineBatch | CanonicalBatchPayload;
  issuerAccountId: string;
  status: BatchStatus;
  timestamp?: string;
  reason?: string;
  notes?: string;
}): HcsBatchEventPayload {
  const recordHash =
    "recordHash" in params.batch && params.batch.recordHash
      ? params.batch.recordHash
      : computeCanonicalBatchHash(params.batch);

  return {
    schemaVersion: "1.0.0",
    eventType: params.eventType,
    batchId: params.batch.id.trim().toUpperCase(),
    recordHash,
    issuerAccountId: params.issuerAccountId.trim(),
    timestamp: params.timestamp || new Date().toISOString(),
    status: params.status,
    ...(params.reason ? { reason: params.reason } : {}),
    ...(params.notes ? { notes: params.notes } : {}),
  };
}

/**
 * Serializes an HCS batch event payload into a deterministic JSON string for topic submission
 */
export function serializeHcsEvent(payload: HcsBatchEventPayload): string {
  // Enforce sorted keys for canonical message structure on-chain
  const sortedPayload: Record<string, any> = {
    batchId: payload.batchId,
    eventType: payload.eventType,
    issuerAccountId: payload.issuerAccountId,
    recordHash: payload.recordHash,
    schemaVersion: payload.schemaVersion,
    status: payload.status,
    timestamp: payload.timestamp,
  };

  if (payload.reason) sortedPayload.reason = payload.reason;
  if (payload.notes) sortedPayload.notes = payload.notes;

  return JSON.stringify(sortedPayload);
}

/**
 * Deserializes and validates an HCS topic message into an HcsBatchEventPayload
 */
export function parseHcsEventMessage(messageStr: string): HcsBatchEventPayload {
  let parsed: any;
  try {
    parsed = JSON.parse(messageStr);
  } catch (err: any) {
    throw new Error(`Invalid JSON format in HCS event: ${err.message}`);
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("HCS event payload must be a JSON object");
  }

  const validTypes: HcsEventType[] = ["BATCH_REGISTERED", "BATCH_UPDATED", "BATCH_RECALLED"];
  if (!validTypes.includes(parsed.eventType)) {
    throw new Error(`Invalid or unsupported eventType: ${parsed.eventType}`);
  }

  if (!parsed.batchId || typeof parsed.batchId !== "string") {
    throw new Error("HCS event must contain a valid batchId string");
  }

  if (!parsed.recordHash || typeof parsed.recordHash !== "string") {
    throw new Error("HCS event must contain a valid recordHash string");
  }

  if (!parsed.issuerAccountId || typeof parsed.issuerAccountId !== "string") {
    throw new Error("HCS event must contain a valid issuerAccountId string");
  }

  const validStatuses: BatchStatus[] = ["VALID", "EXPIRED", "RECALLED"];
  if (!validStatuses.includes(parsed.status)) {
    throw new Error(`Invalid or unsupported status in event: ${parsed.status}`);
  }

  return {
    schemaVersion: "1.0.0",
    eventType: parsed.eventType,
    batchId: parsed.batchId.toUpperCase(),
    recordHash: parsed.recordHash,
    issuerAccountId: parsed.issuerAccountId,
    timestamp: parsed.timestamp || new Date().toISOString(),
    status: parsed.status,
    reason: parsed.reason,
    notes: parsed.notes,
  };
}

/**
 * Converts a parsed HCS event + consensus metadata into a full BatchAuditEvent
 */
export function createAuditEventFromHcs(
  payload: HcsBatchEventPayload,
  consensusMeta?: {
    topicId?: string;
    consensusTimestamp?: string;
    transactionId?: string;
    sequenceNumber?: number;
    isSimulatedDemo?: boolean;
  }
): BatchAuditEvent {
  return {
    id: `${payload.batchId}-${payload.eventType}-${Date.now()}`,
    batchId: payload.batchId,
    eventType: payload.eventType,
    status: payload.status,
    recordHash: payload.recordHash,
    issuerAccountId: payload.issuerAccountId,
    timestamp: payload.timestamp,
    consensusTimestamp:
      consensusMeta?.consensusTimestamp || new Date().toISOString(),
    topicId: consensusMeta?.topicId,
    transactionId: consensusMeta?.transactionId,
    sequenceNumber: consensusMeta?.sequenceNumber,
    reason: payload.reason,
    isSimulatedDemo: Boolean(consensusMeta?.isSimulatedDemo),
  };
}
