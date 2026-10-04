import { describe, it, expect } from "vitest";
import { calculateBatchStatus } from "../lib/status-calculator";

describe("Status Calculation Engine", () => {
  const fixedNow = new Date("2026-03-01T12:00:00Z");

  it("should calculate VALID status for unexpired, un-recalled batch", () => {
    const result = calculateBatchStatus(
      {
        expiryDate: "2027-06-30",
        isRecalled: false,
      },
      fixedNow
    );

    expect(result.status).toBe("VALID");
    expect(result.isExpired).toBe(false);
    expect(result.isRecalled).toBe(false);
    expect(result.daysUntilExpiry).toBeGreaterThan(0);
  });

  it("should calculate EXPIRED status when expiry date is in the past", () => {
    const result = calculateBatchStatus(
      {
        expiryDate: "2025-12-31",
        isRecalled: false,
      },
      fixedNow
    );

    expect(result.status).toBe("EXPIRED");
    expect(result.isExpired).toBe(true);
    expect(result.isRecalled).toBe(false);
    expect(result.daysUntilExpiry).toBeLessThan(0);
  });

  it("should prioritize RECALLED status even if batch is not expired", () => {
    const result = calculateBatchStatus(
      {
        expiryDate: "2028-01-01",
        isRecalled: true,
        recallReason: "Particulate contamination observed",
      },
      fixedNow
    );

    expect(result.status).toBe("RECALLED");
    expect(result.isRecalled).toBe(true);
    expect(result.reason).toContain("Particulate contamination");
  });

  it("should prioritize RECALLED status even if batch is already expired", () => {
    const result = calculateBatchStatus(
      {
        expiryDate: "2024-01-01",
        isRecalled: true,
        recallReason: "Severe subpotency detected",
      },
      fixedNow
    );

    expect(result.status).toBe("RECALLED");
    expect(result.isRecalled).toBe(true);
    expect(result.isExpired).toBe(true);
  });
});
