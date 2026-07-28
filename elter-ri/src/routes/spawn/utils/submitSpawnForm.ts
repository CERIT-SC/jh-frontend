/**
 * @fileoverview Submits the spawn form payload to the JupyterHub backend.
 *
 * Isolated as a pure-ish module so the submit orchestrator hook can stay
 * focused on validation flow. Side effects: `fetch`, `console.error`,
 * `window.location` navigation.
 */

import type { SpawnFormPayload } from "@src-types/spawnForm";

/** Outcome of a submission attempt. */
export interface SubmitResult {
  ok: boolean;
  error?: string;
}

/**
 * POST the payload as `FormData` and navigate to the spawn-pending page
 * on success.
 *
 * @param payload - The form payload (all string values).
 * @param postUrl - The JupyterHub POST endpoint (from `appConfig.postUrl`).
 * @returns `{ ok: true }` on success, or `{ ok: false, error }` on failure.
 */
export async function submitSpawnForm(
  payload: SpawnFormPayload,
  postUrl: string,
): Promise<SubmitResult> {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    formData.append(key, value);
  });

  try {
    const response = await fetch(postUrl, {
      method: "POST",
      body: formData,
    });
    if (response.ok) {
      const pendingUrl = postUrl.replace("/spawn/", "/spawn-pending/");
      window.location.href = pendingUrl;
      return { ok: true };
    }
    const errorText = await response.text().catch(() => response.statusText);
    return {
      ok: false,
      error: `Form submission failed: ${errorText || response.statusText}`,
    };
  } catch (error) {
    console.error("Network error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      ok: false,
      error: `Network error during form submission: ${message}`,
    };
  }
}
