/**
 * @fileoverview Legacy adapter: today's hub wire format → `SpawnOptions`.
 *
 * This is the ONLY module allowed to contain hub-specific fallback data or to
 * import `data/formData.js` / hub-specific constants (enforced by grep in A4
 * and E1). It reproduces today's hub form exactly from today's hub wire data
 * plus the `formData.js` / `formConstants.ts` fallbacks — every value it
 * carries corresponds to a "legacy value" row in docs/spawn-options.md.
 *
 * Temporary: removed when hub runs on `spawn_options` emission (Deferred).
 */

import type {
  Choice,
  ImageEntry,
  SpawnOptions,
  SpawnWire,
} from "@src-types/spawnOptions";
import { SPAWN_OPTIONS_VERSION } from "@src-types/spawnOptions";
import {
  images as fallbackImages,
  gpu_instance as fallbackGpuInstances,
  selectOptionsStorage as fallbackMetaCentrumHomes,
  cpuOptions as legacyCpuOptions,
  memOptions as legacyMemOptions,
} from "../data/formData";
import {
  formImagesName as legacyFormImagesName,
  sectionTitles as legacySectionTitles,
} from "../data/formData";
import { DOCS_URLS } from "../data/formConstants";
import { DELETE_HOME_DEFAULTS } from "./presets";

/** Hub's registry prefix; bare catalog values get it prepended (Review Focus #1). */
export const HUB_REGISTRY_PREFIX = "cerit.io/hubs/";

/** Today's fallback container image (was DEFAULT_CONTAINER_IMAGE). */
const DEFAULT_CONTAINER_IMAGE = "cerit.io/hubs/datasciencenb:26-09-2024";

/** Today's custom-image input placeholder (ImageSelector.tsx, verbatim). */
const LEGACY_CUSTOM_IMAGE_PLACEHOLDER =
  "e.g., cerit.io/hubs/custom-image:latest";

/** Type predicate for the wire images map: category → image entries. */
type WireImages = Record<string, unknown>;

type LooseEntry = {
  value?: string;
  name?: string;
  id?: string;
};

/** Mirrors gatherFormData's lenient value/name/id mapping for legacy lists. */
function looseChoice(item: unknown): Choice | null {
  if (typeof item === "string") {
    return item ? { value: item, name: item } : null;
  }
  if (typeof item !== "object" || item === null) {
    return null;
  }
  const entry = item as LooseEntry;
  const value = entry.value || entry.name || entry.id || "";
  const name = entry.name || entry.value || entry.id || "";
  if (!value) {
    return null;
  }
  return { value, name: name || value };
}

/** Images of one legacy category: arrays of {value, name} (wire) or a record (formData.js). */
function legacyImagesOf(source: unknown): ImageEntry[] {
  if (Array.isArray(source)) {
    const entries: ImageEntry[] = [];
    for (const item of source) {
      const choice = looseChoice(item);
      if (choice) {
        // No badges/version on the legacy wire → FE badge heuristics unchanged.
        entries.push({ value: choice.value, name: choice.name });
      }
    }
    return entries;
  }
  if (typeof source === "object" && source !== null) {
    // formData.js fallback shape: Record<value, name> in display order.
    return Object.entries(source as Record<string, string>).map(
      ([value, name]) => ({ value, name }),
    );
  }
  return [];
}

/** Choice list from a legacy wire list with a record-shaped fallback. */
function choicesFrom(
  source: unknown,
  fallback: Record<string, string>,
): Choice[] {
  if (Array.isArray(source) && source.length > 0) {
    const choices = source
      .map(looseChoice)
      .filter((choice): choice is Choice => choice !== null);
    if (choices.length > 0) {
      return choices;
    }
  }
  return Object.entries(fallback).map(([value, name]) => ({ value, name }));
}

/** The hub catalog: `wire.images` in current key order, else `formData.images`. */
function legacyCategories(
  wireImages: unknown,
): SpawnOptions["image"]["categories"] {
  const source: WireImages =
    wireImages && typeof wireImages === "object" && !Array.isArray(wireImages)
      ? (wireImages as WireImages)
      : (fallbackImages as unknown as WireImages);

  return Object.keys(source).map((key) => ({
    key,
    name: legacySectionTitles[key as keyof typeof legacySectionTitles] ?? key,
    images: legacyImagesOf(source[key]),
    legacy_post_key:
      legacyFormImagesName[key as keyof typeof legacyFormImagesName],
  }));
}

/** First image value of the first non-empty category, or null. */
function firstImageValue(
  categories: SpawnOptions["image"]["categories"],
): string | null {
  for (const category of categories) {
    if (category.images.length > 0) {
      return category.images[0].value;
    }
  }
  return null;
}

/** The DEFAULT_CONTAINER_IMAGE value with the hub registry prefix stripped. */
function legacyDefaultImage(): string | null {
  if (DEFAULT_CONTAINER_IMAGE.startsWith(`${HUB_REGISTRY_PREFIX}`)) {
    return DEFAULT_CONTAINER_IMAGE.slice(HUB_REGISTRY_PREFIX.length);
  }
  return DEFAULT_CONTAINER_IMAGE;
}

/**
 * Converts the legacy hub wire (top-level `images`, `gpu_instances`, …, no
 * `spawn_options`) into a fully-populated SpawnOptions object.
 */
export function fromLegacyWire(wire: SpawnWire | undefined): SpawnOptions {
  const categories = legacyCategories(wire?.images);
  const defaultImage = legacyDefaultImage();

  return {
    version: SPAWN_OPTIONS_VERSION,
    image: {
      registry_prefix: HUB_REGISTRY_PREFIX,
      default: defaultImage ?? firstImageValue(categories),
      categories,
      badge_config: {},
      custom: { enabled: true, placeholder: LEGACY_CUSTOM_IMAGE_PLACEHOLDER },
      ssh: { enabled: true, dns_domain: wire?.ssh_dns_domain ?? "" },
    },
    storage: {
      persistent_home: {
        enabled: true,
        existing: Array.isArray(wire?.phomes)
          ? wire.phomes.filter(
              (item): item is string => typeof item === "string",
            )
          : [],
      },
      metacentrum: {
        enabled: true,
        homes: choicesFrom(wire?.mhomes, fallbackMetaCentrumHomes),
      },
      projects: { enabled: true },
      s3: {
        enabled: true,
        buckets: choicesFrom(wire?.s3buckets, {}),
        default_endpoint: "https://s3.cloud.e-infra.cz",
        console_url: "https://s3-ui.cloud.e-infra.cz/",
      },
      delete_home: {
        enabled: false,
        label: DELETE_HOME_DEFAULTS.label,
        warning: DELETE_HOME_DEFAULTS.warning,
      },
    },
    resources: {
      cpu: {
        enabled: true,
        options: [...legacyCpuOptions],
        default: 1,
      },
      memory: {
        enabled: true,
        options: [...legacyMemOptions],
        default: 4,
      },
      gpu: {
        enabled: true,
        options: choicesFrom(wire?.gpu_instances, fallbackGpuInstances),
        default: "none",
        mig_default_amount: 1,
        live_status: true,
      },
    },
    fields: [],
    docs: {
      image: DOCS_URLS.image,
      storage: DOCS_URLS.storage,
      resources: DOCS_URLS.resources,
    },
  };
}
