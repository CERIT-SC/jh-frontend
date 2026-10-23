/**
 * @fileoverview Wire reader + strict resolver for `spawn_options`.
 *
 * Semantics (normative — Review Focus #7):
 * - `spawn_options` absent → legacy adapter (today's hub), `source: "legacy"`.
 * - `spawn_options` present → strict: an omitted group is DISABLED, omitted
 *   data is empty, and no FE fallback data is used. Any code merging
 *   `spawn_options` over "all-on" defaults is a bug (it would silently enable
 *   groups for backends that never offered them).
 * - Unsupported/missing `version` or invalid data → non-blocking problems;
 *   blocking problems (no images, enabled cpu/memory with empty options)
 *   disable Start.
 * - Readers never throw.
 */

import type {
  Choice,
  ConfigProblem,
  GenericField,
  ImageCategory,
  ImageEntry,
  ResolvedSpawn,
  SpawnOptions,
  SpawnWire,
} from "@src-types/spawnOptions";
import { DEFAULT_BADGES, SPAWN_OPTIONS_VERSION } from "@src-types/spawnOptions";
import { readJsonScript } from "@utils/readJsonScript";
import { DELETE_HOME_DEFAULTS } from "./presets";

const GENERIC_FIELD_SECTIONS: GenericField["section"][] = [
  "image",
  "storage",
  "resources",
];

const SPAWN_OPTIONS_TOP_KEYS = new Set([
  "version",
  "image",
  "storage",
  "resources",
  "fields",
  "docs",
]);

const GROUP_KEYS = {
  image: new Set([
    "registry_prefix",
    "default",
    "categories",
    "badge_config",
    "custom",
    "ssh",
  ]),
  storage: new Set([
    "persistent_home",
    "metacentrum",
    "projects",
    "s3",
    "delete_home",
  ]),
  resources: new Set(["cpu", "memory", "gpu"]),
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** `enabled` is true only when the wire value is exactly `true`. */
function enabled(value: unknown): boolean {
  return value === true;
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

/** Validates a Choice: two non-empty strings. */
function asChoice(value: unknown): Choice | null {
  if (!isRecord(value)) {
    return null;
  }
  if (!nonEmptyString(value.value) || !nonEmptyString(value.name)) {
    return null;
  }
  return { value: value.value, name: value.name };
}

/** Keeps only valid choices; pushes a problem per invalid entry. */
function choiceList(
  value: unknown,
  problems: ConfigProblem[],
  what: string,
): Choice[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const choices: Choice[] = [];
  for (const item of value) {
    const choice = asChoice(item);
    if (choice) {
      choices.push(choice);
    } else {
      problems.push({
        message: `Invalid entry ignored in ${what}.`,
        blocking: false,
      });
    }
  }
  return choices;
}

/** Keeps only finite numbers > 0; pushes a problem per invalid entry. */
function numberList(
  value: unknown,
  problems: ConfigProblem[],
  what: string,
): number[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const numbers: number[] = [];
  for (const item of value) {
    if (typeof item === "number" && Number.isFinite(item) && item > 0) {
      numbers.push(item);
    } else {
      problems.push({
        message: `Invalid entry ignored in ${what}.`,
        blocking: false,
      });
    }
  }
  return numbers;
}

/** A numeric selector: `default` must be in options, else the first option. */
function numericGroup(
  wire: unknown,
  problems: ConfigProblem[],
  what: string,
): { enabled: boolean; options: number[]; default: number } {
  const group = isRecord(wire) ? wire : {};
  const options = numberList(group.options, problems, `${what}.options`);
  const isEnabled = enabled(group.enabled);
  if (isEnabled && options.length === 0) {
    problems.push({
      message: `${what} is enabled but has no options — disabled.`,
      blocking: true,
    });
  }
  let fallbackDefault = options[0] ?? 0;
  if (typeof group.default === "number" && Number.isFinite(group.default)) {
    if (options.includes(group.default)) {
      fallbackDefault = group.default;
    } else {
      problems.push({
        message: `${what}.default (${String(group.default)}) is not in options — using the first option.`,
        blocking: false,
      });
    }
  } else if (group.default !== undefined) {
    problems.push({
      message: `Invalid ${what}.default ignored — using the first option.`,
      blocking: false,
    });
  }
  return {
    enabled: isEnabled && options.length > 0,
    options,
    default: fallbackDefault,
  };
}

/** Validates one image entry; badges filtered, version kept verbatim. */
function asImageEntry(
  value: unknown,
  problems: ConfigProblem[],
  what: string,
): ImageEntry | null {
  if (!isRecord(value)) {
    return null;
  }
  if (!nonEmptyString(value.value) || !nonEmptyString(value.name)) {
    return null;
  }
  const entry: ImageEntry = { value: value.value, name: value.name };
  if (value.badges !== undefined) {
    if (Array.isArray(value.badges)) {
      const badges = value.badges.filter((badge): badge is string =>
        nonEmptyString(badge),
      );
      if (badges.length !== value.badges.length) {
        problems.push({
          message: `Invalid badge entries ignored on ${what}.`,
          blocking: false,
        });
      }
      // Present (even empty) → explicit mode: disables the name heuristic.
      entry.badges = badges;
    } else {
      problems.push({
        message: `Invalid badges ignored on ${what} — the name heuristic applies.`,
        blocking: false,
      });
    }
  }
  if (value.version !== undefined) {
    if (nonEmptyString(value.version)) {
      entry.version = value.version;
    } else {
      problems.push({
        message: `Invalid version ignored on ${what} — the tag-regex chain applies.`,
        blocking: false,
      });
    }
  }
  return entry;
}

function imageCategories(
  wire: unknown,
  problems: ConfigProblem[],
): ImageCategory[] {
  if (!Array.isArray(wire)) {
    if (wire !== undefined) {
      problems.push({
        message: "Invalid image.categories ignored — no images available.",
        blocking: false,
      });
    }
    return [];
  }
  const categories: ImageCategory[] = [];
  wire.forEach((item, index) => {
    const what = `image.categories[${index}]`;
    if (!isRecord(item) || !nonEmptyString(item.key)) {
      problems.push({
        message: `Invalid category ignored in ${what}.`,
        blocking: false,
      });
      return;
    }
    const images: ImageEntry[] = [];
    if (Array.isArray(item.images)) {
      item.images.forEach((image, imageIndex) => {
        const entry = asImageEntry(
          image,
          problems,
          `${what}.images[${imageIndex}]`,
        );
        if (entry) {
          images.push(entry);
        } else {
          problems.push({
            message: `Invalid image ignored in ${what}.images[${imageIndex}].`,
            blocking: false,
          });
        }
      });
    }
    const category: ImageCategory = {
      key: item.key,
      name: nonEmptyString(item.name) ? item.name : item.key,
      images,
    };
    categories.push(category);
  });
  return categories;
}

function badgeConfig(
  wire: unknown,
  problems: ConfigProblem[],
): SpawnOptions["image"]["badge_config"] {
  const merged: SpawnOptions["image"]["badge_config"] = { ...DEFAULT_BADGES };
  if (wire === undefined) {
    return merged;
  }
  if (!isRecord(wire)) {
    problems.push({
      message: "Invalid image.badge_config ignored — FE defaults kept.",
      blocking: false,
    });
    return merged;
  }
  for (const [key, value] of Object.entries(wire)) {
    if (!isRecord(value)) {
      problems.push({
        message: `Invalid badge definition ignored for "${key}".`,
        blocking: false,
      });
      continue;
    }
    const fallback = merged[key];
    merged[key] = {
      abbr: nonEmptyString(value.abbr) ? value.abbr : (fallback?.abbr ?? key),
      name: nonEmptyString(value.name) ? value.name : (fallback?.name ?? key),
      description:
        typeof value.description === "string"
          ? value.description
          : (fallback?.description ?? ""),
    };
  }
  return merged;
}

function stringOrEmpty(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function genericFields(
  wire: unknown,
  problems: ConfigProblem[],
): GenericField[] {
  if (wire === undefined) {
    return [];
  }
  if (!Array.isArray(wire)) {
    problems.push({
      message: "Invalid fields ignored — expected a list.",
      blocking: false,
    });
    return [];
  }
  const fields: GenericField[] = [];
  const seen = new Set<string>();
  for (const [index, item] of wire.entries()) {
    const what = `fields[${index}]`;
    if (
      !isRecord(item) ||
      !nonEmptyString(item.name) ||
      (item.type !== "checkbox" && item.type !== "select") ||
      !GENERIC_FIELD_SECTIONS.includes(
        item.section as GenericField["section"],
      ) ||
      !nonEmptyString(item.label)
    ) {
      problems.push({
        message: `Invalid field ignored in ${what}.`,
        blocking: false,
      });
      continue;
    }
    const field: GenericField = {
      name: item.name,
      type: item.type,
      section: item.section as GenericField["section"],
      label: item.label,
    };
    if (typeof item.description === "string") {
      field.description = item.description;
    }
    if (typeof item.warning === "string") {
      field.warning = item.warning;
    }
    if (item.type === "checkbox") {
      if (item.checked_value !== undefined) {
        if (nonEmptyString(item.checked_value)) {
          field.checked_value = item.checked_value;
        } else {
          problems.push({
            message: `Invalid checked_value ignored in ${what}.`,
            blocking: false,
          });
        }
      }
    } else {
      const options = choiceList(item.options, problems, `${what}.options`);
      if (options.length === 0) {
        problems.push({
          message: `Select field ignored in ${what} — it has no options.`,
          blocking: false,
        });
        continue;
      }
      field.options = options;
      if (
        (typeof item.default === "string" && item.default !== "") ||
        typeof item.default === "boolean"
      ) {
        field.default = item.default;
      }
    }
    if (nonEmptyString(item.summary_label)) {
      field.summary_label = item.summary_label;
    }
    if (item.persist === true) {
      field.persist = true;
    }
    if (seen.has(field.name)) {
      problems.push({
        message: `Duplicate field name "${field.name}" — keeping the first.`,
        blocking: false,
      });
      continue;
    }
    seen.add(field.name);
    fields.push(field);
  }
  return fields;
}

function warnUnknownKeys(
  value: unknown,
  known: Set<string>,
  what: string,
): void {
  if (!isRecord(value)) {
    return;
  }
  for (const key of Object.keys(value)) {
    if (!known.has(key)) {
      console.warn(`Unknown key "${key}" in ${what} ignored.`);
    }
  }
}

/** A spawn-options-less page renders no form: every group off, no images. */
function emptySpawnOptions(): SpawnOptions {
  return {
    version: SPAWN_OPTIONS_VERSION,
    image: {
      registry_prefix: "",
      default: null,
      categories: [],
      badge_config: { ...DEFAULT_BADGES },
      custom: { enabled: false, placeholder: "" },
      ssh: { enabled: false, dns_domain: "" },
    },
    storage: {
      persistent_home: { enabled: false, existing: [] },
      metacentrum: { enabled: false, homes: [] },
      projects: { enabled: false },
      s3: {
        enabled: false,
        buckets: [],
        default_endpoint: "",
        console_url: "",
      },
      delete_home: {
        enabled: false,
        label: DELETE_HOME_DEFAULTS.label,
        warning: DELETE_HOME_DEFAULTS.warning,
      },
    },
    resources: {
      cpu: { enabled: false, options: [], default: 0 },
      memory: { enabled: false, options: [], default: 0 },
      gpu: {
        enabled: false,
        options: [],
        default: "",
        mig_default_amount: 1,
        live_status: false,
      },
    },
    fields: [],
    docs: { image: null, storage: null, resources: null },
  };
}

/**
 * Resolves the spawn wire into fully-populated options. Pure; used by dev
 * fixtures too. Never throws — an internal failure degrades to an empty,
 * fully-disabled form with a blocking problem (no fallback data exists:
 * the form is driven only by real backend configuration).
 */
export function resolveSpawnOptions(
  wire: SpawnWire | undefined,
): ResolvedSpawn {
  try {
    return resolve(wire);
  } catch (error) {
    console.error("Failed to resolve spawn options:", error);
    return {
      options: emptySpawnOptions(),
      userOptions: isRecord(wire?.user_options) ? wire.user_options : {},
      source: "missing",
      problems: [
        {
          message:
            "Spawn options could not be read — the form is disabled. Check the backend emission.",
          blocking: true,
        },
      ],
    };
  }
}

function resolve(wire: SpawnWire | undefined): ResolvedSpawn {
  const userOptions: Record<string, unknown> = isRecord(wire?.user_options)
    ? wire.user_options
    : {};

  const raw = wire?.spawn_options;
  if (!isRecord(raw)) {
    // No fallback data exists: without backend configuration there is no
    // form. Surface it loudly instead of rendering anything.
    console.warn(
      "spawn_options missing on the page — the form cannot be rendered.",
    );
    return {
      options: emptySpawnOptions(),
      userOptions,
      source: "missing",
      problems: [
        {
          message:
            "Spawn options are missing on this page — the form cannot be rendered. Is the backend emitting the #spawn-options script?",
          blocking: true,
        },
      ],
    };
  }

  const problems: ConfigProblem[] = [];
  warnUnknownKeys(raw, SPAWN_OPTIONS_TOP_KEYS, "spawn_options");

  const image = isRecord(raw.image) ? raw.image : {};
  const storage = isRecord(raw.storage) ? raw.storage : {};
  const resources = isRecord(raw.resources) ? raw.resources : {};
  const custom = isRecord(image.custom) ? image.custom : {};
  const ssh = isRecord(image.ssh) ? image.ssh : {};
  const persistentHome = isRecord(storage.persistent_home)
    ? storage.persistent_home
    : {};
  const metacentrum = isRecord(storage.metacentrum) ? storage.metacentrum : {};
  const projects = isRecord(storage.projects) ? storage.projects : {};
  const s3 = isRecord(storage.s3) ? storage.s3 : {};
  const deleteHome = isRecord(storage.delete_home) ? storage.delete_home : {};
  const gpu = isRecord(resources.gpu) ? resources.gpu : {};
  const docs = isRecord(raw.docs) ? raw.docs : {};

  // version: missing or unsupported → non-blocking problem; still resolve.
  const version = typeof raw.version === "number" ? raw.version : undefined;
  if (version === undefined) {
    problems.push({
      message: "Spawn options version is missing (supports 1).",
      blocking: false,
    });
  } else if (version > SPAWN_OPTIONS_VERSION) {
    problems.push({
      message: `Spawn options version ${version} not supported by this frontend (supports ${SPAWN_OPTIONS_VERSION}).`,
      blocking: false,
    });
  }

  warnUnknownKeys(raw.image, GROUP_KEYS.image, "spawn_options.image");

  const categories = imageCategories(image.categories, problems);
  const totalImages = categories.reduce(
    (sum, category) => sum + category.images.length,
    0,
  );
  if (totalImages === 0) {
    problems.push({
      message: "No images are available in any category.",
      blocking: true,
    });
  }

  const defaultGiven = nonEmptyString(image.default) ? image.default : null;
  const knownValues = new Set(
    categories.flatMap((category) =>
      category.images.map((image) => image.value),
    ),
  );
  let defaultImage: string | null = defaultGiven;
  if (defaultImage !== null && !knownValues.has(defaultImage)) {
    problems.push({
      message: "image.default is not in the catalog — using the first image.",
      blocking: false,
    });
    defaultImage = null;
  }
  if (defaultImage === null && totalImages > 0) {
    defaultImage = categories.find((category) => category.images.length > 0)!
      .images[0].value;
  }

  warnUnknownKeys(storage, GROUP_KEYS.storage, "spawn_options.storage");
  warnUnknownKeys(resources, GROUP_KEYS.resources, "spawn_options.resources");

  const gpuOptions = choiceList(gpu.options, problems, "resources.gpu.options");
  let gpuEnabled = enabled(gpu.enabled);
  if (gpuEnabled && gpuOptions.length === 0) {
    problems.push({
      message: "GPU is enabled but has no options — disabled.",
      blocking: false,
    });
    gpuEnabled = false;
  }
  let gpuDefault = nonEmptyString(gpu.default) ? gpu.default : "";
  if (
    gpuDefault !== "" &&
    !gpuOptions.some((option) => option.value === gpuDefault)
  ) {
    problems.push({
      message:
        "resources.gpu.default is not in options — using the first option.",
      blocking: false,
    });
    gpuDefault = "";
  }
  if (gpuDefault === "" && gpuOptions.length > 0) {
    gpuDefault = gpuOptions[0].value;
  }
  const migDefaultAmount =
    typeof gpu.mig_default_amount === "number" &&
    Number.isFinite(gpu.mig_default_amount) &&
    gpu.mig_default_amount > 0
      ? gpu.mig_default_amount
      : 1;

  const cpu = numericGroup(resources.cpu, problems, "resources.cpu");
  const memory = numericGroup(resources.memory, problems, "resources.memory");

  const mergedBadges = badgeConfig(image.badge_config, problems);
  // Per-image `badges` referencing a key defined in neither the backend's
  // badge_config nor the FE registry → non-blocking problem; the chip is
  // skipped at render time.
  for (const category of categories) {
    for (const entry of category.images) {
      if (!entry.badges) continue;
      for (const key of entry.badges) {
        if (!mergedBadges[key]) {
          problems.push({
            message: `Unknown badge key "${key}" on image "${entry.name}" — chip skipped.`,
            blocking: false,
          });
        }
      }
    }
  }

  const deleteHomeLabel = nonEmptyString(deleteHome.label)
    ? deleteHome.label
    : DELETE_HOME_DEFAULTS.label;
  const deleteHomeWarning = nonEmptyString(deleteHome.warning)
    ? deleteHome.warning
    : DELETE_HOME_DEFAULTS.warning;
  if (
    deleteHome.label !== undefined &&
    !nonEmptyString(deleteHome.label) &&
    deleteHome.enabled === true
  ) {
    problems.push({
      message: "Invalid storage.delete_home.label — default copy used.",
      blocking: false,
    });
  }

  const options: SpawnOptions = {
    version: version ?? SPAWN_OPTIONS_VERSION,
    image: {
      registry_prefix: stringOrEmpty(image.registry_prefix),
      default: defaultImage,
      categories,
      badge_config: mergedBadges,
      custom: {
        enabled: enabled(custom.enabled),
        placeholder: stringOrEmpty(custom.placeholder),
      },
      ssh: {
        enabled: enabled(ssh.enabled),
        dns_domain: stringOrEmpty(ssh.dns_domain),
      },
    },
    storage: {
      persistent_home: {
        enabled: enabled(persistentHome.enabled),
        existing: Array.isArray(persistentHome.existing)
          ? persistentHome.existing.filter(
              (item): item is string => typeof item === "string",
            )
          : [],
      },
      metacentrum: {
        enabled: enabled(metacentrum.enabled),
        homes: choiceList(
          metacentrum.homes,
          problems,
          "storage.metacentrum.homes",
        ),
      },
      projects: { enabled: enabled(projects.enabled) },
      s3: {
        enabled: enabled(s3.enabled),
        buckets: choiceList(s3.buckets, problems, "storage.s3.buckets"),
        default_endpoint: stringOrEmpty(s3.default_endpoint),
        console_url: stringOrEmpty(s3.console_url),
      },
      delete_home: {
        enabled: enabled(deleteHome.enabled),
        label: deleteHomeLabel,
        warning: deleteHomeWarning,
      },
    },
    resources: {
      cpu,
      memory,
      gpu: {
        enabled: gpuEnabled,
        options: gpuOptions,
        default: gpuDefault,
        mig_default_amount: migDefaultAmount,
        live_status: gpu.live_status === true,
      },
    },
    fields: genericFields(raw.fields, problems),
    docs: {
      image: stringOrNull(docs.image),
      storage: stringOrNull(docs.storage),
      resources: stringOrNull(docs.resources),
    },
  };

  return { options, userOptions, source: "backend", problems };
}

/** Content of the `#spawn-options` JSON script emitted by the backend. */
export function readSpawnWire(): SpawnWire | undefined {
  const fromScript = readJsonScript<SpawnWire>("spawn-options");
  if (isRecord(fromScript)) {
    return fromScript;
  }
  return undefined;
}

let cached: ResolvedSpawn | undefined;

/** Memoized {@link resolveSpawnOptions}(readSpawnWire()). */
export function getSpawnOptions(): ResolvedSpawn {
  if (!cached) {
    cached = resolveSpawnOptions(readSpawnWire());
  }
  return cached;
}
