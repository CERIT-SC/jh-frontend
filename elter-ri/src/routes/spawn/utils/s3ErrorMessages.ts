/**
 * @fileoverview Maps S3 validation errors to user-friendly messages.
 *
 * Replaces a 50-line if/else chain in the old FormPage.tsx with a
 * data-driven lookup. Each pattern is a pure predicate + message pair,
 * making it trivial to add new cases or unit-test individually.
 */

interface S3ErrorPattern {
  /** Pure predicate over the error message and name. */
  matches: (message: string, name: string) => boolean;
  /** User-facing message shown when the predicate matches. */
  userMessage: string;
}

/**
 * Ordered list of S3 error patterns. First match wins.
 */
const S3_ERROR_PATTERNS: readonly S3ErrorPattern[] = [
  {
    matches: (m) =>
      m.includes("Access Denied") ||
      m.includes("403") ||
      m.includes("Forbidden"),
    userMessage:
      "S3 Access Denied — please check your access key and secret key.",
  },
  {
    matches: (m) =>
      m.includes("404") ||
      m.includes("NoSuchBucket") ||
      m.includes("Not Found"),
    userMessage: "S3 bucket not found — please check the bucket name.",
  },
  {
    matches: (m) =>
      m.includes("ECONNREFUSED") ||
      m.includes("ENOTFOUND") ||
      m.includes("getaddrinfo") ||
      m.includes("NetworkError") ||
      m.includes("Failed to fetch"),
    userMessage: "Cannot reach S3 endpoint — please check the S3 URL.",
  },
  {
    matches: (m, n) =>
      m.includes("SignatureDoesNotMatch") ||
      n.includes("SignatureDoesNotMatch"),
    userMessage: "S3 secret key is incorrect — please verify your secret key.",
  },
  {
    matches: (m, n) =>
      m.includes("InvalidAccessKeyId") || n.includes("InvalidAccessKey"),
    userMessage: "S3 access key is invalid — please verify your access key.",
  },
  {
    matches: (m) => m.includes("timeout") || m.includes("ETIMEDOUT"),
    userMessage:
      "S3 connection timed out — please check the S3 URL and try again.",
  },
];

/**
 * Formats an unknown error from S3 validation into a user-facing message.
 *
 * @param error - The error thrown by `validateS3Credentials`.
 * @returns A user-friendly error string.
 */
export function formatS3ErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return "S3 validation error - Unknown error";
  }
  const message = error.message;
  const name = error.name;
  for (const pattern of S3_ERROR_PATTERNS) {
    if (pattern.matches(message, name)) {
      return pattern.userMessage;
    }
  }
  return `S3 validation error - ${message}`;
}
