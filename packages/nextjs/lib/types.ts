/**
 * BatchProof Types and Data Structures
 * Medicine-batch verification using Hedera Consensus Service (HCS)
 */

export type BatchStatus = "VALID" | "EXPIRED" | "RECALLED";

export type HcsEventType = "BATCH_REGISTERED" | "BATCH_UPDATED" | "BATCH_RECALLED";

/**
 * Off-chain medicine batch record representation
 * Note: Never store patient data or sensitive medical information.
 */
export interface MedicineBatch {
  id: string; // e.g. "AMOX-2024-001"
  medicineName: string; // e.g. "Amoxicillin Trihydrate"
  strength: string; // e.g. "500 mg"
  manufacturer: string; // e.g. "Apex Healthcare Ltd."
  manufacturingDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  storageConditions: string; // e.g. "Store below 25°C in a dry place"
  activeIngredients: string[]; // e.g. ["Amoxicillin"]
  isRecalled: boolean;
  recallReason?: string;
  recalledAt?: string;
  createdAt: string;
  updatedAt: string;
  recordHash: string; // SHA-256 digest of canonical fields
}

/**
 * Canonical payload used for SHA-256 batch hashing
 */
export interface CanonicalBatchPayload {
  id: string;
  medicineName: string;
  strength: string;
  manufacturer: string;
  manufacturingDate: string;
  expiryDate: string;
}

/**
 * HCS Message payload published to the Hedera Consensus Topic
 * Only cryptographic hash and public provenance metadata are published.
 */
export interface HcsBatchEventPayload {
  schemaVersion: "1.0.0";
  eventType: HcsEventType;
  batchId: string;
  recordHash: string;
  issuerAccountId: string;
  timestamp: string; // ISO 8601
  status: BatchStatus;
  reason?: string;
  notes?: string;
}

/**
 * Complete audit log event with consensus metadata
 */
export interface BatchAuditEvent {
  id: string;
  batchId: string;
  eventType: HcsEventType;
  status: BatchStatus;
  recordHash: string;
  issuerAccountId: string;
  timestamp: string;
  consensusTimestamp?: string;
  topicId?: string;
  transactionId?: string;
  sequenceNumber?: number;
  reason?: string;
  isSimulatedDemo?: boolean;
}

/**
 * Verification result returned to consumer/pharmacist
 */
export interface VerificationResult {
  batchId: string;
  found: boolean;
  status: BatchStatus;
  statusReason: string;
  batch?: MedicineBatch;
  calculatedHash?: string;
  hashMatchesOnChain: boolean;
  isExpired: boolean;
  isRecalled: boolean;
  verifiedOnHedera: boolean;
  hederaNetwork: string;
  topicId?: string;
  lastConsensusTimestamp?: string;
  latestTransactionId?: string;
  auditTrail: BatchAuditEvent[];
  disclaimer: string;
}
