import { BatchAuditEvent, MedicineBatch } from "./types";
import { computeCanonicalBatchHash } from "./batch-hash";

const rawValidBatch = {
  id: "AMOX-2025-001",
  medicineName: "Amoxicillin Trihydrate",
  strength: "500 mg",
  manufacturer: "Apex Healthcare Ltd.",
  manufacturingDate: "2024-06-15",
  expiryDate: "2027-06-15",
  storageConditions: "Store below 25°C in a dry place, away from direct sunlight.",
  activeIngredients: ["Amoxicillin (as Trihydrate) 500mg"],
  isRecalled: false,
  createdAt: "2024-06-15T09:00:00Z",
  updatedAt: "2024-06-15T09:00:00Z",
};

const rawExpiredBatch = {
  id: "PARA-2023-088",
  medicineName: "Paracetamol Extra",
  strength: "650 mg",
  manufacturer: "MedLife Pharmaceuticals",
  manufacturingDate: "2022-01-10",
  expiryDate: "2024-01-10", // Past date
  storageConditions: "Store at room temperature 15°C - 30°C.",
  activeIngredients: ["Paracetamol 650mg", "Caffeine 50mg"],
  isRecalled: false,
  createdAt: "2022-01-10T11:30:00Z",
  updatedAt: "2022-01-10T11:30:00Z",
};

const rawRecalledBatch = {
  id: "METF-2024-X09",
  medicineName: "Metformin Hydrochloride ER",
  strength: "850 mg",
  manufacturer: "Global BioPharma Corp",
  manufacturingDate: "2024-02-01",
  expiryDate: "2026-12-31",
  storageConditions: "Store in airtight containers at 20°C to 25°C.",
  activeIngredients: ["Metformin Hydrochloride 850mg Extended Release"],
  isRecalled: true,
  recallReason:
    "FDA Class II Recall: Potential N-nitrosodimethylamine (NDMA) impurity level slightly exceeding acceptable intake threshold.",
  recalledAt: "2024-08-14T14:22:00Z",
  createdAt: "2024-02-01T08:15:00Z",
  updatedAt: "2024-08-14T14:22:00Z",
};

export const SAMPLE_BATCHES: MedicineBatch[] = [
  {
    ...rawValidBatch,
    recordHash: computeCanonicalBatchHash(rawValidBatch),
  },
  {
    ...rawExpiredBatch,
    recordHash: computeCanonicalBatchHash(rawExpiredBatch),
  },
  {
    ...rawRecalledBatch,
    recordHash: computeCanonicalBatchHash(rawRecalledBatch),
  },
];

export const SAMPLE_AUDIT_EVENTS: BatchAuditEvent[] = [
  // AMOX-2025-001 Registration
  {
    id: "evt-amox-01",
    batchId: "AMOX-2025-001",
    eventType: "BATCH_REGISTERED",
    status: "VALID",
    recordHash: SAMPLE_BATCHES[0].recordHash,
    issuerAccountId: "0.0.4829104",
    timestamp: "2024-06-15T09:02:14Z",
    consensusTimestamp: "1718442134.192000000",
    topicId: "0.0.7812044",
    transactionId: "0.0.4829104@1718442120.100000000",
    sequenceNumber: 1042,
    isSimulatedDemo: true,
  },
  // PARA-2023-088 Registration
  {
    id: "evt-para-01",
    batchId: "PARA-2023-088",
    eventType: "BATCH_REGISTERED",
    status: "VALID",
    recordHash: SAMPLE_BATCHES[1].recordHash,
    issuerAccountId: "0.0.3991201",
    timestamp: "2022-01-10T11:32:00Z",
    consensusTimestamp: "1641814320.045000000",
    topicId: "0.0.7812044",
    transactionId: "0.0.3991201@1641814310.020000000",
    sequenceNumber: 820,
    isSimulatedDemo: true,
  },
  // METF-2024-X09 Registration & Recall
  {
    id: "evt-metf-01",
    batchId: "METF-2024-X09",
    eventType: "BATCH_REGISTERED",
    status: "VALID",
    recordHash: SAMPLE_BATCHES[2].recordHash,
    issuerAccountId: "0.0.5102834",
    timestamp: "2024-02-01T08:18:00Z",
    consensusTimestamp: "1706775480.890000000",
    topicId: "0.0.7812044",
    transactionId: "0.0.5102834@1706775470.500000000",
    sequenceNumber: 1319,
    isSimulatedDemo: true,
  },
  {
    id: "evt-metf-02",
    batchId: "METF-2024-X09",
    eventType: "BATCH_RECALLED",
    status: "RECALLED",
    recordHash: SAMPLE_BATCHES[2].recordHash,
    issuerAccountId: "0.0.5102834",
    timestamp: "2024-08-14T14:22:00Z",
    consensusTimestamp: "1723645320.401000000",
    topicId: "0.0.7812044",
    transactionId: "0.0.5102834@1723645310.250000000",
    sequenceNumber: 1588,
    reason:
      "FDA Class II Recall: Potential N-nitrosodimethylamine (NDMA) impurity level slightly exceeding acceptable intake threshold.",
    isSimulatedDemo: true,
  },
];
