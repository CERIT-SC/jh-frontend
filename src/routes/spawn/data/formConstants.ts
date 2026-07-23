/**
 * @fileoverview Centralized constants for the spawn form.
 *
 * Lifts magic values out of FormPage.tsx into named, typed constants
 * so they can be referenced from multiple modules and easily audited.
 */

import type { SpawnFormData } from "@src-types/spawnForm";

/** Fallback container image when no image is selected and no default exists. */
export const DEFAULT_CONTAINER_IMAGE = "cerit.io/hubs/datasciencenb:26-09-2024";

/**
 * Legacy backend expects per-category image keys (e.g. `simplenbname`).
 * The new backend uses `images` + `container_image`; this map supports both
 * during the migration period.
 */
export const IMAGE_CATEGORY_KEY_MAP: Record<string, string> = {
  simple: "simplenbname",
  r: "rnbname",
  tf: "tfnbname",
  matlab: "matlabnbname",
  various: "varnbname",
  folding: "foldnbname",
};

/**
 * Default form data returned by `gatherFormData()` when the backend has
 * no `spawnOptions.user_options` (first visit / fresh spawn).
 */
export const DEFAULT_FORM_DATA = {
  memory: 4,
  gpu: "none",
  cpu: 1,
  metaCentrumHome: {
    enabled: false,
    selectedHome: null,
    mountToStorage: false,
  },
  projectDirectories: false,
  persistentHome: {
    type: "new",
    eraseIfExists: false,
  },
  notebookImage: {
    containerImage: DEFAULT_CONTAINER_IMAGE,
    sshAccess: false,
  },
  shmsize: "4",
} as const;

/** Initial state for the mutable `formData` (user-editable fields). */
export const INITIAL_FORM_DATA: SpawnFormData = {
  memselection: 4,
  cpuselection: 1,
  gpuselection: "none",
  migamount: 1,
  sshAccess: false,
  shmsize: "4",
};

/** Payload keys that MUST be present and non-empty before submission. */
export const REQUIRED_PAYLOAD_KEYS = [
  "cpuselection",
  "memselection",
  "gpuselection",
  "images",
  "container_image",
] as const;

/** Documentation URLs for the help buttons on each step panel. */
export const DOCS_URLS = {
  image: "https://docs.cerit.io/en/docs/web-apps/jupyterhub#choosing-image",
  storage: "https://docs.cerit.io/en/docs/web-apps/jupyterhub#choosing-storage",
  resources:
    "https://docs.cerit.io/en/docs/web-apps/jupyterhub#resource-allocation",
} as const;
