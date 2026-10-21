/**
 * @fileoverview Generic constants for the spawn form.
 *
 * Instance-specific values (image catalog, category labels/POST keys,
 * resource option lists, docs URLs, default image) are owned by
 * `spawn_options` — resolved via `config/readSpawnOptions.ts`; the legacy
 * fallbacks live ONLY in `config/legacyAdapter.ts`.
 */

/** Documentation URLs for the help buttons on each step panel (hub legacy). */
export const DOCS_URLS = {
  image: "https://docs.cerit.io/en/docs/web-apps/jupyterhub#choosing-image",
  storage: "https://docs.cerit.io/en/docs/web-apps/jupyterhub#choosing-storage",
  resources:
    "https://docs.cerit.io/en/docs/web-apps/jupyterhub#resource-allocation",
} as const;
