import { BatchStatus, MedicineBatch } from "./types";

export interface StatusCalculationResult {
  status: BatchStatus;
  isRecalled: boolean;
  isExpired: boolean;
  daysUntilExpiry: number;
  reason: string;
}

/**
 * Parses an ISO date string (YYYY-MM-DD or full ISO) safely to a UTC Date object at end of day
 */
export function parseExpiryDate(dateStr: string): Date {
  const trimmed = dateStr.trim();
  // If format is YYYY-MM-DD, set to 23:59:59.999 UTC so the batch remains valid throughout the expiry day
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [year, month, day] = trimmed.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
  }
  return new Date(trimmed);
}

/**
 * Checks whether a given expiry date has passed relative to a reference date (default: now)
 */
export function isBatchExpired(expiryDateStr: string, referenceDate: Date = new Date()): boolean {
  try {
    const expiry = parseExpiryDate(expiryDateStr);
    if (isNaN(expiry.getTime())) return false;
    return referenceDate.getTime() > expiry.getTime();
  } catch {
    return false;
  }
}

/**
 * Calculates days remaining until expiry (negative if expired)
 */
export function calculateDaysUntilExpiry(expiryDateStr: string, referenceDate: Date = new Date()): number {
  try {
    const expiry = parseExpiryDate(expiryDateStr);
    if (isNaN(expiry.getTime())) return 0;
    const diffMs = expiry.getTime() - referenceDate.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}

/**
 * Calculates the definitive status of a medicine batch:
 * 1. RECALLED: Highest priority. If a batch is recalled for safety, it must show RECALLED.
 * 2. EXPIRED: If current time exceeds the expiry date.
 * 3. VALID: If active, not recalled, and within valid shelf life.
 */
export function calculateBatchStatus(
  batch: Pick<MedicineBatch, "expiryDate" | "isRecalled" | "recallReason">,
  referenceDate: Date = new Date()
): StatusCalculationResult {
  const isRecalled = Boolean(batch.isRecalled);
  const expired = isBatchExpired(batch.expiryDate, referenceDate);
  const daysUntilExpiry = calculateDaysUntilExpiry(batch.expiryDate, referenceDate);

  if (isRecalled) {
    return {
      status: "RECALLED",
      isRecalled: true,
      isExpired: expired,
      daysUntilExpiry,
      reason: batch.recallReason
        ? `Batch recalled: ${batch.recallReason}`
        : "Batch has been formally recalled by manufacturer/regulator.",
    };
  }

  if (expired) {
    const absDays = Math.abs(daysUntilExpiry);
    return {
      status: "EXPIRED",
      isRecalled: false,
      isExpired: true,
      daysUntilExpiry,
      reason: `Batch expired ${absDays} day${absDays === 1 ? "" : "s"} ago on ${batch.expiryDate}. Do not dispense or ingest.`,
    };
  }

  return {
    status: "VALID",
    isRecalled: false,
    isExpired: false,
    daysUntilExpiry,
    reason: `Batch is active and valid. Expires in ${daysUntilExpiry} days (${batch.expiryDate}).`,
  };
}
