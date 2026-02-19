import { describe, expect, test } from "bun:test";
import { formatDate } from "./formatters";

describe("formatDate", () => {
  test("formats a valid Date object correctly in pt-BR locale", () => {
    // 2023-10-05 is a Thursday (quinta-feira)
    const date = new Date("2023-10-05T12:00:00Z");
    const result = formatDate(date);
    expect(result).toBe("quinta-feira, 5 de outubro de 2023");
  });

  test("formats a valid ISO date string correctly in pt-BR locale", () => {
    const result = formatDate("2023-10-05T12:00:00Z");
    expect(result).toBe("quinta-feira, 5 de outubro de 2023");
  });

  test("handles leap year date correctly", () => {
    // 2024-02-29 is a Thursday (quinta-feira)
    const result = formatDate("2024-02-29T12:00:00Z");
    expect(result).toBe("quinta-feira, 29 de fevereiro de 2024");
  });

  test("handles invalid date string gracefully", () => {
    const result = formatDate("invalid-date-string");
    expect(result).toBe("Invalid Date");
  });
});
