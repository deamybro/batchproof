import { createHash } from "crypto";
import { CanonicalBatchPayload, MedicineBatch } from "./types";

/**
 * Extracts and formats the canonical fields of a batch into a normalized JSON string.
 * Key order is deterministic (sorted alphabetically) to ensure identical hash across platforms.
 */
export function canonicalizeBatchPayload(
  batch: CanonicalBatchPayload | MedicineBatch
): string {
  const canonical: CanonicalBatchPayload = {
    expiryDate: batch.expiryDate.trim(),
    id: batch.id.trim().toUpperCase(),
    manufacturer: batch.manufacturer.trim(),
    manufacturingDate: batch.manufacturingDate.trim(),
    medicineName: batch.medicineName.trim(),
    strength: batch.strength.trim(),
  };

  // Deterministic JSON stringify by sorted keys
  const sortedKeys = Object.keys(canonical).sort() as (keyof CanonicalBatchPayload)[];
  const sortedObj: Record<string, string> = {};
  for (const key of sortedKeys) {
    sortedObj[key] = canonical[key];
  }

  return JSON.stringify(sortedObj);
}

/**
 * Computes the SHA-256 cryptographic digest of a canonical batch record.
 * Output is standard 64-character lowercase hexadecimal.
 */
export function computeCanonicalBatchHash(
  batch: CanonicalBatchPayload | MedicineBatch
): string {
  const canonicalString = canonicalizeBatchPayload(batch);
  return createHash("sha256").update(canonicalString, "utf8").digest("hex");
}

/**
 * Verifies that a batch's computed hash matches an on-chain or recorded hash
 */
export function verifyBatchRecordHash(
  batch: MedicineBatch,
  expectedHash: string
): boolean {
  if (!expectedHash) return false;
  const computed = computeCanonicalBatchHash(batch);
  const cleanExpected = expectedHash.startsWith("0x")
    ? expectedHash.slice(2).toLowerCase()
    : expectedHash.toLowerCase();
  return computed.toLowerCase() === cleanExpected;
}
