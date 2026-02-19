import { expect, test, describe } from "bun:test";
import { formatDate, formatDateShort, formatTime, formatRelativeTime } from "./formatters";
import { DEFAULT_LOCALE } from "../constants";

describe("formatters", () => {
  // Use a fixed date: 2023-12-25 14:30:00
  // Note: Date constructor parses ISO string in UTC if Z is present, or local if not.
  // To be safe and consistent with tests, let's use a specific timestamp or construct it carefully.
  // new Date("2023-12-25T14:30:00") is local time.
  const testDate = new Date("2023-12-25T14:30:00");

  test("formatDate uses default locale (pt-BR)", () => {
    const formatted = formatDate(testDate);
    // Expect Portuguese output
    expect(formatted).toContain("dezembro");
    expect(formatted).toContain("2023");
  });

  test("formatDate uses custom locale (en-US)", () => {
    const formatted = formatDate(testDate, "en-US");
    // Expect English output
    expect(formatted).toContain("December");
    expect(formatted).toContain("2023");
  });

  test("formatDateShort uses default locale (pt-BR)", () => {
    const formatted = formatDateShort(testDate);
    // pt-BR: DD/MM/YYYY
    expect(formatted).toBe("25/12/2023");
  });

  test("formatDateShort uses custom locale (en-US)", () => {
    const formatted = formatDateShort(testDate, "en-US");
    // en-US: MM/DD/YYYY
    expect(formatted).toBe("12/25/2023");
  });

  test("formatTime uses default locale (pt-BR)", () => {
    const formatted = formatTime(testDate);
    // pt-BR uses 24h format usually
    expect(formatted).toBe("14:30");
  });

  test("formatTime uses custom locale (en-US)", () => {
    const formatted = formatTime(testDate, "en-US");
    // en-US uses 12h format
    expect(formatted).toMatch(/2:30 PM|02:30 PM/);
  });

  test("formatRelativeTime uses custom locale for date fallback", () => {
    const oldDate = new Date("2022-01-01T12:00:00");
    const formatted = formatRelativeTime(oldDate, "en-US");
    // Should return short date formatted in en-US
    expect(formatted).toBe("01/01/2022");
  });
});
