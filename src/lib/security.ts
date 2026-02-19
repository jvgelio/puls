import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Performs a timing-safe comparison of two strings.
 *
 * This function hashes both strings using SHA-256 before comparing them
 * with `timingSafeEqual`. This prevents timing attacks that could reveal
 * the content or length of the secret token.
 *
 * @param a First string to compare
 * @param b Second string to compare
 * @returns True if the strings are equal, false otherwise
 */
export function safeCompare(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") {
    return false;
  }

  // Hashing to a fixed length hides the original length of the strings
  // and ensures they are of equal length for `timingSafeEqual`.
  const hashA = createHash("sha256").update(a).digest();
  const hashB = createHash("sha256").update(b).digest();

  return timingSafeEqual(hashA, hashB);
}
