import {
  images as fallbackImages,
  gpu_instance as fallbackGpuInstances,
} from "../data/formData";

type NamedOption = { value?: string; name?: string; id?: string };
type ImageOption = { value: string; name: string };
type ImageOptionsByCategory = Record<string, ImageOption[]>;

declare const spawnOptions: {
  user_options?: {
    mem?: string;
    cpu?: string;
    gpu?: string;
    delhome?: string | boolean;
    container_image?: string;
    ssh?: boolean;
    shmsize?: string;
    images?: string;
    customimage?: string;
    s3check?: string;
    s3url?: string;
    s3bucket?: string;
    s3accesskey?: string;
    s3secretkey?: string;
    s3name?: string;
    s3selection?: string;
    s3existing?: string;
  };
  ssh_dns_domain?: string;
  gpu_instances?: unknown[];
  images?: unknown[];
  s3buckets?: unknown[];
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
      delhome: Boolean(opts.delhome),

      s3Storage: {
        enabled: Boolean(
          opts.s3check || opts.s3url || opts.s3name || opts.s3existing,
        ),
        existings3: opts.s3existing
          ? { value: opts.s3existing }
          : opts.s3name
            ? { value: opts.s3name }
            : null,
        s3url: opts.s3url || null,
        s3bucket: opts.s3bucket || null,
        s3accesskey: opts.s3accesskey || null,
        s3secretkey: opts.s3secretkey || null,
        s3selection: opts.s3url || opts.s3bucket ? "new" : "existing",
      },

      // Image & Access
      notebookImage: {
        containerImage: opts.container_image || null,
        sshAccess: Boolean(opts.ssh),
        type: opts.images === "custom" ? "customnb" : opts.images || null,
        selectedOption:
          opts.images === "custom" ? opts.customimage || "" : undefined,
      },
      sshName: spawnOptions.ssh_dns_domain || "",
    };

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

export function getS3BucketOptions() {
  if (!spawnOptions || !Array.isArray(spawnOptions.s3buckets)) {
    return {};
  }

  const mapped = spawnOptions.s3buckets.reduce(
    (acc: Record<string, string>, item: unknown) => {
      const value =
        typeof item === "string"
          ? item
          : (item as { value?: string; name?: string; id?: string })?.value ||
            (item as { value?: string; name?: string; id?: string })?.name ||
            (item as { value?: string; name?: string; id?: string })?.id ||
            "";
      if (value) {
        acc[value] = value;
      }
      return acc;
    },
    {},
  );

  return mapped;
}

/**
 * Builds a centralized O(1) lookup map from image value to category.
 * This is a pure, immutable build from getImageOptions().
 * @returns Map<string, string> where key is image value and value is category
 */
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

/**
 * Builds a centralized O(1) lookup map from image value to image name.
 * This is a pure, immutable build from getImageOptions().
 * @returns Map<string, string> where key is image value and value is image name
 */
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
