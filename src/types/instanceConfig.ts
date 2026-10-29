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
      /** Reserved legacy wire key; home does not render/fetch GPU availability. */
      gpu_indicators: boolean;
      /** Resource-usage badge on the home page. */
      resource_usage: boolean;
    };
    /**
     * Optional per-instance login-page content. Absent → the brand's own
     * login slot; present (even `{}`) → the shared generic login card.
     */
    login?: LoginContent;
  };
}

/** Configured content of the shared login card (all fields validated). */
export interface LoginContent {
  heading: string;
  /** Empty string hides the subtitle. */
  subtitle: string;
  /** Same-origin image URLs only (page CSP is `img-src 'self' data: blob:`). */
  logo?: { src: string; dark_src?: string; alt: string };
  /** Plain text paragraphs, rendered escaped — no HTML. */
  paragraphs: string[];
  /** HTTP(S) links (any origin); relative hrefs are resolved against the page. */
  links: { label: string; href: string }[];
  button_text: string;
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
