/**
 * @fileoverview Pure payload builders for the spawn form.
 *
 * Each function is pure (no side effects, no `pushAlert`) and returns
 * either a new payload or a `{ error }` result so the caller can decide
 * how to surface errors. This makes the builders trivially testable.
 */

import type { SpawnFormData, SpawnFormPayload } from "@src-types/spawnForm";
import type { GenericField, SpawnOptions } from "@src-types/spawnOptions";
import { buildImageValueToCategoryMap } from "./gatherFormData";

/**
 * Resolve the image category from the selected image using O(1) lookup.
 * @param selectedImage - The selected image value (e.g. "datasciencenb:26-09-2024")
 * @param imageToCategoryMap - Pre-built Map for O(1) lookup
 * @returns The resolved category key or null if not found
 */
export function resolveImageCategory(
  selectedImage: string | null,
  imageToCategoryMap: Map<string, string>,
): string | null {
  if (!selectedImage) return null;
  return imageToCategoryMap.get(selectedImage) ?? null;
}

/** Result of resolving the container image string. */
export type ContainerImageResult =
  { ok: true; image: string } | { ok: false; error: string };

/**
 * Prefix a bare image value with the instance's registry prefix.
 * A value that already contains a "/" is a full reference and is kept as-is
 * (Review Focus #1: cas sends full refs with no prefix).
 */
export function resolveContainerRef(
  value: string,
  registryPrefix: string,
): string {
  if (value.includes("/")) return value;
  return registryPrefix ? `${registryPrefix}${value}` : value;
}

/**
 * Resolve the final container image string from form state.
 *
 * Custom images are trimmed; the caller is responsible for `validateDockerImage`
 * (kept out of this pure module to avoid a `@utils` dependency cycle).
 */
export function resolveContainerImage(
  isCustomImage: boolean,
  formData: SpawnFormData,
  selectedImage: string | null,
  options: SpawnOptions,
): ContainerImageResult {
  if (isCustomImage) {
    const image = (formData.customimage || "").trim();
    if (!image) {
      return { ok: false, error: "Custom image name cannot be empty." };
    }
    return { ok: true, image };
  }
  if (selectedImage) {
    return {
      ok: true,
      image: resolveContainerRef(selectedImage, options.image.registry_prefix),
    };
  }
  if (options.image.default) {
    return {
      ok: true,
      image: resolveContainerRef(
        options.image.default,
        options.image.registry_prefix,
      ),
    };
  }
  return { ok: false, error: "Select an image." };
}

/**
 * Apply generic fields (`spawn_options.fields[]`) to the payload.
 * checkbox checked → `checked_value` (default "yes"); unchecked → omitted.
 * select → posted when a non-empty value is chosen; empty → omitted.
 */
export function applyGenericFields(
  payload: SpawnFormPayload,
  formData: SpawnFormData,
  fields: GenericField[],
): SpawnFormPayload {
  const values = formData.fields ?? {};
  const next: SpawnFormPayload = { ...payload };
  for (const field of fields) {
    const value = values[field.name];
    if (field.type === "checkbox") {
      if (value === true) {
        next[field.name] = field.checked_value ?? "yes";
      }
    } else if (typeof value === "string" && value !== "") {
      next[field.name] = value;
    }
  }
  return next;
}

/** Add `sshCheck: "yes"` when SSH access is enabled. */
export function applySshAccess(
  payload: SpawnFormPayload,
  sshAccess: boolean | undefined,
): SpawnFormPayload {
  if (!sshAccess) return payload;
  return { ...payload, sshCheck: "yes" };
}

/** Apply MetaCentrum storage fields. Returns `{ error }` if invalid. */
export function applyStorage(
  payload: SpawnFormPayload,
  formData: SpawnFormData,
): SpawnFormPayload | { error: string } {
  if (formData.storageCheck !== "yes") return payload;
  if (!formData.home) {
    return {
      error: "MetaCentrum storage enabled but no home directory selected.",
    };
  }
  const next: SpawnFormPayload = {
    ...payload,
    storageCheck: "yes",
    home: formData.home,
  };
  if (formData.locationStorageCheck === "yes") {
    next.locationStorageCheck = "yes";
  }
  return next;
}

/** Apply persistent home fields. Returns `{ error }` if invalid. */
export function applyPersistentHome(
  payload: SpawnFormPayload,
  formData: SpawnFormData,
): SpawnFormPayload | { error: string } {
  const phselection = formData.phselection || "new";
  if (phselection === "existing") {
    if (!formData.phname) {
      return {
        error:
          "Existing persistent home selected but no home directory specified.",
      };
    }
    return { ...payload, phname: formData.phname };
  }
  if (formData.phCheck === "yes") {
    return { ...payload, phCheck: "yes" };
  }
  return payload;
}

/** Apply MIG GPU amount when a MIG GPU is selected. Returns `{ error }` if invalid. */
export function applyMigGpu(
  payload: SpawnFormPayload,
  formData: SpawnFormData,
): SpawnFormPayload | { error: string } {
  if (!payload.gpuselection.startsWith("mig")) return payload;
  if (!formData.migamount) {
    return { error: "MIG GPU requires selecting MIG amount." };
  }
  return { ...payload, migamount: String(formData.migamount) };
}

/** Apply `projectCheck` when project directories are requested. */
export function applyProjectDirectories(
  payload: SpawnFormPayload,
  projectCheck: string | undefined,
): SpawnFormPayload {
  if (projectCheck !== "yes") return payload;
  return { ...payload, projectCheck: "yes" };
}

/**
 * Apply S3 base fields (`s3check`, `s3selection`) when S3 storage is checked.
 * Does NOT apply the per-mode fields (s3name vs s3url/s3bucket/...) — those
 * require validation and are handled by the submit orchestrator.
 */
export function applyS3Fields(
  payload: SpawnFormPayload,
  formData: SpawnFormData,
  checkedS3Storage: boolean,
): SpawnFormPayload {
  if (!checkedS3Storage) return payload;
  return {
    ...payload,
    s3check: "yes",
    s3selection: formData.s3selection || "existing",
  };
}

/** Convenience: build the O(1) image lookup map (delegates to gatherFormData). */
export function buildImageMap(): Map<string, string> {
  return buildImageValueToCategoryMap();
}
