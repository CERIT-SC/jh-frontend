/**
 * @fileoverview Pure payload builders for the spawn form.
 *
 * Each function is pure (no side effects, no `pushAlert`) and returns
 * either a new payload or a `{ error }` result so the caller can decide
 * how to surface errors. This makes the builders trivially testable.
 */

import type { SpawnFormData, SpawnFormPayload } from "@src-types/spawnForm";
import { buildImageValueToCategoryMap } from "./gatherFormData";
import {
  IMAGE_CATEGORY_KEY_MAP,
  DEFAULT_CONTAINER_IMAGE,
} from "../data/formConstants";

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
 * Resolve the final container image string from form state.
 *
 * Custom images are trimmed; the caller is responsible for `validateDockerImage`
 * (kept out of this pure module to avoid a `@utils` dependency cycle).
 */
export function resolveContainerImage(
  isCustomImage: boolean,
  formData: SpawnFormData,
  selectedImage: string | null,
  defaultContainerImage: string = DEFAULT_CONTAINER_IMAGE,
): ContainerImageResult {
  if (isCustomImage) {
    const image = (formData.customimage || "").trim();
    if (!image) {
      return { ok: false, error: "Custom image name cannot be empty." };
    }
    return { ok: true, image };
  }
  if (selectedImage) {
    return { ok: true, image: `cerit.io/hubs/${selectedImage}` };
  }
  return { ok: true, image: defaultContainerImage };
}

/**
 * Build the base payload with the fields always sent to the backend.
 *
 * Note: `shmsize` is intentionally derived from `memselection` to match
 * the backend contract (`options['shmsize'] = options['mem']`).
 */
export function buildBasePayload(
  formData: SpawnFormData,
  imageCategory: string | null,
  containerImage: string,
): SpawnFormPayload {
  const phselection = formData.phselection || "new";
  return {
    cpuselection: String(formData.cpuselection ?? ""),
    memselection: String(formData.memselection ?? ""),
    gpuselection: String(formData.gpuselection ?? "none"),
    shmsize: String(formData.memselection ?? ""),
    images: imageCategory || "",
    phselection,
    container_image: containerImage,
  };
}

/**
 * Apply image-specific fields (`customimage` for custom, legacy per-category
 * keys otherwise). Removes `customimage` when not a custom image.
 */
export function applyImageFields(
  payload: SpawnFormPayload,
  isCustomImage: boolean,
  imageCategory: string | null,
  containerImage: string,
): SpawnFormPayload {
  const next: SpawnFormPayload = { ...payload };
  if (isCustomImage) {
    next.customimage = containerImage;
  } else {
    delete next.customimage;
    if (imageCategory) {
      const key = IMAGE_CATEGORY_KEY_MAP[imageCategory];
      if (key) {
        next[key] = containerImage;
      }
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
