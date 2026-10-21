/**
 * @fileoverview `spawn_options` schema v1 — the canonical contract between a
 * JupyterHub backend and this frontend (see docs/spawn-options.md).
 *
 * The same keys (snake_case) exist in the backend's values.yaml, the shared
 * Python module (`jh-backend/spawn_options.py`) and this file. A contract
 * change updates all three mirrors plus the contract doc in the same PR.
 *
 * Reading rules (normative): every optional group is an object with
 * `enabled`; an omitted group is disabled; an omitted list is empty; the FE
 * never injects fallback data when `spawn_options` is present. Instance
 * fallback data lives ONLY in `legacyAdapter.ts`.
 */

/** Schema version of the `spawn_options` wire format. */
export const SPAWN_OPTIONS_VERSION = 1;

/** A display/post pair: `value` is posted, `name` is shown. */
export interface Choice {
  value: string;
  name: string;
}

/** One image in a category catalog. */
export interface ImageEntry {
  value: string;
  name: string;
  /** Explicit badge keys; present (even empty) disables the name heuristic. */
  badges?: string[];
  /** Version chip text; shown verbatim when a non-empty string. */
  version?: string;
}

/** Badge definition: styling stays in FE code, keyed by id. */
export interface BadgeDef {
  abbr: string;
  name: string;
  description: string;
}

/** An image category: ordered; rendered as one tab of the image selector. */
export interface ImageCategory {
  key: string;
  name: string;
  images: ImageEntry[];
  /** Legacy per-category POST key (e.g. `simplenbname`); omitted = not sent. */
  legacy_post_key?: string;
}

/**
 * Generic field primitive — the escape hatch for one-off controls.
 * Rendered by the section named in `section`; POSTs `name` with the value.
 */
export interface GenericField {
  /** POST key (snake_case for new fields). */
  name: string;
  type: "checkbox" | "select";
  /** Which StepPanel renders it. */
  section: "image" | "storage" | "resources";
  label: string;
  description?: string;
  /** checkbox: shown when checked. */
  warning?: string;
  /** checkbox: POST value when checked (default "yes"); unchecked → omitted. */
  checked_value?: string;
  /** select (required). */
  options?: Choice[];
  default?: string | boolean;
  /** OverviewPanel row label (default: label). */
  summary_label?: string;
  /** prefill from user_options (default false; destructive fields never prefill). */
  persist?: boolean;
}

/** Fully resolved spawn options — every key present. Built by the resolver. */
export interface SpawnOptions {
  version: number;
  image: {
    /** "" = category values are full refs. */
    registry_prefix: string;
    /** A value; null → first image of first category. */
    default: string | null;
    categories: ImageCategory[];
    /** merged over DEFAULT_BADGES (styles always FE). */
    badge_config: Record<string, BadgeDef>;
    custom: { enabled: boolean; placeholder: string };
    ssh: { enabled: boolean; dns_domain: string };
  };
  storage: {
    /** per-user: existing PVCs, filled per request by the backend. */
    persistent_home: { enabled: boolean; existing: string[] };
    metacentrum: { enabled: boolean; homes: Choice[] };
    projects: { enabled: boolean };
    /** buckets per-user. */
    s3: {
      enabled: boolean;
      buckets: Choice[];
      default_endpoint: string;
      console_url: string;
    };
    delete_home: { enabled: boolean; label: string; warning: string };
  };
  resources: {
    cpu: { enabled: boolean; options: number[]; default: number };
    /** GiB; shmsize = memory (backend contract). */
    memory: { enabled: boolean; options: number[]; default: number };
    gpu: {
      enabled: boolean;
      options: Choice[];
      default: string;
      mig_default_amount: number;
      /** live GPU status widget on the spawn page. */
      live_status: boolean;
    };
  };
  /** Generic fields; `storage.delete_home` is rendered through one. */
  fields: GenericField[];
  /** Help URLs; null → no help button for that section. */
  docs: {
    image: string | null;
    storage: string | null;
    resources: string | null;
  };
}

/** Partial version of T; arrays keep their element type (not partial items). */
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends (infer U)[]
    ? U[]
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};

/** What a backend sends inside the `spawn_options` key. */
export type SpawnOptionsWire = DeepPartial<SpawnOptions>;

/**
 * Content of the `#spawn-options` JSON script (or the legacy global).
 * The legacy top-level keys are read only by the legacy adapter.
 */
export interface SpawnWire {
  user_options?: Record<string, unknown>;
  spawn_options?: SpawnOptionsWire;
  // legacy top-level keys — read only by the legacy adapter:
  images?: unknown;
  gpu_instances?: unknown;
  mhomes?: unknown;
  phomes?: unknown;
  s3buckets?: unknown;
  ssh_dns_domain?: string;
}

/** Where the resolved options came from. */
export type ConfigSource = "legacy" | "backend";

/** A schema problem surfaced to the user; blocking ones disable Start. */
export interface ConfigProblem {
  message: string;
  blocking: boolean;
}

/** Result of resolving the spawn wire. */
export interface ResolvedSpawn {
  options: SpawnOptions;
  userOptions: Record<string, unknown>;
  source: ConfigSource;
  problems: ConfigProblem[];
}

/**
 * FE-default badge definitions, moved verbatim from ImageSelector's
 * FEATURE_CONFIG (AI, SSH, GPU, CPU, TB, RSAT, VSC, NI). Chip styles stay in
 * `src/routes/spawn/data/imageBadges.ts` — never in backend config.
 */
export const DEFAULT_BADGES: Record<string, BadgeDef> = {
  AI: {
    abbr: "AI",
    name: "Artificial Intelligence",
    description:
      "Pre-installed AI/ML frameworks and tools for machine learning development.",
  },
  SSH: {
    abbr: "SSH",
    name: "SSH Access",
    description:
      "Allows direct terminal access to the running notebook container via SSH protocol.",
  },
  GPU: {
    abbr: "GPU",
    name: "GPU Support",
    description:
      "Includes GPU drivers and libraries (CUDA/cuDNN). Requires selecting a GPU instance in Resource Options.",
  },
  CPU: {
    abbr: "CPU",
    name: "CPU Only",
    description: "Optimized for CPU-only workloads without GPU acceleration.",
  },
  TB: {
    abbr: "TB",
    name: "TensorBoard",
    description:
      "Includes TensorBoard for visualizing machine learning experiments and model training.",
  },
  RSAT: {
    abbr: "RSAT",
    name: "RSAT Tools",
    description:
      "Regulatory Sequence Analysis Tools for bioinformatics research.",
  },
  VSC: {
    abbr: "VSC",
    name: "Integrated VS Code",
    description: "Integrated Visual Studio Code editor.",
  },
  NI: {
    abbr: "NI",
    name: "Notebook Intelligence",
    description:
      "AI-powered code assistance and suggestions within Jupyter notebooks.",
  },
};
