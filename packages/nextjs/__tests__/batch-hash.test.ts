import { describe, it, expect } from "vitest";
import {
  canonicalizeBatchPayload,
  computeCanonicalBatchHash,
  verifyBatchRecordHash,
} from "../lib/batch-hash";
import { MedicineBatch } from "../lib/types";

describe("Batch Hashing Module", () => {
  const sampleBatch: MedicineBatch = {
    id: "TEST-BATCH-001",
    medicineName: "Amoxicillin",
    strength: "500 mg",
    manufacturer: "PharmaCorp Global",
    manufacturingDate: "2024-01-01",
    expiryDate: "2026-01-01",
    storageConditions: "Store below 25C",
    activeIngredients: ["Amoxicillin 500mg"],
    isRecalled: false,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    recordHash: "",
  };

  it("should generate deterministic canonical JSON with sorted keys", () => {
    const canonical = canonicalizeBatchPayload(sampleBatch);
    const parsed = JSON.parse(canonical);
    const keys = Object.keys(parsed);

    expect(keys).toEqual([
      "expiryDate",
      "id",
      "manufacturer",
      "manufacturingDate",
      "medicineName",
      "strength",
    ]);
  });

  it("should compute valid 64-character SHA-256 hexadecimal hash", () => {
    const hash = computeCanonicalBatchHash(sampleBatch);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("should produce identical hash regardless of input field insertion order", () => {
    const hash1 = computeCanonicalBatchHash({
      id: "ABC-123",
      medicineName: "Ibuprofen",
      strength: "400 mg",
      manufacturer: "HealthLabs",
      manufacturingDate: "2024-05-10",
      expiryDate: "2027-05-10",
    });

    const hash2 = computeCanonicalBatchHash({
      expiryDate: "2027-05-10",
      strength: "400 mg",
      medicineName: "Ibuprofen",
      manufacturer: "HealthLabs",
      manufacturingDate: "2024-05-10",
      id: "ABC-123",
    });

    expect(hash1).toBe(hash2);
  });

  it("should detect hash tampering when a field is altered", () => {
    const originalHash = computeCanonicalBatchHash(sampleBatch);
    const tamperedBatch: MedicineBatch = {
      ...sampleBatch,
      expiryDate: "2029-01-01", // Modified expiry date!
    };
    const tamperedHash = computeCanonicalBatchHash(tamperedBatch);

    expect(tamperedHash).not.toBe(originalHash);
  });

  it("should verify valid record hash and reject corrupted hash", () => {
    const hash = computeCanonicalBatchHash(sampleBatch);
    const batchWithHash = { ...sampleBatch, recordHash: hash };

    expect(verifyBatchRecordHash(batchWithHash, hash)).toBe(true);
    expect(verifyBatchRecordHash(batchWithHash, `0x${hash}`)).toBe(true);
    expect(verifyBatchRecordHash(batchWithHash, "invalid_hash_string")).toBe(false);
  });
});
