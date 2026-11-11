/**
 * @fileoverview Brand registry — the only place that maps an instance's
 * `brand` id (from `template_vars["instance"]`) to its slots.
 */

import { getInstanceConfig } from "@utils/instanceConfig";
import { OriginHeader } from "./origin/OriginHeader";
import { OriginFooter } from "./origin/OriginFooter";
import { OriginLoginPage } from "./origin/OriginLoginPage";
import { originCopy, originLogos } from "./origin/copy";
import type { BrandDefinition } from "./types";

/** All known brands. `"origin"` is the design-system default theme (:root). */
export const BRANDS: Record<string, BrandDefinition> = {
  origin: {
    id: "origin",
    logos: originLogos,
    copy: originCopy,
    slots: {
      Header: OriginHeader,
      Footer: OriginFooter,
      LoginPage: OriginLoginPage,
    },
  },
};

/**
 * The brand for this instance: `instance.brand` → registry entry, falling
 * back to origin (with a console error) for unknown ids.
 */
export function getBrand(): BrandDefinition {
  const id = getInstanceConfig().config.brand;
  const brand = BRANDS[id];
  if (!brand) {
    console.error(`Unknown brand "${id}" — falling back to the origin brand.`);
    return BRANDS.origin;
  }
  return brand;
}
