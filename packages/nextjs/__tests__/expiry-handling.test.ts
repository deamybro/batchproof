import { describe, it, expect } from "vitest";
import {
  isBatchExpired,
  calculateDaysUntilExpiry,
  parseExpiryDate,
} from "../lib/status-calculator";

describe("Expiry Handling Logic", () => {
  it("should parse YYYY-MM-DD to end of day UTC", () => {
    const parsed = parseExpiryDate("2026-12-31");
    expect(parsed.getUTCFullYear()).toBe(2026);
    expect(parsed.getUTCMonth()).toBe(11); // 0-indexed December
    expect(parsed.getUTCDate()).toBe(31);
    expect(parsed.getUTCHours()).toBe(23);
    expect(parsed.getUTCMinutes()).toBe(59);
  });

  it("should treat batch as active until the expiry day ends", () => {
    // 2026-06-15 at 12:00:00 UTC should not be expired if expiry is 2026-06-15
    const noonOnExpiryDay = new Date(Date.UTC(2026, 5, 15, 12, 0, 0));
    expect(isBatchExpired("2026-06-15", noonOnExpiryDay)).toBe(false);

    // 2026-06-16 at 00:00:01 UTC should be expired
    const dayAfterExpiry = new Date(Date.UTC(2026, 5, 16, 0, 0, 1));
    expect(isBatchExpired("2026-06-15", dayAfterExpiry)).toBe(true);
  });

  it("should calculate correct positive days until future expiry", () => {
    const ref = new Date(Date.UTC(2026, 0, 1, 0, 0, 0));
    const days = calculateDaysUntilExpiry("2026-01-11", ref);
    expect(days).toBe(10);
  });

  it("should calculate negative days for past expiry", () => {
    const ref = new Date(Date.UTC(2026, 0, 15, 0, 0, 0));
    const days = calculateDaysUntilExpiry("2026-01-10", ref);
    expect(days).toBeLessThan(0);
  });
});
