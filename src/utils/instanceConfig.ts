/**
 * @fileoverview Page-wide instance config + announcement readers.
 *
 * `instance` comes from `#instance-config` (backend `template_vars["instance"]`)
 * on every page; the announcement from `#announcement-data`. Absent config →
 * `LEGACY_INSTANCE_CONFIG` (everything on, brand "origin"); present config →
 * omitted widgets are off, missing `brand` → "origin". Readers never throw.
 */

import type {
  InstanceConfig,
  InstanceConfigWire,
} from "@src-types/instanceConfig";
import type { ConfigProblem, ConfigSource } from "@src-types/spawnOptions";
import {
  INSTANCE_CONFIG_VERSION,
  LEGACY_INSTANCE_CONFIG,
} from "@src-types/instanceConfig";
import { readJsonScript } from "./readJsonScript";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function resolveInstanceConfig(wire: InstanceConfigWire | undefined): {
  config: InstanceConfig;
  source: ConfigSource;
  problems: ConfigProblem[];
} {
  if (!isRecord(wire)) {
    return { config: LEGACY_INSTANCE_CONFIG, source: "legacy", problems: [] };
  }

  const problems: ConfigProblem[] = [];

  const version = typeof wire.version === "number" ? wire.version : undefined;
  if (version === undefined) {
    problems.push({
      message: "Instance config version is missing (supports 1).",
      blocking: false,
    });
  } else if (version > INSTANCE_CONFIG_VERSION) {
    problems.push({
      message: `Instance config version ${version} not supported by this frontend (supports ${INSTANCE_CONFIG_VERSION}).`,
      blocking: false,
    });
  }

  const brand =
    typeof wire.brand === "string" && wire.brand !== "" ? wire.brand : "origin";

  const pages = isRecord(wire.pages) ? wire.pages : {};
  const home = isRecord(pages.home) ? pages.home : {};

  const config: InstanceConfig = {
    version: version ?? INSTANCE_CONFIG_VERSION,
    brand,
    pages: {
      home: {
        // Omitted widgets are off (strict semantics; legacy is all-on).
        gpu_indicators: home.gpu_indicators === true,
        resource_usage: home.resource_usage === true,
      },
    },
  };

  return { config, source: "backend", problems };
}

let cachedConfig:
  | { config: InstanceConfig; source: ConfigSource; problems: ConfigProblem[] }
  | undefined;

/** Memoized page-wide instance config reader. */
export function getInstanceConfig(): {
  config: InstanceConfig;
  source: ConfigSource;
  problems: ConfigProblem[];
} {
  if (!cachedConfig) {
    cachedConfig = resolveInstanceConfig(
      readJsonScript<InstanceConfigWire>("instance-config"),
    );
  }
  return cachedConfig;
}

/** Announcement from `#announcement-data`, else the legacy `appConfig`. */
export function getAnnouncement(): string {
  const fromScript = readJsonScript<unknown>("announcement-data");
  if (typeof fromScript === "string") {
    return fromScript;
  }
  if (
    typeof appConfig !== "undefined" &&
    typeof appConfig.announcement === "string"
  ) {
    return appConfig.announcement;
  }
  return "";
}
