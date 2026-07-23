/**
 * @fileoverview Orchestrates the spawn-form submission flow.
 *
 * Replaces the ~280-line `submitForm` in the original FormPage.tsx with a
 * linear pipeline of pure helper calls. Each step returns either a new
 * payload or `{ error }`; the orchestrator surfaces errors via pushAlert.
 */

import { useState, useCallback } from "react";
import { validateDockerImage } from "@utils";
import { buildImageValueToCategoryMap } from "../utils/gatherFormData";
import { validateS3Credentials } from "../utils/validateS3Credentials";
import { formatS3ErrorMessage } from "../utils/s3ErrorMessages";
import {
  resolveImageCategory,
  resolveContainerImage,
  buildBasePayload,
  applyImageFields,
  applySshAccess,
  applyStorage,
  applyPersistentHome,
  applyMigGpu,
  applyProjectDirectories,
  applyS3Fields,
} from "../utils/buildSpawnPayload";
import {
  validateExistingS3,
  validateNewS3,
  validateRequiredFields,
  getMissingS3Fields,
} from "../utils/validateSpawnForm";
import { submitSpawnForm } from "../utils/submitSpawnForm";
import type {
  DefaultFormData,
  SpawnFormData,
  SpawnFormPayload,
} from "@src-types/spawnForm";
import type { PushAlertFn } from "./useSpawnFormState";

/** Context object passed to `submit`. */
export interface SubmitContext {
  formData: SpawnFormData;
  selectedImage: string | null;
  checkedS3Storage: boolean;
  s3values: Record<string, string>;
  defaultFormData: DefaultFormData;
  postUrl: string;
}

interface UseSpawnFormSubmitArgs {
  pushAlert: PushAlertFn;
}

/** Return type of the useSpawnFormSubmit hook. */
export interface SpawnFormSubmitApi {
  isSubmitting: boolean;
  submit: (ctx: SubmitContext) => Promise<void>;
}

/**
 * Owns the submission lifecycle (validating → building → submitting).
 *
 * `isSubmitting` is true during the entire pipeline, mirroring the original
 * behavior where the button label flips to "Validating...".
 */
export function useSpawnFormSubmit({
  pushAlert,
}: UseSpawnFormSubmitArgs): SpawnFormSubmitApi {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = useCallback(
    async (ctx: SubmitContext) => {
      setIsSubmitting(true);
      try {
        const result = await runSubmitPipeline(ctx);
        if (!result.ok) {
          pushAlert(result.error, { variant: "error" });
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [pushAlert],
  );

  return { isSubmitting, submit };
}

/** Internal: runs the full pipeline. Returns ok or the final error. */
async function runSubmitPipeline(ctx: {
  formData: SpawnFormData;
  selectedImage: string | null;
  checkedS3Storage: boolean;
  s3values: Record<string, string>;
  postUrl: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const { formData, selectedImage, checkedS3Storage, s3values, postUrl } = ctx;
  const isCustomImage = formData.images === "custom";

  // 1. Resolve image category (O(1) lookup)
  const imageMap = buildImageValueToCategoryMap();
  const imageCategory = isCustomImage
    ? "custom"
    : resolveImageCategory(selectedImage, imageMap);

  // 2. Resolve container image (may fail for empty custom image)
  const containerResult = resolveContainerImage(
    isCustomImage,
    formData,
    selectedImage,
  );
  if (!containerResult.ok) {
    return { ok: false, error: containerResult.error };
  }
  // Additional docker-image validation for custom images.
  if (isCustomImage && !validateDockerImage(containerResult.image)) {
    return {
      ok: false,
      error: `Invalid Docker image name: "${containerResult.image}". Please provide a valid image reference.`,
    };
  }

  // 3. Build payload via pure apply* helpers (each may fail validation).
  let payload: SpawnFormPayload = buildBasePayload(
    formData,
    imageCategory,
    containerResult.image,
  );
  payload = applyImageFields(
    payload,
    isCustomImage,
    imageCategory,
    containerResult.image,
  );
  payload = applySshAccess(payload, formData.sshAccess);

  const storageResult = applyStorage(payload, formData);
  if ("error" in storageResult)
    return { ok: false, error: storageResult.error };
  payload = storageResult;

  const phResult = applyPersistentHome(payload, formData);
  if ("error" in phResult) return { ok: false, error: phResult.error };
  payload = phResult;

  const migResult = applyMigGpu(payload, formData);
  if ("error" in migResult) return { ok: false, error: migResult.error };
  payload = migResult;

  payload = applyProjectDirectories(payload, formData.projectCheck);
  payload = applyS3Fields(payload, formData, checkedS3Storage);

  // 4. S3-specific validation (possibly async — validates credentials).
  if (checkedS3Storage) {
    const s3Sel = formData.s3selection || "existing";
    if (s3Sel === "existing") {
      const r = validateExistingS3(formData, s3values);
      if (!r.ok) return { ok: false, error: r.error };
      payload.s3name = formData.s3name as string;
    } else {
      const r = validateNewS3(formData);
      if (!r.ok) return { ok: false, error: r.error };
      const fields = getMissingS3Fields(formData);
      payload.s3url = fields.s3url;
      payload.s3bucket = fields.s3bucket;
      payload.s3accesskey = fields.s3accesskey;
      payload.s3secretkey = fields.s3secretkey;
      try {
        await validateS3Credentials(fields);
      } catch (error) {
        return { ok: false, error: formatS3ErrorMessage(error) };
      }
    }
  }

  // 5. Required fields check
  const required = validateRequiredFields(payload);
  if (!required.ok) return { ok: false, error: required.error };

  // 6. Submit
  const result = await submitSpawnForm(payload, postUrl);
  if (!result.ok) {
    return { ok: false, error: result.error || "Submission failed" };
  }
  return { ok: true };
}
