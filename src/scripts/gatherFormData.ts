import {
  images as fallbackImages,
  gpu_instance as fallbackGpuInstances,
  selectOptionsStorage as fallbackMetaCentrumHomes,
} from "../data/formData";

type NamedOption = { value?: string; name?: string; id?: string };
type ImageOption = { value: string; name: string };
type ImageOptionsByCategory = Record<string, ImageOption[]>;

declare const spawnOptions: {
  user_options?: {
    mem?: string;
    cpu?: string;
    gpu?: string;
    home?: string | null;
    mountprojects?: boolean;
    phome?: string;
    container_image?: string;
    ssh?: boolean;
    shmsize?: string;
  };
  ssh_dns_domain?: string;
  gpu_instances?: any[];
  images?: any[];
  mhomes?: any[];
  phomes?: any[];
  s3buckets?: any[];
};
export function gatherFormData() {
  if (!spawnOptions || !spawnOptions.user_options) {
    return null;
  }

  const opts = spawnOptions.user_options;

  if (
    opts.mem === undefined ||
    opts.cpu === undefined ||
    opts.gpu === undefined
  ) {
    return null;
  }
  try {
    const parsedMem = Number.parseInt(String(opts.mem), 10);
    const parsedCpu = Number.parseInt(String(opts.cpu), 10);
    const normalizedGpu =
      opts.gpu &&
      opts.gpu !== "undefined" &&
      opts.gpu !== "first_available" &&
      opts.gpu !== "<first_available>"
        ? opts.gpu
        : null;

    const formData = {
      // Basic Resources
      memory: Number.isNaN(parsedMem) ? null : parsedMem,
      cpu: Number.isNaN(parsedCpu) ? null : parsedCpu,
      gpu: normalizedGpu,
      shmsize: opts.shmsize || null,

      // Storage Options
      metaCentrumHome: {
        enabled: opts.home !== null,
        selectedHome: opts.home ? { value: opts.home, text: opts.home } : null,
        // Depending on your API, map `mountToStorage` if it's stored in `user_options`
        mountToStorage: false,
      },
      projectDirectories: Boolean(opts.mountprojects),
      persistentHome: {
        // Example mapping based on "remain", "new", or specific volume names
        type:
          opts.phome === "new" || opts.phome === "remain" ? "new" : "existing",
        eraseIfExists: false,
        selectedHome:
          opts.phome !== "new" && opts.phome !== "remain"
            ? { value: opts.phome, text: opts.phome }
            : null,
      },

      // Map other storages as needed or set to null if not in user_options yet
      s3Storage: null,

      // Image & Access
      notebookImage: {
        containerImage: opts.container_image || null,
        sshAccess: Boolean(opts.ssh),
      },
      sshName: spawnOptions.ssh_dns_domain || "",
    };

    console.log("Gathered FormData:", formData);
    return formData;
  } catch (error) {
    console.error("Error gathering form data:", error);
    return null;
  }
}
export function gatherFormOptions() {
  if (!spawnOptions) {
    return null;
  }
  const options = {
    gpu_instances: spawnOptions.gpu_instances,
    images: spawnOptions.images,
    mhomes: spawnOptions.mhomes,
    phomes: spawnOptions.phomes,
  };
  return options;
}

function isNonEmptyObject(value: unknown): value is Record<string, unknown> {
  return Boolean(
    value && typeof value === "object" && Object.keys(value).length,
  );
}

function mapToValueLabelRecord(
  source: unknown,
  fallback: Record<string, string>,
): Record<string, string> {
  if (!Array.isArray(source) || source.length === 0) {
    return fallback;
  }

  const mapped = source.reduce<Record<string, string>>((acc, item) => {
    const value =
      typeof item === "string"
        ? item
        : (item as NamedOption)?.value ||
          (item as NamedOption)?.name ||
          (item as NamedOption)?.id ||
          "";
    const name =
      typeof item === "string"
        ? item
        : (item as NamedOption)?.name ||
          (item as NamedOption)?.value ||
          (item as NamedOption)?.id ||
          "";

    if (value) {
      acc[value] = name || value;
    }
    return acc;
  }, {});

  return Object.keys(mapped).length > 0 ? mapped : fallback;
}

export function getImageOptions() {
  if (isNonEmptyObject(spawnOptions?.images)) {
    return spawnOptions.images as ImageOptionsByCategory;
  }

  const mapped = Object.entries(fallbackImages).reduce<ImageOptionsByCategory>(
    (acc, [category, categoryImages]) => {
      const imageList = Object.entries(
        categoryImages as Record<string, string>,
      ).map(([value, name]) => ({ value, name }));
      acc[category] = imageList;
      return acc;
    },
    {},
  );

  return mapped;
}

export function getGpuOptions() {
  return mapToValueLabelRecord(
    spawnOptions?.gpu_instances,
    fallbackGpuInstances as Record<string, string>,
  );
}

export function getMetaCentrumHomeOptions() {
  return mapToValueLabelRecord(
    spawnOptions?.mhomes,
    fallbackMetaCentrumHomes as Record<string, string>,
  );
}

export function getPersistentHomeOptions() {
  if (!Array.isArray(spawnOptions?.phomes)) {
    return [];
  }
  return spawnOptions.phomes.filter((item) => typeof item === "string");
}

export function getS3BucketOptions() {
  if (!spawnOptions || !Array.isArray(spawnOptions.s3buckets)) {
    return { testing: "s3testing" };
  }

  const mapped = spawnOptions.s3buckets.reduce(
    (acc: Record<string, string>, item: any) => {
      const value =
        typeof item === "string"
          ? item
          : item?.value || item?.name || item?.id || "";
      if (value) {
        acc[value] = value;
      }
      return acc;
    },
    {},
  );

  return Object.keys(mapped).length > 0 ? mapped : { testing: "s3testing" };
}
