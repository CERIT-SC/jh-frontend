/** Length of the hash suffix appended by `stripAndHash`. */
export const HASH_LENGTH = 8;

/**
 * Object-name pattern: lowercase letters, digits, hyphens only.
 */
const OBJECT_PATTERN = /^[a-z0-9-]+$/;

/**
 * Matches any run of characters that are not lowercase alphanumeric.
 * Used to collapse unsafe sequences into a single hyphen.
 */
const NON_ALPHANUM_PATTERN = /[^a-z0-9]+/g;

/** Matches a single lowercase ASCII letter. */
const IS_ALPHA_LOWER = /^[a-z]$/;

/** Matches a single lowercase letter or digit. */
const IS_ALPHANUM_LOWER = /^[a-z0-9]$/;

/**
 * Default maximum length for a safe server name.
 */
const DEFAULT_MAX_LENGTH = 32;

/**
 * Checks whether a string is a valid Kubernetes object name.
 *
 * @param string - The string to validate.
 * @returns `true` if the string is a valid object name.
 */
export function isValidObjectName(string: string): boolean {
  if (!string || string.length < 1 || string.length > 63) return false;
  if (!IS_ALPHA_LOWER.test(string[0]!)) return false;
  if (!IS_ALPHANUM_LOWER.test(string[string.length - 1]!)) return false;
  return OBJECT_PATTERN.test(string);
}

/**
 * Generates a safe substring of a name.
 *
 * @param name - The raw input name.
 * @param maxLength - Maximum length of the resulting safe name.
 * @returns A safe, lowercased, hyphen-delimited substring.
 */
export function extractSafeName(name: string, maxLength: number): string {
  // lowercase, then replace any run of non-alphanumeric chars with a single '-'
  const lowered = name.toLowerCase();
  const collapsed = lowered.replace(NON_ALPHANUM_PATTERN, "-");

  // truncate to maxLength, then strip '-' off both ends
  let safeName = collapsed
    .slice(0, maxLength)
    .replace(/^-+/, "")
    .replace(/-+$/, "");

  // ensure it starts with a lowercase letter
  if (safeName && !IS_ALPHA_LOWER.test(safeName[0]!)) {
    safeName = `x-${safeName.slice(0, maxLength - 2)}`;
  }

  if (!safeName) {
    // guarantee non-empty
    safeName = "x";
  }

  return safeName;
}

/**
 * Computes the first `HASH_LENGTH` hex characters of the SHA-256 digest
 * of `name`.
 *
 * @param name - The UTF-8 string to hash.
 * @returns An 8-character lowercase hex string.
 */
async function sha256Prefix(name: string): Promise<string> {
  const bytes = new TextEncoder().encode(name);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const hex = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hex.slice(0, HASH_LENGTH);
}

/**
 * Generates an always-safe, unique string for any input.
 *
 * @param name - The raw input name.
 * @param maxLength - Maximum total length of the result (default 32).
 * @returns A promise resolving to `{safeName}---{hash}`.
 * @throws If `maxLength` is too small to fit the hash suffix (`HASH_LENGTH + 4`).
 */
export async function stripAndHash(
  name: string,
  maxLength: number = DEFAULT_MAX_LENGTH,
): Promise<string> {
  const nameLength = maxLength - (HASH_LENGTH + 3);
  if (nameLength < 1) {
    throw new Error(`Cannot make safe names shorter than ${HASH_LENGTH + 4}`);
  }
  const nameHash = await sha256Prefix(name);
  const safeName = extractSafeName(name, nameLength);
  // Because extractSafeName strips trailing '-', the join is always exactly
  // '---' — never '--' nor '----'.
  return `${safeName}---${nameHash}`;
}

/**
 * Always generates a safe slug for a server name.
 *
 * If `name` is already a valid object name (and short enough), it is
 * returned unchanged.
 *
 * Any input containing `'--'` is forced through `stripAndHash` to avoid
 * colliding with the `{username}--{servername}` join template.
 *
 *
 * @param name - The raw server name.
 * @returns A promise resolving to a safe, collision-free server name.
 */
export async function safeServerName(name: string): Promise<string> {
  if (name.includes("--")) {
    return stripAndHash(name, DEFAULT_MAX_LENGTH);
  }
  if (isValidObjectName(name)) {
    return name;
  }
  return stripAndHash(name, DEFAULT_MAX_LENGTH);
}
