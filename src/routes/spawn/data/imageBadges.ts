/**
 * @fileoverview Image badge registry — FE-owned styling for badge chips.
 *
 * `DEFAULT_BADGES` (definitions) lives in `src/types/spawnOptions.ts` and is
 * re-exported here; the chip STYLES live only in this file, keyed by badge
 * id. Backend config may override abbr/name/description per key — never
 * colors. Per-image `badges: []` short-circuits the name-keyword heuristic;
 * `version` shows the verbatim version chip.
 */

import { DEFAULT_BADGES } from "@src-types/spawnOptions";

export { DEFAULT_BADGES };

/** Chip style per badge id — FE code only, never values.yaml. */
export const BADGE_STYLES: Record<string, string> = {
  AI: "bg-chart-2/50 text-text",
  SSH: "bg-chart-4/50 text-text",
  GPU: "bg-chart-3/50 text-text",
  CPU: "bg-chart-2/50 text-text",
  TB: "bg-chart-5/50 text-text",
  RSAT: "bg-chart-1/50 text-text",
  VSC: "bg-chart-3/50 text-primary-foreground",
  NI: "bg-chart-2/50 text-text",
};

/** Style of the verbatim version chip (from the image's `version` field). */
export const VERSION_CHIP_STYLE = "bg-surface text-text ring-1 ring-border";

/** Keywords per badge id for the legacy name-keyword heuristic (hub parity). */
export const BADGE_KEYWORDS: Record<string, string[]> = {
  AI: ["ai"],
  SSH: ["ssh", "ssh access"],
  GPU: ["gpu"],
  CPU: ["cpu only"],
  TB: ["tensorboard"],
  RSAT: ["rsat"],
  VSC: ["vs code", "integrated vs code"],
  NI: ["notebook-intelligence", "intelligence"],
};
