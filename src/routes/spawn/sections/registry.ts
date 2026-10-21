/**
 * @fileoverview Section registry — the single place that maps enabled
 * `spawn_options` groups to POST payload keys, validation and defaults.
 *
 * Modules wrap the pure apply* builders from `utils/buildSpawnPayload.ts`.
 * `SECTION_MODULES` order equals the former inline call order in
 * `useSpawnFormSubmit`. POST keys are frozen vocabulary (decision 20).
 */

import type { SpawnFormData, SpawnFormPayload } from "@src-types/spawnForm";
import type { GenericField, SpawnOptions } from "@src-types/spawnOptions";
import { validateDockerImage } from "@utils";
import {
  applyGenericFields,
  applyMigGpu,
  applyPersistentHome,
  applyProjectDirectories,
  applyS3Fields,
  applySshAccess,
  applyStorage,
} from "../utils/buildSpawnPayload";
import { deleteHomeField } from "../config/presets";

/** Everything the apply* builders and modules need to build the payload. */
export interface SubmitCtx {
  formData: SpawnFormData;
  options: SpawnOptions;
  isCustomImage: boolean;
  imageCategory: string | null;
  containerImage: string;
  checkedS3Storage: boolean;
}

/** One enabled spawn_options group's payload contribution. */
export interface SectionModule {
  id:
    | "custom_image"
    | "ssh"
    | "persistent_home"
    | "metacentrum"
    | "projects"
    | "s3"
    | "cpu"
    | "memory"
    | "gpu"
    | "fields";
  enabled(o: SpawnOptions): boolean;
  /** POST keys that must be present when the module is enabled. */
  requiredKeys?(o: SpawnOptions): string[];
  /** Pure; wraps the existing apply* builders. */
  apply(
    payload: SpawnFormPayload,
    ctx: SubmitCtx,
  ): SpawnFormPayload | { error: string };
}

/** Generic fields the form renders/posts: schema `fields[]` + delete-home. */
export function effectiveFields(o: SpawnOptions): GenericField[] {
  const fields = [...o.fields];
  if (o.storage.delete_home.enabled) {
    fields.push(deleteHomeField(o.storage.delete_home));
  }
  return fields;
}

/**
 * Modules in the former inline apply-chain order of useSpawnFormSubmit
 * (cpu/memory were part of the base payload before the registry; fields is
 * always enabled and runs last).
 */
export const SECTION_MODULES: readonly SectionModule[] = [
  {
    id: "custom_image",
    enabled: (o) => o.image.custom.enabled,
    apply: (payload, ctx) => {
      if (!ctx.isCustomImage) return payload;
      if (!validateDockerImage(ctx.containerImage)) {
        return {
          error: `Invalid Docker image name: "${ctx.containerImage}". Please provide a valid image reference.`,
        };
      }
      return { ...payload, customimage: ctx.containerImage };
    },
  },
  {
    id: "ssh",
    enabled: (o) => o.image.ssh.enabled,
    apply: (payload, ctx) => applySshAccess(payload, ctx.formData.sshAccess),
  },
  {
    id: "metacentrum",
    enabled: (o) => o.storage.metacentrum.enabled,
    apply: (payload, ctx) => applyStorage(payload, ctx.formData),
  },
  {
    id: "persistent_home",
    enabled: (o) => o.storage.persistent_home.enabled,
    apply: (payload, ctx) => {
      // `phselection` is posted only when the group is enabled (was part of
      // the base payload before the registry).
      const withSelection: SpawnFormPayload = {
        ...payload,
        phselection: ctx.formData.phselection || "new",
      };
      return applyPersistentHome(withSelection, ctx.formData);
    },
  },
  {
    id: "gpu",
    enabled: (o) => o.resources.gpu.enabled,
    requiredKeys: () => ["gpuselection"],
    apply: (payload, ctx) => {
      const withSelection: SpawnFormPayload = {
        ...payload,
        gpuselection: String(ctx.formData.gpuselection ?? "none"),
      };
      return applyMigGpu(withSelection, ctx.formData);
    },
  },
  {
    id: "projects",
    enabled: (o) => o.storage.projects.enabled,
    apply: (payload, ctx) =>
      applyProjectDirectories(payload, ctx.formData.projectCheck),
  },
  {
    id: "s3",
    enabled: (o) => o.storage.s3.enabled,
    apply: (payload, ctx) =>
      applyS3Fields(payload, ctx.formData, ctx.checkedS3Storage),
  },
  {
    id: "cpu",
    enabled: (o) => o.resources.cpu.enabled,
    requiredKeys: () => ["cpuselection"],
    apply: (payload, ctx) => ({
      ...payload,
      cpuselection: String(ctx.formData.cpuselection ?? ""),
    }),
  },
  {
    id: "memory",
    enabled: (o) => o.resources.memory.enabled,
    requiredKeys: () => ["memselection"],
    // `shmsize` is intentionally derived from `memselection` to match the
    // backend contract (`options['shmsize'] = options['mem']`).
    apply: (payload, ctx) => ({
      ...payload,
      memselection: String(ctx.formData.memselection ?? ""),
      shmsize: String(ctx.formData.memselection ?? ""),
    }),
  },
  {
    id: "fields",
    enabled: () => true,
    apply: (payload, ctx) =>
      applyGenericFields(payload, ctx.formData, effectiveFields(ctx.options)),
  },
];

/** Builds the full POST payload from the enabled modules. */
export function buildPayload(
  ctx: SubmitCtx,
): SpawnFormPayload | { error: string } {
  // Base payload: the category key, the container image and — for legacy
  // backends — the category's legacy per-category POST key.
  let payload: SpawnFormPayload = {
    images: ctx.imageCategory || "",
    container_image: ctx.containerImage,
  };
  if (!ctx.isCustomImage && ctx.imageCategory) {
    const category = ctx.options.image.categories.find(
      (candidate) => candidate.key === ctx.imageCategory,
    );
    if (category?.legacy_post_key) {
      payload[category.legacy_post_key] = ctx.containerImage;
    }
  }

  for (const module of SECTION_MODULES) {
    if (!module.enabled(ctx.options)) continue;
    const result = module.apply(payload, ctx);
    if ("error" in result) return result;
    payload = result;
  }
  return payload;
}

/** Required payload keys: the base pair plus every enabled module's keys. */
export function buildRequiredKeys(o: SpawnOptions): string[] {
  const keys = ["images", "container_image"];
  for (const module of SECTION_MODULES) {
    if (module.enabled(o) && module.requiredKeys) {
      keys.push(...module.requiredKeys(o));
    }
  }
  return keys;
}
