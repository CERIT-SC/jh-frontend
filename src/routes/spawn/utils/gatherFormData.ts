/**
 * @fileoverview Builds `DefaultFormData` (prefill + defaults) and lookup
 * maps from the resolved `SpawnOptions` (A1 reader) — no instance data of
 * its own.
 */

import type { DefaultFormData } from "@src-types/spawnForm";
import type { SpawnOptions } from "@src-types/spawnOptions";
import { getSpawnOptions } from "../config/readSpawnOptions";

type ImageOptionsByCategory = Record<string, { value: string; name: string }[]>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Builds the default form data: `user_options` prefill where present,
 * `options` defaults everywhere else. Never bails early — a missing
 * `user_options` key falls back to the resolved option default.
 */
export function gatherFormData(options: SpawnOptions): DefaultFormData {
  const wire = getSpawnOptions();
  const opts = isRecord(wire.userOptions) ? wire.userOptions : {};

  const parsedMem = Number.parseInt(String(opts.mem ?? ""), 10);
  const parsedCpu = Number.parseInt(String(opts.cpu ?? ""), 10);
  const normalizedGpu =
    opts.gpu &&
    opts.gpu !== "undefined" &&
    opts.gpu !== "first_available" &&
    opts.gpu !== "<first_available>"
      ? (opts.gpu as string)
      : null;

  const normalizedPhome = opts.phome === "delete" ? "new" : opts.phome;

  const memory = Number.isNaN(parsedMem)
    ? options.resources.memory.default
    : parsedMem;
  const cpu = Number.isNaN(parsedCpu)
    ? options.resources.cpu.default
    : parsedCpu;

  const formData: DefaultFormData = {
    // Basic Resources — defaults from spawn_options
    memory,
    cpu,
    gpu: normalizedGpu,
    shmsize: typeof opts.shmsize === "string" ? opts.shmsize : null,

    // Storage Options
    metaCentrumHome: {
      enabled: opts.home != null,
      selectedHome: opts.home
        ? { value: opts.home as string, text: opts.home as string }
        : null,
      mountToStorage: Boolean(opts.mounttostorage),
    },
    projectDirectories: Boolean(opts.mountprojects),
    persistentHome: {
      type:
        normalizedPhome === "new" || normalizedPhome === "remain"
          ? "new"
          : "existing",
      eraseIfExists: false,
      selectedHome:
        normalizedPhome !== "new" && normalizedPhome !== "remain"
          ? {
              value: normalizedPhome as string,
              text: normalizedPhome as string,
            }
          : null,
    },

    s3Storage: {
      enabled: Boolean(
        opts.s3check || opts.s3url || opts.s3name || opts.s3existing,
      ),
      existings3: opts.s3existing
        ? { value: opts.s3existing as string }
        : opts.s3name
          ? { value: opts.s3name as string }
          : null,
      s3url: (opts.s3url as string) || null,
      s3bucket: (opts.s3bucket as string) || null,
      s3accesskey: (opts.s3accesskey as string) || null,
      s3secretkey: (opts.s3secretkey as string) || null,
      s3selection: opts.s3url || opts.s3bucket ? "new" : "existing",
    },

    // Image & Access
    notebookImage: {
      containerImage:
        typeof opts.container_image === "string" ? opts.container_image : null,
      sshAccess: Boolean(opts.ssh),
      type:
        opts.images === "custom" ? "customnb" : (opts.images as string) || null,
      selectedOption:
        opts.images === "custom"
          ? (opts.customimage as string) || ""
          : undefined,
    },
    sshName: options.image.ssh.dns_domain || "",
  };

  // Generic fields: schema `default` is the initial value; `user_options`
  // prefill only when `persist: true` (destructive fields never prefill).
  const fieldValues: Record<string, string | boolean> = {};
  for (const field of options.fields) {
    const persisted = field.persist === true ? opts[field.name] : undefined;
    if (field.type === "checkbox") {
      fieldValues[field.name] = persisted === true;
    } else if (typeof persisted === "string" && persisted !== "") {
      fieldValues[field.name] = persisted;
    } else if (typeof field.default === "string") {
      fieldValues[field.name] = field.default;
    } else {
      fieldValues[field.name] = "";
    }
  }
  formData.fields = fieldValues;

  return formData;
}

/** The image catalog grouped by category key, from the resolved options. */
export function getImageOptions(): ImageOptionsByCategory {
  const { options } = getSpawnOptions();
  const byCategory: ImageOptionsByCategory = {};
  for (const category of options.image.categories) {
    byCategory[category.key] = category.images.map((image) => ({
      value: image.value,
      name: image.name,
    }));
  }
  return byCategory;
}

/** O(1) map: image value → category key (from the resolved options). */
export function buildImageValueToCategoryMap(): Map<string, string> {
  const imageOptions = getImageOptions();
  const imageToCategoryMap = new Map<string, string>();

  for (const [category, categoryImages] of Object.entries(imageOptions)) {
    for (const image of categoryImages) {
      imageToCategoryMap.set(image.value, category);
    }
  }

  return imageToCategoryMap;
}

/** O(1) map: image value → image name (from the resolved options). */
export function buildImageValueToNameMap(): Map<string, string> {
  const imageOptions = getImageOptions();
  const imageToNameMap = new Map<string, string>();

  for (const categoryImages of Object.values(imageOptions)) {
    for (const image of categoryImages) {
      imageToNameMap.set(image.value, image.name);
    }
  }

  return imageToNameMap;
}

/** GPU choices as a value → label record (from the resolved options). */
export function getGpuOptions(): Record<string, string> {
  const { options } = getSpawnOptions();
  return Object.fromEntries(
    options.resources.gpu.options.map((choice) => [choice.value, choice.name]),
  );
}

/** MetaCentrum home choices as a value → label record. */
export function getMetaCentrumHomeOptions(): Record<string, string> {
  const { options } = getSpawnOptions();
  return Object.fromEntries(
    options.storage.metacentrum.homes.map((choice) => [
      choice.value,
      choice.name,
    ]),
  );
}

/** Existing persistent homes for the current user. */
export function getPersistentHomeOptions(): string[] {
  const { options } = getSpawnOptions();
  return options.storage.persistent_home.existing;
}

/** S3 buckets as a value → value record (buckets are their own label). */
export function getS3BucketOptions(): Record<string, string> {
  const { options } = getSpawnOptions();
  const mapped: Record<string, string> = {};
  for (const bucket of options.storage.s3.buckets) {
    mapped[bucket.value] = bucket.value;
  }
  return mapped;
}
