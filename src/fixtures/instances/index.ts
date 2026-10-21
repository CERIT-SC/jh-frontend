/**
 * @fileoverview Per-instance dev fixtures (decision 19: instances are
 * configuration ports reviewed via dev fixtures, not Storybook stories).
 *
 * Selected by `?instance=<name>` or `VITE_INSTANCE`; `hub` (the legacy wire)
 * is the default. See `src/dev-setup.ts` for the injection mechanics.
 */

import type { SpawnWire } from "@src-types/spawnOptions";
import type { InstanceConfigWire } from "@src-types/instanceConfig";
import { hub } from "./hub";
import { cas } from "./cas";
import { minimal } from "./minimal";
import { broken } from "./broken";
import { elter } from "./elter";

/** How dev-setup injects the fixture's wire into the page. */
export interface InstanceFixture {
  /** Content of #spawn-options (or the legacy global). */
  wire: SpawnWire;
  /** Content of #instance-config; undefined → legacy (everything on). */
  instance?: InstanceConfigWire;
  /**
   * - "legacy-global": set `window.spawnOptions` (mirrors today's hub backend).
   * - "json-script": create/replace <script type="application/json"
   *   id="spawn-options">.
   */
  transport: "json-script" | "legacy-global";
}

export const FIXTURES: Record<string, InstanceFixture> = {
  hub,
  cas,
  minimal,
  broken,
  elter,
};
