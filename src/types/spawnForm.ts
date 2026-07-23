/**
 * @fileoverview Type declarations for the spawn form.
 *
 * Replaces the inline interface in FormPage.tsx with strongly-typed shapes
 * shared across hooks, utils, and components.
 */

/**
 * Form state held by the spawn form. Compatible with the index-signature
 * `FormState = Record<string, unknown>` used by formSections/* via its
 * `[key: string]: unknown` index signature.
 */
export interface SpawnFormData {
  memselection?: number;
  cpuselection?: number;
  gpuselection?: string;
  migamount?: number;
  sshAccess?: boolean;
  shmsize?: string;
  s3check?: string;
  s3name?: string;
  s3selection?: string;
  s3url?: string;
  s3bucket?: string;
  s3accesskey?: string;
  s3secretkey?: string;
  images?: string;
  customimage?: string;
  phselection?: string;
  phCheck?: string;
  phname?: string;
  storageCheck?: string;
  home?: string;
  locationStorageCheck?: string;
  projectCheck?: string;
  [key: string]: unknown;
}

/**
 * Payload sent to the JupyterHub backend. All values are strings because
 * `FormData` only supports string values (and the backend parses them).
 */
export type SpawnFormPayload = Record<string, string>;

/**
 * Default form data shape returned by `gatherFormData()`. Lifted to a shared
 * type so hooks and components agree on the structure.
 */
export interface DefaultFormData {
  memory?: number | null;
  gpu?: string | null;
  cpu?: number | null;
  shmsize?: string | null;
  metaCentrumHome?: {
    enabled: boolean;
    selectedHome: { value: string; text: string } | null;
    mountToStorage: boolean;
  };
  projectDirectories?: boolean;
  persistentHome?: {
    type: string;
    eraseIfExists: boolean;
    selectedHome?: { value: string; text: string } | null;
  };
  notebookImage?: {
    containerImage?: string | null;
    sshAccess?: boolean;
    type?: string | null;
    selectedOption?: string;
  };
  sshName?: string;
  s3Storage?: {
    enabled: boolean;
    existings3: { value: string } | null;
    s3url: string | null;
    s3bucket: string | null;
    s3accesskey: string | null;
    s3secretkey: string | null;
    s3selection: string;
  };
}

/**
 * Discriminated union for validation results. Pure functions return this
 * instead of pushing alerts directly, keeping them side-effect free.
 */
export type ValidationResult = { ok: true } | { ok: false; error: string };

/**
 * Result type for payload-builder functions that may fail validation.
 * On failure, `error` carries the user-facing message.
 */
export type PayloadResult =
  { ok: true; payload: SpawnFormPayload } | { ok: false; error: string };
