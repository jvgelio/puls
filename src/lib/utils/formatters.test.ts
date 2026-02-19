
import { describe, it, expect } from "bun:test";
import { formatTime, formatDate, formatDateShort } from "./formatters";

describe("formatters", () => {
  describe("formatTime", () => {
    it("formats a Date object correctly", () => {
      // Create a date with specific time in local timezone
      const date = new Date(2023, 9, 27, 14, 30, 0); // Oct 27, 2023 14:30:00
      expect(formatTime(date)).toBe("14:30");
    });

    it("formats a string input correctly", () => {
      const date = new Date(2023, 9, 27, 14, 30, 0);
      expect(formatTime(date.toString())).toBe("14:30");
    });

    it("handles midnight correctly", () => {
      const date = new Date(2023, 9, 27, 0, 0, 0);
      expect(formatTime(date)).toBe("00:00");
    });

    it("handles invalid inputs gracefully", () => {
      expect(formatTime("invalid-date")).toBe("Invalid Date");
    });
  });

  describe("formatDate", () => {
    it("formats a Date object correctly", () => {
      const date = new Date(2023, 9, 27); // Oct 27, 2023 is a Friday
      const formatted = formatDate(date);
      // Check for key components to be robust against minor formatting differences
      expect(formatted).toContain("27");
      expect(formatted).toContain("outubro");
      expect(formatted).toContain("2023");
      expect(formatted.toLowerCase()).toContain("sexta-feira");
    });

    it("formats a string input correctly", () => {
      const date = new Date(2023, 9, 27);
      const formatted = formatDate(date.toString());
      expect(formatted).toContain("27");
      expect(formatted).toContain("outubro");
      expect(formatted).toContain("2023");
    });

    it("handles invalid inputs gracefully", () => {
      expect(formatDate("invalid-date")).toBe("Invalid Date");
    });
  });

  describe("formatDateShort", () => {
    it("formats a Date object correctly", () => {
      const date = new Date(2023, 9, 27);
      expect(formatDateShort(date)).toBe("27/10/2023");
    });

    it("formats a string input correctly", () => {
      const date = new Date(2023, 9, 27);
      expect(formatDateShort(date.toString())).toBe("27/10/2023");
    });

    it("handles invalid inputs gracefully", () => {
      expect(formatDateShort("invalid-date")).toBe("Invalid Date");
    });
  });
});
