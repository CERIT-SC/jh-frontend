/**
 * @fileoverview Pure validators for the spawn form.
 *
 * Each function returns a {@link ValidationResult} so the caller can push
 * the alert. Validators never call `pushAlert` directly — keeps them pure.
 */

import type {
  SpawnFormData,
  SpawnFormPayload,
  ValidationResult,
} from "@src-types/spawnForm";
import { REQUIRED_PAYLOAD_KEYS } from "../data/formConstants";

/** Validate the "existing S3 bucket" flow. */
export function validateExistingS3(
  formData: SpawnFormData,
  s3values: Record<string, string>,
): ValidationResult {
  if (Object.keys(s3values).length === 0) {
    return { ok: false, error: "No existing S3 bucket was found." };
  }
  if (!formData.s3name) {
    return {
      ok: false,
      error: "Existing S3 bucket was not selected, please choose some",
    };
  }
  return { ok: true };
}

/** Validate the "new/linked S3 bucket" flow. */
export function validateNewS3(formData: SpawnFormData): ValidationResult {
  if (!formData.s3url || !formData.s3bucket) {
    return { ok: false, error: "S3 URL and bucket name are required." };
  }
  return { ok: true };
}

/** Validate that all required payload keys are present and non-empty. */
export function validateRequiredFields(
  payload: SpawnFormPayload,
): ValidationResult {
  const missing = REQUIRED_PAYLOAD_KEYS.filter((key) => {
    if (!(key in payload)) return true;
    const value = payload[key];
    if (value === undefined || value === "") return true;
    if (typeof value === "string" && !value.trim()) return true;
    return false;
  });
  if (missing.length === 0) return { ok: true };
  return {
    ok: false,
    error: `Missing required options: ${missing.join(", ")}.`,
  };
}

/** Strongly-typed view of the S3 credential fields needed for new/linked S3. */
export interface S3CredentialFields {
  s3url: string;
  s3bucket: string;
  s3accesskey: string;
  s3secretkey: string;
}

/**
 * Extract S3 credential fields from the loosely-typed form data.
 *
 * The form data carries these as `unknown` via its index signature; this
 * helper narrows them to strings in one place.
 */
export function getMissingS3Fields(
  formData: SpawnFormData,
): S3CredentialFields {
  return {
    s3url: formData.s3url as string,
    s3bucket: formData.s3bucket as string,
    s3accesskey: (formData.s3accesskey as string) || "",
    s3secretkey: (formData.s3secretkey as string) || "",
  };
}
