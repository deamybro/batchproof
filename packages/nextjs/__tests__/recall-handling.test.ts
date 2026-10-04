import { describe, it, expect } from "vitest";
import { calculateBatchStatus } from "../lib/status-calculator";
import { BatchStore } from "../lib/store";

describe("Recall Handling Logic", () => {
  it("should report recall reason in status determination", () => {
    const reason = "Glass delamination risk reported by hospital network.";
    const result = calculateBatchStatus({
      expiryDate: "2028-12-31",
      isRecalled: true,
      recallReason: reason,
    });

    expect(result.status).toBe("RECALLED");
    expect(result.reason).toContain(reason);
  });

  it("should prevent duplicate recalls in the BatchStore", async () => {
    // METF-2024-X09 is already recalled in sample data
    await expect(
      BatchStore.recallBatch("METF-2024-X09", "Second recall attempt")
    ).rejects.toThrow(/already marked as recalled/i);
  });

  it("should successfully recall an active batch and record audit event", async () => {
    // Register a temporary batch to test recall flow
    const testId = `RECALL-TEST-${Date.now()}`;
    await BatchStore.registerBatch({
      id: testId,
      medicineName: "Test Antibiotic",
      strength: "250 mg",
      manufacturer: "BioTest Labs",
      manufacturingDate: "2025-01-01",
      expiryDate: "2027-01-01",
    });

    const verifyBefore = BatchStore.verifyBatch(testId);
    expect(verifyBefore.status).toBe("VALID");

    const recallReason = "Labeling discrepancy on dosage units.";
    const { batch, event } = await BatchStore.recallBatch(testId, recallReason);

    expect(batch.isRecalled).toBe(true);
    expect(batch.recallReason).toBe(recallReason);
    expect(event.eventType).toBe("BATCH_RECALLED");
    expect(event.status).toBe("RECALLED");

    const verifyAfter = BatchStore.verifyBatch(testId);
    expect(verifyAfter.status).toBe("RECALLED");
    expect(verifyAfter.isRecalled).toBe(true);
    expect(verifyAfter.statusReason).toContain(recallReason);
  });
});
