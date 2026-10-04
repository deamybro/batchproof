import { describe, it, expect } from "vitest";
import {
  createHcsEventPayload,
  serializeHcsEvent,
  parseHcsEventMessage,
  createAuditEventFromHcs,
} from "../lib/hcs-event";
import { MedicineBatch } from "../lib/types";

describe("HCS Event Serialization and Message Schema", () => {
  const sampleBatch: MedicineBatch = {
    id: "CIPRO-500-101",
    medicineName: "Ciprofloxacin",
    strength: "500 mg",
    manufacturer: "Novis Life Sciences",
    manufacturingDate: "2024-03-01",
    expiryDate: "2027-03-01",
    storageConditions: "Room temperature",
    activeIngredients: ["Ciprofloxacin 500mg"],
    isRecalled: false,
    createdAt: "2024-03-01T00:00:00Z",
    updatedAt: "2024-03-01T00:00:00Z",
    recordHash: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
  };

  it("should create well-formed HCS event payload", () => {
    const payload = createHcsEventPayload({
      eventType: "BATCH_REGISTERED",
      batch: sampleBatch,
      issuerAccountId: "0.0.123456",
      status: "VALID",
      timestamp: "2024-03-01T10:00:00.000Z",
    });

    expect(payload.schemaVersion).toBe("1.0.0");
    expect(payload.eventType).toBe("BATCH_REGISTERED");
    expect(payload.batchId).toBe("CIPRO-500-101");
    expect(payload.recordHash).toBe(sampleBatch.recordHash);
    expect(payload.issuerAccountId).toBe("0.0.123456");
    expect(payload.status).toBe("VALID");
  });

  it("should serialize and deserialize losslessly", () => {
    const originalPayload = createHcsEventPayload({
      eventType: "BATCH_RECALLED",
      batch: sampleBatch,
      issuerAccountId: "0.0.654321",
      status: "RECALLED",
      reason: "Foreign matter suspected",
    });

    const serialized = serializeHcsEvent(originalPayload);
    expect(typeof serialized).toBe("string");

    const parsed = parseHcsEventMessage(serialized);
    expect(parsed.schemaVersion).toBe("1.0.0");
    expect(parsed.eventType).toBe("BATCH_RECALLED");
    expect(parsed.batchId).toBe("CIPRO-500-101");
    expect(parsed.recordHash).toBe(sampleBatch.recordHash);
    expect(parsed.issuerAccountId).toBe("0.0.654321");
    expect(parsed.status).toBe("RECALLED");
    expect(parsed.reason).toBe("Foreign matter suspected");
  });

  it("should reject malformed or non-compliant HCS JSON messages", () => {
    expect(() => parseHcsEventMessage("not json")).toThrow(/Invalid JSON/);
    expect(() => parseHcsEventMessage(JSON.stringify({}))).toThrow(/Invalid or unsupported eventType/);
    expect(() =>
      parseHcsEventMessage(
        JSON.stringify({
          eventType: "BATCH_REGISTERED",
          batchId: "TEST",
          // missing recordHash
        })
      )
    ).toThrow(/recordHash/);
  });

  it("should convert HCS payload into an audit event with consensus metadata", () => {
    const payload = createHcsEventPayload({
      eventType: "BATCH_REGISTERED",
      batch: sampleBatch,
      issuerAccountId: "0.0.123456",
      status: "VALID",
    });

    const auditEvent = createAuditEventFromHcs(payload, {
      topicId: "0.0.9999",
      transactionId: "0.0.123456@1700000000.000",
      consensusTimestamp: "1700000005.123456789",
      sequenceNumber: 42,
      isSimulatedDemo: true,
    });

    expect(auditEvent.batchId).toBe("CIPRO-500-101");
    expect(auditEvent.topicId).toBe("0.0.9999");
    expect(auditEvent.transactionId).toBe("0.0.123456@1700000000.000");
    expect(auditEvent.consensusTimestamp).toBe("1700000005.123456789");
    expect(auditEvent.sequenceNumber).toBe(42);
    expect(auditEvent.isSimulatedDemo).toBe(true);
  });
});
