/**
 * @fileoverview Dev fixtures: per-instance configuration ports (decision 19:
 * instances are reviewed via dev fixtures, not Storybook stories).
 *
 * Every fixture carries the wire EXACTLY as the backend emits it — there is
 * no fallback in the frontend, so a fixture without `spawn_options` renders
 * the blocked, empty form (that is the observable failure mode).
 */

import type { SpawnWire } from "@src-types/spawnOptions";
import type { InstanceConfigWire } from "@src-types/instanceConfig";
import { hub } from "./hub";
import { cas } from "./cas";
import { minimal } from "./minimal";
import { broken } from "./broken";
import { elter } from "./elter";

export interface InstanceFixture {
  /** Content of #spawn-options — what the backend emitted for this page. */
  wire: SpawnWire;
  /** Content of #instance-config; undefined → nothing injected (legacy widgets). */
  instance?: InstanceConfigWire;
}

export const FIXTURES: Record<string, InstanceFixture> = {
  hub,
  cas,
  minimal,
  broken,
  elter,
};
