/**
 * @fileoverview Page-wide instance configuration (`template_vars["instance"]`)
 * injected by the JupyterHub backend into `#instance-config` on every page.
 *
 * Omitted widgets are off; a missing `brand` falls back to `"origin"`; a
 * missing whole block means the legacy behavior (everything on).
 */

import type { DeepPartial } from "./spawnOptions";

/** Schema version of the `instance` wire format. */
export const INSTANCE_CONFIG_VERSION = 1;

/** Page-wide configuration for one instance. */
export interface InstanceConfig {
  version: number;
  /** Brand registry key; also the `<html data-theme>` value. */
  brand: string;
  pages: {
    home: {
      /** GPU status badges on the home page. */
      gpu_indicators: boolean;
      /** Resource-usage badge on the home page. */
      resource_usage: boolean;
    };
  };
}

/** What a backend sends inside the `instance` key. */
export type InstanceConfigWire = DeepPartial<InstanceConfig>;

/** Pre-`instance` behavior (today's hub): brand origin, every widget on. */
export const LEGACY_INSTANCE_CONFIG: InstanceConfig = {
  version: INSTANCE_CONFIG_VERSION,
  brand: "origin",
  pages: {
    home: { gpu_indicators: true, resource_usage: true },
  },
};
