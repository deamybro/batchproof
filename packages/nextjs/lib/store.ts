import {
  BatchAuditEvent,
  MedicineBatch,
  VerificationResult,
} from "./types";
import { SAMPLE_BATCHES, SAMPLE_AUDIT_EVENTS } from "./sample-data";
import { computeCanonicalBatchHash, verifyBatchRecordHash } from "./batch-hash";
import { calculateBatchStatus } from "./status-calculator";
import { createHcsEventPayload, createAuditEventFromHcs } from "./hcs-event";
import { publishBatchEventToHcs, getHederaStatus } from "./hedera";

const DISCLAIMER_TEXT =
  "BatchProof is an immutable audit trail prototype built on Hedera Consensus Service. It verifies that this medicine batch's record and cryptographic digest match the registered entry published by the authorized issuer. It does not replace physical drug testing, laboratory assays, or national regulatory authorization.";

// Persistent global store across Next.js dev reloads
declare global {
  var __BATCH_PROOF_STORE__:
    | {
        batches: Map<string, MedicineBatch>;
        auditEvents: BatchAuditEvent[];
      }
    | undefined;
}

function initStore() {
  if (!global.__BATCH_PROOF_STORE__) {
    const batchesMap = new Map<string, MedicineBatch>();
    for (const batch of SAMPLE_BATCHES) {
      batchesMap.set(batch.id.toUpperCase(), { ...batch });
    }
    global.__BATCH_PROOF_STORE__ = {
      batches: batchesMap,
      auditEvents: [...SAMPLE_AUDIT_EVENTS],
    };
  }
  return global.__BATCH_PROOF_STORE__;
}

export class BatchStore {
  private static getStore() {
    return initStore();
  }

  /**
   * Returns list of all known batches
   */
  static getAllBatches(): MedicineBatch[] {
    const store = this.getStore();
    return Array.from(store.batches.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Retrieves a single batch by ID
   */
  static getBatchById(id: string): MedicineBatch | undefined {
    const store = this.getStore();
    return store.batches.get(id.trim().toUpperCase());
  }

  /**
   * Retrieves audit events, optionally filtered by batch ID
   */
  static getAuditEvents(batchId?: string): BatchAuditEvent[] {
    const store = this.getStore();
    if (!batchId) {
      return [...store.auditEvents].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    }
    const target = batchId.trim().toUpperCase();
    return store.auditEvents
      .filter((e) => e.batchId === target)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Registers a new medicine batch and publishes its creation event to Hedera HCS
   */
  static async registerBatch(data: {
    id: string;
    medicineName: string;
    strength: string;
    manufacturer: string;
    manufacturingDate: string;
    expiryDate: string;
    storageConditions?: string;
    activeIngredients?: string[];
    issuerAccountId?: string;
  }): Promise<{ batch: MedicineBatch; event: BatchAuditEvent; hcsResult: any }> {
    const store = this.getStore();
    const cleanId = data.id.trim().toUpperCase();

    if (store.batches.has(cleanId)) {
      throw new Error(`Batch '${cleanId}' is already registered in the system.`);
    }

    const now = new Date().toISOString();
    const issuer = data.issuerAccountId || process.env.HEDERA_OPERATOR_ID || "0.0.4829104";

    const baseBatch: Omit<MedicineBatch, "recordHash"> = {
      id: cleanId,
      medicineName: data.medicineName.trim(),
      strength: data.strength.trim(),
      manufacturer: data.manufacturer.trim(),
      manufacturingDate: data.manufacturingDate.trim(),
      expiryDate: data.expiryDate.trim(),
      storageConditions:
        data.storageConditions?.trim() || "Store in a cool dry place below 25°C.",
      activeIngredients:
        data.activeIngredients && data.activeIngredients.length > 0
          ? data.activeIngredients
          : [data.medicineName.trim()],
      isRecalled: false,
      createdAt: now,
      updatedAt: now,
    };

    const recordHash = computeCanonicalBatchHash(baseBatch);
    const newBatch: MedicineBatch = {
      ...baseBatch,
      recordHash,
    };

    // Calculate initial status
    const statusResult = calculateBatchStatus(newBatch);

    // Create HCS payload
    const hcsPayload = createHcsEventPayload({
      eventType: "BATCH_REGISTERED",
      batch: newBatch,
      issuerAccountId: issuer,
      status: statusResult.status,
      timestamp: now,
    });

    // Publish to Hedera HCS (or demo fallback)
    const hcsResult = await publishBatchEventToHcs(hcsPayload);

    // Create audit event
    const auditEvent = createAuditEventFromHcs(hcsPayload, {
      topicId: hcsResult.topicId,
      consensusTimestamp: hcsResult.consensusTimestamp,
      transactionId: hcsResult.transactionId,
      sequenceNumber: hcsResult.sequenceNumber,
      isSimulatedDemo: hcsResult.isDemo,
    });

    // Store batch and event
    store.batches.set(cleanId, newBatch);
    store.auditEvents.unshift(auditEvent);

    return { batch: newBatch, event: auditEvent, hcsResult };
  }

  /**
   * Recalls an existing batch and publishes BATCH_RECALLED event to Hedera HCS
   */
  static async recallBatch(
    id: string,
    reason: string,
    issuerAccountId?: string
  ): Promise<{ batch: MedicineBatch; event: BatchAuditEvent; hcsResult: any }> {
    const store = this.getStore();
    const cleanId = id.trim().toUpperCase();
    const batch = store.batches.get(cleanId);

    if (!batch) {
      throw new Error(`Batch '${cleanId}' was not found.`);
    }

    if (batch.isRecalled) {
      throw new Error(`Batch '${cleanId}' is already marked as recalled.`);
    }

    const now = new Date().toISOString();
    const issuer = issuerAccountId || process.env.HEDERA_OPERATOR_ID || "0.0.4829104";

    batch.isRecalled = true;
    batch.recallReason = reason.trim();
    batch.recalledAt = now;
    batch.updatedAt = now;

    const hcsPayload = createHcsEventPayload({
      eventType: "BATCH_RECALLED",
      batch,
      issuerAccountId: issuer,
      status: "RECALLED",
      timestamp: now,
      reason: reason.trim(),
    });

    const hcsResult = await publishBatchEventToHcs(hcsPayload);

    const auditEvent = createAuditEventFromHcs(hcsPayload, {
      topicId: hcsResult.topicId,
      consensusTimestamp: hcsResult.consensusTimestamp,
      transactionId: hcsResult.transactionId,
      sequenceNumber: hcsResult.sequenceNumber,
      isSimulatedDemo: hcsResult.isDemo,
    });

    store.auditEvents.unshift(auditEvent);

    return { batch, event: auditEvent, hcsResult };
  }

  /**
   * Performs full cryptographic verification on a batch code
   */
  static verifyBatch(id: string): VerificationResult {
    const cleanId = id.trim().toUpperCase();
    const batch = this.getBatchById(cleanId);
    const hederaStatus = getHederaStatus();

    if (!batch) {
      return {
        batchId: cleanId,
        found: false,
        status: "VALID",
        statusReason: `No medicine batch found matching code "${cleanId}". Please check the batch code printed on the packaging.`,
        hashMatchesOnChain: false,
        isExpired: false,
        isRecalled: false,
        verifiedOnHedera: false,
        hederaNetwork: hederaStatus.network,
        auditTrail: [],
        disclaimer: DISCLAIMER_TEXT,
      };
    }

    const auditTrail = this.getAuditEvents(cleanId);
    const calculatedHash = computeCanonicalBatchHash(batch);
    const hashMatches = verifyBatchRecordHash(batch, batch.recordHash);
    const statusCalc = calculateBatchStatus(batch);

    // Latest HCS transaction details
    const latestEvent = auditTrail[0];

    return {
      batchId: cleanId,
      found: true,
      status: statusCalc.status,
      statusReason: statusCalc.reason,
      batch,
      calculatedHash,
      hashMatchesOnChain: hashMatches,
      isExpired: statusCalc.isExpired,
      isRecalled: statusCalc.isRecalled,
      verifiedOnHedera: hashMatches && auditTrail.length > 0,
      hederaNetwork: hederaStatus.network,
      topicId: latestEvent?.topicId || process.env.HEDERA_TOPIC_ID,
      lastConsensusTimestamp: latestEvent?.consensusTimestamp,
      latestTransactionId: latestEvent?.transactionId,
      auditTrail,
      disclaimer: DISCLAIMER_TEXT,
    };
  }
}
